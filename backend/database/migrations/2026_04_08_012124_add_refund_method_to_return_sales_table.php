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
        Schema::table('return_sales', function (Blueprint $table) {
            $table->enum('refund_method', ['tunai', 'potong_piutang', 'tukar_barang', 'kredit_nota'])
                  ->nullable()
                  ->after('reason');
        });

        // Also update reason enum to include 'lainnya'
        // Note: For SQLite/MySQL enum changes, we'd need raw SQL or recreate the column
        // For now, we'll just add the refund_method column
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('return_sales', function (Blueprint $table) {
            $table->dropColumn('refund_method');
        });
    }
};
