<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\User;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\SalesRep;
use App\Models\FinancialLedger;
use App\Models\StockMutation;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $today = now()->toDateString();
        $users = User::all();
        $suppliers = Supplier::all();
        $customers = Customer::all();
        $salesReps = SalesRep::all();
        $products = Product::all()->keyBy('id');

        $transactionsData = $this->generateTransactions($today, $users, $suppliers, $customers, $salesReps);

        foreach ($transactionsData as $txData) {
            $transaction = Transaction::firstOrCreate(
                ['invoice_number' => $txData['invoice_number']],
                $txData
            );

            if ($txData['details']) {
                foreach ($txData['details'] as $detail) {
                    $productId = $detail['product_id'];
                    $product = $products->get($productId);

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $productId,
                        'quantity' => $detail['quantity'],
                        'price' => $product ? $product->sell_price : $detail['price'],
                        'discount' => $detail['discount'],
                        'subtotal' => $detail['subtotal'],
                    ]);

                    StockMutation::create([
                        'product_id' => $productId,
                        'type' => $txData['mutation_type'],
                        'quantity' => $detail['quantity'],
                        'price' => $product ? $product->sell_price : $detail['price'],
                        'balance' => $product ? $product->stock + $detail['quantity'] : 0,
                        'reason' => $txData['invoice_number'],
                        'date' => $txData['date'],
                    ]);
                }
            }

            FinancialLedger::create([
                'transaction_id' => $transaction->id,
                'type' => $txData['ledger_type'],
                'amount' => $transaction->total,
                'description' => $txData['ledger_description'],
                'balance_after' => 50000000 + rand(-5000000, 5000000),
                'date' => $transaction->date,
            ]);
        }

        $this->command->info('Transactions seeded: ' . count($transactionsData) . ' transaksi.');
    }

    private function generateTransactions($today, $users, $suppliers, $customers, $salesReps): array
    {
        $transactions = [];
        $dateRange = $this->getDateRange(7);

        foreach ($dateRange as $date) {
            $numTransactions = $this->getTransactionCountForDate($date);

            for ($i = 0; $i < $numTransactions; $i++) {
                $type = $this->getTransactionType();
                $isSale = in_array($type, ['penjualan_tunai', 'penjualan_kredit']);
                $isPurchase = $type === 'pembelian';
                $amount = $this->getTransactionAmount($isPurchase);
                $paid = $this->getPaidAmount($amount);
                $invoicePrefix = $isPurchase ? 'PO' : 'INV';
                $invoiceNumber = $invoicePrefix . $date . '-' . str_pad(count($transactions) + $i + 1, 3, '0');

                $details = $this->generateTransactionDetails($type, $amount);

                $transactions[] = [
                    'invoice_number' => $invoiceNumber,
                    'date' => $date,
                    'type' => $type,
                    'supplier_id' => $isPurchase ? $suppliers->random()->id : null,
                    'customer_id' => $isSale ? $customers->random()->id : null,
                    'sales_rep_id' => $isSale ? $salesReps->random()->id : null,
                    'subtotal' => $amount,
                    'discount' => $this->getDiscountAmount(),
                    'tax' => 0,
                    'total' => $amount,
                    'paid' => $paid,
                    'remaining' => $amount - $paid,
                    'status' => $this->getStatus(),
                    'notes' => $this->getNotes(),
                    'created_by' => $users->random()->id,
                    'details' => $details,
                ];
            }
        }

        return $transactions;
    }

    private function getTransactionCountForDate($date): int
    {
        $dayOfWeek = date('N', strtotime($date));
        if (in_array($dayOfWeek, ['Sat', 'Sun'])) {
            return 10;
        }
        return 15;
    }

    private function getTransactionType(): string
    {
        $types = [
            'penjualan_tunai', 'penjualan_tunai', 'penjualan_tunai', 'penjualan_tunai', 'penjualan_tunai',
            'penjualan_kredit', 'penjualan_kredit', 'penjualan_kredit',
            'pembelian', 'pembelian', 'pembelian',
        ];
        return $types[array_rand($types)];
    }

    private function getTransactionAmount($isPurchase): int
    {
        if ($isPurchase) {
            $amounts = [300000, 500000, 800000, 1200000, 1500000, 2000000, 2500000, 3000000];
        } else {
            $amounts = [50000, 100000, 150000, 200000, 350000, 500000, 750000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000];
        }
        return $amounts[array_rand($amounts)];
    }

    private function getPaidAmount($amount): int
    {
        return (rand(0, 1) === 1) ? $amount : round($amount * 0.7);
    }

    private function getDiscountAmount(): int
    {
        $discounts = [0, round(50000 * 0.05), round(200000 * 0.1), round(500000 * 0.15)];
        return $discounts[array_rand($discounts)];
    }

    private function getStatus(): string
    {
        $statuses = ['completed', 'completed', 'completed', 'cancelled'];
        return $statuses[array_rand($statuses)];
    }

    private function getNotes(): ?string
    {
        $notes = [
            'Transaksi harian normal',
            'Customer pelanggan tetap',
            'Pembelian stok mingguan',
            'Stok urgent',
            'Promo minggu ini',
            null,
        ];
        $randomIndex = array_rand($notes);
        return $notes[$randomIndex];
    }

    private function generateTransactionDetails($type, $totalAmount): array
    {
        $numItems = $this->getNumberOfItems();
        $details = [];
        $remainingAmount = $totalAmount;

        for ($i = 0; $i < $numItems; $i++) {
            if ($remainingAmount <= 0) break;

            $quantity = $this->getItemQuantity($remainingAmount);
            $price = $this->getItemPrice();
            $discount = $this->getItemDiscount();
            $subtotal = round($quantity * $price * (1 - $discount / 100));

            $details[] = [
                'product_id' => $this->getProductId(),
                'quantity' => $quantity,
                'price' => $price,
                'discount' => $discount,
                'subtotal' => $subtotal,
            ];

            $remainingAmount -= $subtotal;
        }

        return $details;
    }

    private function getNumberOfItems(): int
    {
        return rand(1, 5);
    }

    private function getItemQuantity($remainingAmount): int
    {
        return rand(1, min(50, floor($remainingAmount / 10000)));
    }

    private function getItemPrice(): int
    {
        $prices = [5000, 8000, 12000, 15000, 20000, 25000, 30000, 35000, 45000, 50000];
        return $prices[array_rand($prices)];
    }

    private function getItemDiscount(): int
    {
        $discounts = [0, 5, 10, 15];
        return $discounts[array_rand($discounts)];
    }

    private function getProductId(): int
    {
        return rand(1, 28);
    }

    private function getDateRange($days): array
    {
        $dates = [];
        $endDate = now();

        for ($i = 0; $i < $days; $i++) {
            $dates[] = $endDate->copy()->subDays($i)->format('Y-m-d');
        }

        return array_reverse($dates);
    }
}
