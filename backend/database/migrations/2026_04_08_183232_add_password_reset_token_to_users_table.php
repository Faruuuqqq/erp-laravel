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
        Schema::table('users', function (Blueprint $table) {
            $table->string('temp_password', 32)->nullable()->after('password')->comment('Temporary password for reset');
            $table->dateTime('temp_password_expires_at')->nullable()->after('temp_password')->comment('Expiry time for temporary password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['temp_password', 'temp_password_expires_at']);
        });
    }
};
