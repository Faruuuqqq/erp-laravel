<?php

namespace App\Http\Requests\Api;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'date'                     => ['required', 'date'],
            'dueDate'                  => ['nullable', 'date', 'after_or_equal:date'],
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
            'items.*.discount.max'     => 'Diskon tidak boleh melebihi 100%.',
            'dueDate.after_or_equal'   => 'Tanggal jatuh tempo harus sama atau setelah tanggal transaksi.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $type = $this->type;
            
            // Check required fields for specific transaction types
            if (in_array($type, ['penjualan_kredit', 'pembayaran_piutang']) && !$this->customerId) {
                $v->errors()->add('customerId', 'Customer wajib dipilih untuk tipe transaksi ini.');
            }
            if (in_array($type, ['pembelian', 'pembayaran_utang']) && !$this->supplierId) {
                $v->errors()->add('supplierId', 'Supplier wajib dipilih untuk tipe transaksi ini.');
            }

            // Validate stock availability for transaction types that consume/produce stock
            $stockConsumingTypes = ['penjualan_tunai', 'penjualan_kredit', 'retur_pembelian', 'surat_jalan'];
            if (in_array($type, $stockConsumingTypes)) {
                foreach ($this->items as $idx => $item) {
                    $product = Product::find($item['productId']);
                    if ($product && $item['quantity'] > $product->stock) {
                        $v->errors()->add(
                            "items.$idx.quantity",
                            "Stok produk {$product->name} tidak cukup. Tersedia: {$product->stock}, diminta: {$item['quantity']}"
                        );
                    }
                }
            }

            // Validate total discount doesn't exceed subtotal
            $subtotal = collect($this->items)->sum(function ($item) {
                return $item['quantity'] * $item['price'] * (1 - (($item['discount'] ?? 0) / 100));
            });
            
            $totalDiscount = $this->discount ?? 0;
            if ($totalDiscount > $subtotal) {
                $v->errors()->add(
                    'discount',
                    "Diskon total ({$totalDiscount}) tidak boleh melebihi subtotal ({$subtotal})"
                );
            }
        });
    }
}
