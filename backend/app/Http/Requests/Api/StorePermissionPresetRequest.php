<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionPresetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['required', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Nama preset wajib diisi.',
            'permissions.required' => 'Permissions wajib diisi.',
        ];
    }
}
