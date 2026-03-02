<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReturnPurchaseRequest;
use App\Models\ReturnPurchase;
use App\Models\Transaction;
use App\Models\Product;
use App\Services\StockService;
use App\Services\FinancialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReturnPurchaseController extends Controller
{
    public function __construct(
        private readonly StockService $stockService,
        private readonly FinancialService $financialService,
    ) {}

    public function index()
    {
        $returns = ReturnPurchase::with(['transaction', 'supplier', 'items.product'])
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

    public function store(StoreReturnPurchaseRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            // Generate return number
            $returnNumber = $this->stockService->generateInvoiceNumber('retur_pembelian');

            // Create return purchase
            $returnPurchase = ReturnPurchase::create([
                'return_number' => $returnNumber,
                'date' => $request->date,
                'transaction_id' => $request->transaction_id,
                'supplier_id' => $request->transaction_id ? Transaction::find($request->transaction_id)?->supplier_id : null,
                'reason' => $request->reason,
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

                // Create return purchase item
                $returnPurchase->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $itemDiscount,
                    'subtotal' => $itemSubtotal,
                ]);

                // Mutate stock (DECREASE stock for return purchase - items returned TO supplier)
                $this->stockService->mutate(
                    product: $product,
                    type: 'OUT',
                    quantity: $item['quantity'],
                    transactionId: $returnPurchase->id,
                    reference: $returnNumber,
                );

                $subtotal += $itemSubtotal;
            }

            // Adjust supplier balance (INCREASE utang - we still owe money because items are returned)
            if ($request->transaction_id && $subtotal > 0) {
                $transaction = Transaction::find($request->transaction_id);
                if ($transaction && $transaction->supplier) {
                    $this->financialService->increaseUtang($transaction->supplier, $subtotal, $returnPurchase->id);
                }
            }

            return response()->json([
                'data' => $returnPurchase->load('items'),
                'message' => "Retur pembelian {$returnNumber} berhasil disimpan.",
            ], 201);
        });
    }

    public function show(ReturnPurchase $returnPurchase): JsonResponse
    {
        return response()->json([
            'data' => $returnPurchase->load(['items', 'transaction', 'supplier']),
        ]);
    }

    public function update(Request $request, ReturnPurchase $returnPurchase): JsonResponse
    {
        $data = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:draft,processed,cancelled'],
        ]);

        $returnPurchase->update($data);

        return response()->json([
            'data' => $returnPurchase->fresh(),
            'message' => 'Retur pembelian berhasil diperbarui.',
        ]);
    }

    public function destroy(ReturnPurchase $returnPurchase): JsonResponse
    {
        $returnPurchase->delete();

        return response()->json(['message' => 'Retur pembelian berhasil dihapus.']);
    }
}
