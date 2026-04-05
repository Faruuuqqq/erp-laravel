<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'permissions'       => 'array',
        ];
    }

    public function scopeOwners($query)
    {
        return $query->where('role', 'owner');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasPermission(string $module, string $action): bool
    {
        if ($this->isOwner()) {
            return true;
        }

        $permissions = $this->permissions ?? [];
        return ($permissions[$module][$action] ?? false) === true;
    }

    public function hasAnyPermission(string $module): bool
    {
        if ($this->isOwner()) {
            return true;
        }

        $permissions = $this->permissions ?? [];
        if (!isset($permissions[$module])) {
            return false;
        }

        foreach ($permissions[$module] as $allowed) {
            if ($allowed) {
                return true;
            }
        }

        return false;
    }

    public function getDefaultPermissions(): array
    {
        return [
            'products' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => true],
            'categories' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => false],
            'warehouses' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => false],
            'suppliers' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => true],
            'customers' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => true],
            'sales_reps' => ['view' => true, 'create' => true, 'update' => true, 'delete' => false, 'print' => false],
            'transactions' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.purchase' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.cash_sale' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.credit_sale' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.payable' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.receivable' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.return_purchase' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.return_sale' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.delivery_note' => ['view' => true, 'create' => true, 'update' => false, 'delete' => false, 'print' => true],
            'transactions.kontra_bon' => ['view' => true, 'create' => false, 'update' => false, 'delete' => false, 'print' => true],
            'reports' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'reports.daily' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'reports.stock' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'reports.balance' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'info' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'info.piutang' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'info.utang' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'info.stok' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'info.kartu_stok' => ['view' => false, 'create' => false, 'update' => false, 'delete' => false, 'print' => false],
            'settings' => ['view' => true, 'create' => false, 'update' => true, 'delete' => false, 'print' => false],
        ];
    }
}
