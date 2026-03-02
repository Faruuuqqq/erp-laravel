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

        $deliveryCount = $this->faker->numberBetween(4, 6);

        for ($i = 0; $i < $deliveryCount; $i++) {
            $creditSale = $creditSales->random();
            $deliveryNumber = 'SJ-' . now()->format('Ymd') . '-' . str_pad($i + 1, 2, '0');

            DeliveryNote::create([
                'delivery_number' => $deliveryNumber,
                'transaction_id' => $creditSale ? $creditSale->id : null,
                'customer_id' => $customers->random()->id,
                'driver_name' => $this->getDriverName(),
                'vehicle_plate' => $this->getVehiclePlate(),
                'address' => $this->getAddress(),
                'notes' => $this->getNotes(),
                'status' => $this->getStatus(),
                'created_by' => $users->random()->id,
            ]);
        }
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
        ];
        return $plates[array_rand($plates)];
    }

    private function getAddress(): string
    {
        $addresses = [
            'Jl. Sudirman No. 123, Jakarta',
            'Jl. Gatot Subroto Kav. 5, Bandung',
            'Jl. Basuki Rahmat No. 45, Surabaya',
        ];
        return $addresses[array_rand($addresses)];
    }

    private function getNotes(): ?string
    {
        $notes = [
            'Kirim harian',
            'Kirim segera',
            'Antar ke gudang pelanggan',
            null,
        ];
        $randomIndex = array_rand($notes);
        return $notes[$randomIndex];
    }

    private function getStatus(): string
    {
        $statuses = ['completed', 'completed', 'completed', 'cancelled'];
        return $statuses[array_rand($statuses)];
    }

        $this->command->info('Delivery notes seeded: ' . $deliveryCount . ' surat jalan.');
    }
}
