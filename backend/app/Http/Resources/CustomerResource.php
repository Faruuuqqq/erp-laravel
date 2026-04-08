<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            // Basic Information
            'id'                  => (string) $this->id,
            'customerId'          => $this->customer_id ?? '',
            'name'                => $this->name,
            'phone'               => $this->phone ?? '',
            'phone2'              => $this->phone_2 ?? '',
            'email'               => $this->email ?? '',
            'address'             => $this->address ?? '',
            'city'                => $this->city ?? '',

            // Tax & Identification
            'npwp'                => $this->npwp ?? '',

            // Contact Information
            'contactPerson'       => $this->contact_person ?? '',

            // Bank Information
            'bankName'            => $this->bank_name ?? '',
            'bankAccount'         => $this->bank_account ?? '',
            'accountHolder'       => $this->account_holder ?? '',

            // Warehouse Relationship
            'warehouseId'         => $this->warehouse_id ? (string) $this->warehouse_id : null,
            'warehouse'           => $this->warehouse ? [
                'id'              => (string) $this->warehouse->id,
                'name'            => $this->warehouse->name,
            ] : null,

            // Financial
            'balance'             => (float) $this->balance,
            'creditLimit'         => (float) ($this->credit_limit ?? 0),
            'discountPercentage'  => (float) ($this->discount_percentage ?? 0),
            'discountAmount'      => (float) ($this->discount_amount ?? 0),

            // Operational Details
            'operationalHours'    => $this->operational_hours ?? '',
            'notes'               => $this->notes ?? '',

            // Status
            'isVerified'          => (bool) $this->is_verified,
            'isActive'            => (bool) $this->is_active ?? true,

            // Metadata
            'totalTransactions'   => $this->transactions()->count(),
            'createdAt'           => $this->created_at?->toISOString(),
            'updatedAt'           => $this->updated_at?->toISOString(),
        ];
    }
}
