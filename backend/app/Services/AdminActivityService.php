<?php

namespace App\Services;

use App\Models\AdminActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class AdminActivityService
{
    /**
     * Log admin creation
     */
    public static function logAdminCreated(User $admin, array $newData): void
    {
        AdminActivityLog::logActivity(
            auth()->user(),
            'create',
            'admin',
            (string) $admin->id,
            null,
            self::sanitizeData($newData),
        );
    }

    /**
     * Log admin update
     */
    public static function logAdminUpdated(User $admin, array $oldData, array $newData): void
    {
        AdminActivityLog::logActivity(
            auth()->user(),
            'update',
            'admin',
            (string) $admin->id,
            self::sanitizeData($oldData),
            self::sanitizeData($newData),
        );
    }

    /**
     * Log admin permission update
     */
    public static function logAdminPermissionsUpdated(User $admin, array $oldPermissions, array $newPermissions): void
    {
        AdminActivityLog::logActivity(
            auth()->user(),
            'update_permissions',
            'admin',
            (string) $admin->id,
            ['permissions' => $oldPermissions],
            ['permissions' => $newPermissions],
        );
    }

    /**
     * Log admin active status toggle
     */
    public static function logAdminToggleActive(User $admin, bool $previousStatus, bool $newStatus): void
    {
        AdminActivityLog::logActivity(
            auth()->user(),
            'toggle_active',
            'admin',
            (string) $admin->id,
            ['is_active' => $previousStatus],
            ['is_active' => $newStatus],
        );
    }

    /**
     * Log admin password reset
     */
    public static function logAdminPasswordReset(User $admin): void
    {
        AdminActivityLog::logActivity(
            auth()->user(),
            'reset_password',
            'admin',
            (string) $admin->id,
            null,
            ['temp_password_expires_at' => $admin->temp_password_expires_at],
        );
    }

    /**
     * Log admin deletion
     */
    public static function logAdminDeleted(User $admin, array $adminData): void
    {
        AdminActivityLog::logActivity(
            auth()->user(),
            'delete',
            'admin',
            (string) $admin->id,
            self::sanitizeData($adminData),
            null,
        );
    }

    /**
     * Sanitize data to exclude sensitive fields
     */
    private static function sanitizeData(array $data): array
    {
        $sensitive = ['password', 'temp_password', 'remember_token'];
        
        foreach ($sensitive as $field) {
            if (isset($data[$field])) {
                $data[$field] = '[REDACTED]';
            }
        }
        
        return $data;
    }
}
