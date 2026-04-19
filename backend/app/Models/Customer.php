<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'phone', 'phone2', 'email', 'address', 'city', 'balance', 'credit_limit',
        'discount', 'warehouse', 'price_list', 'daerah', 'keterangan', 'npwp'
    ];

    protected $casts = ['balance' => 'decimal:2', 'credit_limit' => 'decimal:2'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
        }
        return $query;
    }
}
