<?php

namespace Database\Factories;

use App\Models\SalesRep;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalesRepFactory extends Factory
{
    protected $model = SalesRep::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Budi Santoso',
                'Siti Aminah',
                'Ahmad Fauzi',
                'Rina Wati',
                'Dedi Kurniawan',
                'Lestari Sari',
                'Joko Susilo',
                'Dewi Sartika',
                'Agus Setiawan',
                'Endang Suryani',
                'Indra Wijaya',
                'Tatik Sari',
                'Darmawan Saputra',
            ]),
            'phone' => $this->faker->randomElement([
                '08123456789',
                '08234567890',
                '0856789012',
                '08789012345',
            ]),
            'email' => $this->faker->companyEmail(),
            'address' => $this->faker->address(),
            'total_sales' => $this->faker->numberBetween(5000000, 50000000),
            'status' => $this->faker->randomElement(['active', 'active', 'active', 'inactive']),
        ];
    }
}
