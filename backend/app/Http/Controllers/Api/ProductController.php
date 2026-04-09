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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    private const CACHE_TTL = 3600; // 1 hour

    public function index(Request $request): ResourceCollection
    {
        $query = Product::with(['category:id,name', 'warehouse:id,name'])
            ->select([
                'id', 'code', 'name', 'category_id', 'buy_price', 
                'sell_price', 'stock', 'min_stock', 'unit', 'warehouse_id',
                'total_sales', 'avg_daily_sales', 'days_of_stock', 'created_at'
            ])
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
        $category = Category::firstOrCreate(
            ['name' => $request->category],
            ['user_id' => auth()->user()->id]
        );

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

        Cache::forget('categories_' . auth()->user()->id);
        Cache::forget('products_count');

        return response()->json([
            'data'    => new ProductResource($product->load('category')),
            'message' => 'Produk berhasil ditambahkan.',
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'warehouse']);
        return response()->json(['data' => new ProductResource($product)]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = [];

        if ($request->has('category')) {
            $category = Category::firstOrCreate(
                ['name' => $request->category],
                ['user_id' => auth()->user()->id]
            );
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

        Cache::forget('categories_' . auth()->user()->id);
        Cache::forget('products_count');

        return response()->json([
            'data'    => new ProductResource($product->fresh(['category', 'warehouse'])),
            'message' => 'Produk berhasil diperbarui.',
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        Cache::forget('products_count');

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    public function updateStock(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $product->update(['stock' => $validated['stock']]);

        Cache::forget('products_count');

        return response()->json([
            'data'    => new ProductResource($product->fresh('category')),
            'message' => 'Stok berhasil diperbarui.',
        ]);
    }
}
