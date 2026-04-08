<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionPresetRequest extends FormRequest
{
    public function authorize(): bool
    {
        $preset = $this->route('preset');
        return $this->user() && $this->user()->isOwner() && !$preset->is_system;
    }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['sometimes', 'required', 'array'],
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
