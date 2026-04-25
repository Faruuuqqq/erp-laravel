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
            'phone2'  => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'city'    => ['nullable', 'string', 'max:50'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'discount'  => ['nullable', 'string', 'max:50'],
            'warehouse' => ['nullable', 'string', 'max:50'],
            'price_list' => ['nullable', 'string', 'max:50'],
            'daerah'    => ['nullable', 'string', 'max:50'],
            'keterangan' => ['nullable', 'string', 'max:255'],
            'npwp'      => ['nullable', 'string', 'max:20'],
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
            'phone2'  => ['nullable', 'string', 'max:20'],
            'email'   => ['nullable', 'email'],
            'address' => ['nullable', 'string'],
            'city'    => ['nullable', 'string', 'max:50'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'discount'  => ['nullable', 'string', 'max:50'],
            'warehouse' => ['nullable', 'string', 'max:50'],
            'price_list' => ['nullable', 'string', 'max:50'],
            'daerah'    => ['nullable', 'string', 'max:50'],
            'keterangan' => ['nullable', 'string', 'max:255'],
            'npwp'      => ['nullable', 'string', 'max:20'],
        ]);
        $customer->update($data);
        return response()->json(['data' => new CustomerResource($customer->fresh()), 'message' => 'Customer berhasil diperbarui.']);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer berhasil dihapus.']);
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

        // Get existing names to skip duplicates efficiently
        $existingNames = Customer::pluck('name')->map(fn($name) => strtolower(trim($name)))->toArray();

        foreach ($rows as $index => $row) {
            $name = strtolower(trim($row['name']));
            
            if (in_array($name, $existingNames)) {
                $skipped++;
                continue;
            }

            try {
                Customer::create([
                    'name' => $row['name'],
                    'phone' => $row['phone'] ?? null,
                    'phone2' => $row['phone2'] ?? null,
                    'email' => $row['email'] ?? null,
                    'address' => $row['address'] ?? null,
                    'city' => $row['city'] ?? null,
                    'credit_limit' => isset($row['creditLimit']) && is_numeric($row['creditLimit']) ? $row['creditLimit'] : (isset($row['credit_limit']) && is_numeric($row['credit_limit']) ? $row['credit_limit'] : 0),
                    'discount' => $row['discount'] ?? null,
                    'warehouse' => $row['warehouse'] ?? null,
                    'price_list' => $row['priceList'] ?? $row['price_list'] ?? null,
                    'daerah' => $row['area'] ?? $row['daerah'] ?? null,
                    'keterangan' => $row['notes'] ?? $row['keterangan'] ?? null,
                    'npwp' => $row['npwp'] ?? null,
                ]);
                $imported++;
                $existingNames[] = $name; // Add to avoid duplicates within the same import
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
