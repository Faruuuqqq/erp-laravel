<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Transaction;
use App\Models\Setting;
use App\Services\FinancialService;
use App\Services\StockService;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TransactionController extends Controller
{
    public function __construct(
        private readonly StockService     $stockService,
        private readonly FinancialService $financialService,
    ) {}

    // ─── Index ────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Transaction::with(['customer', 'supplier'])
            ->search($request->search);

        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->from) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->to) {
            $query->whereDate('date', '<=', $request->to);
        }

        $transactions = $query->latest()->paginate($request->perPage ?? 25);
        return TransactionResource::collection($transactions);
    }

    // ─── Store (Core business logic) ─────────────────────────────────────────
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            // 1. Buat header transaksi
            $subtotal = 0;
            $invoiceNumber = $this->stockService->generateInvoiceNumber($request->type);

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'date'           => $request->date,
                'type'           => $request->type,
                'supplier_id'    => $request->supplierId,
                'customer_id'    => $request->customerId,
                'sales_rep_id'   => $request->salesId,
                'discount'       => $request->discount ?? 0,
                'tax'            => $request->tax ?? 0,
                'paid'           => $request->paid ?? 0,
                'notes'          => $request->notes,
                'status'         => 'completed',
                'created_by'     => auth()->id(),
                // Sementara 0, diupdate setelah items diproses
                'subtotal'       => 0,
                'total'          => 0,
                'remaining'      => 0,
            ]);

            // 2. Proses setiap item
            $stockDirection = $this->stockService->getStockDirection($request->type);

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['productId']);
                $itemDiscount = $item['discount'] ?? 0;
                $itemSubtotal = $item['quantity'] * $item['price'] * (1 - ($itemDiscount / 100));

                // 2a. Simpan detail transaksi
                $transaction->details()->create([
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'quantity'     => $item['quantity'],
                    'price'        => $item['price'],
                    'discount'     => $itemDiscount,
                    'subtotal'     => $itemSubtotal,
                ]);

                // 2b. Mutasi stok (jika tipe mempengaruhi stok)
                if ($stockDirection !== 'NONE') {
                    $this->stockService->mutate(
                        product:       $product,
                        type:          $stockDirection,
                        quantity:      $item['quantity'],
                        transactionId: $transaction->id,
                        reference:     $invoiceNumber,
                    );
                }

                // 2c. Update HPP jika Pembelian (Average Cost Method)
                if ($request->type === 'pembelian') {
                    $this->stockService->updateHPP($product, $item['quantity'], $item['price']);
                }

                $subtotal += $itemSubtotal;
            }

            // 3. Hitung dan simpan total
            $total     = $subtotal - $transaction->discount + $transaction->tax;
            $paid      = min((float) $request->paid, $total); // paid tidak boleh melebihi total
            $remaining = max(0, $total - $paid);

            $transaction->update([
                'subtotal'  => $subtotal,
                'total'     => $total,
                'paid'      => $paid,
                'remaining' => $remaining,
            ]);

            // 4. Catat piutang/utang (untuk transaksi kredit)
            if ($request->type === 'penjualan_kredit' && $remaining > 0) {
                $this->financialService->addPiutang($transaction->fresh());
            }
            if ($request->type === 'pembelian' && $remaining > 0) {
                $this->financialService->addUtang($transaction->fresh());
            }

            // 5. Proses pembayaran utang/piutang melalui transaksi khusus
            if ($request->type === 'pembayaran_piutang' && $request->customerId) {
                $customer = Customer::findOrFail($request->customerId);
                $this->financialService->payPiutang($customer, $paid, $transaction->id);
            }
            if ($request->type === 'pembayaran_utang' && $request->supplierId) {
                $supplier = Supplier::findOrFail($request->supplierId);
                $this->financialService->payUtang($supplier, $paid, $transaction->id);
            }

            return response()->json([
                'data'    => new TransactionResource($transaction->load('details')),
                'message' => "Transaksi {$invoiceNumber} berhasil disimpan.",
            ], 201);
        });
    }

    // ─── Show ─────────────────────────────────────────────────────────────────
    public function show(Transaction $transaction): JsonResponse
    {
        return response()->json([
            'data' => new TransactionResource($transaction->load(['details', 'customer', 'supplier', 'salesRep'])),
        ]);
    }

    // ─── Update (terbatas – hanya notes dan status) ───────────────────────────
    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        $data = $request->validate([
            'notes'  => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:draft,completed,cancelled'],
        ]);
        $transaction->update($data);
        return response()->json([
            'data'    => new TransactionResource($transaction->fresh()),
            'message' => 'Transaksi berhasil diperbarui.',
        ]);
    }

    // ─── Destroy (SoftDelete) ─────────────────────────────────────────────────
    public function destroy(Transaction $transaction): JsonResponse
    {
        $transaction->delete();
        return response()->json(['message' => 'Transaksi berhasil dihapus.']);
    }

    // ─── Update Payment Status (PATCH /transactions/{id}/payment) ─────────────
    public function updatePayment(Request $request, Transaction $transaction): JsonResponse
    {
        $validated = $request->validate([
            'paid'          => ['required', 'numeric', 'min:0'],
            'paymentStatus' => ['nullable', 'in:lunas,belum_lunas'],
        ]);

        $additionalPaid = (float) $validated['paid'];
        $newPaid        = $transaction->paid + $additionalPaid;
        $newRemaining   = max(0, $transaction->total - $newPaid);

        $transaction->update([
            'paid'      => $newPaid,
            'remaining' => $newRemaining,
        ]);

        // Kurangi piutang customer jika ada
        if ($transaction->type === 'penjualan_kredit' && $transaction->customer_id) {
            $customer = Customer::findOrFail($transaction->customer_id);
            $this->financialService->payPiutang($customer, $additionalPaid, $transaction->id);
        }

        return response()->json([
            'data'    => new TransactionResource($transaction->fresh()),
            'message' => 'Status pembayaran berhasil diperbarui.',
        ]);
    }

    // ─── Print Invoice PDF (GET /transactions/{id}/print/invoice) ────────────
    public function printInvoice(Transaction $transaction): JsonResponse
    {
        $transaction->load(['items', 'customer', 'supplier', 'sales']);
        
        // Get store settings
        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
            'npwp' => Setting::get('npwp') ?? '',
            'siup' => Setting::get('siup') ?? '',
        ];

        $pdf = PDF::loadView('pdf.invoice', compact([
            'transaction',
            'storeSettings',
        ]))->setPaper('a4')->setOption('isHtml5ParserEnabled', true);

        $filename = "invoice-{$transaction->invoice_number}.pdf";
        Storage::disk('public')->put("invoices/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/invoices/{$filename}"),
            'filename' => $filename,
        ]);
    }

    // ─── Print Receipt PDF (GET /transactions/{id}/print/receipt) ────────────
    public function printReceipt(Transaction $transaction): JsonResponse
    {
        $transaction->load(['items', 'customer', 'supplier']);
        
        // Get store settings
        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
        ];

        $pdf = PDF::loadView('pdf.receipt', compact([
            'transaction',
            'storeSettings',
        ]))->setPaper([0, 0, 226.77, 600]) // 80mm thermal width
            ->setOption('isHtml5ParserEnabled', true)
            ->setOption('isRemoteEnabled', true);

        $filename = "receipt-{$transaction->invoice_number}.pdf";
        Storage::disk('public')->put("receipts/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/receipts/{$filename}"),
            'filename' => $filename,
        ]);
    }
}
