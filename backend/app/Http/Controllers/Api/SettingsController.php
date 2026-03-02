<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get all settings for current user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get settings for this user
        $settings = Setting::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->get()
            ->groupBy('group')
            ->map(function ($items) {
                return $items->mapWithKeys(function ($item) {
                    return [$item->key => $item->value];
                });
            });
        
        // Merge with user data
        $profile = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
        
        return response()->json([
            'data' => [
                'profile' => $profile,
                'store' => $settings['store'] ?? $this->getDefaultStoreSettings(),
                'notifications' => $settings['notifications'] ?? $this->getDefaultNotificationSettings(),
            ]
        ]);
    }

    /**
     * Update profile settings
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        
        // Check if email already exists for another user
        if ($request->email !== $user->email) {
            $exists = User::where('email', $request->email)
                ->where('id', '!=', $user->id)
                ->exists();
            
            if ($exists) {
                return response()->json([
                    'errors' => ['email' => ['Email sudah digunakan oleh user lain.']]
                ], 422);
            }
        }

        $user->update($request->only(['name', 'email']));

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Update store settings
     */
    public function updateStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'store_name' => 'required|string|max:200',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'npwp' => 'nullable|string|max:50',
            'siup' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Store settings per user
        foreach ($request->only(['store_name', 'phone', 'address', 'npwp', 'siup']) as $key => $value) {
            Setting::updateOrCreate(
                [
                    'key' => $key,
                    'user_id' => $user->id,
                ],
                [
                    'value' => $value,
                    'group' => 'store',
                    'type' => 'string',
                ]
            );
        }

        return response()->json(['message' => 'Informasi toko berhasil diperbarui.']);
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['Password saat ini tidak sesuai.']]
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    /**
     * Update notification settings
     */
    public function updateNotifications(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'low_stock_alert' => 'boolean',
            'receivable_due_alert' => 'boolean',
            'daily_report' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        foreach ($request->only(['low_stock_alert', 'receivable_due_alert', 'daily_report']) as $key => $value) {
            Setting::updateOrCreate(
                [
                    'key' => $key,
                    'user_id' => $user->id,
                ],
                [
                    'value' => (bool) $value,
                    'group' => 'notifications',
                    'type' => 'boolean',
                ]
            );
        }

        return response()->json(['message' => 'Pengaturan notifikasi berhasil diperbarui.']);
    }

    /**
     * Get default store settings
     */
    private function getDefaultStoreSettings(): array
    {
        return [
            'store_name' => 'Toko Sejahtera',
            'phone' => '',
            'address' => '',
            'npwp' => '',
            'siup' => '',
        ];
    }

    /**
     * Get default notification settings
     */
    private function getDefaultNotificationSettings(): array
    {
        return [
            'low_stock_alert' => true,
            'receivable_due_alert' => true,
            'daily_report' => false,
        ];
    }
}
