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
            'supplier_id'   => ['required', 'string', 'max:50', 'unique:suppliers,supplier_id'],
            'name'          => ['required', 'string', 'min:2', 'max:100'],
            'phone_1'       => ['nullable', 'string', 'max:20'],
            'phone_2'       => ['nullable', 'string', 'max:20'],
            'email'         => ['nullable', 'email'],
            'address'       => ['nullable', 'string'],
            'city'          => ['nullable', 'string', 'max:100'],
            'contact_person' => ['nullable', 'string', 'max:100'],
            'bank_account'  => ['nullable', 'string', 'max:50'],
        ], [
            'supplier_id.required' => 'ID Supplier wajib diisi.',
            'supplier_id.unique' => 'ID Supplier sudah terdaftar.',
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
            'supplier_id'   => ['sometimes', 'required', 'string', 'max:50', "unique:suppliers,supplier_id,{$supplier->id}"],
            'name'          => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'phone_1'       => ['nullable', 'string', 'max:20'],
            'phone_2'       => ['nullable', 'string', 'max:20'],
            'email'         => ['nullable', 'email'],
            'address'       => ['nullable', 'string'],
            'city'          => ['nullable', 'string', 'max:100'],
            'contact_person' => ['nullable', 'string', 'max:100'],
            'bank_account'  => ['nullable', 'string', 'max:50'],
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
