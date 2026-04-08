<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionPresetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => (string) $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'permissions' => $this->permissions,
            'isSystem'    => $this->is_system,
            'createdAt'   => $this->created_at?->toISOString(),
            'updatedAt'   => $this->updated_at?->toISOString(),
        ];
    }
}
