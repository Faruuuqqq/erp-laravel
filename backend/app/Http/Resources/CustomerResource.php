<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => (string) $this->id,
            'name'              => $this->name,
            'phone'             => $this->phone ?? '',
            'phone2'            => $this->phone2 ?? '',
            'email'             => $this->email ?? '',
            'address'           => $this->address ?? '',
            'city'              => $this->city ?? '',
            'balance'           => (float) $this->balance,
            'creditLimit'       => (float) ($this->credit_limit ?? 0),
            'discount'          => $this->discount ?? '',
            'warehouse'         => $this->warehouse ?? '',
            'priceList'         => $this->price_list ?? '',
            'area'              => $this->daerah ?? '',
            'notes'             => $this->keterangan ?? '',
            'npwp'              => $this->npwp ?? '',
            'totalTransactions' => $this->transactions()->count(),
            'createdAt'         => $this->created_at?->toISOString(),
            'updatedAt'         => $this->updated_at?->toISOString(),
        ];
    }
}
