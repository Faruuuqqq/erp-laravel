<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreAdminRequest;
use App\Http\Requests\Api\UpdateAdminRequest;
use App\Http\Requests\Api\UpdateAdminPermissionsRequest;
use App\Http\Resources\AdminResource;
use App\Models\User;
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

        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $admin->update($data);

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

        $admin->update(['permissions' => $request->permissions]);

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

        $admin->update(['is_active' => !$admin->is_active]);

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

        $admin->delete();

        return response()->json(['message' => 'Admin berhasil dihapus.']);
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
}
