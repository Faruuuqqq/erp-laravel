<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambahkan index pada kolom-kolom yang sering di-query
 * untuk performa produksi pada volume data tinggi.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('date');
            $table->index('type');
            $table->index('status');
            $table->index('created_by');
        });

        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->index(['product_id', 'created_at']);
        });

        Schema::table('financial_ledgers', function (Blueprint $table) {
            $table->index(['type', 'entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['date']);
            $table->dropIndex(['type']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_by']);
        });

        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->dropIndex(['product_id', 'created_at']);
        });

        Schema::table('financial_ledgers', function (Blueprint $table) {
            $table->dropIndex(['type', 'entity_type', 'entity_id']);
        });
    }
};
