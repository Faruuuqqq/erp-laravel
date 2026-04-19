<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            // Existing 13 suppliers
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
            // Additional suppliers for production volume
            [
                'name' => 'PT. Kimia Semarang',
                'phone' => '08229876543',
                'email' => 'sales@kimiasemarang.com',
                'address' => 'Jl. Pemuda No. 345, Semarang',
                'balance' => -1500000,
            ],
            [
                'name' => 'CV. Elektronik Maju',
                'phone' => '08329876543',
                'email' => 'order@elektronikmaju.id',
                'address' => 'Jl. Ahmad Yani No. 234, Surabaya',
                'balance' => 2100000,
            ],
            [
                'name' => 'PT. Tekstil Sentosa',
                'phone' => '08429876543',
                'email' => 'supply@tekstilsentosa.com',
                'address' => 'Jl. Merdeka No. 456, Yogyakarta',
                'balance' => -980000,
            ],
            [
                'name' => 'UD. Peralatan Dapur',
                'phone' => '08529876543',
                'email' => 'info@peralatandapur.id',
                'address' => 'Jl. Sudirman No. 234, Jakarta',
                'balance' => 1200000,
            ],
            [
                'name' => 'CV. Furniture Impor',
                'phone' => '08629876543',
                'email' => 'sales@furnitureimpor.com',
                'address' => 'Jl. Gatot Subroto No. 456, Jakarta',
                'balance' => -2200000,
            ],
            [
                'name' => 'PT. Kosmetik Beauty',
                'phone' => '08729876543',
                'email' => 'order@kosmetikbeauty.co.id',
                'address' => 'Jl. Asia Afrika No. 345, Jakarta',
                'balance' => 1800000,
            ],
            [
                'name' => 'UD. Obat & Vitamin',
                'phone' => '08829876543',
                'email' => 'supply@obatsehat.id',
                'address' => 'Jl. Diponegoro No. 456, Bandung',
                'balance' => -3400000,
            ],
            [
                'name' => 'CV. Minuman Segar',
                'phone' => '08929876543',
                'email' => 'sales@minumansegar.com',
                'address' => 'Jl. Basuki Rahmat No. 567, Surabaya',
                'balance' => 750000,
            ],
            [
                'name' => 'PT. Bahan Bangunan Jaya',
                'phone' => '08112345678',
                'email' => 'info@babunbangunan.com',
                'address' => 'Jl. Ahmad Yani No. 567, Semarang',
                'balance' => -2800000,
            ],
            [
                'name' => 'UD. Alat Pancing Murni',
                'phone' => '08212345678',
                'email' => 'order@alatpancing.id',
                'address' => 'Jl. Pemuda No. 678, Jakarta',
                'balance' => 600000,
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(['name' => $supplier['name']], $supplier);
        }

        $this->command->info('✅ Suppliers seeded: ' . count($suppliers) . ' supplier.');
    }
}
