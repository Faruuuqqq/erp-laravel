<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::search($request->search)->latest()->paginate($request->perPage ?? 50);
        return CustomerResource::collection($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'min:2', 'max:100'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
        ], [
            'name.required' => 'Nama customer wajib diisi.',
        ]);

        $customer = Customer::create($data);

        return response()->json(['data' => new CustomerResource($customer), 'message' => 'Customer berhasil ditambahkan.'], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json(['data' => new CustomerResource($customer)]);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $data = $request->validate([
            'name'    => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'phone'   => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
        ]);
        $customer->update($data);
        return response()->json(['data' => new CustomerResource($customer->fresh()), 'message' => 'Customer berhasil diperbarui.']);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer berhasil dihapus.']);
    }
}
