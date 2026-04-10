<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add critical composite indexes for query optimization.
 * These indexes target high-traffic queries in Dashboard, Reports, and Info endpoints.
 */
return new class extends Migration
{
    public function up(): void
    {
        // High Priority: Customer and Supplier date range queries
        Schema::table('transactions', function (Blueprint $table) {
            // For filtering by customer + date (e.g., customer payment history)
            if (!Schema::hasIndex('transactions', 'idx_customer_date')) {
                $table->index(['customer_id', 'date'], 'idx_customer_date');
            }
            
            // For filtering by supplier + date (e.g., supplier payment history)
            if (!Schema::hasIndex('transactions', 'idx_supplier_date')) {
                $table->index(['supplier_id', 'date'], 'idx_supplier_date');
            }
            
            // For complex filtering (type + status + date)
            if (!Schema::hasIndex('transactions', 'idx_type_status_date')) {
                $table->index(['type', 'status', 'date'], 'idx_type_status_date');
            }
        });

        // Medium Priority: Transaction detail product lookups
        Schema::table('transaction_details', function (Blueprint $table) {
            if (!Schema::hasIndex('transaction_details', 'idx_product_date')) {
                $table->index(['product_id', 'created_at'], 'idx_product_date');
            }
        });

        // Medium Priority: Balance filtering for reports
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasIndex('customers', 'idx_balance_filter')) {
                $table->index('balance', 'idx_balance_filter');
            }
        });

        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasIndex('suppliers', 'idx_balance_filter')) {
                $table->index('balance', 'idx_balance_filter');
            }
        });

        // Medium Priority: Product category and stock queries
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasIndex('products', 'idx_category_stock')) {
                $table->index(['category_id', 'stock'], 'idx_category_stock');
            }
        });

        // Low Priority: Stock mutation date queries
        Schema::table('stock_mutations', function (Blueprint $table) {
            if (!Schema::hasIndex('stock_mutations', 'idx_created_type')) {
                $table->index(['created_at', 'type'], 'idx_created_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_customer_date');
            $table->dropIndexIfExists('idx_supplier_date');
            $table->dropIndexIfExists('idx_type_status_date');
        });

        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_product_date');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_balance_filter');
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_balance_filter');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_category_stock');
        });

        Schema::table('stock_mutations', function (Blueprint $table) {
            $table->dropIndexIfExists('idx_created_type');
        });
    }
};
