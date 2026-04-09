<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->index(['name', 'phone', 'email'], 'customers_name_phone_email_idx');
        });

        Schema::table('transaction_details', function (Blueprint $table) {
            $table->index(['transaction_id', 'product_id'], 'td_transaction_product_idx');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index(['stock', 'min_stock'], 'products_stock_min_idx');
        });

        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->index(['product_id', 'type', 'created_at'], 'sm_product_type_date_idx');
        });

        Schema::table('delivery_notes', function (Blueprint $table) {
            if (!Schema::hasIndex('delivery_notes', 'delivery_notes_transaction_date_idx')) {
                $table->index(['transaction_id', 'date'], 'delivery_notes_transaction_date_idx');
            }
            if (!Schema::hasIndex('delivery_notes', 'delivery_notes_date_idx')) {
                $table->index('date', 'delivery_notes_date_idx');
            }
        });

        Schema::table('return_sales', function (Blueprint $table) {
            if (!Schema::hasIndex('return_sales', 'return_sales_transaction_date_idx')) {
                $table->index(['transaction_id', 'date'], 'return_sales_transaction_date_idx');
            }
            if (!Schema::hasIndex('return_sales', 'return_sales_date_idx')) {
                $table->index('date', 'return_sales_date_idx');
            }
        });

        Schema::table('return_purchases', function (Blueprint $table) {
            if (!Schema::hasIndex('return_purchases', 'return_purchases_transaction_date_idx')) {
                $table->index(['transaction_id', 'date'], 'return_purchases_transaction_date_idx');
            }
            if (!Schema::hasIndex('return_purchases', 'return_purchases_date_idx')) {
                $table->index('date', 'return_purchases_date_idx');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('customers_name_phone_email_idx');
        });

        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropIndex('td_transaction_product_idx');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_stock_min_idx');
        });

        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->dropIndex('sm_product_type_date_idx');
        });

        Schema::table('delivery_notes', function (Blueprint $table) {
            $table->dropIndex('delivery_notes_transaction_date_idx');
            $table->dropIndex('delivery_notes_date_idx');
        });

        Schema::table('return_sales', function (Blueprint $table) {
            $table->dropIndex('return_sales_transaction_date_idx');
            $table->dropIndex('return_sales_date_idx');
        });

        Schema::table('return_purchases', function (Blueprint $table) {
            $table->dropIndex('return_purchases_transaction_date_idx');
            $table->dropIndex('return_purchases_date_idx');
        });
    }
};