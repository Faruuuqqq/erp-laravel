<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = ['name', 'address', 'status'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getTotalProductsAttribute(): int
    {
        return $this->products()->count();
    }
}
