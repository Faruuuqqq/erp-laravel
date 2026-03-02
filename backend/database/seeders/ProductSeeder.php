<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id')->toArray();
        $warehouses = Warehouse::pluck('id')->toArray();

        $products = [
            ['code' => 'PRD001', 'name' => 'Beras Premium 5kg', 'category_id' => $categories[0] ?? 1, 'buy_price' => 45000, 'sell_price' => 55000, 'stock' => 50, 'min_stock' => 10, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 250000, 'avg_daily_sales' => 25, 'days_of_stock' => 2],
            ['code' => 'PRD002', 'name' => 'Minyak Goreng 2L', 'category_id' => $categories[0] ?? 1, 'buy_price' => 28000, 'sell_price' => 35000, 'stock' => 35, 'min_stock' => 8, 'unit' => 'liter', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 180000, 'avg_daily_sales' => 15, 'days_of_stock' => 2],
            ['code' => 'PRD003', 'name' => 'Gula Pasir 1kg', 'category_id' => $categories[0] ?? 1, 'buy_price' => 12000, 'sell_price' => 15000, 'stock' => 80, 'min_stock' => 15, 'unit' => 'kg', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 320000, 'avg_daily_sales' => 40, 'days_of_stock' => 2],
            ['code' => 'PRD004', 'name' => 'Sabun Mandi 250ml', 'category_id' => $categories[6] ?? 7, 'buy_price' => 15000, 'sell_price' => 20000, 'stock' => 60, 'min_stock' => 12, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 150000, 'avg_daily_sales' => 20, 'days_of_stock' => 3],
            ['code' => 'PRD005', 'name' => 'Pasta Gigi 75g', 'category_id' => $categories[6] ?? 7, 'buy_price' => 8000, 'sell_price' => 12000, 'stock' => 45, 'min_stock' => 10, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 90000, 'avg_daily_sales' => 15, 'days_of_stock' => 3],
            ['code' => 'PRD006', 'name' => 'Shampo Botol 200ml', 'category_id' => $categories[6] ?? 7, 'buy_price' => 18000, 'sell_price' => 25000, 'stock' => 55, 'min_stock' => 10, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 210000, 'avg_daily_sales' => 22, 'days_of_stock' => 2],
            ['code' => 'PRD007', 'name' => 'Roti Tawar', 'category_id' => $categories[0] ?? 1, 'buy_price' => 15000, 'sell_price' => 20000, 'stock' => 40, 'min_stock' => 8, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 160000, 'avg_daily_sales' => 25, 'days_of_stock' => 1],
            ['code' => 'PRD008', 'name' => 'Telur Ayam 10pcs', 'category_id' => $categories[0] ?? 1, 'buy_price' => 25000, 'sell_price' => 35000, 'stock' => 70, 'min_stock' => 12, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 420000, 'avg_daily_sales' => 30, 'days_of_stock' => 2],
            ['code' => 'PRD009', 'name' => 'Susu UHT 1L', 'category_id' => $categories[1] ?? 2, 'buy_price' => 18000, 'sell_price' => 22000, 'stock' => 35, 'min_stock' => 8, 'unit' => 'liter', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 110000, 'avg_daily_sales' => 18, 'days_of_stock' => 1],
            ['code' => 'PRD010', 'name' => 'Mie Instan Goreng', 'category_id' => $categories[2] ?? 3, 'buy_price' => 3000, 'sell_price' => 4000, 'stock' => 4, 'min_stock' => 10, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 15000, 'avg_daily_sales' => 5, 'days_of_stock' => 0],
            ['code' => 'PRD011', 'name' => 'Kecap Botol 250ml', 'category_id' => $categories[2] ?? 3, 'buy_price' => 8000, 'sell_price' => 12000, 'stock' => 12, 'min_stock' => 8, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 50000, 'avg_daily_sales' => 10, 'days_of_stock' => 1],
            ['code' => 'PRD012', 'name' => 'Garam 500g', 'category_id' => $categories[2] ?? 3, 'buy_price' => 3000, 'sell_price' => 5000, 'stock' => 8, 'min_stock' => 6, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 8000, 'avg_daily_sales' => 8, 'days_of_stock' => 1],
            ['code' => 'PRD013', 'name' => 'Teh Kotak 25 Tea Bags', 'category_id' => $categories[1] ?? 2, 'buy_price' => 35000, 'sell_price' => 45000, 'stock' => 30, 'min_stock' => 8, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 180000, 'avg_daily_sales' => 20, 'days_of_stock' => 1],
            ['code' => 'PRD014', 'name' => 'Kopi Sachet Premium', 'category_id' => $categories[1] ?? 2, 'buy_price' => 5000, 'sell_price' => 7000, 'stock' => 100, 'min_stock' => 15, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 210000, 'avg_daily_sales' => 25, 'days_of_stock' => 4],
            ['code' => 'PRD015', 'name' => 'Air Mineral 600ml', 'category_id' => $categories[1] ?? 2, 'buy_price' => 3000, 'sell_price' => 5000, 'stock' => 150, 'min_stock' => 20, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 150000, 'avg_daily_sales' => 18, 'days_of_stock' => 8],
            ['code' => 'PRD016', 'name' => 'Biskuit Kaleng', 'category_id' => $categories[2] ?? 3, 'buy_price' => 8000, 'sell_price' => 12000, 'stock' => 25, 'min_stock' => 10, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 75000, 'avg_daily_sales' => 12, 'days_of_stock' => 2],
            ['code' => 'PRD017', 'name' => 'Wafer Coklat', 'category_id' => $categories[2] ?? 3, 'buy_price' => 5000, 'sell_price' => 8000, 'stock' => 18, 'min_stock' => 6, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 42000, 'avg_daily_sales' => 8, 'days_of_stock' => 2],
            ['code' => 'PRD018', 'name' => 'Keripik Pisang 100g', 'category_id' => $categories[2] ?? 3, 'buy_price' => 7000, 'sell_price' => 10000, 'stock' => 14, 'min_stock' => 5, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 35000, 'avg_daily_sales' => 10, 'days_of_stock' => 1],
            ['code' => 'PRD019', 'name' => 'Baterai AA', 'category_id' => $categories[3] ?? 4, 'buy_price' => 15000, 'sell_price' => 20000, 'stock' => 20, 'min_stock' => 5, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 80000, 'avg_daily_sales' => 10, 'days_of_stock' => 2],
            ['code' => 'PRD020', 'name' => 'Lampu LED 5W', 'category_id' => $categories[3] ?? 4, 'buy_price' => 12000, 'sell_price' => 18000, 'stock' => 15, 'min_stock' => 5, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 45000, 'avg_daily_sales' => 8, 'days_of_stock' => 1],
            ['code' => 'PRD021', 'name' => 'Charger HP Universal', 'category_id' => $categories[3] ?? 4, 'buy_price' => 25000, 'sell_price' => 35000, 'stock' => 10, 'min_stock' => 3, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 60000, 'avg_daily_sales' => 10, 'days_of_stock' => 1],
            ['code' => 'PRD022', 'name' => 'Kabel Roll 5m', 'category_id' => $categories[4] ?? 5, 'buy_price' => 8000, 'sell_price' => 12000, 'stock' => 30, 'min_stock' => 8, 'unit' => 'roll', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 75000, 'avg_daily_sales' => 15, 'days_of_stock' => 2],
            ['code' => 'PRD023', 'name' => 'Obeng Set', 'category_id' => $categories[4] ?? 5, 'buy_price' => 35000, 'sell_price' => 50000, 'stock' => 8, 'min_stock' => 2, 'unit' => 'set', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 18000, 'avg_daily_sales' => 5, 'days_of_stock' => 1],
            ['code' => 'PRD024', 'name' => 'Pemutih Pakaian 500ml', 'category_id' => $categories[5] ?? 6, 'buy_price' => 10000, 'sell_price' => 15000, 'stock' => 45, 'min_stock' => 10, 'unit' => 'liter', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 120000, 'avg_daily_sales' => 20, 'days_of_stock' => 2],
            ['code' => 'PRD025', 'name' => 'Pembersih Lantai 2L', 'category_id' => $categories[5] ?? 6, 'buy_price' => 25000, 'sell_price' => 35000, 'stock' => 20, 'min_stock' => 5, 'unit' => 'liter', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 95000, 'avg_daily_sales' => 12, 'days_of_stock' => 1],
            ['code' => 'PRD026', 'name' => 'Vitamin C 500mg', 'category_id' => $categories[6] ?? 7, 'buy_price' => 5000, 'sell_price' => 8000, 'stock' => 60, 'min_stock' => 10, 'unit' => 'pcs', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 120000, 'avg_daily_sales' => 22, 'days_of_stock' => 2],
            ['code' => 'PRD027', 'name' => 'Paracetamol Strip', 'category_id' => $categories[6] ?? 7, 'buy_price' => 3500, 'sell_price' => 6000, 'stock' => 80, 'min_stock' => 15, 'unit' => 'strip', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 85000, 'avg_daily_sales' => 15, 'days_of_stock' => 5],
            ['code' => 'PRD028', 'name' => 'Obat Batuk 100ml', 'category_id' => $categories[6] ?? 7, 'buy_price' => 12000, 'sell_price' => 18000, 'stock' => 35, 'min_stock' => 8, 'unit' => 'botol', 'warehouse_id' => $warehouses[0] ?? 1, 'total_sales' => 68000, 'avg_daily_sales' => 12, 'days_of_stock' => 2],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(['code' => $product['code']], $product);
        }

        $this->command->info('Products seeded: ' . count($products) . ' produk.');
    }
}
