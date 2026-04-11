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
    private int $invoiceCounter = 1;
    private int $poCounter      = 1;

    public function run(): void
    {
        $users     = User::all();
        $suppliers = Supplier::all();
        $customers = Customer::all();
        $salesReps = SalesRep::all();
        $products  = Product::all();

        if ($users->isEmpty() || $suppliers->isEmpty() || $customers->isEmpty() || $products->isEmpty()) {
            $this->command->error('Harap seed Users, Suppliers, Customers, dan Products terlebih dahulu!');
            return;
        }

        if (Transaction::count() > 0) {
            $this->command->info('Transaksi sudah ada, melewati SimpleTransactionSeeder.');
            return;
        }

        $this->createSalesTransactions($users, $customers, $salesReps, $products);
        $this->createPurchaseTransactions($users, $suppliers, $products);
        $this->createCreditPayments($users, $customers);

        $count = Transaction::count();
        $this->command->info("Transaksi selesai: {$count} transaksi dibuat.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function createSalesTransactions($users, $customers, $salesReps, $products): void
    {
        $created = 0;

        for ($i = 0; $i < 80; $i++) {
            $daysBack  = rand(0, 30);
            $date      = now()->subDays($daysBack)->format('Y-m-d');
            $isCredit  = ($i % 4 === 0);                    // 25% kredit
            $type      = $isCredit ? 'penjualan_kredit' : 'penjualan_tunai';
            $customer  = $customers->random();
            $salesRep  = ($isCredit && $salesReps->isNotEmpty()) ? $salesReps->random() : null;

            $invoice = 'INV' . str_replace('-', '', $date) . '-' . str_pad($this->invoiceCounter++, 3, '0', STR_PAD_LEFT);

            $trx = Transaction::create([
                'invoice_number' => $invoice,
                'date'           => $date,
                'type'           => $type,
                'customer_id'    => $customer->id,
                'sales_rep_id'   => $salesRep?->id,
                'subtotal'       => 0,
                'discount'       => 0,
                'tax'            => 0,
                'total'          => 0,
                'paid'           => 0,
                'remaining'      => 0,
                'status'         => 'completed',
                'notes'          => $this->randomNote('penjualan'),
                'created_by'     => $users->random()->id,
            ]);

            $numItems = rand(1, 5);
            $total    = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product  = $products->random();
                $qty      = rand(1, 10);
                $price    = $product->sell_price;
                $diskon   = (rand(0, 10) > 7) ? rand(5, 15) : 0;  // 30% chance diskon
                $subtotal = $qty * $price * (1 - $diskon / 100);

                TransactionDetail::create([
                    'transaction_id' => $trx->id,
                    'product_id'     => $product->id,
                    'product_name'   => $product->name,
                    'quantity'       => $qty,
                    'price'          => $price,
                    'discount'       => $diskon,
                    'subtotal'       => $subtotal,
                ]);

                $total += $subtotal;
            }

            $discount = (rand(0, 10) > 8) ? rand(5000, 25000) : 0;
            $grandTotal = max(0, $total - $discount);

            if ($isCredit) {
                $dp        = (rand(0, 10) > 5) ? round($grandTotal * rand(3, 7) / 10, -3) : 0;
                $remaining = $grandTotal - $dp;
                $paid      = $dp;
            } else {
                $paid      = $grandTotal;
                $remaining = 0;
            }

            $trx->update([
                'subtotal'  => $total,
                'discount'  => $discount,
                'total'     => $grandTotal,
                'paid'      => $paid,
                'remaining' => $remaining,
            ]);

            $created++;
        }

        $this->command->info("  → {$created} transaksi penjualan dibuat.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function createPurchaseTransactions($users, $suppliers, $products): void
    {
        $created = 0;

        for ($i = 0; $i < 30; $i++) {
            $daysBack  = rand(0, 30);
            $date      = now()->subDays($daysBack)->format('Y-m-d');
            $supplier  = $suppliers->random();
            $isKredit  = ($i % 3 === 0);   // 33% utang

            $po = 'PO' . str_replace('-', '', $date) . '-' . str_pad($this->poCounter++, 3, '0', STR_PAD_LEFT);

            $trx = Transaction::create([
                'invoice_number' => $po,
                'date'           => $date,
                'type'           => 'pembelian',
                'supplier_id'    => $supplier->id,
                'subtotal'       => 0,
                'discount'       => 0,
                'tax'            => 0,
                'total'          => 0,
                'paid'           => 0,
                'remaining'      => 0,
                'status'         => 'completed',
                'notes'          => $this->randomNote('pembelian'),
                'created_by'     => $users->random()->id,
            ]);

            $numItems = rand(2, 6);
            $total    = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product  = $products->random();
                $qty      = rand(5, 30);
                $price    = $product->buy_price;
                $subtotal = $qty * $price;

                TransactionDetail::create([
                    'transaction_id' => $trx->id,
                    'product_id'     => $product->id,
                    'product_name'   => $product->name,
                    'quantity'       => $qty,
                    'price'          => $price,
                    'discount'       => 0,
                    'subtotal'       => $subtotal,
                ]);

                $total += $subtotal;
            }

            if ($isKredit) {
                $dp        = (rand(0, 10) > 5) ? round($total * 0.3, -3) : 0;
                $remaining = $total - $dp;
                $paid      = $dp;
            } else {
                $paid      = $total;
                $remaining = 0;
            }

            $trx->update([
                'subtotal'  => $total,
                'discount'  => 0,
                'total'     => $total,
                'paid'      => $paid,
                'remaining' => $remaining,
            ]);

            $created++;
        }

        $this->command->info("  → {$created} transaksi pembelian dibuat.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Buat beberapa pembayaran piutang untuk transaksi kredit yang ada
    private function createCreditPayments($users, $customers): void
    {
        $creditTrx = Transaction::where('type', 'penjualan_kredit')
            ->where('remaining', '>', 0)
            ->take(8)
            ->get();

        $created = 0;
        foreach ($creditTrx as $trx) {
            $bayar = round($trx->remaining * rand(5, 10) / 10, -3);
            if ($bayar <= 0) continue;

            $date = now()->subDays(rand(0, 7))->format('Y-m-d');
            $inv  = 'BYR' . str_replace('-', '', $date) . '-' . str_pad(++$created, 3, '0', STR_PAD_LEFT);

            Transaction::create([
                'invoice_number' => $inv,
                'date'           => $date,
                'type'           => 'pembayaran_piutang',
                'customer_id'    => $trx->customer_id,
                'subtotal'       => $bayar,
                'discount'       => 0,
                'tax'            => 0,
                'total'          => $bayar,
                'paid'           => $bayar,
                'remaining'      => 0,
                'status'         => 'completed',
                'notes'          => 'Pembayaran piutang untuk ' . $trx->invoice_number,
                'created_by'     => $users->random()->id,
            ]);

            // Kurangi remaining di transaksi asal
            $newRemaining = max(0, $trx->remaining - $bayar);
            $trx->update([
                'paid'      => $trx->paid + $bayar,
                'remaining' => $newRemaining,
            ]);
        }

        $this->command->info("  → {$created} pembayaran piutang dibuat.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function randomNote(string $context): ?string
    {
        $penjualan = [
            'Transaksi harian normal', 'Pelanggan tetap', 'Promo minggu ini',
            'Pembelian grosir', 'Bayar tunai langsung', null, null,
        ];
        $pembelian = [
            'Stok mingguan', 'Restok urgent', 'Pembelian bulanan',
            'Harga spesial supplier', null, null,
        ];

        return match ($context) {
            'penjualan' => $penjualan[array_rand($penjualan)],
            'pembelian' => $pembelian[array_rand($pembelian)],
            default     => null,
        };
    }
}
