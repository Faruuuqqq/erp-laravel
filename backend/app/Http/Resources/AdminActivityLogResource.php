<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminActivityLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'adminId' => $this->admin_id,
            'adminName' => $this->admin?->name,
            'action' => $this->action,
            'module' => $this->module,
            'entityId' => $this->entity_id,
            'oldData' => $this->old_data,
            'newData' => $this->new_data,
            'ipAddress' => $this->ip_address,
            'userAgent' => $this->user_agent,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
