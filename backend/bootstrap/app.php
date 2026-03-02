<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum stateful API requests
        $middleware->statefulApi();

        // Alias middleware role untuk digunakan di routes
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);

        // Tambahkan CORS headers untuk semua API responses
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Replace default CSRF middleware with custom one
        $middleware->replace(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class, \App\Http\Middleware\VerifyCsrfToken::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle InsufficientStockException → 422
        $exceptions->render(function (\App\Exceptions\InsufficientStockException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors'  => ['stock' => [$e->getMessage()]],
            ], 422);
        });
    })->create();
