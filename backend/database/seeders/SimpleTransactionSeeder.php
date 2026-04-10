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

class SimpleTransactionSeeder extends Seeder
{
    private array $invoiceCounters = [];

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

        $existingTransactions = Transaction::count();
        if ($existingTransactions > 0) {
            $this->command->info("Found {$existingTransactions} existing transactions. Skipping seeder.");
            return;
        }

        $this->command->info('Creating sales transactions...');
        $this->createSalesTransactions($users, $customers, $salesReps, $products);

        $this->command->info('Creating purchase transactions...');
        $this->createPurchaseTransactions($users, $suppliers, $products);

        $this->updateCustomerBalances($customers);
        $this->updateSupplierBalances($suppliers);

        $this->command->info('Simple transactions seeded successfully!');
    }

    private function createSalesTransactions($users, $customers, $salesReps, $products)
    {
        $dateRange = $this->getDateRange();

        for ($i = 0; $i < 40; $i++) {
            $date = $dateRange[array_rand($dateRange)];
            $isCredit = (rand(1, 100) <= 70);
            $type = $isCredit ? 'penjualan_kredit' : 'penjualan_tunai';

            $customer = $customers->random();
            $salesRep = $isCredit && $salesReps->isNotEmpty() ? $salesReps->random() : null;

            $invoiceNumber = $this->getNextInvoiceNumber('INV', $date);

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
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
            ]);

            $numItems = rand(2, 5);
            $selectedProducts = $products->random($numItems);
            $total = 0;

            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 15);
                $price = $product->sell_price;
                $discount = rand(0, 1) ? rand(5, 15) : 0;
                $subtotal = $quantity * $price;
                $discountAmount = $subtotal * $discount / 100;
                $itemTotal = $subtotal - $discountAmount;

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'discount' => $discount,
                    'subtotal' => $itemTotal,
                ]);

                $total += $itemTotal;
            }

            $paid = $this->calculatePaidAmount($total, $isCredit, true);

            $transaction->update([
                'subtotal' => $total,
                'discount' => 0,
                'tax' => 0,
                'total' => $total,
                'paid' => $paid,
                'remaining' => max(0, $total - $paid),
            ]);
        }

        $this->command->info('Created 40 sales transactions');
    }

    private function createPurchaseTransactions($users, $suppliers, $products)
    {
        $dateRange = $this->getDateRange();

        for ($i = 0; $i < 20; $i++) {
            $date = $dateRange[array_rand($dateRange)];
            $supplier = $suppliers->random();

            $invoiceNumber = $this->getNextInvoiceNumber('PO', $date);

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
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
            ]);

            $numItems = rand(2, 5);
            $selectedProducts = $products->random($numItems);
            $total = 0;

            foreach ($selectedProducts as $product) {
                $quantity = rand(5, 30);
                $price = $product->buy_price;
                $discount = rand(0, 1) ? rand(3, 10) : 0;
                $subtotal = $quantity * $price;
                $discountAmount = $subtotal * $discount / 100;
                $itemTotal = $subtotal - $discountAmount;

                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'discount' => $discount,
                    'subtotal' => $itemTotal,
                ]);

                $total += $itemTotal;
            }

            $paid = $this->calculatePaidAmount($total, false, false);

            $transaction->update([
                'subtotal' => $total,
                'discount' => 0,
                'tax' => 0,
                'total' => $total,
                'paid' => $paid,
                'remaining' => max(0, $total - $paid),
            ]);
        }

        $this->command->info('Created 20 purchase transactions');
    }

    private function calculatePaidAmount(float $total, bool $isCredit, bool $isSale): float
    {
        if (!$isCredit) {
            return $total;
        }

        $rand = rand(1, 100);
        
        if ($rand <= 50) {
            return $total;
        } elseif ($rand <= 80) {
            $percentage = rand(50, 80) / 100;
            return round($total * $percentage);
        } else {
            return 0;
        }
    }

    private function getNextInvoiceNumber(string $prefix, string $date): string
    {
        $dateStr = str_replace('-', '', $date);
        $key = $prefix . $dateStr;

        if (!isset($this->invoiceCounters[$key])) {
            $this->invoiceCounters[$key] = 0;
        }
        $this->invoiceCounters[$key]++;

        return $prefix . $dateStr . '-' . str_pad($this->invoiceCounters[$key], 3, '0', STR_PAD_LEFT);
    }

    private function getDateRange(): array
    {
        $dates = [];
        $startDate = strtotime('2025-02-20');
        $endDate = strtotime('2025-02-28');

        for ($ts = $startDate; $ts <= $endDate; $ts += 86400) {
            $dates[] = date('Y-m-d', $ts);
        }

        return $dates;
    }

    private function getRandomNote(): ?string
    {
        $notes = [
            'Transaksi harian normal',
            'Customer pelanggan tetap',
            'Pembelian stok mingguan',
            'Stok urgent',
            'Promo minggu ini',
            'Pesanan khusus',
            null,
        ];
        return $notes[array_rand($notes)];
    }

    private function updateCustomerBalances($customers)
    {
        foreach ($customers as $customer) {
            $sales = Transaction::where('customer_id', $customer->id)
                ->whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
                ->get();

            $balance = 0;
            foreach ($sales as $sale) {
                $balance += ($sale->total - ($sale->paid ?? 0));
            }

            $customer->update(['balance' => $balance]);
        }
    }

    private function updateSupplierBalances($suppliers)
    {
        foreach ($suppliers as $supplier) {
            $purchases = Transaction::where('supplier_id', $supplier->id)
                ->where('type', 'pembelian')
                ->get();

            $balance = 0;
            foreach ($purchases as $purchase) {
                $balance += (($purchase->paid ?? 0) - $purchase->total);
            }

            $supplier->update(['balance' => $balance]);
        }
    }
}