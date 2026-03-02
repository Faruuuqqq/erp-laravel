<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | TokoSync ERP: React frontend (Vite on port 5173) berkomunikasi dengan
    | Laravel (port 8000). Izinkan origin frontend + semua IP LAN.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost',
    ],

    // Untuk meng-allow semua IP LAN (192.168.x.x:5173), gunakan pattern:
    'allowed_origins_patterns' => [
        '#^http://192\.168\.\d+\.\d+(:\d+)?$#',
        '#^http://localhost(:\d+)?$#',
        '#^http://127\.0\.0\.1(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Wajib true agar Sanctum bisa set cookie & baca Authorization header
    'supports_credentials' => true,

];
