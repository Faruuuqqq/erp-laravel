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

        $product   = Product::with('category')->findOrFail($request->product_id);
        $mutations = StockMutation::where('product_id', $request->product_id)
            ->when($request->from, fn($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('created_at', '<=', $request->to))
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'data' => [
                'product'   => [
                    'id'           => (string) $product->id,
                    'code'         => $product->code,
                    'name'         => $product->name,
                    'unit'         => $product->unit,
                    'categoryName' => $product->category?->name ?? 'Uncategorized',
                    'buyPrice'     => (float) $product->buy_price,
                    'sellPrice'    => (float) $product->sell_price,
                    'minimumStock' => (int) $product->min_stock,
                    'currentStock' => (int) $product->stock,
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
        $customers = Customer::orderByDesc('balance')->get();

        return response()->json([
            'data' => $customers->map(fn($c) => [
                'id'          => (string) $c->id,
                'code'        => $c->code ?? 'N/A',
                'name'        => $c->name,
                'email'       => $c->email,
                'phone'       => $c->phone,
                'balance'     => (float) $c->balance,
                'creditLimit' => (float) ($c->credit_limit ?? 0),
            ]),
        ]);
    }

    /**
     * GET /api/info/saldo-utang
     * Semua supplier yang punya saldo utang > 0.
     */
    public function saldoUtang(): JsonResponse
    {
        $suppliers = Supplier::orderByDesc('balance')->get();

        // Count transactions per supplier
        $transactionCounts = Transaction::whereIn('type', ['pembelian', 'pembayaran_utang'])
            ->select('supplier_id')
            ->distinct()
            ->groupBy('supplier_id')
            ->get()
            ->mapWithKeys(fn($t) => [$t->supplier_id => Transaction::where('supplier_id', $t->supplier_id)->count()]);

        return response()->json([
            'data' => $suppliers->map(fn($s) => [
                'id'                 => (string) $s->id,
                'code'               => $s->code ?? 'N/A',
                'name'               => $s->name,
                'email'              => $s->email,
                'phone'              => $s->phone,
                'address'            => $s->address,
                'balance'            => (float) $s->balance,
                'totalTransactions'  => (float) ($transactionCounts[$s->id] ?? 0),
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
        $transactions = Transaction::whereDate('date', $date)->with(['customer', 'supplier', 'details'])->get();

        $sales = $transactions->whereIn('type', ['penjualan_tunai', 'penjualan_kredit']);
        $purchases = $transactions->where('type', 'pembelian');

        $penjualanTunai = $transactions->where('type', 'penjualan_tunai')->sum('total');
        $penjualanKredit = $transactions->where('type', 'penjualan_kredit')->sum('total');
        $totalPembelian = $purchases->sum('total');
        $totalBiaya = 0; // Placeholder - expenses table integration if needed

        $byType = $transactions->groupBy('type')->map(fn($txs) => [
            'count' => $txs->count(),
            'total' => (float) $txs->sum('total'),
        ]);

        return response()->json([
            'data' => [
                'date'     => $date,
                'summary'  => [
                    'totalPenjualan'   => (float) ($penjualanTunai + $penjualanKredit),
                    'totalPembelian'   => (float) $totalPembelian,
                    'totalBiaya'       => (float) $totalBiaya,
                    'kasBersih'        => (float) ($penjualanTunai - $totalPembelian),
                    'penjualanTunai'   => (float) $penjualanTunai,
                    'penjualanKredit'  => (float) $penjualanKredit,
                ],
                'transactions' => $transactions->map(fn($t) => [
                    'id'            => (string) $t->id,
                    'invoiceNumber' => $t->invoice_number ?? 'N/A',
                    'type'          => $t->type,
                    'customer'      => $t->customer?->name,
                    'supplier'      => $t->supplier?->name,
                    'total'         => (float) $t->total,
                    'paid'          => (float) $t->paid ?? 0,
                    'remaining'     => (float) ($t->total - ($t->paid ?? 0)),
                ])->values(),
                'expenses'  => [],
                'totalIn'   => (float) $transactions->whereIn('type', ['penjualan_tunai', 'penjualan_kredit', 'pembayaran_piutang'])->sum('paid'),
                'totalOut'  => (float) $transactions->whereIn('type', ['pembelian', 'pembayaran_utang'])->sum('paid'),
                'transactionCount' => $transactions->count(),
                'byType'    => $byType,
            ],
        ]);
    }
}
