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
        Schema::table('customers', function (Blueprint $table) {
            // Only add fields that don't already exist
            // Already exist: customer_id, phone_2, city, npwp, contact_person, bank_name, bank_account, account_holder, warehouse_id, credit_limit
            
            // Add missing fields only
            if (!Schema::hasColumn('customers', 'discount_percentage')) {
                $table->decimal('discount_percentage', 5, 2)->nullable()->default(0)->after('credit_limit');
            }
            
            if (!Schema::hasColumn('customers', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->nullable()->default(0)->after('discount_percentage');
            }
            
            if (!Schema::hasColumn('customers', 'operational_hours')) {
                $table->text('operational_hours')->nullable()->after('discount_amount');
            }
            
            if (!Schema::hasColumn('customers', 'notes')) {
                $table->longText('notes')->nullable()->after('operational_hours');
            }
            
            if (!Schema::hasColumn('customers', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('updated_at');
            }

            // Add indexes if they don't exist
            if (!Schema::hasColumn('customers', 'balance')) {
                // balance already exists, this is just a check
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumnIfExists('discount_percentage');
            $table->dropColumnIfExists('discount_amount');
            $table->dropColumnIfExists('operational_hours');
            $table->dropColumnIfExists('notes');
            $table->dropColumnIfExists('is_verified');
        });
    }
};
