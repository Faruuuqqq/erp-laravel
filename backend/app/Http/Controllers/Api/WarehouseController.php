<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WarehouseResource;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $warehouses = Warehouse::when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()->paginate($request->perPage ?? 50);
        return WarehouseResource::collection($warehouses);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'status'  => ['nullable', 'in:active,inactive'],
        ]);
        $warehouse = Warehouse::create($data);
        return response()->json(['data' => new WarehouseResource($warehouse), 'message' => 'Gudang berhasil ditambahkan.'], 201);
    }

    public function show(Warehouse $warehouse): JsonResponse
    {
        return response()->json(['data' => new WarehouseResource($warehouse)]);
    }

    public function update(Request $request, Warehouse $warehouse): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['sometimes', 'required', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'status'  => ['nullable', 'in:active,inactive'],
        ]);
        $warehouse->update($data);
        return response()->json(['data' => new WarehouseResource($warehouse->fresh()), 'message' => 'Gudang berhasil diperbarui.']);
    }

    public function destroy(Warehouse $warehouse): JsonResponse
    {
        $warehouse->delete();
        return response()->json(['message' => 'Gudang berhasil dihapus.']);
    }
}
