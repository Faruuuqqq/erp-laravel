<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => (string) $this->id,
            'code'        => $this->code,
            'date'        => $this->date?->format('Y-m-d'),
            'category'    => $this->category,
            'description' => $this->description,
            'amount'      => (float) $this->amount,
            'createdBy'   => $this->whenLoaded('creator', fn() => $this->creator?->name),
            'createdAt'   => $this->created_at?->toISOString(),
            'updatedAt'   => $this->updated_at?->toISOString(),
        ];
    }
}
