<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAdminRequest;
use App\Http\Requests\Api\UpdateAdminRequest;
use App\Http\Requests\Api\UpdateAdminPermissionsRequest;
use App\Http\Resources\AdminResource;
use App\Http\Resources\AdminActivityLogResource;
use App\Models\User;
use App\Models\AdminActivityLog;
use App\Services\AdminActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'admin');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%");
        }

        if ($request->has('active')) {
            $query->where('is_active', (bool) $request->active);
        }

        $admins = $query->latest()->paginate($request->perPage ?? 25);

        return AdminResource::collection($admins);
    }

    public function store(StoreAdminRequest $request): JsonResponse
    {
        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'is_active' => true,
            'permissions' => $request->permissions ?? (new User())->getDefaultPermissions(),
        ]);

        // Log the activity
        AdminActivityService::logAdminCreated($admin, [
            'name' => $admin->name,
            'email' => $admin->email,
            'permissions' => $admin->permissions,
        ]);

        return response()->json([
            'data' => new AdminResource($admin),
            'message' => 'Admin berhasil ditambahkan.',
        ], 201);
    }

    public function show(User $admin): JsonResponse
    {
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'User bukan admin.'], 404);
        }

        return response()->json(['data' => new AdminResource($admin)]);
    }

    public function update(UpdateAdminRequest $request, User $admin): JsonResponse
    {
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'User bukan admin.'], 404);
        }

        $oldData = $admin->toArray();
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $admin->update($data);

        // Log the activity
        AdminActivityService::logAdminUpdated($admin, $oldData, $admin->fresh()->toArray());

        return response()->json([
            'data' => new AdminResource($admin->fresh()),
            'message' => 'Admin berhasil diperbarui.',
        ]);
    }

    public function updatePermissions(UpdateAdminPermissionsRequest $request, User $admin): JsonResponse
    {
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'User bukan admin.'], 404);
        }

        $oldPermissions = $admin->permissions;
        $admin->update(['permissions' => $request->permissions]);

        // Log the activity
        AdminActivityService::logAdminPermissionsUpdated($admin, $oldPermissions, $request->permissions);

        return response()->json([
            'data' => new AdminResource($admin->fresh()),
            'message' => 'Permission admin berhasil diperbarui.',
        ]);
    }

    public function toggleActive(User $admin): JsonResponse
    {
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'User bukan admin.'], 404);
        }

        $previousStatus = $admin->is_active;
        $admin->update(['is_active' => !$admin->is_active]);

        // Log the activity
        AdminActivityService::logAdminToggleActive($admin, $previousStatus, $admin->is_active);

        return response()->json([
            'data' => new AdminResource($admin->fresh()),
            'message' => $admin->is_active ? 'Admin diaktifkan.' : 'Admin dinonaktifkan.',
        ]);
    }

    public function destroy(User $admin): JsonResponse
    {
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'User bukan admin.'], 404);
        }

        // Store data before deletion
        $adminData = $admin->toArray();

        // Log the activity
        AdminActivityService::logAdminDeleted($admin, $adminData);

        $admin->delete();

        return response()->json(['message' => 'Admin berhasil dihapus.']);
    }

    public function resetPassword(User $admin): JsonResponse
    {
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'User bukan admin.'], 404);
        }

        // Generate temporary password
        $tempPassword = substr(bin2hex(random_bytes(16)), 0, 12);
        
        $admin->update([
            'temp_password' => $tempPassword,
            'temp_password_expires_at' => now()->addHours(24),
        ]);

        // Log the activity
        AdminActivityService::logAdminPasswordReset($admin);

        return response()->json([
            'data' => [
                'tempPassword' => $tempPassword,
                'expiresAt' => $admin->temp_password_expires_at->toISOString(),
            ],
            'message' => 'Password reset berhasil. Bagikan password sementara kepada admin.',
        ]);
    }

    public function permissionPresets(): JsonResponse
    {
        return response()->json([
            'data' => [
                'full_access' => [
                    'name' => 'Full Access',
                    'description' => 'Akses penuh ke semua modul kecuali laporan owner',
                    'permissions' => array_merge((new User())->getDefaultPermissions(), [
                        'products' => ['view' => true, 'create' => true, 'update' => true, 'delete' => true, 'print' => true],
                        'suppliers' => ['view' => true, 'create' => true, 'update' => true, 'delete' => true, 'print' => true],
                        'customers' => ['view' => true, 'create' => true, 'update' => true, 'delete' => true, 'print' => true],
                        'transactions' => ['view' => true, 'create' => true, 'update' => true, 'delete' => true, 'print' => true],
                    ]),
                ],
                'products_only' => [
                    'name' => 'Produk Only',
                    'description' => 'Hanya bisa manage produk dan kategori',
                    'permissions' => array_merge((new User())->getDefaultPermissions(), [
                        'products' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => true],
                        'categories' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => false],
                        'warehouses' => ['view' => true, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                        'suppliers' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                        'customers' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                        'sales_reps' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                        'transactions' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                    ]),
                ],
                'transactions_only' => [
                    'name' => 'Transaksi Only',
                    'description' => 'Hanya bisa manage transaksi',
                    'permissions' => array_merge((new User())->getDefaultPermissions(), [
                        'products' => ['view' => true, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                        'suppliers' => ['view' => true, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                        'customers' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => false],
                        'transactions' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
                    ]),
                ],
                'customers_only' => [
                    'name' => 'Customer Only',
                    'description' => 'Hanya bisa manage customer dan sales',
                    'permissions' => array_merge((new User())->getDefaultPermissions(), [
                        'products' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                        'customers' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => true],
                        'sales_reps' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => false],
                        'transactions' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
                    ]),
                ],
            ],
        ]);
    }

    public function activityLogs(Request $request): JsonResponse
    {
        $query = AdminActivityLog::with('admin')->orderBy('created_at', 'desc');

        // Filter by admin
        if ($request->adminId) {
            $query->where('admin_id', $request->adminId);
        }

        // Filter by action
        if ($request->action) {
            $query->where('action', $request->action);
        }

        // Filter by module
        if ($request->module) {
            $query->where('module', $request->module);
        }

        // Filter by date range
        if ($request->startDate) {
            $query->whereDate('created_at', '>=', $request->startDate);
        }
        if ($request->endDate) {
            $query->whereDate('created_at', '<=', $request->endDate);
        }

        $logs = $query->paginate($request->perPage ?? 50);

        return response()->json([
            'data' => AdminActivityLogResource::collection($logs->items()),
            'pagination' => [
                'currentPage' => $logs->currentPage(),
                'perPage' => $logs->perPage(),
                'total' => $logs->total(),
                'lastPage' => $logs->lastPage(),
            ],
        ]);
    }
}
