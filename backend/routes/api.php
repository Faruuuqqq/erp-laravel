<?php

use App\Http\Controllers\Api\AdminManagementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryNoteController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InfoController;
use App\Http\Controllers\Api\KontraBonController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReturnPurchaseController;
use App\Http\Controllers\Api\ReturnSaleController;
use App\Http\Controllers\Api\SalesRepController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\WarehouseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TokoSync ERP – API Routes (Production-Ready)
|--------------------------------------------------------------------------
*/

// ─── Public Routes (Rate Limited) ─────────────────────────────────────────────
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ─── Authenticated Routes ─────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ── Settings (All Authenticated Users) ─────────────────────────────────────
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::patch('/settings/profile', [SettingsController::class, 'updateProfile']);
    Route::patch('/settings/store', [SettingsController::class, 'updateStore']);
    Route::patch('/settings/password', [SettingsController::class, 'updatePassword']);
    Route::patch('/settings/notifications', [SettingsController::class, 'updateNotifications']);

    // ── Master Data (Admin & Owner) ───────────────────────────────────────────
    Route::apiResource('categories', CategoryController::class);
    Route::post('products/import', [ProductController::class, 'import']);
    Route::apiResource('products', ProductController::class);
    Route::patch('products/{product}/stock', [ProductController::class, 'updateStock']);
    Route::post('suppliers/import', [SupplierController::class, 'import']);
    Route::apiResource('suppliers', SupplierController::class);
    Route::post('customers/import', [CustomerController::class, 'import']);
    Route::apiResource('customers', CustomerController::class);
    Route::post('warehouses/import', [WarehouseController::class, 'import']);
    Route::apiResource('warehouses', WarehouseController::class);
    Route::post('sales/import', [SalesRepController::class, 'import']);
    Route::apiResource('sales', SalesRepController::class);
    Route::apiResource('expenses', ExpenseController::class);

    // ── Transactions (Admin & Owner) ──────────────────────────────────────────
    Route::apiResource('transactions', TransactionController::class);
    Route::patch('transactions/{transaction}/payment', [TransactionController::class, 'updatePayment']);
    Route::patch('transactions/{transaction}/toggle-hidden', [TransactionController::class, 'toggleHidden']);
    Route::get('transactions/{transaction}/print/document', [TransactionController::class, 'printDocument']);
    Route::get('transactions/{transaction}/print/invoice', [TransactionController::class, 'printInvoice']);
    Route::get('transactions/{transaction}/print/receipt', [TransactionController::class, 'printReceipt']);

    // ── Kontra Bon (Admin & Owner) ───────────────────────────────────────────
    Route::apiResource('kontra-bon', KontraBonController::class)->only(['index']);
    Route::post('kontra-bon/print', [KontraBonController::class, 'printBilling']);
    Route::get('kontra-bon/aging', [KontraBonController::class, 'calculateAging']);

    // ── Returns (Admin & Owner) ────────────────────────────────────────────────
    Route::apiResource('return-sales', ReturnSaleController::class);
    Route::apiResource('return-purchases', ReturnPurchaseController::class);

    // ── Delivery Notes (Admin & Owner) ───────────────────────────────
    Route::apiResource('delivery-notes', DeliveryNoteController::class);
    Route::get('delivery-notes/{id}/print', [DeliveryNoteController::class, 'print']);

    // ── Dashboard (Admin & Owner) ────────────────────────────────────
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'stats']);
        Route::get('recent-transactions', [DashboardController::class, 'recentTransactions']);
        Route::get('low-stock', [DashboardController::class, 'lowStock']);
        Route::get('financial-summary', [DashboardController::class, 'financialSummary']);
        Route::get('sales-trend', [DashboardController::class, 'salesTrend']);
        Route::get('expenses-stats', [DashboardController::class, 'expensesStats']);
        Route::get('top-products', [DashboardController::class, 'topProducts']);
        Route::get('category-distribution', [DashboardController::class, 'categoryDistribution']);
    });

    // ── Owner Only (Laporan & Info Finansial) ────────────────────────
    Route::middleware('role:owner')->group(function () {
        Route::prefix('reports')->group(function () {
            Route::get('daily', [ReportController::class, 'daily']);
            Route::get('stock', [ReportController::class, 'stock']);
            Route::get('balance', [ReportController::class, 'balance']);
            Route::get('history/pembelian', [ReportController::class, 'historyPembelian']);
            Route::get('history/penjualan', [ReportController::class, 'historyPenjualan']);
            Route::get('daily/print', [ReportController::class, 'printDaily']);
            Route::get('stock/print', [ReportController::class, 'printStock']);
            Route::get('balance/print', [ReportController::class, 'printBalance']);
        });

        Route::prefix('info')->group(function () {
            Route::get('saldo-piutang', [InfoController::class, 'saldoPiutang']);
            Route::get('saldo-utang', [InfoController::class, 'saldoUtang']);
            Route::get('saldo-stok', [InfoController::class, 'saldoStok']);
            Route::get('kartu-stok', [InfoController::class, 'kartuStok']);
            Route::get('laporan-harian', [InfoController::class, 'laporanHarian']);
        });

        // ── Admin Management (Owner Only) ─────────────────────────────
        Route::get('/admins', [AdminManagementController::class, 'index']);
        Route::post('/admins', [AdminManagementController::class, 'store']);
        Route::get('/admins/{admin}', [AdminManagementController::class, 'show']);
        Route::put('/admins/{admin}', [AdminManagementController::class, 'update']);
        Route::put('/admins/{admin}/permissions', [AdminManagementController::class, 'updatePermissions']);
        Route::patch('/admins/{admin}/toggle-active', [AdminManagementController::class, 'toggleActive']);
        Route::delete('/admins/{admin}', [AdminManagementController::class, 'destroy']);
        Route::get('/admin-presets', [AdminManagementController::class, 'permissionPresets']);
    });

    // ─── Catch-all route for unmatched API routes ───────────────────
    Route::fallback(function () {
        return response()->json([
            'error' => [
                'message' => 'API endpoint not found',
                'path' => request()->path(),
                'method' => request()->method(),
            ],
        ], 404);
    });
});
