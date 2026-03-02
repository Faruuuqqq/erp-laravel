<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'PT. Distributor Jaya Abadi',
                'CV. Sumber Makmur Sejahtera',
                'UD. Berkah Barokah',
                'PT. Grosir Utama Nusantara',
                'CV. Anugerah Sentosa',
                'PT. Pangan Berkah',
                'UD. Maju Jaya Mandiri',
                'CV. Harapan Baru',
                'PT. Mitra Dagang Sejahtera',
                'UD. Sejahtera Sentosa',
            ]),
            'phone' => $this->faker->randomElement([
                '08123456789',
                '08234567890',
                '0856789012',
                '08789012345',
                '08901234567',
                '+62 811 2345 6789',
                '+62 812 3456 7890',
            ]),
            'email' => $this->faker->companyEmail(),
            'address' => $this->faker->randomElement([
                'Jl. Sudirman No. 123, Jakarta',
                'Jl. Gatot Subroto Kav. 5, Bandung',
                'Jl. Ahmad Yani No. 45, Surabaya',
                'Jl. Pemuda No. 67, Semarang',
                'Jl. Merdeka No. 89, Yogyakarta',
            ]),
            'balance' => $this->faker->randomElement([
                0,
                $this->faker->numberBetween(-10000000, -500000),
                $this->faker->numberBetween(500000, 5000000),
            ]),
        ];
    }
}
