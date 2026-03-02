<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('schedule:run', function () {
    $this->call('schedule:work');
})->purpose('Run the scheduler');

use Illuminate\Support\Facades\Schedule;

Schedule::command('app:update-product-metrics')->dailyAt('01:00');
