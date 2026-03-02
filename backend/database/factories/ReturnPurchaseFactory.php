<?php

namespace Database\Factories;

use App\Models\ReturnPurchase;
use App\Models\Transaction;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReturnPurchaseFactory extends Factory
{
    protected $model = ReturnPurchase::class;

    public function definition(): array
    {
        $date = $this->faker->dateTimeBetween('-7 days', 'today')->format('Y-m-d');
        $returnNumber = 'RET-P' . now()->format('Ymd') . '-' .
            str_pad($this->faker->unique()->numberBetween(1, 99), 2, '0');

        return [
            'return_number' => $returnNumber,
            'transaction_id' => Transaction::where('type', 'pembelian')->inRandomOrder()->first()?->id,
            'supplier_id' => Supplier::inRandomOrder()->first()?->id,
            'reason' => $this->faker->randomElement([
                'Barang rusak dari supplier',
                'Salah kirim barang',
                'Kualitas tidak sesuai',
                'Barang kadaluarsa',
                'Kemasan rusak',
            ]),
            'total' => $this->faker->numberBetween(300000, 3000000),
            'status' => $this->faker->randomElement(['completed', 'completed', 'completed', 'cancelled']),
            'notes' => $this->faker->randomElement([
                'Retur mingguan',
                'Klaim ke supplier',
                'Quality check failed',
                null,
            ]),
            'created_by' => User::inRandomOrder()->first()?->id,
        ];
    }
}
