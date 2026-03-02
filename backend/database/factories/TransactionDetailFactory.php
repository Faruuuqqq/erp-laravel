<?php

namespace Database\Factories;

use App\Models\TransactionDetail;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionDetailFactory extends Factory
{
    protected $model = TransactionDetail::class;

    public function definition(): array
    {
        $product = Product::inRandomOrder()->first();
        $transaction = Transaction::inRandomOrder()->first();

        if (!$product) {
            $product = Product::factory()->create();
        }

        if (!$transaction) {
            $transaction = Transaction::factory()->create();
        }

        $quantity = $this->faker->numberBetween(1, 50);
        $discount = $this->faker->randomElement([0, 5, 10, 15]);
        $isPurchase = $transaction->type === 'pembelian' || $transaction->type === 'retur_pembelian';
        $price = $isPurchase ? $product->buy_price : $product->sell_price;

        return [
            'transaction_id' => $transaction->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'price' => $price,
            'discount' => $discount,
            'subtotal' => $quantity * $price * (1 - $discount / 100),
        ];
    }
}
