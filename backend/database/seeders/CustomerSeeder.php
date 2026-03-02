<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Toko Makmur Jaya',
                'phone' => '08123456789',
                'email' => 'makmurbintar@gmail.com',
                'address' => 'Jl. Diponegoro No. 45, Jakarta',
                'balance' => 2500000,
            ],
            [
                'name' => 'CV. Berkah Abadi',
                'phone' => '08234567890',
                'email' => 'berkahabadi@yahoo.com',
                'address' => 'Jl. Gatot Subroto Kav. 12, Bandung',
                'balance' => 1500000,
            ],
            [
                'name' => 'Warung Bu Siti',
                'phone' => '0856789012',
                'email' => 'warungbutsiti@gmail.com',
                'address' => 'Jl. Ahmad Yani No. 89, Surabaya',
                'balance' => -850000,
            ],
            [
                'name' => 'Pasar Gede Indah',
                'phone' => '08789012345',
                'email' => 'info@pasargede.com',
                'address' => 'Jl. Pemuda No. 67, Semarang',
                'balance' => -1200000,
            ],
            [
                'name' => 'Toko Serba Ada',
                'phone' => '08901234567',
                'email' => 'serbaada@yahoo.com',
                'address' => 'Jl. Merdeka No. 145, Yogyakarta',
                'balance' => 0,
            ],
            [
                'name' => 'Minimarket Sentosa',
                'phone' => '08129876543',
                'email' => 'minimarket@gmail.com',
                'address' => 'Jl. Asia Afrika Kav. 23, Jakarta',
                'balance' => -450000,
            ],
            [
                'name' => 'UD. Maju Bersama',
                'phone' => '08219876543',
                'email' => 'majubersama@gmail.com',
                'address' => 'Jl. Diponegoro No. 234, Jakarta',
                'balance' => 750000,
            ],
            [
                'name' => 'CV. Harapan Baru',
                'phone' => '08561234567',
                'email' => 'harapanbaru@yahoo.com',
                'address' => 'Jl. Basuki Rahmat No. 67, Surabaya',
                'balance' => -2800000,
            ],
            [
                'name' => 'Pasar Tradisional Sejahtera',
                'phone' => '08761234567',
                'email' => 'pasartadi@gmail.com',
                'address' => 'Jl. Ahmad Yani No. 234, Semarang',
                'balance' => 500000,
            ],
            [
                'name' => 'Toko Berkah Raya',
                'phone' => '08919876543',
                'email' => 'berkahraya@yahoo.com',
                'address' => 'Jl. Pemuda No. 156, Jakarta',
                'balance' => -650000,
            ],
            [
                'name' => 'Indomaret Pusat',
                'phone' => '08134567890',
                'email' => 'indomaret@gmail.com',
                'address' => 'Jl. Merdeka No. 289, Yogyakarta',
                'balance' => 3200000,
            ],
            [
                'name' => 'Alfamart Cabang',
                'phone' => '08229876543',
                'email' => 'alfamart@gmail.com',
                'address' => 'Jl. Asia Afrika Kav. 45, Jakarta',
                'balance' => -1800000,
            ],
            [
                'name' => 'Warung Makan Jaya',
                'phone' => '08562345678',
                'email' => 'warungmakanjaya@gmail.com',
                'address' => 'Jl. Basuki Rahmat No. 89, Surabaya',
                'balance' => 120000,
            ],
            [
                'name' => 'Pasar Swalayan Makmur',
                'phone' => '08762345678',
                'email' => 'swalayanmakmur@yahoo.com',
                'address' => 'Jl. Ahmad Yani No. 345, Semarang',
                'balance' => -950000,
            ],
            [
                'name' => 'Toko Grosir Nusantara',
                'phone' => '08962345678',
                'email' => 'grosirnusantara@gmail.com',
                'address' => 'Jl. Merdeka No. 234, Yogyakarta',
                'balance' => 500000,
            ],
            [
                'name' => 'CV. Pangan Sejahtera',
                'phone' => '08172345678',
                'email' => 'pangansejahtera@yahoo.com',
                'address' => 'Jl. Pemuda No. 456, Jakarta',
                'balance' => -1250000,
            ],
            [
                'name' => 'Toko Makmur Sentosa',
                'phone' => '08272345678',
                'email' => 'makmursentosa@gmail.com',
                'address' => 'Jl. Basuki Rahmat No. 234, Surabaya',
                'balance' => 850000,
            ],
            [
                'name' => 'Warung Sederhana',
                'phone' => '08572345678',
                'email' => 'warungsederhana@gmail.com',
                'address' => 'Jl. Ahmad Yani No. 456, Semarang',
                'balance' => -350000,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(['name' => $customer['name']], $customer);
        }

        $this->command->info('Customers seeded: ' . count($customers) . ' customer.');
    }
}
