<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        $warehouses = [
            ['name' => 'Gudang Utama', 'address' => 'Jl. Industri No. 1, Jakarta Industrial Estate', 'status' => 'active'],
            ['name' => 'Gudang Cabang A', 'address' => 'Jl. Raya Pahlawan No. 100, Bandung', 'status' => 'active'],
            ['name' => 'Gudang Cabang B', 'address' => 'Jl. Karang Pilang No. 50, Surabaya', 'status' => 'active'],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::firstOrCreate(['name' => $warehouse['name']], $warehouse);
        }

        $this->command->info('Warehouses seeded: ' . count($warehouses) . ' gudang.');
    }
}
