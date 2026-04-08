<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        // Basic Information
        'customer_id',
        'name',
        'phone',
        'phone_2',
        'email',
        'address',
        'city',

        // Tax & Identification
        'npwp',

        // Contact Information
        'contact_person',

        // Bank Information
        'bank_name',
        'bank_account',
        'account_holder',

        // Warehouse Relationship
        'warehouse_id',

        // Financial
        'balance',
        'credit_limit',
        'discount_percentage',
        'discount_amount',

        // Operational Details
        'operational_hours',
        'notes',

        // Status
        'is_verified',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'credit_limit' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'is_verified' => 'boolean',
    ];

    // Relationships
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Scopes
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%")
                         ->orWhere('customer_id', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('city', 'like', "%{$search}%");
        }
        return $query;
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeUnverified($query)
    {
        return $query->where('is_verified', false);
    }
}
