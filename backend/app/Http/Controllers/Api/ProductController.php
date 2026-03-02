<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreProductRequest;
use App\Http\Requests\Api\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request): ResourceCollection
    {
        $query = Product::with(['category', 'warehouse'])
            ->search($request->search);

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('name', $request->category));
        }
        if ($request->warehouseId) {
            $query->where('warehouse_id', $request->warehouseId);
        }

        $products = $query->latest()->paginate($request->perPage ?? 50);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $category = Category::where('name', $request->category)->firstOrCreate(['name' => $request->category]);

        $product = Product::create([
            'code'         => $request->code,
            'name'         => $request->name,
            'category_id'  => $category->id,
            'buy_price'    => $request->buyPrice,
            'sell_price'   => $request->sellPrice,
            'stock'        => $request->stock,
            'min_stock'    => $request->minStock,
            'unit'         => $request->unit,
            'warehouse_id' => $request->warehouseId,
        ]);

        return response()->json([
            'data'    => new ProductResource($product->load('category')),
            'message' => 'Produk berhasil ditambahkan.',
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => new ProductResource($product->load(['category', 'warehouse']))]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = [];

        if ($request->has('category')) {
            $category = Category::where('name', $request->category)->firstOrCreate(['name' => $request->category]);
            $data['category_id'] = $category->id;
        }

        $fieldMap = [
            'code'        => 'code',
            'name'        => 'name',
            'buyPrice'    => 'buy_price',
            'sellPrice'   => 'sell_price',
            'stock'       => 'stock',
            'minStock'    => 'min_stock',
            'unit'        => 'unit',
            'warehouseId' => 'warehouse_id',
        ];

        foreach ($fieldMap as $input => $column) {
            if ($request->has($input)) {
                $data[$column] = $request->input($input);
            }
        }

        $product->update($data);

        return response()->json([
            'data'    => new ProductResource($product->fresh(['category', 'warehouse'])),
            'message' => 'Produk berhasil diperbarui.',
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete(); // SoftDelete

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    /**
     * PATCH /api/products/{product}/stock
     * Update stok manual (penyesuaian inventaris).
     */
    public function updateStock(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $product->update(['stock' => $validated['stock']]);

        return response()->json([
            'data'    => new ProductResource($product->fresh('category')),
            'message' => 'Stok berhasil diperbarui.',
        ]);
    }
}
