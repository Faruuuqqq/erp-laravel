<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => (string) $this->id,
            'name'          => $this->name,
            'address'       => $this->address ?? '',
            'status'        => $this->status,
            'totalProducts' => $this->products()->count(),
            'createdAt'     => $this->created_at?->toISOString(),
            'updatedAt'     => $this->updated_at?->toISOString(),
        ];
    }
}
