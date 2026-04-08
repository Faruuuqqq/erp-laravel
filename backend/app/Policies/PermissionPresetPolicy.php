<?php

namespace App\Policies;

use App\Models\PermissionPreset;
use App\Models\User;

class PermissionPresetPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isOwner();
    }

    public function view(User $user, PermissionPreset $permissionPreset): bool
    {
        return $user->isOwner() && ($permissionPreset->is_system || $permissionPreset->user_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->isOwner();
    }

    public function update(User $user, PermissionPreset $permissionPreset): bool
    {
        return $user->isOwner() && $permissionPreset->user_id === $user->id && !$permissionPreset->is_system;
    }

    public function delete(User $user, PermissionPreset $permissionPreset): bool
    {
        return $user->isOwner() && $permissionPreset->user_id === $user->id && !$permissionPreset->is_system;
    }

    public function restore(User $user, PermissionPreset $permissionPreset): bool
    {
        return false;
    }

    public function forceDelete(User $user, PermissionPreset $permissionPreset): bool
    {
        return false;
    }
}
