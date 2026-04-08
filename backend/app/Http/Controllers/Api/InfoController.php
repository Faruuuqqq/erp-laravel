<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockMutationResource;
use App\Models\Customer;
use App\Models\FinancialLedger;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StockMutation;
use App\Models\Supplier;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

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
     * Semua customer beserta saldo piutangnya.
     */
    public function saldoPiutang(): JsonResponse
    {
        $customers = Customer::withCount('transactions')
            ->orderByDesc('balance')
            ->get(['id', 'name', 'phone', 'email', 'address', 'balance']);

        return response()->json([
            'data' => $customers->map(fn($c) => [
                'id'                => (string) $c->id,
                'name'              => $c->name,
                'phone'             => $c->phone ?? '',
                'email'             => $c->email ?? '',
                'address'           => $c->address ?? '',
                'balance'           => (float) $c->balance,
                'totalTransactions' => $c->transactions_count,
            ]),
        ]);
    }

    /**
     * GET /api/info/saldo-utang
     * Semua supplier beserta saldo utangnya.
     */
    public function saldoUtang(): JsonResponse
    {
        $suppliers = Supplier::withCount('transactions')
            ->orderByDesc('balance')
            ->get(['id', 'name', 'phone', 'email', 'address', 'balance']);

        return response()->json([
            'data' => $suppliers->map(fn($s) => [
                'id'                => (string) $s->id,
                'name'              => $s->name,
                'phone'             => $s->phone ?? '',
                'email'             => $s->email ?? '',
                'address'           => $s->address ?? '',
                'balance'           => (float) $s->balance,
                'totalTransactions' => $s->transactions_count,
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

    // ─── Print Saldo Piutang PDF (GET /info/saldo-piutang/print) ────────────
    public function printSaldoPiutang(): JsonResponse
    {
        $customers = Customer::withCount('transactions')
            ->orderByDesc('balance')
            ->get(['id', 'name', 'phone', 'email', 'address', 'balance']);

        // Get store settings
        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
        ];

        $pdf = PDF::loadView('pdf.saldo-piutang', compact([
            'customers',
            'storeSettings',
        ]))->setPaper('a4')->setOption('isHtml5ParserEnabled', true);

        $filename = "saldo-piutang-" . now()->format('Y-m-d') . ".pdf";
        Storage::disk('public')->put("reports/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/reports/{$filename}"),
            'filename' => $filename,
        ]);
    }

    // ─── Print Saldo Utang PDF (GET /info/saldo-utang/print) ────────────
    public function printSaldoUtang(): JsonResponse
    {
        $suppliers = Supplier::withCount('transactions')
            ->orderByDesc('balance')
            ->get(['id', 'name', 'phone', 'email', 'address', 'balance']);

        // Get store settings
        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
        ];

        $pdf = PDF::loadView('pdf.saldo-utang', compact([
            'suppliers',
            'storeSettings',
        ]))->setPaper('a4')->setOption('isHtml5ParserEnabled', true);

        $filename = "saldo-utang-" . now()->format('Y-m-d') . ".pdf";
        Storage::disk('public')->put("reports/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/reports/{$filename}"),
            'filename' => $filename,
        ]);
    }

    // ─── Print Kartu Stok PDF (GET /info/kartu-stok/print) ────────────
    public function printKartuStok(Request $request): JsonResponse
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

        // Get store settings
        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
        ];

        $pdf = PDF::loadView('pdf.kartu-stok', compact([
            'product',
            'mutations',
            'storeSettings',
        ]))->setPaper('a4')->setOption('isHtml5ParserEnabled', true);

        $filename = "kartu-stok-{$product->code}-" . now()->format('Y-m-d') . ".pdf";
        Storage::disk('public')->put("reports/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/reports/{$filename}"),
            'filename' => $filename,
        ]);
    }
}
