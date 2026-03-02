<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('total_sales', 8, 2)->default(0)->after('stock');
            $table->decimal('avg_daily_sales', 10, 2)->default(0)->after('total_sales');
            $table->integer('days_of_stock')->nullable()->after('avg_daily_sales');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('days_of_stock');
            $table->dropColumn('avg_daily_sales');
            $table->dropColumn('total_sales');
        });
    }
};
