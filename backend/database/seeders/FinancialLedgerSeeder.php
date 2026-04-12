<?php

namespace Database\Seeders;

use App\Models\FinancialLedger;
use App\Models\Transaction;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class FinancialLedgerSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) return;

        if (FinancialLedger::count() > 0) {
            $this->command->info('Ledger sudah ada, melewati FinancialLedgerSeeder.');
            return;
        }

        $userId = $users->first()->id;
        $count  = 0;

        // ── Piutang dari transaksi kredit yang ada remaining ─────────────────
        $creditTrx = Transaction::where('type', 'penjualan_kredit')
            ->where('remaining', '>', 0)
            ->with('customer')
            ->get();

        foreach ($creditTrx as $trx) {
            FinancialLedger::create([
                'type'          => 'PIUTANG',
                'entity_type'   => 'customer',
                'entity_id'     => $trx->customer_id,
                'transaction_id'=> $trx->id,
                'debit'         => $trx->remaining,
                'credit'        => 0,
                'balance_after' => $trx->remaining,
                'description'   => 'Piutang dari ' . $trx->invoice_number,
                'created_by'    => $userId,
            ]);
            $count++;
        }

        // ── Utang dari pembelian kredit ──────────────────────────────────────
        $debtTrx = Transaction::where('type', 'pembelian')
            ->where('remaining', '>', 0)
            ->with('supplier')
            ->get();

        foreach ($debtTrx as $trx) {
            FinancialLedger::create([
                'type'          => 'UTANG',
                'entity_type'   => 'supplier',
                'entity_id'     => $trx->supplier_id,
                'transaction_id'=> $trx->id,
                'debit'         => $trx->remaining,
                'credit'        => 0,
                'balance_after' => $trx->remaining,
                'description'   => 'Utang dari ' . $trx->invoice_number,
                'created_by'    => $userId,
            ]);
            $count++;
        }

        $this->command->info("FinancialLedger seeder selesai: {$count} entri ledger dibuat.");
    }
}
