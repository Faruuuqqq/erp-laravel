<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete duplicate global settings (where user_id is NULL)
        // Keep only one entry per key for global settings
        DB::statement('
            DELETE FROM settings WHERE user_id IS NULL AND id NOT IN (
                SELECT MIN(id) FROM (
                    SELECT MIN(id) FROM settings 
                    WHERE user_id IS NULL 
                    GROUP BY `key`
                ) AS tmp
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback needed - this is a data cleanup migration
    }
};
