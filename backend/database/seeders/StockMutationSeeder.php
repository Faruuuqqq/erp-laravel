<?php

namespace Database\Seeders;

use App\Models\StockMutation;
use App\Models\TransactionDetail;
use Illuminate\Database\Seeder;

class StockMutationSeeder extends Seeder
{
    public function run(): void
    {
        $transactionDetails = TransactionDetail::all();

        foreach ($transactionDetails as $detail) {
            $existingMutation = StockMutation::where('transaction_id', $detail->transaction_id)
                ->where('product_id', $detail->product_id)
                ->first();

            if (!$existingMutation) {
                $transaction = $detail->transaction;
                $isPurchase = in_array($transaction->type, ['pembelian', 'retur_pembelian']);
                $type = $isPurchase ? 'in' : 'out';

                StockMutation::create([
                    'product_id' => $detail->product_id,
                    'type' => $type,
                    'quantity' => $detail->quantity,
                    'price' => $detail->price,
                    'balance' => rand(10, 100),
                    'reason' => $transaction->invoice_number,
                    'date' => $transaction->date,
                ]);
            }
        }

        $this->command->info('Stock mutations seeded: ' . $transactionDetails->count() . ' entries.');
    }
}
