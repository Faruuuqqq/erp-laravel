<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_purchases', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->date('date');
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->enum('reason', ['rusak', 'kadaluarsa', 'tidak_sesuai', 'kelebihan'])->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'processed', 'cancelled'])->default('processed');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('set null');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_purchases');
    }
};
