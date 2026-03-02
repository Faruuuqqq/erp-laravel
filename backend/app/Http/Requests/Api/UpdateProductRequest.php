<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'code'        => ['sometimes', 'required', 'string', 'min:2', 'max:20',
                              'regex:/^[A-Z0-9\-]+$/',
                              "unique:products,code,{$productId}"],
            'name'        => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'category'    => ['sometimes', 'required', 'string', 'exists:categories,name'],
            'buyPrice'    => ['sometimes', 'required', 'numeric', 'min:0'],
            'sellPrice'   => ['sometimes', 'required', 'numeric', 'min:0.01', 'gt:buyPrice'],
            'stock'       => ['sometimes', 'required', 'integer', 'min:0'],
            'minStock'    => ['sometimes', 'required', 'integer', 'min:0'],
            'unit'        => ['sometimes', 'required', 'string', 'max:20'],
            'warehouseId' => ['nullable', 'exists:warehouses,id'],
        ];
    }
}
