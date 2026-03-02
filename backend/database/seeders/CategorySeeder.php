<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Makanan',
            'Minuman',
            'Sembako',
            'Elektronik',
            'Peralatan',
            'Kebersihan',
            'Kesehatan',
            'Lain-lain',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name]);
        }

        $this->command->info('Categories seeded: ' . count($categories) . ' kategori.');
    }
}
