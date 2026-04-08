<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StorePermissionPresetRequest;
use App\Http\Requests\Api\UpdatePermissionPresetRequest;
use App\Http\Resources\PermissionPresetResource;
use App\Models\PermissionPreset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionPresetController extends Controller
{
    /**
     * Display a listing of presets - system presets + user's custom presets
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', PermissionPreset::class);

        $presets = PermissionPreset::where('is_system', true)
            ->orWhere('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => PermissionPresetResource::collection($presets)]);
    }

    /**
     * Store a newly created preset
     */
    public function store(StorePermissionPresetRequest $request): JsonResponse
    {
        $preset = $request->user()->permissionPresets()->create([
            'name'        => $request->name,
            'slug'        => $this->generateUniqueSlug($request->name, $request->user()->id),
            'description' => $request->description,
            'permissions' => $request->permissions,
            'is_system'   => false,
        ]);

        return response()->json(['data' => new PermissionPresetResource($preset), 'message' => 'Preset berhasil dibuat.'], 201);
    }

    /**
     * Display the specified preset
     */
    public function show(PermissionPreset $preset): JsonResponse
    {
        $this->authorize('view', $preset);
        return response()->json(['data' => new PermissionPresetResource($preset)]);
    }

    /**
     * Update the specified preset
     */
    public function update(UpdatePermissionPresetRequest $request, PermissionPreset $preset): JsonResponse
    {
        $preset->update($request->validated());

        return response()->json(['data' => new PermissionPresetResource($preset), 'message' => 'Preset berhasil diperbarui.']);
    }

    /**
     * Remove the specified preset (cannot delete system presets)
     */
    public function destroy(PermissionPreset $preset): JsonResponse
    {
        $this->authorize('delete', $preset);

        if ($preset->is_system) {
            return response()->json(['message' => 'Tidak dapat menghapus system preset.'], 403);
        }

        $preset->delete();

        return response()->json(['message' => 'Preset berhasil dihapus.']);
    }

    /**
     * Duplicate a preset
     */
    public function duplicate(Request $request, PermissionPreset $preset): JsonResponse
    {
        $this->authorize('view', $preset);

        $newPreset = $request->user()->permissionPresets()->create([
            'name'        => $preset->name . ' (Copy)',
            'slug'        => $this->generateUniqueSlug($preset->name . ' Copy', $request->user()->id),
            'description' => $preset->description,
            'permissions' => $preset->permissions,
            'is_system'   => false,
        ]);

        return response()->json(['data' => new PermissionPresetResource($newPreset), 'message' => 'Preset berhasil diduplikasi.'], 201);
    }

    /**
     * Generate unique slug for preset
     */
    private function generateUniqueSlug(string $name, int $userId): string
    {
        $slug = \Illuminate\Support\Str::slug($name);
        $original = $slug;
        $counter = 1;

        while (PermissionPreset::where('user_id', $userId)->where('slug', $slug)->exists()) {
            $slug = "{$original}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
