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
        $reps = SalesRep::when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()->paginate($request->perPage ?? 50);
        return SalesRepResource::collection($reps);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
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
}
