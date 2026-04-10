<?php

namespace Database\Seeders;

use App\Models\FinancialLedger;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class FinancialLedgerSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        
        $existingLedgers = FinancialLedger::count();
        if ($existingLedgers > 0) {
            $this->command->info("Found {$existingLedgers} existing financial ledgers. Skipping seeder.");
            return;
        }

        $this->command->info('Creating financial ledger entries...');

        $this->seedSalesEntries($users);
        $this->seedPurchaseEntries($users);
        $this->seedPaymentEntries($users);

        $this->command->info('Financial ledgers seeded successfully!');
    }

    private function seedSalesEntries($users): void
    {
        $salesTransactions = Transaction::whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $runningBalances = [];

        foreach ($salesTransactions as $transaction) {
            $customerId = $transaction->customer_id;
            
            if (!isset($runningBalances[$customerId])) {
                $runningBalances[$customerId] = 0;
            }

            $runningBalances[$customerId] += $transaction->total;

            FinancialLedger::create([
                'transaction_id' => $transaction->id,
                'type' => 'PIUTANG',
                'entity_type' => 'customer',
                'entity_id' => $customerId,
                'debit' => $transaction->total,
                'credit' => 0,
                'balance_after' => $runningBalances[$customerId],
                'description' => "Penjualan {$transaction->invoice_number}",
                'created_by' => $users->random()->id,
            ]);
        }

        $this->command->info('Created financial ledger entries for sales');
    }

    private function seedPurchaseEntries($users): void
    {
        $purchaseTransactions = Transaction::where('type', 'pembelian')
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $runningBalances = [];

        foreach ($purchaseTransactions as $transaction) {
            $supplierId = $transaction->supplier_id;
            
            if (!isset($runningBalances[$supplierId])) {
                $runningBalances[$supplierId] = 0;
            }

            $runningBalances[$supplierId] += $transaction->total;

            FinancialLedger::create([
                'transaction_id' => $transaction->id,
                'type' => 'UTANG',
                'entity_type' => 'supplier',
                'entity_id' => $supplierId,
                'debit' => 0,
                'credit' => $transaction->total,
                'balance_after' => $runningBalances[$supplierId],
                'description' => "Pembelian {$transaction->invoice_number}",
                'created_by' => $users->random()->id,
            ]);
        }

        $this->command->info('Created financial ledger entries for purchases');
    }

    private function seedPaymentEntries($users): void
    {
        $supplierPayments = Transaction::where('type', 'pembayaran_utang')
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $supplierBalances = [];

        foreach ($supplierPayments as $payment) {
            $supplierId = $payment->supplier_id;
            
            if (!isset($supplierBalances[$supplierId])) {
                $supplierBalances[$supplierId] = 0;
            }

            $supplierBalances[$supplierId] = max(0, $supplierBalances[$supplierId] - $payment->total);

            FinancialLedger::create([
                'transaction_id' => $payment->id,
                'type' => 'UTANG',
                'entity_type' => 'supplier',
                'entity_id' => $supplierId,
                'debit' => $payment->total,
                'credit' => 0,
                'balance_after' => $supplierBalances[$supplierId],
                'description' => "Pembayaran utang {$payment->invoice_number}",
                'created_by' => $users->random()->id,
            ]);
        }

        $customerPayments = Transaction::where('type', 'pembayaran_piutang')
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $customerBalances = [];

        foreach ($customerPayments as $payment) {
            $customerId = $payment->customer_id;
            
            if (!isset($customerBalances[$customerId])) {
                $customerBalances[$customerId] = 0;
            }

            $customerBalances[$customerId] = max(0, $customerBalances[$customerId] - $payment->total);

            FinancialLedger::create([
                'transaction_id' => $payment->id,
                'type' => 'PIUTANG',
                'entity_type' => 'customer',
                'entity_id' => $customerId,
                'debit' => 0,
                'credit' => $payment->total,
                'balance_after' => $customerBalances[$customerId],
                'description' => "Pembayaran piutang {$payment->invoice_number}",
                'created_by' => $users->random()->id,
            ]);
        }

        $this->command->info('Created financial ledger entries for payments');
    }
}