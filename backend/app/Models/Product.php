<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code', 'name', 'category_id', 'buy_price', 'sell_price',
        'stock', 'min_stock', 'unit', 'warehouse_id',
        'total_sales', 'avg_daily_sales', 'days_of_stock',
    ];

    protected $casts = [
        'buy_price'  => 'decimal:2',
        'sell_price' => 'decimal:2',
        'stock'      => 'integer',
        'min_stock'  => 'integer',
        'total_sales' => 'decimal:2',
        'avg_daily_sales' => 'decimal:2',
        'days_of_stock' => 'integer',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function stockMutations()
    {
        return $this->hasMany(StockMutation::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────
    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= min_stock');
    }

    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }
        return $query;
    }
}
