<?php

namespace Database\Factories;

use App\Models\StockMutation;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class StockMutationFactory extends Factory
{
    protected $model = StockMutation::class;

    public function definition(): array
    {
        $transactionDetail = TransactionDetail::inRandomOrder()->first();

        if (!$transactionDetail) {
            $transactionDetail = TransactionDetail::factory()->create();
        }

        $transaction = $transactionDetail->transaction;
        $product = $transactionDetail->product;

        $isPurchase = $transaction->type === 'pembelian' || $transaction->type === 'retur_pembelian';
        $type = $isPurchase ? 'in' : 'out';

        return [
            'product_id' => $product->id,
            'type' => $type,
            'quantity' => $transactionDetail->quantity,
            'price' => $transactionDetail->price,
            'balance' => $this->faker->numberBetween(10, 100),
            'reason' => $transaction->invoice_number,
            'date' => $transaction->date,
        ];
    }
}
