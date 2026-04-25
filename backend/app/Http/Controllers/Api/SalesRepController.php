<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SalesRepResource;
use App\Models\SalesRep;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesRepController extends Controller
{
    public function index(Request $request)
    {
        $query = SalesRep::when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"));
        
        // Add status filter
        if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('status', $request->status);
        }
        
        $reps = $query->latest()->paginate($request->perPage ?? 50);
        return SalesRepResource::collection($reps);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'area'    => ['nullable', 'string', 'max:100'],
            'status'  => ['nullable', 'in:active,inactive'],
        ]);
        $rep = SalesRep::create($data);
        return response()->json(['data' => new SalesRepResource($rep), 'message' => 'Sales berhasil ditambahkan.'], 201);
    }

    public function show(SalesRep $sale): JsonResponse
    {
        return response()->json(['data' => new SalesRepResource($sale)]);
    }

    public function update(Request $request, SalesRep $sale): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['sometimes', 'required', 'string', 'max:100'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'area'    => ['nullable', 'string', 'max:100'],
            'status'  => ['nullable', 'in:active,inactive'],
        ]);
        $sale->update($data);
        return response()->json(['data' => new SalesRepResource($sale->fresh()), 'message' => 'Sales berhasil diperbarui.']);
    }

    public function destroy(SalesRep $sale): JsonResponse
    {
        $sale->delete();
        return response()->json(['message' => 'Sales berhasil dihapus.']);
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

        $existingNames = SalesRep::pluck('name')->map(fn($name) => strtolower(trim($name)))->toArray();

        foreach ($rows as $index => $row) {
            $name = strtolower(trim($row['name']));
            
            if (in_array($name, $existingNames)) {
                $skipped++;
                continue;
            }

            try {
                SalesRep::create([
                    'name' => $row['name'],
                    'phone' => $row['phone'] ?? null,
                    'email' => $row['email'] ?? null,
                    'address' => $row['address'] ?? null,
                    'area' => $row['area'] ?? null,
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
