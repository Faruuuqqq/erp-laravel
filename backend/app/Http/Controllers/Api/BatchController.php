<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function deleteProducts(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:products,id'],
        ]);

        $deleted = Product::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "{$deleted} produk berhasil dihapus",
            'deleted_count' => $deleted,
        ]);
    }

    public function updateProducts(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:products,id'],
            'data' => ['required', 'array'],
            'data.warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'data.category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'data.sell_price' => ['nullable', 'numeric', 'min:0'],
            'data.buy_price' => ['nullable', 'numeric', 'min:0'],
            'data.min_stock' => ['nullable', 'integer', 'min:0'],
        ]);

        $updated = Product::whereIn('id', $request->ids)->update($request->only([
            'warehouse_id', 'category_id', 'sell_price', 'buy_price', 'min_stock'
        ]));

        return response()->json([
            'message' => "{$updated} produk berhasil diperbarui",
            'updated_count' => $updated,
        ]);
    }

    public function deleteCustomers(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:customers,id'],
        ]);

        $deleted = Customer::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "{$deleted} pelanggan berhasil dihapus",
            'deleted_count' => $deleted,
        ]);
    }

    public function deleteSuppliers(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:suppliers,id'],
        ]);

        $deleted = Supplier::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "{$deleted} supplier berhasil dihapus",
            'deleted_count' => $deleted,
        ]);
    }

    public function verifyCustomers(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:customers,id'],
            'verified' => ['required', 'boolean'],
        ]);

        $updated = Customer::whereIn('id', $request->ids)->update([
            'is_verified' => $request->verified,
        ]);

        return response()->json([
            'message' => "{$updated} pelanggan berhasil " . ($request->verified ? ' diverifikasi' : 'ditolak'),
            'updated_count' => $updated,
        ]);
    }
}