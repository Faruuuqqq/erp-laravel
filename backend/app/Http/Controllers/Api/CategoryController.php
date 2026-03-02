<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);
        return response()->json([
            'data' => $categories->map(fn($c) => ['id' => (string) $c->id, 'name' => $c->name]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:categories,name'],
        ], [
            'name.unique' => 'Kategori sudah ada.',
        ]);
        $category = Category::create($data);
        return response()->json(['data' => ['id' => (string) $category->id, 'name' => $category->name], 'message' => 'Kategori berhasil ditambahkan.'], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50', "unique:categories,name,{$category->id}"],
        ]);
        $category->update($data);
        return response()->json(['data' => ['id' => (string) $category->id, 'name' => $category->name], 'message' => 'Kategori berhasil diperbarui.']);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
