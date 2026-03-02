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

        $returnCount = $this->faker->numberBetween(3, 5);

        for ($i = 0; $i < $returnCount; $i++) {
            $purchase = $purchases->random();
            $returnNumber = 'RET-P' . now()->format('Ymd') . '-' . str_pad($i + 1, 2, '0');

            $returnPurchase = ReturnPurchase::create([
                'return_number' => $returnNumber,
                'transaction_id' => $purchase ? $purchase->id : null,
                'supplier_id' => $suppliers->random()->id,
                'reason' => $this->getReason(),
                'total' => rand(300000, 3000000),
                'status' => $this->getStatus(),
                'notes' => $this->getNotes(),
                'created_by' => $users->random()->id,
            ]);

            if ($purchase) {
                ReturnPurchaseItem::create([
                    'return_purchase_id' => $returnPurchase->id,
                    'product_id' => rand(1, 28),
                    'product_name' => $this->getProductName(),
                    'quantity' => rand(1, 20),
                    'price' => rand(5000, 50000),
                    'discount' => $this->getItemDiscount(),
                    'subtotal' => rand(300000, 3000000),
                ]);
            }
        }
    }

    private function getReason(): string
    {
        $reasons = [
            'Barang rusak dari supplier',
            'Salah kirim barang',
            'Kualitas tidak sesuai',
            'Barang kadaluarsa',
            'Kemasan rusak',
        ];
        return $reasons[array_rand($reasons)];
    }

    private function getStatus(): string
    {
        $statuses = ['completed', 'completed', 'completed', 'cancelled'];
        return $statuses[array_rand($statuses)];
    }

    private function getNotes(): ?string
    {
        $notes = [
            'Retur mingguan',
            'Klaim ke supplier',
            'Quality check failed',
            null,
        ];
        $randomIndex = array_rand($notes);
        return $notes[$randomIndex];
    }

    private function getProductName(): string
    {
        $names = [
            'Beras Premium 5kg',
            'Minyak Goreng 2L',
            'Gula Pasir 1kg',
            'Teh Kotak',
        ];
        return $names[array_rand($names)];
    }

    private function getItemDiscount(): int
    {
        $discounts = [0, 5, 10];
        return $discounts[array_rand($discounts)];
    }

        $this->command->info('Return purchases seeded: ' . $returnCount . ' retur pembelian.');
    }
}
