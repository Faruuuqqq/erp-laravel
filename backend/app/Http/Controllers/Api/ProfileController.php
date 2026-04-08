<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile
     */
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => new UserResource(auth()->user()),
        ]);
    }

    /**
     * Update the authenticated user's profile information
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . auth()->id(),
            'phone' => 'nullable|string|max:20',
        ]);

        $user = auth()->user();
        $user->update($validated);

        return response()->json([
            'data' => new UserResource($user->fresh()),
            'message' => 'Profil berhasil diperbarui.',
        ]);
    }

    /**
     * Change the authenticated user's password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:6|confirmed',
        ]);

        $user = auth()->user();

        // Verify current password
        if (!Hash::check($validated['currentPassword'], $user->password)) {
            throw ValidationException::withMessages([
                'currentPassword' => 'Password saat ini tidak sesuai.',
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['newPassword']),
        ]);

        return response()->json([
            'data' => new UserResource($user->fresh()),
            'message' => 'Password berhasil diubah.',
        ]);
    }
}
