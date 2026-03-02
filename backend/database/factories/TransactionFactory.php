<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\SalesRep;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $transactionTypes = [
            'penjualan_tunai', 'penjualan_tunai', 'penjualan_tunai',
            'penjualan_tunai', 'penjualan_kredit', 'penjualan_kredit',
            'penjualan_kredit', 'penjualan_kredit',
            'pembelian', 'pembelian', 'pembelian',
            'retur_penjualan', 'retur_pembelian',
        ];

        $type = $this->faker->randomElement($transactionTypes);
        $today = now()->toDateString();
        $date = $this->faker->dateTimeBetween('-7 days', $today)->format('Y-m-d');

        $amount = $type === 'pembelian'
            ? $this->faker->numberBetween(300000, 3000000)
            : $this->faker->numberBetween(50000, 5000000);

        $paid = $this->faker->randomElement([
            $amount,
            $amount * $this->faker->randomFloat(0.5, 0.9, 2),
        ]);

        $invoicePrefix = match($type) {
            'pembelian' => 'PO',
            'retur_penjualan' => 'RET-J',
            'retur_pembelian' => 'RET-P',
            default => 'INV',
        };

        $invoiceNumber = $invoicePrefix . now()->format('Ymd') . '-' .
            str_pad($this->faker->unique()->numberBetween(1, 999), 3, '0');

        return [
            'invoice_number' => $invoiceNumber,
            'date' => $date,
            'type' => $type,
            'supplier_id' => $type === 'pembelian' || $type === 'retur_pembelian'
                ? Supplier::inRandomOrder()->first()?->id
                : null,
            'customer_id' => ($type === 'penjualan_tunai' || $type === 'penjualan_kredit')
                ? Customer::inRandomOrder()->first()?->id
                : null,
            'sales_rep_id' => ($type === 'penjualan_tunai' || $type === 'penjualan_kredit')
                ? SalesRep::inRandomOrder()->first()?->id
                : null,
            'subtotal' => $amount,
            'discount' => $this->faker->randomElement([0, $amount * 0.05, $amount * 0.1, $amount * 0.15]),
            'tax' => $this->faker->randomElement([0, $amount * 0.11]),
            'total' => $amount,
            'paid' => $paid,
            'remaining' => $amount - $paid,
            'status' => $this->faker->randomElement(['completed', 'completed', 'completed', 'cancelled']),
            'notes' => $this->faker->randomElement([
                'Transaksi harian normal',
                'Customer pelanggan tetap',
                'Pembelian stok mingguan',
                'Stok urgent',
                'Promo minggu ini',
                null,
            ]),
            'created_by' => User::inRandomOrder()->first()?->id,
        ];
    }
}
