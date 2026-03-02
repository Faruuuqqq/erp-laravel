<?php

namespace Database\Seeders;

use App\Models\ReturnSale;
use App\Models\Transaction;
use App\Models\ReturnSaleItem;
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

        $returnCount = rand(4, 6);

        for ($i = 0; $i < $returnCount; $i++) {
            $creditSale = $creditSales->random();
            $returnNumber = 'RET-J' . now()->format('Ymd') . '-' . str_pad($i + 1, 2, '0');

            $returnSale = ReturnSale::create([
                'return_number' => $returnNumber,
                'transaction_id' => $creditSale ? $creditSale->id : null,
                'customer_id' => $customers->random()->id,
                'sales_rep_id' => $salesReps->random()->id,
                'reason' => $this->getReason(),
                'total' => rand(50000, 500000),
                'status' => $this->getStatus(),
                'notes' => $this->getNotes(),
                'created_by' => $users->random()->id,
            ]);

            if ($creditSale) {
                ReturnSaleItem::create([
                    'return_sale_id' => $returnSale->id,
                    'product_id' => rand(1, 28),
                    'product_name' => $this->getProductName(),
                    'quantity' => rand(1, 10),
                    'price' => rand(5000, 50000),
                    'discount' => $this->getItemDiscount(),
                    'subtotal' => rand(50000, 500000),
                ]);
            }
        }
    }

    private function getReason(): string
    {
        $reasons = [
            'Barang rusak saat pengiriman',
            'Salah kirim barang',
            'Tidak sesuai pesanan',
            'Kualitas tidak memuaskan',
            'Barang kadaluarsa',
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
            'Retur harian',
            'Komplain pelanggan',
            'Quality control issue',
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
            'Roti Tawar',
        ];
        return $names[array_rand($names)];
    }

    private function getItemDiscount(): int
    {
        $discounts = [0, 5, 10];
        return $discounts[array_rand($discounts)];
    }

        $this->command->info('Return sales seeded: ' . $returnCount . ' retur penjualan.');
    }
}
