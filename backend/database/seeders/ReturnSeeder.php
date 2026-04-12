<?php

namespace Database\Seeders;

use App\Models\ReturnSale;
use App\Models\ReturnSaleItem;
use App\Models\ReturnPurchase;
use App\Models\ReturnPurchaseItem;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReturnSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) return;

        if (ReturnSale::count() > 0 || ReturnPurchase::count() > 0) {
            $this->command->info('Return data sudah ada, melewati ReturnSeeder.');
            return;
        }

        $rsCount = $this->seedReturnSales($users);
        $rpCount = $this->seedReturnPurchases($users);

        $this->command->info("Return seeder selesai: {$rsCount} retur penjualan, {$rpCount} retur pembelian.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function seedReturnSales($users): int
    {
        $reasons = ['rusak', 'kadaluarsa', 'tidak_sesuai', 'kelebihan'];

        $penjualanTrx = Transaction::whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
            ->with('details')
            ->has('details')
            ->take(6)
            ->get();

        $noCounter = 1;
        foreach ($penjualanTrx as $trx) {
            $date = now()->subDays(rand(0, 10))->format('Y-m-d');
            $returnNumber = 'RTJ-' . str_replace('-', '', $date) . '-' . str_pad($noCounter++, 3, '0', STR_PAD_LEFT);

            $retur = ReturnSale::create([
                'return_number'  => $returnNumber,
                'date'           => $date,
                'transaction_id' => $trx->id,
                'customer_id'    => $trx->customer_id,
                'reason'         => $reasons[array_rand($reasons)],
                'notes'          => 'Retur dari faktur ' . $trx->invoice_number,
                'status'         => 'processed',
                'created_by'     => $users->random()->id,
            ]);

            // Ambil 1-2 item dari transaksi asal
            $items = $trx->details->take(rand(1, min(2, $trx->details->count())));

            foreach ($items as $item) {
                $qty      = rand(1, max(1, (int)($item->quantity / 2)));
                $subtotal = $qty * $item->price;

                ReturnSaleItem::create([
                    'return_sale_id' => $retur->id,
                    'product_id'     => $item->product_id,
                    'product_name'   => $item->product_name,
                    'quantity'       => $qty,
                    'price'          => $item->price,
                    'discount'       => 0,
                    'subtotal'       => $subtotal,
                ]);
            }
        }

        return $noCounter - 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function seedReturnPurchases($users): int
    {
        $reasons = ['rusak', 'kadaluarsa', 'tidak_sesuai', 'kelebihan'];

        $pembelianTrx = Transaction::where('type', 'pembelian')
            ->with('details')
            ->has('details')
            ->take(4)
            ->get();

        $noCounter = 1;
        foreach ($pembelianTrx as $trx) {
            $date = now()->subDays(rand(0, 10))->format('Y-m-d');
            $returnNumber = 'RTB-' . str_replace('-', '', $date) . '-' . str_pad($noCounter++, 3, '0', STR_PAD_LEFT);

            $retur = ReturnPurchase::create([
                'return_number'  => $returnNumber,
                'date'           => $date,
                'transaction_id' => $trx->id,
                'supplier_id'    => $trx->supplier_id,
                'reason'         => $reasons[array_rand($reasons)],
                'notes'          => 'Retur dari PO ' . $trx->invoice_number,
                'status'         => 'processed',
                'created_by'     => $users->random()->id,
            ]);

            $items = $trx->details->take(rand(1, min(2, $trx->details->count())));

            foreach ($items as $item) {
                $qty      = rand(1, max(1, (int)($item->quantity / 3)));
                $subtotal = $qty * $item->price;

                ReturnPurchaseItem::create([
                    'return_purchase_id' => $retur->id,
                    'product_id'         => $item->product_id,
                    'product_name'       => $item->product_name,
                    'quantity'           => $qty,
                    'price'              => $item->price,
                    'discount'           => 0,
                    'subtotal'           => $subtotal,
                ]);
            }
        }

        return $noCounter - 1;
    }
}
