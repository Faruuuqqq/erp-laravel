<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'PT. Distributor Jaya Abadi',
                'phone' => '08123456789',
                'email' => 'info@distributorjaya.co.id',
                'address' => 'Jl. Sudirman No. 123, Jakarta',
                'balance' => -2500000,
            ],
            [
                'name' => 'CV. Sumber Makmur Sejahtera',
                'phone' => '08234567890',
                'email' => 'sales@sumbermakmur.com',
                'address' => 'Jl. Gatot Subroto Kav. 5, Bandung',
                'balance' => 1500000,
            ],
            [
                'name' => 'UD. Berkah Barokah',
                'phone' => '0856789012',
                'email' => 'order@berkahbarokah.id',
                'address' => 'Jl. Ahmad Yani No. 45, Surabaya',
                'balance' => -1800000,
            ],
            [
                'name' => 'PT. Grosir Utama Nusantara',
                'phone' => '08789012345',
                'email' => 'supply@grosirnusantara.com',
                'address' => 'Jl. Pemuda No. 67, Semarang',
                'balance' => 0,
            ],
            [
                'name' => 'CV. Anugerah Sentosa',
                'phone' => '08901234567',
                'email' => 'purchasing@anugerahsentosa.co.id',
                'address' => 'Jl. Merdeka No. 89, Yogyakarta',
                'balance' => 3200000,
            ],
            [
                'name' => 'PT. Pangan Berkah',
                'phone' => '+62 811 2345 6789',
                'email' => 'info@panganberkah.com',
                'address' => 'Jl. Asia Afrika Kav. 10, Jakarta',
                'balance' => -4500000,
            ],
            [
                'name' => 'UD. Maju Jaya Mandiri',
                'phone' => '+62 812 3456 7890',
                'email' => 'sales@majujaya.com',
                'address' => 'Jl. Soekarno Hatta No. 25, Bekasi',
                'balance' => -1200000,
            ],
            [
                'name' => 'CV. Harapan Baru',
                'phone' => '08129876543',
                'email' => 'order@harapanbaru.id',
                'address' => 'Jl. Diponegoro No. 200, Jakarta',
                'balance' => 500000,
            ],
            [
                'name' => 'PT. Mitra Dagang Sejahtera',
                'phone' => '08219876543',
                'email' => 'supply@mitradagang.com',
                'address' => 'Jl. Gatot Subroto Kav. 15, Jakarta',
                'balance' => 2800000,
            ],
            [
                'name' => 'UD. Sejahtera Sentosa',
                'phone' => '08561234567',
                'email' => 'info@sejahterasentosa.id',
                'address' => 'Jl. Basuki Rahmat No. 78, Surabaya',
                'balance' => -900000,
            ],
            [
                'name' => 'PT. Berkah Abadi Jaya',
                'phone' => '08761234567',
                'email' => 'purchasing@berkahabadi.com',
                'address' => 'Jl. Ahmad Yani No. 156, Semarang',
                'balance' => 1500000,
            ],
            [
                'name' => 'CV. Makmur Sentosa',
                'phone' => '08919876543',
                'email' => 'sales@makmursentosa.co.id',
                'address' => 'Jl. Pemuda No. 234, Jakarta',
                'balance' => -3800000,
            ],
            [
                'name' => 'UD. Pangan Berkah',
                'phone' => '08134567890',
                'email' => 'info@panganberkah.id',
                'address' => 'Jl. Merdeka No. 145, Yogyakarta',
                'balance' => 950000,
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(['name' => $supplier['name']], $supplier);
        }

        $this->command->info('Suppliers seeded: ' . count($suppliers) . ' supplier.');
    }
}
