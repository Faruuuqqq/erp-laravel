<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminPermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isOwner();
    }

    public function rules(): array
    {
        return [
            'permissions' => ['required', 'array'],
        ];
    }
}
