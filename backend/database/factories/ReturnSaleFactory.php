<?php

namespace Database\Factories;

use App\Models\ReturnSale;
use App\Models\Transaction;
use App\Models\Customer;
use App\Models\SalesRep;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReturnSaleFactory extends Factory
{
    protected $model = ReturnSale::class;

    public function definition(): array
    {
        $date = $this->faker->dateTimeBetween('-7 days', 'today')->format('Y-m-d');
        $returnNumber = 'RET-J' . now()->format('Ymd') . '-' .
            str_pad($this->faker->unique()->numberBetween(1, 99), 2, '0');

        return [
            'return_number' => $returnNumber,
            'transaction_id' => Transaction::where('type', 'penjualan_tunai')->inRandomOrder()->first()?->id,
            'customer_id' => Customer::inRandomOrder()->first()?->id,
            'sales_rep_id' => SalesRep::inRandomOrder()->first()?->id,
            'reason' => $this->faker->randomElement([
                'Barang rusak saat pengiriman',
                'Salah kirim barang',
                'Tidak sesuai pesanan',
                'Kualitas tidak memuaskan',
                'Barang kadaluarsa',
            ]),
            'total' => $this->faker->numberBetween(50000, 500000),
            'status' => $this->faker->randomElement(['completed', 'completed', 'completed', 'cancelled']),
            'notes' => $this->faker->randomElement([
                'Retur harian',
                'Komplain pelanggan',
                'Quality control issue',
                null,
            ]),
            'created_by' => User::inRandomOrder()->first()?->id,
        ];
    }
}
