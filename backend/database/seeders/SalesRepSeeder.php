<?php

namespace Database\Seeders;

use App\Models\SalesRep;
use Illuminate\Database\Seeder;

class SalesRepSeeder extends Seeder
{
    public function run(): void
    {
        $salesReps = [
            [
                'name' => 'Budi Santoso',
                'phone' => '08123456789',
                'email' => 'budi.santoso@tokosync.com',
                'address' => 'Jl. Merdeka No. 123, Jakarta',
                'total_sales' => 15000000,
                'status' => 'active',
            ],
            [
                'name' => 'Siti Aminah',
                'phone' => '08234567890',
                'email' => 'siti.aminah@tokosync.com',
                'address' => 'Jl. Gatot Subroto Kav. 5, Bandung',
                'total_sales' => 25000000,
                'status' => 'active',
            ],
            [
                'name' => 'Ahmad Fauzi',
                'phone' => '0856789012',
                'email' => 'ahmad.fauzi@tokosync.com',
                'address' => 'Jl. Ahmad Yani No. 45, Surabaya',
                'total_sales' => 18500000,
                'status' => 'active',
            ],
            [
                'name' => 'Rina Wati',
                'phone' => '08789012345',
                'email' => 'rina.wati@tokosync.com',
                'address' => 'Jl. Pemuda No. 67, Semarang',
                'total_sales' => 22000000,
                'status' => 'active',
            ],
            [
                'name' => 'Dedi Kurniawan',
                'phone' => '08901234567',
                'email' => 'dedi.kurniawan@tokosync.com',
                'address' => 'Jl. Merdeka No. 89, Yogyakarta',
                'total_sales' => 12000000,
                'status' => 'active',
            ],
            [
                'name' => 'Lestari Sari',
                'phone' => '08129876543',
                'email' => 'lestari.sari@tokosync.com',
                'address' => 'Jl. Diponegoro No. 200, Jakarta',
                'total_sales' => 30000000,
                'status' => 'active',
            ],
            [
                'name' => 'Joko Susilo',
                'phone' => '08219876543',
                'email' => 'joko.susilo@tokosync.com',
                'address' => 'Jl. Gatot Subroto Kav. 15, Jakarta',
                'total_sales' => 18000000,
                'status' => 'active',
            ],
        ];

        foreach ($salesReps as $salesRep) {
            SalesRep::firstOrCreate(['name' => $salesRep['name']], $salesRep);
        }

        $this->command->info('Sales reps seeded: ' . count($salesReps) . ' sales rep.');
    }
}
