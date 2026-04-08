<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturnPurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_id' => ['nullable', 'exists:transactions,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'date' => ['required', 'date'],
            'reason' => ['required', 'in:rusak,kadaluarsa,tidak_sesuai,cacat,kelebihan'],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.productName' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Minimal harus ada 1 item retur.',
            'items.*.productId.required' => 'Produk harus dipilih.',
            'items.*.productId.exists' => 'Produk tidak ditemukan.',
            'items.*.quantity.required' => 'Qty harus diisi.',
            'items.*.quantity.min' => 'Qty minimal 1.',
            'reason.required' => 'Alasan retur harus dipilih.',
            'date.required' => 'Tanggal harus diisi.',
        ];
    }
}
