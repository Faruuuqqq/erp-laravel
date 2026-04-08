<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReturnSaleRequest;
use App\Models\ReturnSale;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\Setting;
use App\Services\StockService;
use App\Services\FinancialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class ReturnSaleController extends Controller
{
    public function __construct(
        private readonly StockService $stockService,
        private readonly FinancialService $financialService,
    ) {}

    public function index()
    {
        $returns = ReturnSale::with(['transaction', 'customer', 'items.product'])
            ->latest()
            ->paginate(25);

        return response()->json([
            'data' => $returns->items(),
            'meta' => [
                'current_page' => $returns->currentPage(),
                'last_page' => $returns->lastPage(),
                'per_page' => $returns->perPage(),
                'total' => $returns->total(),
            ],
        ]);
    }

    public function store(StoreReturnSaleRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            // Generate return number
            $returnNumber = $this->stockService->generateInvoiceNumber('retur_penjualan');

            // Determine customer_id
            $customerId = $request->customer_id;
            if (!$customerId && $request->transaction_id) {
                $customerId = Transaction::find($request->transaction_id)?->customer_id;
            }

            // Create return sale
            $returnSale = ReturnSale::create([
                'return_number' => $returnNumber,
                'date' => $request->date,
                'transaction_id' => $request->transaction_id,
                'customer_id' => $customerId,
                'reason' => $request->reason,
                'refund_method' => $request->refund_method,
                'notes' => $request->notes,
                'status' => 'processed',
                'created_by' => auth()->id(),
            ]);

            $subtotal = 0;

            // Process items
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['productId']);
                $itemDiscount = $item['discount'] ?? 0;
                $itemSubtotal = $item['quantity'] * $item['price'] * (1 - ($itemDiscount / 100));

                // Create return sale item
                $returnSale->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $itemDiscount,
                    'subtotal' => $itemSubtotal,
                ]);

                // Mutate stock (increase stock for return)
                $this->stockService->mutate(
                    product: $product,
                    type: 'IN',
                    quantity: $item['quantity'],
                    transactionId: $returnSale->id,
                    reference: $returnNumber,
                );

                $subtotal += $itemSubtotal;
            }

            // Adjust customer balance (reduce piutang)
            if ($customerId && $subtotal > 0) {
                $customer = \App\Models\Customer::find($customerId);
                if ($customer) {
                    $this->financialService->reducePiutang($customer, $subtotal, $returnSale->id);
                }
            }

            return response()->json([
                'data' => $returnSale->load('items'),
                'message' => "Retur penjualan {$returnNumber} berhasil disimpan.",
            ], 201);
        });
    }

    public function show(ReturnSale $returnSale): JsonResponse
    {
        return response()->json([
            'data' => $returnSale->load(['items', 'transaction', 'customer']),
        ]);
    }

    public function update(Request $request, ReturnSale $returnSale): JsonResponse
    {
        $data = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:draft,processed,cancelled'],
        ]);

        $returnSale->update($data);

        return response()->json([
            'data' => $returnSale->fresh(),
            'message' => 'Retur penjualan berhasil diperbarui.',
        ]);
    }

    public function destroy(ReturnSale $returnSale): JsonResponse
    {
        $returnSale->delete();

        return response()->json(['message' => 'Retur penjualan berhasil dihapus.']);
    }

    // ─── Print Return Sale PDF (GET /return-sales/{id}/print) ────────────
    public function print(ReturnSale $returnSale): JsonResponse
    {
        $returnSale->load(['items.product', 'customer', 'transaction']);
        
        // Get store settings
        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
            'npwp' => Setting::get('npwp') ?? '',
            'siup' => Setting::get('siup') ?? '',
        ];

        $pdf = PDF::loadView('pdf.return-sale', compact([
            'returnSale',
            'storeSettings',
        ]))->setPaper('a4')->setOption('isHtml5ParserEnabled', true);

        $filename = "return-sale-{$returnSale->return_number}.pdf";
        Storage::disk('public')->put("returns/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/returns/{$filename}"),
            'filename' => $filename,
        ]);
    }
}
