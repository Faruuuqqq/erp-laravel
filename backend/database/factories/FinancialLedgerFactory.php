<?php

namespace Database\Factories;

use App\Models\FinancialLedger;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class FinancialLedgerFactory extends Factory
{
    protected $model = FinancialLedger::class;

    public function definition(): array
    {
        $transaction = Transaction::inRandomOrder()->first();

        if (!$transaction) {
            $transaction = Transaction::factory()->create();
        }

        $isSale = in_array($transaction->type, ['penjualan_tunai', 'penjualan_kredit']);
        $type = $isSale ? 'debit' : 'credit';
        $description = $isSale
            ? "Penjualan {$transaction->invoice_number}"
            : "Pembelian {$transaction->invoice_number}";

        return [
            'transaction_id' => $transaction->id,
            'type' => $type,
            'amount' => $transaction->total,
            'description' => $description,
            'balance_after' => $this->faker->numberBetween(50000000, 100000000),
            'date' => $transaction->date,
        ];
    }
}
