<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // === STORE (PRIMARY KEYS USED BY SETTINGS + PDF) ===
            ['key' => 'store_name',             'value' => 'TokoSync Retail', 'group' => 'store', 'type' => 'string'],
            ['key' => 'phone',                  'value' => '021-5550123', 'group' => 'store', 'type' => 'string'],
            ['key' => 'address',                'value' => 'Jl. Raya Pasar No. 88, Jakarta Selatan', 'group' => 'store', 'type' => 'string'],
            ['key' => 'email',                  'value' => 'info@tokosync.local', 'group' => 'store', 'type' => 'string'],
            ['key' => 'npwp',                   'value' => '01.234.567.8-901.000', 'group' => 'store', 'type' => 'string'],
            ['key' => 'siup',                   'value' => '', 'group' => 'store', 'type' => 'string'],

            // === STORE LEGACY COMPATIBILITY KEYS ===
            ['key' => 'store_address',          'value' => 'Jl. Raya Pasar No. 88, Jakarta Selatan', 'group' => 'store', 'type' => 'string'],
            ['key' => 'store_phone',            'value' => '021-5550123', 'group' => 'store', 'type' => 'string'],
            ['key' => 'store_email',            'value' => 'info@tokosync.local', 'group' => 'store', 'type' => 'string'],
            ['key' => 'store_npwp',             'value' => '01.234.567.8-901.000', 'group' => 'store', 'type' => 'string'],
            ['key' => 'store_tagline',          'value' => 'Belanja Mudah, Harga Terjangkau', 'group' => 'store', 'type' => 'string'],

            // === BILLING / KONTRA BON DOCUMENT SETTINGS ===
            ['key' => 'bank_name',              'value' => '', 'group' => 'store', 'type' => 'string'],
            ['key' => 'bank_account_number',    'value' => '', 'group' => 'store', 'type' => 'string'],
            ['key' => 'bank_account_name',      'value' => '', 'group' => 'store', 'type' => 'string'],
            ['key' => 'billing_due_days',       'value' => 7, 'group' => 'store', 'type' => 'number'],
            ['key' => 'billing_payment_terms',  'value' => 'Pembayaran maksimal {due_days} hari sejak tanggal terbit dokumen.', 'group' => 'store', 'type' => 'string'],
            ['key' => 'billing_approver_name',  'value' => 'Finance', 'group' => 'store', 'type' => 'string'],
            ['key' => 'billing_approver_title', 'value' => 'AR Officer', 'group' => 'store', 'type' => 'string'],

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
