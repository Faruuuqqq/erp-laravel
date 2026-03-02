<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialLedger extends Model
{
    protected $fillable = [
        'type', 'entity_type', 'entity_id', 'transaction_id',
        'debit', 'credit', 'balance_after', 'description', 'created_by',
    ];

    protected $casts = [
        'debit'        => 'decimal:2',
        'credit'       => 'decimal:2',
        'balance_after'=> 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class)->withTrashed();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Polymorphic-like helper to get entity (supplier or customer)
    public function entity()
    {
        if ($this->entity_type === 'customer') {
            return Customer::find($this->entity_id);
        }
        return Supplier::find($this->entity_id);
    }
}
