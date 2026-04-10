<?php

namespace Database\Seeders;

use App\Models\DeliveryNote;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class DeliveryNoteSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $customers = Customer::all();
        $creditSales = Transaction::where('type', 'penjualan_kredit')->get();

        if ($creditSales->isEmpty()) {
            $this->command->warn('No credit sales found. Skipping delivery note seeder.');
            return;
        }

        $deliveryCount = rand(4, 6);
        $created = 0;
        $dateRange = $this->getDateRange();

        for ($i = 0; $i < $deliveryCount; $i++) {
            $creditSale = $creditSales->random();
            $deliveryNumber = 'SJ-' . date('Ymd') . '-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT);

            $deliveryNote = DeliveryNote::firstOrCreate(
                ['delivery_number' => $deliveryNumber],
                [
                    'date' => $dateRange[array_rand($dateRange)],
                    'transaction_id' => $creditSale ? $creditSale->id : null,
                    'customer_id' => $creditSale ? $creditSale->customer_id : $customers->random()->id,
                    'driver' => $this->getDriverName(),
                    'vehicle_plate' => $this->getVehiclePlate(),
                    'notes' => $this->getNotes(),
                    'status' => $this->getStatus(),
                    'created_by' => $users->random()->id,
                ]
            );

            if ($deliveryNote->wasRecentlyCreated) {
                $created++;
            }
        }

        $this->command->info("Delivery notes seeded: {$created} surat jalan.");
    }

    private function getDateRange(): array
    {
        $dates = [];
        $startDate = strtotime('2025-02-20');
        $endDate = strtotime('2025-02-28');

        for ($ts = $startDate; $ts <= $endDate; $ts += 86400) {
            $dates[] = date('Y-m-d', $ts);
        }

        return $dates;
    }

    private function getDriverName(): string
    {
        $names = [
            'Budi Santoso',
            'Agus Setiawan',
            'Dedi Kurniawan',
            'Joko Susilo',
            'Rudi Hartono',
            'Wawan Kurniawan',
            'Heri Wijaya',
            'Kurniawan',
        ];
        return $names[array_rand($names)];
    }

    private function getVehiclePlate(): string
    {
        $plates = [
            'B 1234 ABC',
            'B 5678 XYZ',
            'B 9012 DEF',
            'B 3456 GHI',
            'B 7890 JKL',
            'D 2345 MNO',
            'F 6789 PQR',
        ];
        return $plates[array_rand($plates)];
    }

    private function getNotes(): ?string
    {
        $notes = [
            'Kirim harian',
            'Kirim segera',
            'Antar ke gudang pelanggan',
            'Hubungi penerima sebelum kirim',
            'Prioritas tinggi',
            null,
        ];
        return $notes[array_rand($notes)];
    }

    private function getStatus(): string
    {
        $statuses = ['delivered', 'delivered', 'delivered', 'pending', 'cancelled'];
        return $statuses[array_rand($statuses)];
    }
}