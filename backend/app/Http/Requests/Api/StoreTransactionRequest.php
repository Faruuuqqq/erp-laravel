<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'date'                     => ['required', 'date'],
            'type'                     => ['required', 'in:pembelian,penjualan_tunai,penjualan_kredit,retur_pembelian,retur_penjualan,pembayaran_utang,pembayaran_piutang,surat_jalan,kontra_bon'],
            'supplierId'               => ['nullable', 'exists:suppliers,id'],
            'customerId'               => ['nullable', 'exists:customers,id'],
            'salesId'                  => ['nullable', 'exists:sales_reps,id'],
            'discount'                 => ['nullable', 'numeric', 'min:0'],
            'tax'                      => ['nullable', 'numeric', 'min:0'],
            'paid'                     => ['nullable', 'numeric', 'min:0'],
            'notes'                    => ['nullable', 'string', 'max:500'],
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.productId'        => ['required', 'exists:products,id'],
            'items.*.quantity'         => ['required', 'integer', 'min:1'],
            'items.*.price'            => ['required', 'numeric', 'min:0'],
            'items.*.discount'         => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.in'                  => 'Tipe transaksi tidak valid.',
            'items.required'           => 'Minimal 1 produk harus ditambahkan.',
            'items.min'                => 'Minimal 1 produk harus ditambahkan.',
            'items.*.productId.exists' => 'Produk tidak ditemukan.',
            'items.*.quantity.min'     => 'Qty minimal 1.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $type = $this->type;
            if (in_array($type, ['penjualan_kredit', 'pembayaran_piutang']) && !$this->customerId) {
                $v->errors()->add('customerId', 'Customer wajib dipilih untuk tipe transaksi ini.');
            }
            if (in_array($type, ['pembelian', 'pembayaran_utang']) && !$this->supplierId) {
                $v->errors()->add('supplierId', 'Supplier wajib dipilih untuk tipe transaksi ini.');
            }
        });
    }
}
