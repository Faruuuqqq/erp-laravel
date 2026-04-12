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
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('city', 50)->nullable()->after('address');
            $table->string('phone2', 20)->nullable()->after('phone');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('city', 50)->nullable()->after('address');
            $table->string('phone2', 20)->nullable()->after('phone');
            $table->string('discount', 50)->nullable()->after('price_list');
            $table->string('warehouse', 50)->nullable()->after('discount');
            $table->string('keterangan', 255)->nullable()->after('warehouse');
        });

        Schema::table('sales_reps', function (Blueprint $table) {
            $table->string('area', 100)->nullable()->after('address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['city', 'phone2']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['city', 'phone2', 'discount', 'warehouse', 'keterangan']);
        });

        Schema::table('sales_reps', function (Blueprint $table) {
            $table->dropColumn('area');
        });
    }
};
