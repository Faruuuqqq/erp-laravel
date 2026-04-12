<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = Supplier::search($request->search)->latest()->paginate($request->perPage ?? 50);
        return SupplierResource::collection($suppliers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'min:2', 'max:100'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'phone2'  => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'city'    => ['nullable', 'string', 'max:50'],
            'no_rekening' => ['nullable', 'string', 'max:50'],
        ], [
            'name.required' => 'Nama supplier wajib diisi.',
        ]);

        $supplier = Supplier::create($data);

        return response()->json(['data' => new SupplierResource($supplier), 'message' => 'Supplier berhasil ditambahkan.'], 201);
    }

    public function show(Supplier $supplier): JsonResponse
    {
        return response()->json(['data' => new SupplierResource($supplier)]);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'phone2'  => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'city'    => ['nullable', 'string', 'max:50'],
            'no_rekening' => ['nullable', 'string', 'max:50'],
        ]);
        $supplier->update($data);
        return response()->json(['data' => new SupplierResource($supplier->fresh()), 'message' => 'Supplier berhasil diperbarui.']);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();
        return response()->json(['message' => 'Supplier berhasil dihapus.']);
    }
}
