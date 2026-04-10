<?php

namespace Database\Seeders;

use App\Models\ReturnPurchase;
use App\Models\ReturnPurchaseItem;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class ReturnPurchaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $suppliers = Supplier::all();
        $purchases = Transaction::where('type', 'pembelian')->get();

        if ($purchases->isEmpty()) {
            $this->command->warn('No purchases found. Skipping return purchase seeder.');
            return;
        }

        $returnCount = rand(3, 5);
        $created = 0;
        $dateRange = $this->getDateRange();

        for ($i = 0; $i < $returnCount; $i++) {
            $purchase = $purchases->random();
            $returnNumber = 'RET-P' . date('Ymd') . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT);

            $reason = $this->getReason();
            $status = $this->getStatus();

            $returnPurchase = ReturnPurchase::firstOrCreate(
                ['return_number' => $returnNumber],
                [
                    'date' => $dateRange[array_rand($dateRange)],
                    'transaction_id' => $purchase ? $purchase->id : null,
                    'supplier_id' => $purchase ? $purchase->supplier_id : $suppliers->random()->id,
                    'reason' => $reason,
                    'notes' => $this->getNotes(),
                    'status' => $status,
                    'created_by' => $users->random()->id,
                ]
            );

            if ($returnPurchase->wasRecentlyCreated || ReturnPurchaseItem::where('return_purchase_id', $returnPurchase->id)->count() === 0) {
                if ($purchase && $purchase->details->isNotEmpty()) {
                    $numItems = min(rand(1, 2), $purchase->details->count());
                    $selectedDetails = $purchase->details->random($numItems);

                    foreach ($selectedDetails as $detail) {
                        $quantity = rand(1, min($detail->quantity, 5));
                        $price = $detail->price;
                        $subtotal = $quantity * $price;
                        $discount = rand(0, 1) ? rand(5, 10) : 0;

                        ReturnPurchaseItem::create([
                            'return_purchase_id' => $returnPurchase->id,
                            'product_id' => $detail->product_id,
                            'product_name' => $detail->product_name,
                            'quantity' => $quantity,
                            'price' => $price,
                            'discount' => $discount,
                            'subtotal' => $subtotal - ($subtotal * $discount / 100),
                        ]);
                    }
                }
                $created++;
            }
        }

        $this->command->info("Return purchases seeded: {$created} retur pembelian.");
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

    private function getReason(): string
    {
        $reasons = [
            'rusak',
            'kadaluarsa',
            'tidak_sesuai',
            'kelebihan',
        ];
        return $reasons[array_rand($reasons)];
    }

    private function getStatus(): string
    {
        $statuses = ['processed', 'processed', 'processed', 'cancelled'];
        return $statuses[array_rand($statuses)];
    }

    private function getNotes(): ?string
    {
        $notes = [
            'Retur supplier',
            'Barang rusak saat terima',
            'Produk tidak sesuai specs',
            'Expired date terlalu dekat',
            null,
        ];
        return $notes[array_rand($notes)];
    }
}