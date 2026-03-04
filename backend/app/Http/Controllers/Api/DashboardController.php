<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TransactionResource;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/stats?range=today|week|month
     * Statistik ringkasan harian untuk kartu-kartu di dashboard.
     */
    public function stats(Request $request): JsonResponse
    {
        $range = $request->get('range', 'today');
        $dateRange = $this->getDateRange($range);

        $start = $dateRange['start'];
        $end = $dateRange['end'];

        // Get current period data
        $sales = Transaction::whereBetween('date', [$start, $end])->sales()->get();
        $salesTotal = $sales->sum('total');
        $salesCount = $sales->count();

        $purchases = Transaction::whereBetween('date', [$start, $end])->purchases()->get();
        $purchasesTotal = $purchases->sum('total');
        $purchasesCount = $purchases->count();

        // Get previous period for comparison
        $previousRange = $this->getPreviousDateRange($dateRange);
        $previousSales = Transaction::whereBetween('date', [$previousRange['start'], $previousRange['end']])->sales()->sum('total');
        $previousPurchases = Transaction::whereBetween('date', [$previousRange['start'], $previousRange['end']])->purchases()->sum('total');

        $salesGrowth = $previousSales > 0
            ? round(($salesTotal - $previousSales) / $previousSales * 100, 1)
            : 0;
        $purchasesGrowth = $previousPurchases > 0
            ? round(($purchasesTotal - $previousPurchases) / $previousPurchases * 100, 1)
            : 0;

        // Produk
        $totalProducts = Product::count();

        // Customer active (punya transaksi dalam periode)
        $activeCustomers = Customer::whereHas('transactions', function ($query) use ($start, $end) {
            $query->whereBetween('date', [$start, $end]);
        })->count();

        // Get period start customer count for growth
        $activeCustomersStart = Customer::whereHas('transactions', function ($query) use ($previousRange) {
            $query->whereBetween('date', [$previousRange['start'], $previousRange['end']]);
        })->count();

        $customersGrowth = $activeCustomersStart > 0
            ? round(($activeCustomers - $activeCustomersStart) / $activeCustomersStart * 100, 1)
            : 0;

        return response()->json([
            'data' => [
                'totalSalesToday'        => (float) $salesTotal,
                'salesGrowth'            => $salesGrowth,
                'totalPurchasesToday'    => (float) $purchasesTotal,
                'purchasesGrowth'        => $purchasesGrowth,
                'totalProducts'          => $totalProducts,
                'stockValue'             => (float) Product::selectRaw('SUM(stock * buy_price) as val')->value('val'),
                'activeCustomers'        => $activeCustomers,
                'customersGrowth'        => $customersGrowth,
                'totalTransactionsToday' => $salesCount + $purchasesCount,
            ],
        ]);
    }

    private function getDateRange(string $range): array
    {
        return match($range) {
            'today' => [
                'start' => Carbon::today()->startOfDay(),
                'end' => Carbon::today()->endOfDay(),
            ],
            'week' => [
                'start' => Carbon::today()->startOfWeek(),
                'end' => Carbon::today()->endOfWeek(),
            ],
            'month' => [
                'start' => Carbon::today()->startOfMonth(),
                'end' => Carbon::today()->endOfMonth(),
            ],
            default => [
                'start' => Carbon::today()->startOfDay(),
                'end' => Carbon::today()->endOfDay(),
            ],
        };
    }

    private function getPreviousDateRange(array $currentRange): array
    {
        $start = Carbon::parse($currentRange['start']);
        $daysDiff = $start->diffInDays(Carbon::parse($currentRange['end']));

        return [
            'start' => $start->copy()->subDays($daysDiff + 1)->startOfDay(),
            'end' => $start->copy()->subDays(1)->endOfDay(),
        ];
    }

    /**
     * GET /api/dashboard/recent-transactions?type=all|sales|purchases
     * 10 transaksi terakhir untuk tabel di dashboard.
     */
    public function recentTransactions(Request $request): JsonResponse
    {
        $type = $request->get('type', 'all');

        $query = Transaction::with(['customer', 'supplier'])
            ->latest();

        if ($type !== 'all') {
            $query = match($type) {
                'sales' => $query->sales(),
                'purchases' => $query->purchases(),
                default => $query,
            };
        }

        $transactions = $query->limit(10)->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions),
        ]);
    }

    /**
     * GET /api/dashboard/low-stock
     * Produk dengan stok di bawah atau sama dengan min_stock, termasuk metrik urgensi.
     */
    public function lowStock(): JsonResponse
    {
        $products = Product::lowStock()
            ->with('category')
            ->select('id', 'name', 'stock', 'min_stock', 'unit', 'total_sales', 'avg_daily_sales')
            ->get();

        $productsWithMetrics = $products->map(function ($product) {
            $daysRemaining = null;
            $urgency = 'moderate';
            $avgDailySales = $product->avg_daily_sales ?? 0;

            if ($avgDailySales > 0) {
                $daysRemaining = max(0, floor($product->stock / $avgDailySales));

                if ($daysRemaining <= 3) {
                    $urgency = 'critical';
                } elseif ($daysRemaining <= 7) {
                    $urgency = 'warning';
                }
            }

            return [
                'id' => (string) $product->id,
                'name' => $product->name,
                'stock' => $product->stock,
                'minStock' => $product->min_stock,
                'unit' => $product->unit,
                'category' => $product->category?->name,
                'daysRemaining' => $daysRemaining,
                'urgency' => $urgency,
            ];
        });

        return response()->json([
            'data' => $productsWithMetrics,
        ]);
    }

    /**
     * GET /api/dashboard/financial-summary?range=today|week|month
     * Ringkasan keuangan: total piutang, total utang, overdue, pending payments.
     */
    public function financialSummary(Request $request): JsonResponse
    {
        $range = $request->get('range', 'today');
        $dateRange = $this->getDateRange($range);
        $start = $dateRange['start'];
        $end = $dateRange['end'];

        // Total AR (piutang)
        $totalReceivables = Customer::sum('balance');

        // Total AP (utang)
        $totalPayables = Supplier::sum('balance');

        // Overdue receivables (customer dengan balance > 0 + check payment dates)
        $overdueReceivables = Transaction::where('type', 'penjualan_kredit')
            ->where('remaining', '>', 0)
            ->where('date', '<=', Carbon::now()->subDays(30)->toDateString())
            ->count();

        // Pending payments (transactions dengan remaining > 0)
        $pendingPayments = Transaction::where('remaining', '>', 0)->count();

        return response()->json([
            'data' => [
                'totalReceivables' => (float) $totalReceivables,
                'overdueReceivables' => $overdueReceivables,
                'totalPayables' => (float) $totalPayables,
                'pendingPayments' => $pendingPayments,
            ],
        ]);
    }

    /**
     * GET /api/dashboard/sales-trend?range=week|month
     * Data tren penjualan dan pembelian untuk chart.
     */
    public function salesTrend(Request $request): JsonResponse
    {
        $range = $request->get('range', 'week');
        $dateRange = $this->getDateRange($range);
        $start = $dateRange['start'];
        $end = $dateRange['end'];

        $salesData = Transaction::whereBetween('date', [$start, $end])
            ->sales()
            ->selectRaw('DATE(date) as date, SUM(total) as sales, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $purchasesData = Transaction::whereBetween('date', [$start, $end])
            ->purchases()
            ->selectRaw('DATE(date) as date, SUM(total) as purchases, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Format for recharts
        $chartData = collect($salesData)->map(function ($sale) use ($purchasesData) {
            $purchase = $purchasesData->firstWhere('date', $sale->date);

            return [
                'name' => Carbon::parse($sale->date)->format('D'),
                'sales' => (float) ($sale->sales ?? 0),
                'purchases' => (float) ($purchase->purchases ?? 0),
            ];
        })->values()->toArray();

        return response()->json([
            'data' => $chartData,
        ]);
    }
}
