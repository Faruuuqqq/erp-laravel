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
        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // 'create', 'update', 'delete', 'toggle_active', 'reset_password', etc.
            $table->string('module'); // 'admin', 'product', 'supplier', etc.
            $table->string('entity_id')->nullable(); // ID of the entity affected
            $table->text('old_data')->nullable()->comment('JSON of old data before change');
            $table->text('new_data')->nullable()->comment('JSON of new data after change');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->index('admin_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
    }
};
