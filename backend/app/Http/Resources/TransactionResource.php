<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => (string) $this->id,
            'invoiceNumber' => $this->invoice_number,
            'date'          => $this->date?->format('Y-m-d'),
            'type'          => $this->type,
            'supplierId'    => $this->supplier_id ? (string) $this->supplier_id : null,
            'supplier'      => $this->whenLoaded('supplier', fn() => $this->supplier?->name),
            'customerId'    => $this->customer_id ? (string) $this->customer_id : null,
            'customer'      => $this->whenLoaded('customer', fn() => $this->customer?->name),
            'salesId'       => $this->sales_rep_id ? (string) $this->sales_rep_id : null,
            'subtotal'      => (float) $this->subtotal,
            'discount'      => (float) $this->discount,
            'tax'           => (float) $this->tax,
            'total'         => (float) $this->total,
            'paid'          => (float) $this->paid,
            'remaining'     => (float) $this->remaining,
            'status'        => $this->status,
            'paymentStatus' => $this->remaining <= 0 ? 'lunas' : 'belum_lunas',
            'notes'         => $this->notes,
            'items'         => TransactionDetailResource::collection(
                $this->whenLoaded('details')
            ),
            'createdAt'     => $this->created_at?->toISOString(),
            'updatedAt'     => $this->updated_at?->toISOString(),
        ];
    }
}
