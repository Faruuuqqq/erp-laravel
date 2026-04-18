<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('settings')
            ->where('group', 'toko')
            ->update(['group' => 'store']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')
            ->where('group', 'store')
            ->whereIn('key', [
                'store_name',
                'store_address',
                'store_phone',
                'store_email',
                'store_npwp',
                'store_tagline',
            ])
            ->update(['group' => 'toko']);
    }
};
