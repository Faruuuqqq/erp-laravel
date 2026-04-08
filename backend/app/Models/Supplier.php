<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

    protected $fillable = ['supplier_id', 'name', 'phone', 'phone_1', 'phone_2', 'email', 'address', 'city', 'contact_person', 'bank_account', 'balance'];

    protected $casts = ['balance' => 'decimal:2'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where('name', 'like', "%{$search}%")
                         ->orWhere('phone_1', 'like', "%{$search}%")
                         ->orWhere('phone_2', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('supplier_id', 'like', "%{$search}%");
        }
        return $query;
    }
}
