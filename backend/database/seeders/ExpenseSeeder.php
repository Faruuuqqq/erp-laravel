<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::pluck('id')->toArray();
        
        $categories = [
            'Operasional',
            'Gaji',
            'Listrik',
            'Asuransi',
            'Maintenance',
            'Marketing',
            'Transport',
            'Sewa',
            'Komunikasi',
            'Kantor',
        ];

        $descriptions = [
            'Operasional' => [
                'Biaya operasional harian toko',
                'Biaya supply & perlengkapan operasional',
                'Biaya utilitas harian',
                'Biaya kebersihan dan pengemasan',
                'Biaya pengeluaran misc operasional',
            ],
            'Gaji' => [
                'Gaji karyawan bulan ini',
                'Bonus performa karyawan',
                'Tunjangan kesehatan karyawan',
                'Lembur karyawan',
            ],
            'Listrik' => [
                'Biaya rekening listrik bulan ini',
                'Biaya pemeliharaan sistem listrik',
            ],
            'Asuransi' => [
                'Premi asuransi bisnis bulanan',
                'Asuransi kesehatan karyawan',
                'Asuransi properti toko',
            ],
            'Maintenance' => [
                'Perbaikan AC dan pendingin',
                'Service kasir register',
                'Perbaikan komputer POS',
                'Perbaikan rak dan etalase',
                'Pembersihan tangki air',
            ],
            'Marketing' => [
                'Biaya iklan online',
                'Pembuatan spanduk promo',
                'Biaya diskon promosi bulanan',
                'Social media ads',
            ],
            'Transport' => [
                'BBM untuk pengiriman',
                'Biaya logistics & kurir',
                'Biaya transport pembelian stok',
                'Service kendaraan operasional',
            ],
            'Sewa' => [
                'Biaya sewa toko/lokasi',
                'Biaya sewa gudang',
            ],
            'Komunikasi' => [
                'Biaya internet bulanan',
                'Kuota telepon/data karyawan',
            ],
            'Kantor' => [
                'Alat tulis kantor',
                'Tinta printer dan kertas',
                'Perlengkapan rapat',
            ],
        ];

        $expenses = [];
        
        // Generate 80 expenses over the last 90 days
        for ($i = 0; $i < 80; $i++) {
            $category = $categories[array_rand($categories)];
            $dateOffset = rand(0, 89); // 0-89 days ago
            $date = now()->subDays($dateOffset)->format('Y-m-d');
            
            // Get random description for this category
            $categoryDescriptions = $descriptions[$category] ?? ['Pengeluaran ' . $category];
            $description = $categoryDescriptions[array_rand($categoryDescriptions)];
            
            // Generate realistic amount based on category
            $baseAmounts = [
                'Operasional' => [100000, 500000],
                'Gaji' => [2000000, 5000000],
                'Listrik' => [500000, 1500000],
                'Asuransi' => [1000000, 3000000],
                'Maintenance' => [150000, 800000],
                'Marketing' => [200000, 1000000],
                'Transport' => [100000, 600000],
                'Sewa' => [3000000, 5000000],
                'Komunikasi' => [200000, 500000],
                'Kantor' => [50000, 300000],
            ];
            
            $range = $baseAmounts[$category] ?? [100000, 1000000];
            $amount = rand($range[0], $range[1]);
            
            $expenses[] = [
                'category' => $category,
                'date' => $date,
                'description' => $description,
                'amount' => $amount,
                'created_by' => $users[array_rand($users)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert all expenses
        foreach ($expenses as $expense) {
            // Generate unique code
            $lastExpense = Expense::orderBy('id', 'desc')->first();
            $nextId = $lastExpense ? $lastExpense->id + 1 : 1;
            $code = 'BOP-' . date('Ymd', strtotime($expense['date'])) . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            
            Expense::create([
                'code' => $code,
                'category' => $expense['category'],
                'date' => $expense['date'],
                'description' => $expense['description'],
                'amount' => $expense['amount'],
                'created_by' => $expense['created_by'],
            ]);
        }

        $this->command->info('✅ Expenses seeded: 80 biaya operasional.');
    }
}
