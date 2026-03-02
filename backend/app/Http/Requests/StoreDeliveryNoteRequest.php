<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDeliveryNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'transaction_id' => ['nullable', 'exists:transactions,id'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'driver' => ['nullable', 'string', 'max:100'],
            'vehicle_plate' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'date.required' => 'Tanggal wajib diisi.',
            'transaction_id.exists' => 'Transaksi tidak ditemukan.',
            'customer_id.exists' => 'Pelanggan tidak ditemukan.',
            'driver.max' => 'Nama driver maksimal 100 karakter.',
            'vehicle_plate.max' => 'Plat nomor kendaraan maksimal 20 karakter.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'notes.max' => 'Catatan maksimal 500 karakter.',
        ];
    }
}
