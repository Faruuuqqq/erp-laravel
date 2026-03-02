<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => (string) $this->id,
            'code'        => $this->code,
            'name'        => $this->name,
            'category'    => $this->category->name ?? '',
            'categoryId'  => (string) ($this->category_id ?? ''),
            'buyPrice'    => (float) $this->buy_price,
            'sellPrice'   => (float) $this->sell_price,
            'stock'       => (int) $this->stock,
            'minStock'    => (int) $this->min_stock,
            'unit'        => $this->unit,
            'warehouseId' => $this->warehouse_id ? (string) $this->warehouse_id : null,
            'warehouse'   => $this->whenLoaded('warehouse', fn() => $this->warehouse?->name),
            'createdAt'   => $this->created_at?->toISOString(),
            'updatedAt'   => $this->updated_at?->toISOString(),
        ];
    }
}
