<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_number', 'date', 'type',
        'supplier_id', 'customer_id', 'sales_rep_id',
        'subtotal', 'discount', 'tax', 'total', 'paid', 'remaining',
        'status', 'notes', 'created_by',
    ];

    protected $casts = [
        'date'      => 'date:Y-m-d',
        'subtotal'  => 'decimal:2',
        'discount'  => 'decimal:2',
        'tax'       => 'decimal:2',
        'total'     => 'decimal:2',
        'paid'      => 'decimal:2',
        'remaining' => 'decimal:2',
    ];

    // ─── Relations ────────────────────────────────────────────────────────────
    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function salesRep()
    {
        return $this->belongsTo(SalesRep::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function stockMutations()
    {
        return $this->hasMany(StockMutation::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────
    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeSales($query)
    {
        return $query->whereIn('type', ['penjualan_tunai', 'penjualan_kredit']);
    }

    public function scopePurchases($query)
    {
        return $query->where('type', 'pembelian');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where('invoice_number', 'like', "%{$search}%");
        }
        return $query;
    }
}
