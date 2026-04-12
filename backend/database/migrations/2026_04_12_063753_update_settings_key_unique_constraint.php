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
        Schema::table('settings', function (Blueprint $table) {
            // Drop the old unique constraint on key only
            $table->dropUnique(['key']);
            
            // Add new composite unique constraint on (key, user_id)
            // This allows same key for different users, but prevents duplicates per user
            $table->unique(['key', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Revert to original unique constraint on key only
            $table->dropUnique(['key', 'user_id']);
            $table->unique('key');
        });
    }
};
