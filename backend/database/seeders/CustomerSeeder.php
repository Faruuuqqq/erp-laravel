<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            // Existing 18 customers
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
            // Additional 32+ customers for realistic volume
            [
                'name' => 'Toko Elektronik Maju',
                'phone' => '08671234567',
                'email' => 'elektonirmaju@gmail.com',
                'address' => 'Jl. Sudirman No. 78, Jakarta',
                'balance' => 1200000,
            ],
            [
                'name' => 'CV. Dagang Jaya',
                'phone' => '08781234567',
                'email' => 'dagangjaya@yahoo.com',
                'address' => 'Jl. Hayam Wuruk No. 123, Surabaya',
                'balance' => -500000,
            ],
            [
                'name' => 'Toko Pakaian Indah',
                'phone' => '08891234567',
                'email' => 'pakaianindah@gmail.com',
                'address' => 'Jl. Imam Bonjol No. 56, Bandung',
                'balance' => 750000,
            ],
            [
                'name' => 'UD. Barokah Jaya',
                'phone' => '08191234567',
                'email' => 'barokahjaya@gmail.com',
                'address' => 'Jl. Monginsidi No. 89, Medan',
                'balance' => -320000,
            ],
            [
                'name' => 'Warung Makan Sentosa',
                'phone' => '08291234567',
                'email' => 'warungsentosa@gmail.com',
                'address' => 'Jl. Sultan Agung No. 145, Semarang',
                'balance' => 180000,
            ],
            [
                'name' => 'Pasar Induk Makmur',
                'phone' => '08391234567',
                'email' => 'pasarinduk@yahoo.com',
                'address' => 'Jl. Gatot Subroto No. 234, Bandung',
                'balance' => -1100000,
            ],
            [
                'name' => 'CV. Utama Jaya',
                'phone' => '08491234567',
                'email' => 'utamajaya@gmail.com',
                'address' => 'Jl. Diponegoro No. 567, Semarang',
                'balance' => 1800000,
            ],
            [
                'name' => 'Toko Furniture Maju',
                'phone' => '08591234567',
                'email' => 'furnitumaju@gmail.com',
                'address' => 'Jl. Ahmad Yani No. 678, Surabaya',
                'balance' => -780000,
            ],
            [
                'name' => 'UD. Panen Raya',
                'phone' => '08691234567',
                'email' => 'panenraya@yahoo.com',
                'address' => 'Jl. Merdeka No. 456, Yogyakarta',
                'balance' => 950000,
            ],
            [
                'name' => 'Minimarket Sejahtera',
                'phone' => '08711234567',
                'email' => 'minimarksejahtera@gmail.com',
                'address' => 'Jl. Pemuda No. 789, Jakarta',
                'balance' => -420000,
            ],
            [
                'name' => 'CV. Suplai Abadi',
                'phone' => '08811234567',
                'email' => 'suplaijaya@gmail.com',
                'address' => 'Jl. Basuki Rahmat No. 345, Surabaya',
                'balance' => 2200000,
            ],
            [
                'name' => 'Warung Kopi Bersama',
                'phone' => '08911234567',
                'email' => 'warungkopi@gmail.com',
                'address' => 'Jl. Ahmad Yani No. 567, Semarang',
                'balance' => -250000,
            ],
            [
                'name' => 'Toko Buku Nusantara',
                'phone' => '08111234567',
                'email' => 'bukunusantara@yahoo.com',
                'address' => 'Jl. Asia Afrika No. 234, Jakarta',
                'balance' => 680000,
            ],
            [
                'name' => 'UD. Kembar Jaya',
                'phone' => '08121234567',
                'email' => 'kembrojaya@gmail.com',
                'address' => 'Jl. Sudirman No. 123, Bandung',
                'balance' => -890000,
            ],
            [
                'name' => 'Pasar Rakyat Sejati',
                'phone' => '08221234567',
                'email' => 'pasarrakyat@gmail.com',
                'address' => 'Jl. Hayam Wuruk No. 456, Surabaya',
                'balance' => 1100000,
            ],
            [
                'name' => 'Toko Kaca Maju',
                'phone' => '08321234567',
                'email' => 'kacamaju@yahoo.com',
                'address' => 'Jl. Imam Bonjol No. 678, Bandung',
                'balance' => -650000,
            ],
            [
                'name' => 'CV. Berkah Sejati',
                'phone' => '08421234567',
                'email' => 'berkahjati@gmail.com',
                'address' => 'Jl. Monginsidi No. 234, Medan',
                'balance' => 920000,
            ],
            [
                'name' => 'Warung Es Segar',
                'phone' => '08521234567',
                'email' => 'warungessegar@gmail.com',
                'address' => 'Jl. Sultan Agung No. 234, Semarang',
                'balance' => -180000,
            ],
            [
                'name' => 'Toko Peralatan Rumah',
                'phone' => '08621234567',
                'email' => 'peralatanrumah@yahoo.com',
                'address' => 'Jl. Gatot Subroto No. 567, Bandung',
                'balance' => 780000,
            ],
            [
                'name' => 'UD. Mitra Sukses',
                'phone' => '08721234567',
                'email' => 'mitrasukses@gmail.com',
                'address' => 'Jl. Diponegoro No. 789, Semarang',
                'balance' => -1350000,
            ],
            [
                'name' => 'CV. Pabrik Maju',
                'phone' => '08821234567',
                'email' => 'pabrikmaju@gmail.com',
                'address' => 'Jl. Ahmad Yani No. 789, Surabaya',
                'balance' => 2100000,
            ],
            [
                'name' => 'Toko Sepatu Modern',
                'phone' => '08921234567',
                'email' => 'sepatumodern@yahoo.com',
                'address' => 'Jl. Merdeka No. 678, Yogyakarta',
                'balance' => -540000,
            ],
            [
                'name' => 'Warung Nasi Lezat',
                'phone' => '08122345678',
                'email' => 'warungnasi@gmail.com',
                'address' => 'Jl. Pemuda No. 890, Jakarta',
                'balance' => 420000,
            ],
            [
                'name' => 'CV. Produk Halal',
                'phone' => '08222345678',
                'email' => 'produkhalal@yahoo.com',
                'address' => 'Jl. Basuki Rahmat No. 567, Surabaya',
                'balance' => -760000,
            ],
            [
                'name' => 'Toko Mainan Anak',
                'phone' => '08322345678',
                'email' => 'mainananak@gmail.com',
                'address' => 'Jl. Ahmad Yani No. 890, Semarang',
                'balance' => 1050000,
            ],
            [
                'name' => 'UD. Berkah Abadi',
                'phone' => '08422345678',
                'email' => 'berkahabadi2@gmail.com',
                'address' => 'Jl. Asia Afrika No. 456, Jakarta',
                'balance' => -320000,
            ],
            [
                'name' => 'Pasar Buah Segar',
                'phone' => '08522345678',
                'email' => 'pasarbuah@yahoo.com',
                'address' => 'Jl. Sudirman No. 234, Bandung',
                'balance' => 890000,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(['name' => $customer['name']], $customer);
        }

        $this->command->info('✅ Customers seeded: ' . count($customers) . ' customer.');
    }
}
