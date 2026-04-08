<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturnSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_id' => ['nullable', 'exists:transactions,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'date' => ['required', 'date'],
            'reason' => ['required', 'in:rusak,kadaluarsa,tidak_sesuai,kelebihan,lainnya'],
            'refund_method' => ['required', 'in:tunai,potong_piutang,tukar_barang,kredit_nota'],
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
            'refund_method.required' => 'Metode pengembalian harus dipilih.',
            'date.required' => 'Tanggal harus diisi.',
        ];
    }
}
