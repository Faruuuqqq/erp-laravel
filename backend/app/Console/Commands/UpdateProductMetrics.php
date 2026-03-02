<?php

namespace App\Console\Commands;

use App\Jobs\UpdateProductSalesMetrics;
use Illuminate\Console\Command;

class UpdateProductMetrics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-product-metrics';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update product sales metrics for dashboard';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating product sales metrics...');

        UpdateProductSalesMetrics::dispatch();

        $this->info('Product sales metrics update job dispatched.');
    }
}
