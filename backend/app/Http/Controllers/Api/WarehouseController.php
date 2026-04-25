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
        $query = Warehouse::when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"));
        
        // Add status filter
        if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('status', $request->status);
        }
        
        $warehouses = $query->latest()->paginate($request->perPage ?? 50);
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

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'rows' => ['required', 'array'],
            'rows.*.name' => ['required', 'string', 'max:100'],
        ]);

        $rows = $request->input('rows');
        $imported = 0;
        $skipped = 0;
        $errors = [];

        $existingNames = Warehouse::pluck('name')->map(fn($name) => strtolower(trim($name)))->toArray();

        foreach ($rows as $index => $row) {
            $name = strtolower(trim($row['name']));
            
            if (in_array($name, $existingNames)) {
                $skipped++;
                continue;
            }

            try {
                Warehouse::create([
                    'name' => $row['name'],
                    'address' => $row['address'] ?? null,
                    'status' => in_array(strtolower($row['status'] ?? ''), ['active', 'inactive']) ? strtolower($row['status']) : 'active',
                ]);
                $imported++;
                $existingNames[] = $name;
            } catch (\Exception $e) {
                $skipped++;
                $errors[] = "Baris " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => "Import selesai. $imported berhasil, $skipped dilewati.",
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors
        ]);
    }
}
