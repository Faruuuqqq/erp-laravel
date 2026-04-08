<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActivityLog extends Model
{
    protected $fillable = [
        'admin_id',
        'action',
        'module',
        'entity_id',
        'old_data',
        'new_data',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    /**
     * Relationship: The admin who performed the action
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Static method to log an activity
     */
    public static function logActivity(
        User $admin,
        string $action,
        string $module,
        ?string $entityId = null,
        ?array $oldData = null,
        ?array $newData = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): self {
        return self::create([
            'admin_id' => $admin->id,
            'action' => $action,
            'module' => $module,
            'entity_id' => $entityId,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => $ipAddress ?? request()->ip(),
            'user_agent' => $userAgent ?? request()->userAgent(),
        ]);
    }
}

