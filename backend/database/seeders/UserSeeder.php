<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Owner – akses penuh (termasuk laporan keuangan)
        User::firstOrCreate(
            ['email' => 'owner@tokosync.local'],
            [
                'name'      => 'Pemilik Toko',
                'password'  => Hash::make('password123'),
                'role'      => 'owner',
                'is_active' => true,
            ]
        );

        // Admin/Kasir – akses operasional harian
        User::firstOrCreate(
            ['email' => 'admin@tokosync.local'],
            [
                'name'      => 'Admin Kasir',
                'password'  => Hash::make('password123'),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        $this->command->info('Users seeded: owner@tokosync.local & admin@tokosync.local (password: password123)');
    }
}
