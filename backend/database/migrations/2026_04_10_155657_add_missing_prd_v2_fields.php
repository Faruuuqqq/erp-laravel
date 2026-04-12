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
        Schema::table('transactions', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->after('status');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('price_list', 50)->nullable()->after('credit_limit');
            $table->string('daerah', 50)->nullable()->after('price_list');
            $table->string('npwp', 20)->nullable()->after('daerah');
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('no_rekening', 50)->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('is_hidden');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['price_list', 'daerah', 'npwp']);
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn('no_rekening');
        });
    }
};
