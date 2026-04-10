<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting database seeding...');
        $this->command->info('');

        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            WarehouseSeeder::class,
            SupplierSeeder::class,
            CustomerSeeder::class,
            SalesRepSeeder::class,
            ProductSeeder::class,
            SimpleTransactionSeeder::class,
            PaymentSeeder::class,
            ReturnSaleSeeder::class,
            ReturnPurchaseSeeder::class,
            DeliveryNoteSeeder::class,
            FinancialLedgerSeeder::class,
            StockMutationSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('Database seeding completed successfully!');
    }
}