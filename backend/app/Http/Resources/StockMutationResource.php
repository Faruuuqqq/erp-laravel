<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StockMutationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => (string) $this->id,
            'productId'    => (string) $this->product_id,
            'productName'  => $this->product?->name ?? '-',
            'type'         => $this->type, // IN | OUT | ADJUSTMENT
            'quantity'     => (int) $this->quantity,
            'stockBefore'  => (int) $this->stock_before,
            'stockAfter'   => (int) $this->stock_after,
            'reference'    => $this->reference,
            'notes'        => $this->notes,
            'createdAt'    => $this->created_at?->toISOString(),
        ];
    }
}
