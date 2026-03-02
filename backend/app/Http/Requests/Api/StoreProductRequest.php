<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'        => ['required', 'string', 'min:2', 'max:20',
                              'regex:/^[A-Z0-9\-]+$/',
                              'unique:products,code'],
            'name'        => ['required', 'string', 'min:2', 'max:100'],
            'category'    => ['required', 'string', 'exists:categories,name'],
            'buyPrice'    => ['required', 'numeric', 'min:0', 'max:999999999'],
            'sellPrice'   => ['required', 'numeric', 'min:0.01', 'max:999999999', 'gt:buyPrice'],
            'stock'       => ['required', 'integer', 'min:0'],
            'minStock'    => ['required', 'integer', 'min:0'],
            'unit'        => ['required', 'string', 'max:20'],
            'warehouseId' => ['nullable', 'exists:warehouses,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required'   => 'Kode produk wajib diisi.',
            'code.unique'     => 'SKU sudah terdaftar.',
            'code.regex'      => 'Kode hanya boleh huruf kapital, angka, dan tanda strip.',
            'sellPrice.gt'    => 'Harga jual harus lebih besar dari harga beli.',
            'category.exists' => 'Kategori tidak valid.',
        ];
    }
}
