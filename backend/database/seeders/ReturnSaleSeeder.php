<?php

namespace Database\Seeders;

use App\Models\ReturnSale;
use App\Models\ReturnSaleItem;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Customer;
use App\Models\SalesRep;
use Illuminate\Database\Seeder;

class ReturnSaleSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $customers = Customer::all();
        $salesReps = SalesRep::all();
        $creditSales = Transaction::where('type', 'penjualan_kredit')->get();

        if ($creditSales->isEmpty()) {
            $this->command->warn('No credit sales found. Skipping return sales seeder.');
            return;
        }

        $returnCount = rand(4, 6);
        $created = 0;
        $dateRange = $this->getDateRange();

        for ($i = 0; $i < $returnCount; $i++) {
            $creditSale = $creditSales->random();
            $returnNumber = 'RET-J' . date('Ymd') . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT);

            $reason = $this->getReason();
            $status = $this->getStatus();

            $returnSale = ReturnSale::firstOrCreate(
                ['return_number' => $returnNumber],
                [
                    'date' => $dateRange[array_rand($dateRange)],
                    'transaction_id' => $creditSale ? $creditSale->id : null,
                    'customer_id' => $creditSale ? $creditSale->customer_id : $customers->random()->id,
                    'reason' => $reason,
                    'status' => $status,
                    'notes' => $this->getNotes(),
                    'created_by' => $users->random()->id,
                ]
            );

            if ($returnSale->wasRecentlyCreated || ReturnSaleItem::where('return_sale_id', $returnSale->id)->count() === 0) {
                if ($creditSale && $creditSale->details->isNotEmpty()) {
                    $numItems = min(rand(1, 3), $creditSale->details->count());
                    $selectedDetails = $creditSale->details->random($numItems);

                    foreach ($selectedDetails as $detail) {
                        $quantity = rand(1, min($detail->quantity, 5));
                        $price = $detail->price;
                        $subtotal = $quantity * $price;
                        $discount = rand(0, 1) ? rand(5, 15) : 0;

                        ReturnSaleItem::create([
                            'return_sale_id' => $returnSale->id,
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

        $this->command->info("Return sales seeded: {$created} retur penjualan.");
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
        $statuses = ['processed', 'processed', 'processed', 'draft', 'cancelled'];
        return $statuses[array_rand($statuses)];
    }

    private function getNotes(): ?string
    {
        $notes = [
            'Retur harian',
            'Komplain pelanggan',
            'Quality control issue',
            'Dokumen lengkap',
            null,
        ];
        return $notes[array_rand($notes)];
    }
}