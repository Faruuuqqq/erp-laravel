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
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('supplier_id', 50)->nullable()->unique()->after('id')->comment('Manual supplier ID format (e.g., SUP-001)');
            $table->string('city', 100)->nullable()->after('address')->comment('Kota');
            $table->string('phone_1', 20)->nullable()->after('city')->comment('Nomor telepon utama');
            $table->string('phone_2', 20)->nullable()->after('phone_1')->comment('Nomor telepon alternatif');
            $table->string('email', 100)->nullable()->change();
            $table->string('contact_person', 100)->nullable()->after('email')->comment('Nama kontak');
            $table->string('bank_account', 50)->nullable()->after('contact_person')->comment('Nomor rekening');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['supplier_id', 'city', 'phone_1', 'phone_2', 'contact_person', 'bank_account']);
        });
    }
};
