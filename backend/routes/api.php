<?php

use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\AdminManagementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryNoteController;
use App\Http\Controllers\Api\InfoController;
use App\Http\Controllers\Api\KontraBonController;
use App\Http\Controllers\Api\PermissionPresetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReturnPurchaseController;
use App\Http\Controllers\Api\ReturnSaleController;
use App\Http\Controllers\Api\SalesRepController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\BatchController;
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

    // ── Profile (All Authenticated Users) ──────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/change-password', [ProfileController::class, 'changePassword']);

    // ── Settings (All Authenticated Users) ─────────────────────────────────────
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::patch('/settings/profile', [SettingsController::class, 'updateProfile']);
    Route::patch('/settings/store', [SettingsController::class, 'updateStore']);
    Route::patch('/settings/password', [SettingsController::class, 'updatePassword']);
    Route::patch('/settings/notifications', [SettingsController::class, 'updateNotifications']);

    // ── Master Data (Admin & Owner) ───────────────────────────────────────────
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::patch('products/{product}/stock', [ProductController::class, 'updateStock']);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('warehouses', WarehouseController::class);
    Route::apiResource('sales', SalesRepController::class);

    // ── Transactions (Admin & Owner) ──────────────────────────────────────────
    Route::apiResource('transactions', TransactionController::class);
    Route::patch('transactions/{transaction}/payment', [TransactionController::class, 'updatePayment']);
    Route::get('transactions/{transaction}/print/invoice', [TransactionController::class, 'printInvoice']);
    Route::get('transactions/{transaction}/print/receipt', [TransactionController::class, 'printReceipt']);

    // ── Kontra Bon (Admin & Owner) ───────────────────────────────────────────
    Route::apiResource('kontra-bon', KontraBonController::class)->only(['index']);
    Route::post('kontra-bon/print', [KontraBonController::class, 'printBilling']);
    Route::get('kontra-bon/aging', [KontraBonController::class, 'calculateAging']);

    // ── Export CSV (Admin & Owner) ──────────────────────────────────────────
    Route::get('export/products', [ExportController::class, 'products']);
    Route::get('export/customers', [ExportController::class, 'customers']);
    Route::get('export/suppliers', [ExportController::class, 'suppliers']);
    Route::get('export/transactions', [ExportController::class, 'transactions']);
    Route::get('export/expenses', [ExportController::class, 'expenses']);

    // ── Batch Operations (Admin & Owner) ─────────────────────────────────────
    Route::post('batch/products/delete', [BatchController::class, 'deleteProducts']);
    Route::post('batch/products/update', [BatchController::class, 'updateProducts']);
    Route::post('batch/customers/delete', [BatchController::class, 'deleteCustomers']);
    Route::post('batch/customers/verify', [BatchController::class, 'verifyCustomers']);
    Route::post('batch/suppliers/delete', [BatchController::class, 'deleteSuppliers']);

    // ── Returns (Admin & Owner) ────────────────────────────────────────────────
    Route::apiResource('return-sales', ReturnSaleController::class);
    Route::get('return-sales/{returnSale}/print', [ReturnSaleController::class, 'print']);
    Route::apiResource('return-purchases', ReturnPurchaseController::class);
    Route::get('return-purchases/{returnPurchase}/print', [ReturnPurchaseController::class, 'print']);

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
    });

    // ── Expenses (Admin & Owner) ─────────────────────────────────────
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('expenses/categories', [ExpenseController::class, 'categories']);

    // ── Owner Only (Laporan & Info Finansial) ────────────────────────
    Route::middleware('role:owner')->group(function () {
        Route::prefix('reports')->group(function () {
            Route::get('daily', [ReportController::class, 'daily']);
            Route::get('stock', [ReportController::class, 'stock']);
            Route::get('balance', [ReportController::class, 'balance']);
            Route::get('history/pembelian', [ReportController::class, 'historyPembelian']);
            Route::get('history/penjualan', [ReportController::class, 'historyPenjualan']);
            Route::get('history/retur-pembelian', [ReportController::class, 'historyReturPembelian']);
            Route::get('history/retur-penjualan', [ReportController::class, 'historyReturPenjualan']);
            Route::get('history/pembayaran-utang', [ReportController::class, 'historyPembayaranUtang']);
            Route::get('history/pembayaran-piutang', [ReportController::class, 'historyPembayaranPiutang']);
            Route::get('daily/print', [ReportController::class, 'printDaily']);
            Route::get('stock/print', [ReportController::class, 'printStock']);
            Route::get('balance/print', [ReportController::class, 'printBalance']);
        });

        Route::prefix('info')->group(function () {
            Route::get('saldo-piutang', [InfoController::class, 'saldoPiutang']);
            Route::get('saldo-piutang/print', [InfoController::class, 'printSaldoPiutang']);
            Route::get('saldo-utang', [InfoController::class, 'saldoUtang']);
            Route::get('saldo-utang/print', [InfoController::class, 'printSaldoUtang']);
            Route::get('saldo-stok', [InfoController::class, 'saldoStok']);
            Route::get('kartu-stok', [InfoController::class, 'kartuStok']);
            Route::get('kartu-stok/print', [InfoController::class, 'printKartuStok']);
            Route::get('laporan-harian', [InfoController::class, 'laporanHarian']);
        });

        // ── Admin Management (Owner Only) ─────────────────────────────
        Route::get('/admins', [AdminManagementController::class, 'index']);
        Route::post('/admins', [AdminManagementController::class, 'store']);
        Route::get('/admins/{admin}', [AdminManagementController::class, 'show']);
        Route::put('/admins/{admin}', [AdminManagementController::class, 'update']);
        Route::put('/admins/{admin}/permissions', [AdminManagementController::class, 'updatePermissions']);
        Route::patch('/admins/{admin}/toggle-active', [AdminManagementController::class, 'toggleActive']);
        Route::post('/admins/{admin}/reset-password', [AdminManagementController::class, 'resetPassword']);
        Route::delete('/admins/{admin}', [AdminManagementController::class, 'destroy']);
        Route::get('/admin-activity-logs', [AdminManagementController::class, 'activityLogs']);
        Route::get('/admin-presets', [AdminManagementController::class, 'permissionPresets']);

        // ── Permission Presets (Owner Only) ──────────────────────────
        Route::prefix('permission-presets')->group(function () {
            Route::get('/', [PermissionPresetController::class, 'index']);
            Route::post('/', [PermissionPresetController::class, 'store']);
            Route::get('/{preset}', [PermissionPresetController::class, 'show']);
            Route::put('/{preset}', [PermissionPresetController::class, 'update']);
            Route::delete('/{preset}', [PermissionPresetController::class, 'destroy']);
            Route::post('/{preset}/duplicate', [PermissionPresetController::class, 'duplicate']);
        });
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
