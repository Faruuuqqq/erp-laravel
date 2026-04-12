<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // === TOKO ===
            ['key' => 'store_name',       'value' => 'TokoSync Retail',     'group' => 'toko',     'type' => 'string'],
            ['key' => 'store_address',    'value' => 'Jl. Raya Pasar No. 88, Jakarta Selatan', 'group' => 'toko', 'type' => 'string'],
            ['key' => 'store_phone',      'value' => '021-5550123',          'group' => 'toko',     'type' => 'string'],
            ['key' => 'store_email',      'value' => 'info@tokosync.local',  'group' => 'toko',     'type' => 'string'],
            ['key' => 'store_npwp',       'value' => '01.234.567.8-901.000', 'group' => 'toko',     'type' => 'string'],
            ['key' => 'store_tagline',    'value' => 'Belanja Mudah, Harga Terjangkau', 'group' => 'toko', 'type' => 'string'],

            // === INVOICE ===
            ['key' => 'invoice_prefix',   'value' => 'INV',  'group' => 'invoice', 'type' => 'string'],
            ['key' => 'po_prefix',        'value' => 'PO',   'group' => 'invoice', 'type' => 'string'],
            ['key' => 'sj_prefix',        'value' => 'SJ',   'group' => 'invoice', 'type' => 'string'],
            ['key' => 'retur_prefix',     'value' => 'RTN',  'group' => 'invoice', 'type' => 'string'],
            ['key' => 'invoice_footer',   'value' => 'Terima kasih atas kepercayaan Anda berbelanja di toko kami.', 'group' => 'invoice', 'type' => 'string'],

            // === KEUANGAN ===
            ['key' => 'tax_enabled',      'value' => false,  'group' => 'keuangan', 'type' => 'boolean'],
            ['key' => 'tax_rate',         'value' => 11,     'group' => 'keuangan', 'type' => 'number'],
            ['key' => 'default_currency', 'value' => 'IDR',  'group' => 'keuangan', 'type' => 'string'],
            ['key' => 'low_stock_alert',  'value' => true,   'group' => 'keuangan', 'type' => 'boolean'],
            ['key' => 'credit_limit_default', 'value' => 5000000, 'group' => 'keuangan', 'type' => 'number'],

            // === PRINT ===
            ['key' => 'print_logo',       'value' => true,   'group' => 'print', 'type' => 'boolean'],
            ['key' => 'print_header',     'value' => true,   'group' => 'print', 'type' => 'boolean'],
            ['key' => 'print_footer',     'value' => true,   'group' => 'print', 'type' => 'boolean'],
            ['key' => 'paper_size',       'value' => 'A4',   'group' => 'print', 'type' => 'string'],
        ];

        foreach ($settings as $s) {
            Setting::updateOrCreate(
                ['key' => $s['key']],
                [
                    'value' => $s['value'],
                    'group' => $s['group'],
                    'type'  => $s['type'],
                ]
            );
        }

        $this->command->info('Settings seeded: ' . count($settings) . ' entri.');
    }
}
