<?php

namespace Database\Seeders;

use App\Models\FinancialLedger;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class FinancialLedgerSeeder extends Seeder
{
    public function run(): void
    {
        $transactions = Transaction::all();

        foreach ($transactions as $transaction) {
            $existingLedger = FinancialLedger::where('transaction_id', $transaction->id)->first();

            if (!$existingLedger) {
                $isSale = in_array($transaction->type, ['penjualan_tunai', 'penjualan_kredit']);
                $type = $isSale ? 'debit' : 'credit';
                $description = $isSale
                    ? "Penjualan {$transaction->invoice_number}"
                    : "Pembelian {$transaction->invoice_number}";

                FinancialLedger::create([
                    'transaction_id' => $transaction->id,
                    'type' => $type,
                    'amount' => $transaction->total,
                    'description' => $description,
                    'balance_after' => 50000000 + rand(-5000000, 5000000),
                    'date' => $transaction->date,
                ]);
            }
        }

        $this->command->info('Financial ledgers seeded: ' . $transactions->count() . ' entries.');
    }
}
