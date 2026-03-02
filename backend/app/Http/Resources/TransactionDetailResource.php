<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionDetailResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => (string) $this->id,
            'productId'   => (string) $this->product_id,
            'productName' => $this->product_name,
            'quantity'    => (int) $this->quantity,
            'price'       => (float) $this->price,
            'discount'    => (float) $this->discount,
            'subtotal'    => (float) $this->subtotal,
        ];
    }
}
