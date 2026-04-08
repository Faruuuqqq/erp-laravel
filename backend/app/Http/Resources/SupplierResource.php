<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => (string) $this->id,
            'supplierId'      => $this->supplier_id ?? '',
            'name'            => $this->name,
            'phone1'          => $this->phone_1 ?? '',
            'phone2'          => $this->phone_2 ?? '',
            'phone'           => $this->phone ?? '', // Keep for backward compatibility
            'email'           => $this->email ?? '',
            'address'         => $this->address ?? '',
            'city'            => $this->city ?? '',
            'contactPerson'   => $this->contact_person ?? '',
            'bankAccount'     => $this->bank_account ?? '',
            'balance'         => (float) $this->balance,
            'totalTransactions' => $this->transactions()->count(),
            'createdAt'       => $this->created_at?->toISOString(),
            'updatedAt'       => $this->updated_at?->toISOString(),
        ];
    }
}
