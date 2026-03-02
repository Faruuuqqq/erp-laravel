<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SalesRepResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => (string) $this->id,
            'name'       => $this->name,
            'phone'      => $this->phone ?? '',
            'email'      => $this->email ?? '',
            'address'    => $this->address ?? '',
            'status'     => $this->status,
            'totalSales' => (float) $this->total_sales,
            'createdAt'  => $this->created_at?->toISOString(),
            'updatedAt'  => $this->updated_at?->toISOString(),
        ];
    }
}
