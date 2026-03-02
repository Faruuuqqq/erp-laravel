<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryNoteRequest;
use App\Models\DeliveryNote;
use App\Models\Transaction;
use App\Models\Customer;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class DeliveryNoteController extends Controller
{
    public function index()
    {
        $deliveryNotes = DeliveryNote::with(['transaction', 'customer'])
            ->latest()
            ->paginate(25);

        return response()->json([
            'data' => $deliveryNotes->items(),
            'meta' => [
                'current_page' => $deliveryNotes->currentPage(),
                'last_page' => $deliveryNotes->lastPage(),
                'per_page' => $deliveryNotes->perPage(),
                'total' => $deliveryNotes->total(),
            ],
        ]);
    }

    public function store(StoreDeliveryNoteRequest $request): JsonResponse
    {
        $deliveryNumber = $this->generateDeliveryNumber();
        
        $deliveryNote = DeliveryNote::create([
            'delivery_number' => $deliveryNumber,
            'date' => $request->date,
            'transaction_id' => $request->transaction_id,
            'customer_id' => $request->customer_id,
            'driver' => $request->driver,
            'vehicle_plate' => $request->vehicle_plate,
            'notes' => $request->notes,
            'status' => 'delivered',
            'created_by' => auth()->id(),
        ]);

        // Update transaction status if needed
        $transaction = Transaction::find($request->transaction_id);
        if ($transaction && $transaction->status === 'completed') {
            $transaction->status = 'completed';
            $transaction->save();
        }

        return response()->json([
            'data' => $deliveryNote,
            'message' => "Surat jalan {$deliveryNumber} berhasil dibuat.",
        ], 201);
    }

    public function show(DeliveryNote $deliveryNote): JsonResponse
    {
        return response()->json([
            'data' => $deliveryNote->load(['transaction', 'customer']),
        ]);
    }

    public function update(Request $request, DeliveryNote $deliveryNote): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,delivered,cancelled'],
        ]);

        $deliveryNote->update($data);

        return response()->json([
            'data' => $deliveryNote->fresh(),
            'message' => 'Surat jalan berhasil diperbarui.',
        ]);
    }

    public function destroy(DeliveryNote $deliveryNote): JsonResponse
    {
        $deliveryNote->delete();

        return response()->json(['message' => 'Surat jalan berhasil dihapus.']);
    }

    public function print(DeliveryNote $deliveryNote)
    {
        $deliveryNote->load(['transaction', 'customer', 'transaction.items']);

        $pdf = Pdf::loadView('pdf.delivery-note', compact([
            'deliveryNote' => $deliveryNote,
            'transaction' => $deliveryNote->transaction,
            'customer' => $deliveryNote->customer,
            'items' => $deliveryNote->transaction->items ?? [],
        ]))->setPaper('a4')->setOption('isHtml5ParserEnabled', true);

        $filename = "surat-jalan-{$deliveryNote->delivery_number}.pdf";

        // Save to storage
        Storage::disk('public')->put("delivery-notes/{$filename}", $pdf->output());

        // Return download URL
        return response()->json([
            'url' => asset("storage/delivery-notes/{$filename}"),
            'filename' => $filename,
        ]);
    }

    private function generateDeliveryNumber(): string
    {
        $prefix = 'SJ';
        $date = now()->format('Ymd');
        $lastDelivery = DeliveryNote::whereDate('date', '>=', now()->startOfDay())
            ->orderBy('id', 'desc')
            ->first();

        if ($lastDelivery && str_starts_with($lastDelivery->delivery_number, "{$prefix}-{$date}")) {
            $number = (int) substr($lastDelivery->delivery_number, -4) + 1;
            return sprintf("%s-%s-%03d", $prefix, $date, $number);
        }

        return sprintf("%s-%s-001", $prefix, $date);
    }
}
