<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Supplier;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $suppliers = Supplier::all();
        $customers = Customer::all();

        if ($users->isEmpty()) {
            $this->command->error('Error: Please seed Users first!');
            return;
        }

        $existingPayments = Transaction::whereIn('type', ['pembayaran_utang', 'pembayaran_piutang'])->count();
        if ($existingPayments > 0) {
            $this->command->info("Found {$existingPayments} existing payments. Skipping seeder.");
            return;
        }

        $this->command->info('Creating payment transactions...');
        
        $supplierPayments = $this->createSupplierPayments($users, $suppliers);
        $customerPayments = $this->createCustomerPayments($users, $customers);

        $this->updateSupplierBalancesAfterPayments($suppliers);
        $this->updateCustomerBalancesAfterPayments($customers);

        $totalPayments = $supplierPayments + $customerPayments;
        $this->command->info("Created {$totalPayments} payment transactions ({$supplierPayments} supplier, {$customerPayments} customer)");
    }

    private function createSupplierPayments($users, $suppliers): int
    {
        $count = 0;
        $dateRange = $this->getDateRange();

        foreach ($suppliers as $supplier) {
            $unpaidPurchases = Transaction::where('supplier_id', $supplier->id)
                ->where('type', 'pembelian')
                ->where('remaining', '>', 0)
                ->get();

            if ($unpaidPurchases->isEmpty()) {
                continue;
            }

            $transactionsToPay = $unpaidPurchases->random(min(rand(1, 2), $unpaidPurchases->count()));
            
            foreach ($transactionsToPay as $purchase) {
                $remaining = $purchase->remaining;
                $paymentAmount = $remaining > 0 ? min($remaining * rand(50, 100) / 100, $remaining) : 0;

                if ($paymentAmount <= 0) {
                    continue;
                }

                $invoiceNumber = 'BYR-UT-' . date('Ymd') . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

                Transaction::create([
                    'invoice_number' => $invoiceNumber,
                    'date' => $dateRange[array_rand($dateRange)],
                    'type' => 'pembayaran_utang',
                    'supplier_id' => $supplier->id,
                    'subtotal' => $paymentAmount,
                    'discount' => 0,
                    'tax' => 0,
                    'total' => $paymentAmount,
                    'paid' => $paymentAmount,
                    'remaining' => 0,
                    'status' => 'completed',
                    'notes' => $this->getRandomNote(true),
                    'created_by' => $users->random()->id,
                ]);

                $purchase->update([
                    'paid' => ($purchase->paid ?? 0) + $paymentAmount,
                    'remaining' => max(0, $purchase->total - ($purchase->paid ?? 0) - $paymentAmount),
                ]);

                $count++;
            }
        }

        return $count;
    }

    private function createCustomerPayments($users, $customers): int
    {
        $count = 0;
        $dateRange = $this->getDateRange();

        foreach ($customers as $customer) {
            $unpaidSales = Transaction::where('customer_id', $customer->id)
                ->whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
                ->where('remaining', '>', 0)
                ->get();

            if ($unpaidSales->isEmpty()) {
                continue;
            }

            $transactionsToPay = $unpaidSales->random(min(rand(1, 2), $unpaidSales->count()));

            foreach ($transactionsToPay as $sale) {
                $remaining = $sale->remaining;
                $paymentAmount = $remaining > 0 ? min($remaining * rand(50, 100) / 100, $remaining) : 0;

                if ($paymentAmount <= 0) {
                    continue;
                }

                $invoiceNumber = 'BYR-PT-' . date('Ymd') . '-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);

                Transaction::create([
                    'invoice_number' => $invoiceNumber,
                    'date' => $dateRange[array_rand($dateRange)],
                    'type' => 'pembayaran_piutang',
                    'customer_id' => $customer->id,
                    'subtotal' => $paymentAmount,
                    'discount' => 0,
                    'tax' => 0,
                    'total' => $paymentAmount,
                    'paid' => $paymentAmount,
                    'remaining' => 0,
                    'status' => 'completed',
                    'notes' => $this->getRandomNote(false),
                    'created_by' => $users->random()->id,
                ]);

                $sale->update([
                    'paid' => ($sale->paid ?? 0) + $paymentAmount,
                    'remaining' => max(0, $sale->total - ($sale->paid ?? 0) - $paymentAmount),
                ]);

                $count++;
            }
        }

        return $count;
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

    private function getRandomNote(bool $isSupplier): string
    {
        if ($isSupplier) {
            $notes = [
                'Pembayaran hutang supplier',
                'Pelunasan faktur purchase',
                'Pembayaran jatuh tempo',
                'Pembayaran partial',
                'Pelunasan lengkap',
            ];
        } else {
            $notes = [
                'Pembayaran piutang customer',
                'Pelunasan faktur penjualan',
                'Pembayaran jatuh tempo',
                'Pembayaran partial',
                'Pelunasan lengkap',
            ];
        }
        return $notes[array_rand($notes)];
    }

    private function updateSupplierBalancesAfterPayments($suppliers)
    {
        foreach ($suppliers as $supplier) {
            $purchases = Transaction::where('supplier_id', $supplier->id)
                ->where('type', 'pembelian')
                ->get();

            $payments = Transaction::where('supplier_id', $supplier->id)
                ->where('type', 'pembayaran_utang')
                ->get();

            $balance = $purchases->sum('total') - $purchases->sum('paid') - $payments->sum('total');
            
            $supplier->update(['balance' => $balance]);
        }
    }

    private function updateCustomerBalancesAfterPayments($customers)
    {
        foreach ($customers as $customer) {
            $sales = Transaction::where('customer_id', $customer->id)
                ->whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
                ->get();

            $payments = Transaction::where('customer_id', $customer->id)
                ->where('type', 'pembayaran_piutang')
                ->get();

            $balance = $sales->sum('total') - $sales->sum('paid') - $payments->sum('total');
            
            $customer->update(['balance' => $balance]);
        }
    }
}