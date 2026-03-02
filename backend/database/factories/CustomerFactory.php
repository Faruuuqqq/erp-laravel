<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Toko Makmur Jaya',
                'CV. Berkah Abadi',
                'Warung Bu Siti',
                'Pasar Gede Indah',
                'Toko Serba Ada',
                'Minimarket Sentosa',
                'UD. Maju Bersama',
                'CV. Harapan Baru',
                'Pasar Tradisional Sejahtera',
                'Toko Berkah Raya',
                'Indomaret Pusat',
                'Alfamart Cabang',
                'Warung Makan Jaya',
                'Pasar Swalayan Makmur',
                'Toko Grosir Nusantara',
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
                'Jl. Diponegoro No. 123, Jakarta',
                'Jl. Asia Afrika Kav. 5, Bandung',
                'Jl. Basuki Rahmat No. 45, Surabaya',
                'Jl. Pangeran Diponegoro No. 67, Semarang',
                'Jl. Malioboro No. 89, Yogyakarta',
            ]),
            'balance' => $this->faker->randomElement([
                0,
                $this->faker->numberBetween(-15000000, -500000),
                $this->faker->numberBetween(500000, 8000000),
            ]),
        ];
    }
}
