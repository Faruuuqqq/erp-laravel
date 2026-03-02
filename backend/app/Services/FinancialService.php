<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\FinancialLedger;
use App\Models\Supplier;
use App\Models\Transaction;

/**
 * FinancialService – pengelola utang (ke supplier) dan piutang (dari customer).
 *
 * Setiap mutasi keuangan otomatis dicatat ke financial_ledgers
 * dan memperbarui saldo di tabel supplier/customer.
 */
class FinancialService
{
    // ─── PIUTANG (Customer) ───────────────────────────────────────────────────

    /**
     * Catat piutang baru (saldo customer naik).
     * Dipanggil saat Penjualan Kredit.
     */
    public function addPiutang(Transaction $tx): void
    {
        if ($tx->remaining <= 0 || !$tx->customer_id) return;

        $customer = Customer::findOrFail($tx->customer_id);
        $customer->increment('balance', $tx->remaining);
        $customer->refresh();

        FinancialLedger::create([
            'type'           => 'PIUTANG',
            'entity_type'    => 'customer',
            'entity_id'      => $customer->id,
            'transaction_id' => $tx->id,
            'debit'          => $tx->remaining,
            'credit'         => 0,
            'balance_after'  => $customer->balance,
            'description'    => "Piutang dari invoice {$tx->invoice_number}",
            'created_by'     => auth()->id() ?? 1,
        ]);
    }

    /**
     * Bayar piutang (saldo customer turun).
     * Dipanggil saat Pembayaran Piutang.
     */
    public function payPiutang(Customer $customer, float $amount, ?int $txId = null): void
    {
        $customer->decrement('balance', $amount);
        $customer->refresh();

        FinancialLedger::create([
            'type'           => 'PIUTANG',
            'entity_type'    => 'customer',
            'entity_id'      => $customer->id,
            'transaction_id' => $txId,
            'debit'          => 0,
            'credit'         => $amount,
            'balance_after'  => $customer->balance,
            'description'    => 'Pembayaran piutang',
            'created_by'     => auth()->id() ?? 1,
        ]);
    }

    // ─── UTANG (Supplier) ─────────────────────────────────────────────────────

    /**
     * Catat utang baru (saldo supplier naik).
     * Dipanggil saat Pembelian Kredit.
     */
    public function addUtang(Transaction $tx): void
    {
        if ($tx->remaining <= 0 || !$tx->supplier_id) return;

        $supplier = Supplier::findOrFail($tx->supplier_id);
        $supplier->increment('balance', $tx->remaining);
        $supplier->refresh();

        FinancialLedger::create([
            'type'           => 'UTANG',
            'entity_type'    => 'supplier',
            'entity_id'      => $supplier->id,
            'transaction_id' => $tx->id,
            'debit'          => $tx->remaining,
            'credit'         => 0,
            'balance_after'  => $supplier->balance,
            'description'    => "Utang dari invoice {$tx->invoice_number}",
            'created_by'     => auth()->id() ?? 1,
        ]);
    }

     /**
      * Bayar utang (saldo supplier turun).
      * Dipanggil saat Pembayaran Utang.
      */
    public function payUtang(Supplier $supplier, float $amount, ?int $txId = null): void
    {
        $supplier->decrement('balance', $amount);
        $supplier->refresh();

        FinancialLedger::create([
            'type'           => 'UTANG',
            'entity_type'    => 'supplier',
            'entity_id'      => $supplier->id,
            'transaction_id' => $txId,
            'debit'          => 0,
            'credit'         => $amount,
            'balance_after'  => $supplier->balance,
            'description'    => 'Pembayaran utang',
            'created_by'     => auth()->id() ?? 1,
        ]);
    }

    // ─── PIUTANG REDUCTION (untuk Retur Penjualan) ─────────────────────────
    /**
     * Kurangi piutang customer (karena barang dikembalikan).
     * Dipanggil saat Retur Penjualan.
     */
    public function reducePiutang(Customer $customer, float $amount, int $txId): void
    {
        $customer->decrement('balance', $amount);
        $customer->refresh();

        FinancialLedger::create([
            'type'           => 'PIUTANG',
            'entity_type'    => 'customer',
            'entity_id'      => $customer->id,
            'transaction_id' => $txId,
            'debit'          => 0,
            'credit'         => $amount,
            'balance_after'  => $customer->balance,
            'description'    => 'Retur penjualan',
            'created_by'     => auth()->id() ?? 1,
        ]);
    }

    /**
     * Tambah piutang customer (pembayaran dari customer - seharusnya tidak terjadi).
     * Dipanggil saat Retur Pembelian.
     */
    public function increasePiutang(Customer $customer, float $amount, int $txId): void
    {
        $customer->increment('balance', $amount);
        $customer->refresh();

        FinancialLedger::create([
            'type'           => 'PIUTANG',
            'entity_type'    => 'customer',
            'entity_id'      => $customer->id,
            'transaction_id' => $txId,
            'debit'          => $amount,
            'credit'         => 0,
            'balance_after'  => $customer->balance,
            'description'    => 'Retur pembelian',
            'created_by'     => auth()->id() ?? 1,
        ]);
    }

    // ─── UTANG INCREASE (untuk Retur Pembelian) ───────────────────────────
    /**
     * Tambah utang ke supplier (barang dikembalikan ke supplier).
     * Dipanggil saat Retur Pembelian.
     */
    public function increaseUtang(Supplier $supplier, float $amount, int $txId): void
    {
        $supplier->increment('balance', $amount);
        $supplier->refresh();

        FinancialLedger::create([
            'type'           => 'UTANG',
            'entity_type'    => 'supplier',
            'entity_id'      => $supplier->id,
            'transaction_id' => $txId,
            'debit'          => $amount,
            'credit'         => 0,
            'balance_after'  => $supplier->balance,
            'description'    => 'Retur pembelian',
            'created_by'     => auth()->id() ?? 1,
        ]);
    }

    /**
     * Kurangi utang supplier (pembayaran ke supplier).
     */
    public function reduceUtang(Supplier $supplier, float $amount, ?int $txId = null): void
    {
        $supplier->decrement('balance', $amount);
        $supplier->refresh();

        FinancialLedger::create([
            'type'           => 'UTANG',
            'entity_type'    => 'supplier',
            'entity_id'      => $supplier->id,
            'transaction_id' => $txId,
            'debit'          => 0,
            'credit'         => $amount,
            'balance_after'  => $supplier->balance,
            'description'    => 'Pembayaran utang',
            'created_by'     => auth()->id() ?? 1,
        ]);
    }
}
