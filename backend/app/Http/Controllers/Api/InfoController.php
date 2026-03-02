<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockMutationResource;
use App\Models\Customer;
use App\Models\FinancialLedger;
use App\Models\Product;
use App\Models\StockMutation;
use App\Models\Supplier;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InfoController extends Controller
{
    /**
     * GET /api/info/kartu-stok?product_id=5&from=2026-01-01&to=2026-02-28
     * Kartu stok kronologis dari tabel stock_mutations.
     */
    public function kartuStok(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $product   = Product::findOrFail($request->product_id);
        $mutations = StockMutation::where('product_id', $request->product_id)
            ->when($request->from, fn($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('created_at', '<=', $request->to))
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'data' => [
                'product'   => [
                    'id'   => (string) $product->id,
                    'code' => $product->code,
                    'name' => $product->name,
                    'unit' => $product->unit,
                ],
                'mutations' => StockMutationResource::collection($mutations),
            ],
        ]);
    }

    /**
     * GET /api/info/saldo-piutang
     * Semua customer yang punya saldo piutang > 0.
     */
    public function saldoPiutang(): JsonResponse
    {
        $customers = Customer::where('balance', '>', 0)
            ->orderByDesc('balance')
            ->get(['id', 'name', 'phone', 'balance']);

        return response()->json([
            'data' => $customers->map(fn($c) => [
                'id'      => (string) $c->id,
                'name'    => $c->name,
                'phone'   => $c->phone,
                'balance' => (float) $c->balance,
            ]),
        ]);
    }

    /**
     * GET /api/info/saldo-utang
     * Semua supplier yang punya saldo utang > 0.
     */
    public function saldoUtang(): JsonResponse
    {
        $suppliers = Supplier::where('balance', '>', 0)
            ->orderByDesc('balance')
            ->get(['id', 'name', 'phone', 'balance']);

        return response()->json([
            'data' => $suppliers->map(fn($s) => [
                'id'      => (string) $s->id,
                'name'    => $s->name,
                'phone'   => $s->phone,
                'balance' => (float) $s->balance,
            ]),
        ]);
    }

    /**
     * GET /api/info/saldo-stok
     * Total nilai stok (HPP) seluruh produk.
     */
    public function saldoStok(): JsonResponse
    {
        $totalValue = Product::selectRaw('SUM(stock * buy_price) as total')->value('total');
        $lowCount   = Product::whereRaw('stock <= min_stock')->count();

        return response()->json([
            'data' => [
                'totalStockValue' => (float) $totalValue,
                'lowStockCount'   => $lowCount,
                'totalProducts'   => Product::count(),
            ],
        ]);
    }

    /**
     * GET /api/info/laporan-harian?date=2026-02-28
     * Laporan ringkasan kasir untuk hari tertentu (kontra-check kasir).
     */
    public function laporanHarian(Request $request): JsonResponse
    {
        $date         = $request->date ?? today()->toDateString();
        $transactions = Transaction::whereDate('date', $date)->get();

        $byType = $transactions->groupBy('type')->map(fn($txs) => [
            'count' => $txs->count(),
            'total' => (float) $txs->sum('total'),
        ]);

        return response()->json([
            'data' => [
                'date'         => $date,
                'totalIn'      => (float) $transactions->whereIn('type', ['penjualan_tunai', 'penjualan_kredit', 'pembayaran_piutang'])->sum('paid'),
                'totalOut'     => (float) $transactions->whereIn('type', ['pembelian', 'pembayaran_utang'])->sum('paid'),
                'transactionCount' => $transactions->count(),
                'byType'       => $byType,
            ],
        ]);
    }
}
