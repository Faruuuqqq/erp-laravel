<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TransactionResource;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * GET /api/reports/daily?date=2026-02-28
     * Laporan ringkasan harian: total penjualan, pembelian, profit, dan summary transaksi.
     */
    public function daily(Request $request): JsonResponse
    {
        $date = $request->date ?? today()->toDateString();

        $sales     = Transaction::whereDate('date', $date)->sales()->get();
        $purchases = Transaction::whereDate('date', $date)->purchases()->get();

        $totalSales     = $sales->sum('total');
        $totalPurchases = $purchases->sum('total');

        return response()->json([
            'data' => [
                'date'           => $date,
                'totalSales'     => (float) $totalSales,
                'totalPurchases' => (float) $totalPurchases,
                'grossProfit'    => (float) ($totalSales - $totalPurchases),
                'salesCount'     => $sales->count(),
                'purchasesCount' => $purchases->count(),
                'transactions'   => TransactionResource::collection($sales->concat($purchases)),
            ],
        ]);
    }

    /**
     * GET /api/reports/stock
     * Ringkasan nilai stok semua produk (untuk laporan Neraca Stok).
     */
    public function stock(): JsonResponse
    {
        $products = Product::with('category')->get();

        $data = $products->map(fn($p) => [
            'id'         => (string) $p->id,
            'code'       => $p->code,
            'name'       => $p->name,
            'category'   => $p->category?->name,
            'stock'      => (int) $p->stock,
            'unit'       => $p->unit,
            'buyPrice'   => (float) $p->buy_price,
            'sellPrice'  => (float) $p->sell_price,
            'stockValue' => round($p->stock * $p->buy_price, 2),
        ]);

        return response()->json([
            'data' => [
                'items'      => $data,
                'totalValue' => $data->sum('stockValue'),
            ],
        ]);
    }

    /**
     * GET /api/reports/balance
     * Laporan laba-rugi ringkasan berdasarkan periode.
     */
    public function balance(Request $request): JsonResponse
    {
        $from = $request->from ?? today()->startOfMonth()->toDateString();
        $to   = $request->to   ?? today()->toDateString();

        $totalSales     = Transaction::whereBetween('date', [$from, $to])->sales()->sum('total');
        $totalPurchases = Transaction::whereBetween('date', [$from, $to])->purchases()->sum('total');

        return response()->json([
            'data' => [
                'from'           => $from,
                'to'             => $to,
                'totalSales'     => (float) $totalSales,
                'totalPurchases' => (float) $totalPurchases,
                'grossProfit'    => (float) ($totalSales - $totalPurchases),
            ],
        ]);
    }

    /**
     * GET /api/reports/history/pembelian
     */
    public function historyPembelian(Request $request): JsonResponse
    {
        $transactions = Transaction::with(['supplier'])
            ->where('type', 'pembelian')
            ->when($request->from, fn($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('date', '<=', $request->to))
            ->latest()
            ->paginate($request->perPage ?? 25);

        return response()->json([
            'data' => TransactionResource::collection($transactions)->response()->getData(),
        ]);
    }

    /**
     * GET /api/reports/history/penjualan
     */
    public function historyPenjualan(Request $request): JsonResponse
    {
        $transactions = Transaction::with(['customer'])
            ->whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
            ->when($request->from, fn($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('date', '<=', $request->to))
            ->latest()
            ->paginate($request->perPage ?? 25);

        return response()->json([
            'data' => TransactionResource::collection($transactions)->response()->getData(),
        ]);
    }

    /**
     * GET /api/reports/daily/print?date=2026-02-28
     */
    public function printDaily(Request $request): JsonResponse
    {
        $date = $request->date ?? today()->toDateString();
        
        $sales = Transaction::whereDate('date', $date)->sales()->get();
        $purchases = Transaction::whereDate('date', $date)->purchases()->get();
        
        $totalSales = $sales->sum('total');
        $totalPurchases = $purchases->sum('total');
        
        $data = [
            'date' => $date,
            'totalSales' => (float) $totalSales,
            'totalPurchases' => (float) $totalPurchases,
            'grossProfit' => (float) ($totalSales - $totalPurchases),
            'salesCount' => $sales->count(),
            'purchasesCount' => $purchases->count(),
            'transactions' => $sales->concat($purchases)->load(['customer', 'supplier', 'items']),
        ];

        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
            'npwp' => Setting::get('npwp') ?? '',
            'siup' => Setting::get('siup') ?? '',
        ];

        $pdf = PDF::loadView('pdf.report-daily', compact('data', 'storeSettings'))
            ->setPaper('a4', 'landscape')
            ->setOption('isHtml5ParserEnabled', true);

        $filename = "laporan-harian-{$date}.pdf";
        Storage::disk('public')->put("reports/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/reports/{$filename}"),
            'filename' => $filename,
        ]);
    }

    /**
     * GET /api/reports/stock/print
     */
    public function printStock(): JsonResponse
    {
        $products = Product::with('category')->get();
        
        $data = [
            'items' => $products->map(fn($p) => [
                'code' => $p->code,
                'name' => $p->name,
                'category' => $p->category?->name,
                'stock' => (int) $p->stock,
                'unit' => $p->unit,
                'buyPrice' => (float) $p->buy_price,
                'sellPrice' => (float) $p->sell_price,
                'stockValue' => round($p->stock * $p->buy_price, 2),
            ]),
            'totalValue' => $products->sum(fn($p) => $p->stock * $p->buy_price),
        ];

        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
        ];

        $pdf = PDF::loadView('pdf.report-stock', compact('data', 'storeSettings'))
            ->setPaper('a4')
            ->setOption('isHtml5ParserEnabled', true);

        $filename = "laporan-stok-" . date('Y-m-d') . ".pdf";
        Storage::disk('public')->put("reports/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/reports/{$filename}"),
            'filename' => $filename,
        ]);
    }

    /**
     * GET /api/reports/balance/print?from=2026-01-01&to=2026-01-31
     */
    public function printBalance(Request $request): JsonResponse
    {
        $from = $request->from ?? today()->startOfMonth()->toDateString();
        $to = $request->to ?? today()->toDateString();
        
        $totalSales = Transaction::whereBetween('date', [$from, $to])->sales()->sum('total');
        $totalPurchases = Transaction::whereBetween('date', [$from, $to])->purchases()->sum('total');
        
        $data = [
            'from' => $from,
            'to' => $to,
            'totalSales' => (float) $totalSales,
            'totalPurchases' => (float) $totalPurchases,
            'grossProfit' => (float) ($totalSales - $totalPurchases),
        ];

        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
            'npwp' => Setting::get('npwp') ?? '',
            'siup' => Setting::get('siup') ?? '',
        ];

        $pdf = PDF::loadView('pdf.report-balance', compact('data', 'storeSettings'))
            ->setPaper('a4')
            ->setOption('isHtml5ParserEnabled', true);

        $filename = "laporan-balance-{$from}-to-{$to}.pdf";
        Storage::disk('public')->put("reports/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/reports/{$filename}"),
            'filename' => $filename,
        ]);
    }
}
