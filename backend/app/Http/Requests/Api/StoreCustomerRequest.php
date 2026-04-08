<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
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
            // Basic Information
            'customer_id'         => ['required', 'string', 'max:50', 'unique:customers,customer_id'],
            'name'                => ['required', 'string', 'min:2', 'max:100'],
            'phone'               => ['nullable', 'string', 'max:20'],
            'phone_2'             => ['nullable', 'string', 'max:20'],
            'email'               => ['nullable', 'email', 'max:255'],
            'address'             => ['nullable', 'string'],
            'city'                => ['nullable', 'string', 'max:100'],

            // Tax & Identification
            'npwp'                => ['nullable', 'string', 'max:20', 'unique:customers,npwp'],

            // Contact Information
            'contact_person'      => ['nullable', 'string', 'max:100'],

            // Bank Information
            'bank_name'           => ['nullable', 'string', 'max:100'],
            'bank_account'        => ['nullable', 'string', 'max:50'],
            'account_holder'      => ['nullable', 'string', 'max:100'],

            // Warehouse Relationship
            'warehouse_id'        => ['nullable', 'exists:warehouses,id'],

            // Financial
            'balance'             => ['nullable', 'numeric', 'min:0'],
            'credit_limit'        => ['nullable', 'numeric', 'min:0'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount'     => ['nullable', 'numeric', 'min:0'],

            // Operational Details
            'operational_hours'   => ['nullable', 'string'],
            'notes'               => ['nullable', 'string'],

            // Status
            'is_verified'         => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'customer_id.required'    => 'ID Customer wajib diisi.',
            'customer_id.unique'      => 'ID Customer sudah digunakan.',
            'name.required'           => 'Nama customer wajib diisi.',
            'npwp.unique'             => 'NPWP sudah terdaftar.',
            'warehouse_id.exists'     => 'Warehouse yang dipilih tidak valid.',
        ];
    }
}
