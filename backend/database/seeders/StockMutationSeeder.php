<?php

namespace Database\Seeders;

use App\Models\StockMutation;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class StockMutationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        
        $existingMutations = StockMutation::count();
        if ($existingMutations > 0) {
            $this->command->info("Found {$existingMutations} existing stock mutations. Skipping seeder.");
            return;
        }

        $this->command->info('Creating stock mutations...');

        $products = Product::all();
        $productStocks = [];
        
        foreach ($products as $product) {
            $productStocks[$product->id] = $product->stock ?? rand(50, 200);
        }

        $this->seedFromSales($products, $users, $productStocks);
        $this->seedFromPurchases($products, $users, $productStocks);

        $this->command->info('Stock mutations seeded successfully!');
    }

    private function seedFromSales($products, $users, &$productStocks): void
    {
        $salesDetails = TransactionDetail::whereHas('transaction', function ($query) {
            $query->whereIn('type', ['penjualan_tunai', 'penjualan_kredit']);
        })->orderBy('transaction_id')->get();

        foreach ($salesDetails as $detail) {
            $transaction = $detail->transaction;
            $productId = $detail->product_id;
            $stockBefore = $productStocks[$productId] ?? 0;
            $stockAfter = max(0, $stockBefore - $detail->quantity);
            
            $productStocks[$productId] = $stockAfter;

            StockMutation::create([
                'product_id' => $productId,
                'transaction_id' => $transaction->id,
                'type' => 'OUT',
                'quantity' => $detail->quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reference' => $transaction->invoice_number,
                'notes' => "Penjualan {$transaction->invoice_number}",
                'created_by' => $users->random()->id,
            ]);
        }

        $this->command->info('Created stock mutations for ' . $salesDetails->count() . ' sales items');
    }

    private function seedFromPurchases($products, $users, &$productStocks): void
    {
        $purchaseDetails = TransactionDetail::whereHas('transaction', function ($query) {
            $query->where('type', 'pembelian');
        })->orderBy('transaction_id')->get();

        foreach ($purchaseDetails as $detail) {
            $transaction = $detail->transaction;
            $productId = $detail->product_id;
            $stockBefore = $productStocks[$productId] ?? 0;
            $stockAfter = $stockBefore + $detail->quantity;
            
            $productStocks[$productId] = $stockAfter;

            StockMutation::create([
                'product_id' => $productId,
                'transaction_id' => $transaction->id,
                'type' => 'IN',
                'quantity' => $detail->quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reference' => $transaction->invoice_number,
                'notes' => "Pembelian {$transaction->invoice_number}",
                'created_by' => $users->random()->id,
            ]);
        }

        $this->command->info('Created stock mutations for ' . $purchaseDetails->count() . ' purchase items');
    }
}