<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_ledgers', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['UTANG', 'PIUTANG']);
            $table->enum('entity_type', ['supplier', 'customer']);
            $table->unsignedBigInteger('entity_id');
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->decimal('debit', 15, 2)->default(0);   // penambahan saldo
            $table->decimal('credit', 15, 2)->default(0);  // pengurangan saldo
            $table->decimal('balance_after', 15, 2);       // saldo setelah mutasi
            $table->string('description', 200);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_ledgers');
    }
};
