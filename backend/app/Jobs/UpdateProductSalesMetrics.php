<?php

namespace App\Jobs;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;

class UpdateProductSalesMetrics implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 300;

    public function handle()
    {
        $salesData = DB::table('transaction_details')
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->whereBetween('transactions.date', [now()->subDays(30)->toDateString(), now()->toDateString()])
            ->whereIn('transactions.type', ['penjualan_tunai', 'penjualan_kredit'])
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
            ->groupBy('product_id')
            ->get();

        $daysInPeriod = 30;

        foreach ($salesData as $data) {
            $avgDailySales = $data->total_quantity / $daysInPeriod;

            Product::where('id', $data->product_id)
                ->update([
                    'total_sales' => $data->total_quantity,
                    'avg_daily_sales' => round($avgDailySales, 2),
                ]);
        }
    }
}
