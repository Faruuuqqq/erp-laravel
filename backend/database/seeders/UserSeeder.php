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
            ['email' => 'owner@tokosync.id'],
            [
                'name'      => 'Pemilik Toko',
                'password'  => Hash::make('password'),
                'role'      => 'owner',
                'is_active' => true,
            ]
        );
        // Admin/Kasir – akses operasional harian
        User::firstOrCreate(
            ['email' => 'admin@tokosync.id'],
            [
                'name'      => 'Admin Kasir',
                'password'  => Hash::make('password'),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );

        $this->command->info('Users seeded: owner@tokosync.id & admin@tokosync.id (password: password)');
    }
}
