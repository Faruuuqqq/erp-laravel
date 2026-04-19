<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => (string) $this->id,
            'code'              => 'SUP-' . str_pad($this->id, 4, '0', STR_PAD_LEFT),
            'name'              => $this->name,
            'phone'             => $this->phone ?? '',
            'phone2'            => $this->phone2 ?? '',
            'email'             => $this->email ?? '',
            'address'           => $this->address ?? '',
            'city'              => $this->city ?? '',
            'noRekening'        => $this->no_rekening ?? '',
            'balance'           => (float) $this->balance,
            'totalTransactions' => $this->transactions()->count(),
            'createdAt'         => $this->created_at?->toISOString(),
            'updatedAt'         => $this->updated_at?->toISOString(),
        ];
    }
}
