<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $categories = Category::pluck('id')->toArray();
        $warehouses = Warehouse::pluck('id')->toArray();

        $buyPrice = $this->faker->numberBetween(5000, 100000);
        $margin = $this->faker->numberBetween(15, 40);
        $sellPrice = $buyPrice + ($buyPrice * $margin / 100);

        $stock = $this->faker->randomElement([
            $this->faker->numberBetween(30, 100),
            $this->faker->numberBetween(5, 15),
            0,
        ]);

        return [
            'code' => 'PRD' . str_pad($this->faker->unique()->numberBetween(1, 999), 3, '0'),
            'name' => $this->faker->randomElement([
                'Beras Premium 5kg', 'Minyak Goreng 2L', 'Gula Pasir 1kg',
                'Sabun Mandi', 'Pasta Gigi', 'Shampo Botol',
                'Roti Tawar', 'Telur Ayam', 'Susu UHT 1L',
                'Mie Instan', 'Kecap Botol', 'Garam 500g',
                'Teh Kotak', 'Kopi Sachet', 'Air Mineral 600ml',
            ]),
            'category_id' => $this->faker->randomElement($categories),
            'buy_price' => $buyPrice,
            'sell_price' => $sellPrice,
            'stock' => $stock,
            'min_stock' => $this->faker->numberBetween(5, 15),
            'unit' => $this->faker->randomElement(['pcs', 'kg', 'liter', 'box', 'pack']),
            'warehouse_id' => $this->faker->randomElement($warehouses),
            'total_sales' => $this->faker->numberBetween(0, 5000000),
            'avg_daily_sales' => $this->faker->randomElement([0, 2, 5, 10, 25]),
            'days_of_stock' => $stock > 0 ? $this->faker->numberBetween(1, 30) : 0,
        ];
    }
}
