<?php

namespace Database\Factories;

use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarehouseFactory extends Factory
{
    protected $model = Warehouse::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Gudang Utama',
                'Gudang Cabang A',
                'Gudang Cabang B',
            ]),
            'address' => $this->faker->randomElement([
                'Jl. Industri No. 1, Jakarta Industrial Estate',
                'Jl. Raya Pahlawan No. 100, Bandung',
                'Jl. Karang Pilang No. 50, Surabaya',
            ]),
            'total_products' => $this->faker->numberBetween(100, 500),
            'status' => $this->faker->randomElement(['active', 'active', 'active', 'inactive']),
        ];
    }
}
