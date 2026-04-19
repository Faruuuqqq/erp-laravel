<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Memulai seeding database ERP TokoSync...');
        $this->command->newLine();

        $this->call([
            // 1. Master data — urut sesuai dependensi FK
            UserSeeder::class,
            SettingSeeder::class,
            CategorySeeder::class,
            WarehouseSeeder::class,
            SupplierSeeder::class,
            CustomerSeeder::class,
            SalesRepSeeder::class,
            ProductSeeder::class,

            // 2. Transaksi (80 penjualan + 30 pembelian + 8 pembayaran piutang)
            SimpleTransactionSeeder::class,

            // 3. Retur penjualan & pembelian (butuh transaksi ada dulu)
            ReturnSeeder::class,

            // 4. Surat jalan (butuh transaksi ada dulu)
            DeliveryNoteSeeder::class,

            // 5. Ledger keuangan (butuh transaksi ada dulu)
            FinancialLedgerSeeder::class,

            // 6. Biaya operasional
            ExpenseSeeder::class,
        ]);

        $this->command->newLine();
        $this->command->info('✅ Database seeding selesai!');
        $this->command->newLine();
        $this->command->table(
            ['Akun', 'Email', 'Password', 'Role'],
            [
                ['Pemilik Toko', 'owner@tokosync.local', 'password123', 'owner'],
                ['Admin Kasir',  'admin@tokosync.local', 'password123', 'admin'],
            ]
        );
    }
}
