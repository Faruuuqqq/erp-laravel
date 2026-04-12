<?php

namespace Database\Seeders;

use App\Models\DeliveryNote;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DeliveryNoteSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) return;

        if (DeliveryNote::count() > 0) {
            $this->command->info('Surat jalan sudah ada, melewati DeliveryNoteSeeder.');
            return;
        }

        // Buat surat jalan untuk beberapa transaksi penjualan
        $penjualanTrx = Transaction::whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
            ->where('status', 'completed')
            ->take(12)
            ->get();

        $drivers = [
            ['name' => 'Budi Santoso', 'plate' => 'B 1234 KJ'],
            ['name' => 'Ahmad Fauzi',  'plate' => 'B 5678 MN'],
            ['name' => 'Dede Gunawan', 'plate' => 'D 9012 PQ'],
            ['name' => 'Rudi Hartono', 'plate' => 'B 3456 RS'],
        ];

        $counter  = 1;
        $statuses = ['delivered', 'delivered', 'delivered', 'pending', 'cancelled'];

        foreach ($penjualanTrx as $trx) {
            $date   = now()->subDays(rand(0, 14))->format('Y-m-d');
            $driver = $drivers[array_rand($drivers)];
            $status = $statuses[array_rand($statuses)];

            DeliveryNote::create([
                'delivery_number' => 'SJ-' . str_replace('-', '', $date) . '-' . str_pad($counter++, 3, '0', STR_PAD_LEFT),
                'date'            => $date,
                'transaction_id'  => $trx->id,
                'customer_id'     => $trx->customer_id,
                'driver'          => $driver['name'],
                'vehicle_plate'   => $driver['plate'],
                'notes'           => 'Dikirim oleh ' . $driver['name'],
                'status'          => $status,
                'created_by'      => $users->random()->id,
            ]);
        }

        $this->command->info('DeliveryNote seeder selesai: ' . DeliveryNote::count() . ' surat jalan dibuat.');
    }
}
