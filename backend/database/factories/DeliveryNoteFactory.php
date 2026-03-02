<?php

namespace Database\Factories;

use App\Models\DeliveryNote;
use App\Models\Transaction;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryNoteFactory extends Factory
{
    protected $model = DeliveryNote::class;

    public function definition(): array
    {
        $creditSale = Transaction::where('type', 'penjualan_kredit')
            ->inRandomOrder()->first();

        $date = $creditSale ? $creditSale->date : now()->toDateString();
        $deliveryNumber = 'SJ-' . now()->format('Ymd') . '-' .
            str_pad($this->faker->unique()->numberBetween(1, 99), 2, '0');

        return [
            'delivery_number' => $deliveryNumber,
            'transaction_id' => $creditSale ? $creditSale->id : Transaction::factory()->create()->id,
            'customer_id' => Customer::inRandomOrder()->first()?->id,
            'driver_name' => $this->faker->randomElement([
                'Budi Santoso',
                'Agus Setiawan',
                'Dedi Kurniawan',
                'Joko Susilo',
                'Rudi Hartono',
                'Wawan Kurniawan',
            ]),
            'vehicle_plate' => $this->faker->randomElement([
                'B 1234 ABC',
                'B 5678 XYZ',
                'B 9012 DEF',
                'B 3456 GHI',
            ]),
            'address' => $this->faker->randomElement([
                'Jl. Sudirman No. 123, Jakarta',
                'Jl. Gatot Subroto Kav. 5, Bandung',
                'Jl. Basuki Rahmat No. 45, Surabaya',
            ]),
            'notes' => $this->faker->randomElement([
                'Kirim harian',
                'Kirim segera',
                'Antar ke gudang pelanggan',
                null,
            ]),
            'status' => $this->faker->randomElement(['completed', 'completed', 'completed', 'cancelled']),
            'created_by' => User::inRandomOrder()->first()?->id,
        ];
    }
}
