<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\User;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\SalesRep;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SimpleTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $suppliers = Supplier::all();
        $customers = Customer::all();
        $salesReps = SalesRep::all();
        $products = Product::all();

        if ($users->isEmpty() || $suppliers->isEmpty() || $customers->isEmpty() || $products->isEmpty()) {
            $this->command->error('Error: Please seed Users, Suppliers, Customers, and Products first!');
            return;
        }

        // Check if transactions already exist
        $existingTransactions = Transaction::count();
        if ($existingTransactions > 0) {
            $this->command->info("Found {$existingTransactions} existing transactions. Skipping seeder.");
            return;
        }

        $this->createSalesTransactions($users, $customers, $salesReps, $products);
        $this->createPurchaseTransactions($users, $suppliers, $products);

        $this->command->info('Simple transactions seeded successfully!');
    }

    private function createSalesTransactions($users, $customers, $salesReps, $products)
    {
        $createdCount = 0;
        $skippedCount = 0;

        for ($i = 0; $i < 40; $i++) {
            $date = $this->randomDate(7);
            $isCredit = ($i % 3 === 0);
            $type = $isCredit ? 'penjualan_kredit' : 'penjualan_tunai';

            $customer = $customers->random();
            $salesRep = $isCredit ? $salesReps->random() : null;

            $invoiceNumber = $this->getNextInvoiceNumber('INV', $date, $i);

            $transaction = Transaction::firstOrCreate(
                ['invoice_number' => $invoiceNumber],
                [
                    'date' => $date,
                    'type' => $type,
                    'customer_id' => $customer->id,
                    'sales_rep_id' => $salesRep ? $salesRep->id : null,
                    'subtotal' => 0,
                    'discount' => 0,
                    'tax' => 0,
                    'total' => 0,
                    'paid' => 0,
                    'remaining' => 0,
                    'status' => 'completed',
                    'notes' => $this->getRandomNote(),
                    'created_by' => $users->random()->id,
                ]
            );

            if (!$transaction->wasRecentlyCreated) {
                $skippedCount++;
                continue;
            }

            $numItems = rand(1, 5);
            $total = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product = $products->random();
                $quantity = rand(1, 20);
                $price = $product->sell_price;
                $subtotal = $quantity * $price;

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'discount' => 0,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $transaction->update([
                'subtotal' => $total,
                'discount' => 0,
                'total' => $total,
                'paid' => $total,
                'remaining' => 0,
            ]);

            $createdCount++;
        }

        $this->command->info("Created {$createdCount} sales transactions ({$skippedCount} skipped)");
    }

    private function createPurchaseTransactions($users, $suppliers, $products)
    {
        $createdCount = 0;
        $skippedCount = 0;

        for ($i = 0; $i < 20; $i++) {
            $date = $this->randomDate(7);
            $supplier = $suppliers->random();

            $invoiceNumber = $this->getNextInvoiceNumber('PO', $date, $i);

            $transaction = Transaction::firstOrCreate(
                ['invoice_number' => $invoiceNumber],
                [
                    'date' => $date,
                    'type' => 'pembelian',
                    'supplier_id' => $supplier->id,
                    'subtotal' => 0,
                    'discount' => 0,
                    'tax' => 0,
                    'total' => 0,
                    'paid' => 0,
                    'remaining' => 0,
                    'status' => 'completed',
                    'notes' => $this->getRandomNote(),
                    'created_by' => $users->random()->id,
                ]
            );

            if (!$transaction->wasRecentlyCreated) {
                $skippedCount++;
                continue;
            }

            $numItems = rand(1, 5);
            $total = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product = $products->random();
                $quantity = rand(1, 20);
                $price = $product->buy_price;
                $subtotal = $quantity * $price;

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'discount' => 0,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $transaction->update([
                'subtotal' => $total,
                'discount' => 0,
                'total' => $total,
                'paid' => $total,
                'remaining' => 0,
            ]);

            $createdCount++;
        }

        $this->command->info("Created {$createdCount} purchase transactions ({$skippedCount} skipped)");
    }

    private function getNextInvoiceNumber($prefix, $date, $currentIndex): string
    {
        $datePrefix = str_replace('-', '', $date);

        // Get maximum invoice number across ALL transactions with this prefix
        $existingMax = Transaction::where('invoice_number', 'like', $prefix . '%')
            ->get()
            ->pluck('invoice_number')
            ->map(function ($invoice) use ($prefix) {
                // Extract the numeric suffix (everything after the prefix and date)
                // Format: PREFIX-YYYYMMDD-XXX
                $parts = explode('-', $invoice);
                return isset($parts[2]) ? (int) $parts[2] : 0;
            })
            ->max();

        $nextNumber = $existingMax ? $existingMax + 1 : $currentIndex + 1;

        return $prefix . $datePrefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    private function randomDate($daysBack): string
    {
        return now()->subDays(rand(0, $daysBack))->format('Y-m-d');
    }

    private function getRandomNote(): ?string
    {
        $notes = [
            'Transaksi harian normal',
            'Customer pelanggan tetap',
            'Pembelian stok mingguan',
            'Stok urgent',
            'Promo minggu ini',
            null,
        ];
        return $notes[array_rand($notes)];
    }
}
