# Quick Implementation Guide: Adding Filters to Laravel API

## Quick Reference: Where to Add Each Filter

### 1. STATUS FILTER (`?status=active|inactive`)

#### Step 1: Update Controller
File: `backend/app/Http/Controllers/Api/WarehouseController.php`

```php
public function index(Request $request)
{
    $warehouses = Warehouse::when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
        ->when($request->status, fn($q) => $q->where('status', $request->status))  // ADD THIS LINE
        ->latest()->paginate($request->perPage ?? 50);
    return WarehouseResource::collection($warehouses);
}
```

**Same pattern applies to:**
- `SalesRepController.php` (already has status column)
- `ProductController.php` (if adding status column)
- `CustomerController.php` (if adding status column)
- `SupplierController.php` (if adding status column)

#### Step 2 (Optional): Add Model Scope
File: `backend/app/Models/Warehouse.php`

```php
public function scopeByStatus($query, ?string $status)
{
    if ($status && in_array($status, ['active', 'inactive'])) {
        return $query->where('status', $status);
    }
    return $query;
}
```

Then use in controller:
```php
$warehouses = Warehouse::search($request->search)
    ->byStatus($request->status)
    ->latest()
    ->paginate($request->perPage ?? 50);
```

#### Step 3 (Optional): Add Request Validation
Create: `backend/app/Http/Requests/Api/FilterWarehouseRequest.php`

```php
<?php
namespace App\Http\Requests\Api;
use Illuminate\Foundation\Http\FormRequest;

class FilterWarehouseRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:active,inactive'],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
```

---

### 2. CATEGORY_ID FILTER (`?category_id=1`)

#### Current State
Products already support category filtering, but by **name** (`?category=Electronics`)

#### Enhancement: Change to ID-based

File: `backend/app/Http/Controllers/Api/ProductController.php`

**Before:**
```php
if ($request->category) {
    $query->whereHas('category', fn($q) => $q->where('name', $request->category));
}
```

**After:**
```php
if ($request->categoryId) {
    $query->where('category_id', $request->categoryId);
}
```

**Or keep both for backward compatibility:**
```php
if ($request->categoryId) {
    $query->where('category_id', $request->categoryId);
} elseif ($request->category) {
    $query->whereHas('category', fn($q) => $q->where('name', $request->category));
}
```

#### Add Model Scope
File: `backend/app/Models/Product.php`

```php
public function scopeByCategoryId($query, ?int $categoryId)
{
    if ($categoryId) {
        return $query->where('category_id', $categoryId);
    }
    return $query;
}
```

#### Usage in Controller
```php
$products = Product::with(['category', 'warehouse'])
    ->search($request->search)
    ->byCategoryId($request->categoryId)
    ->byWarehouse($request->warehouseId)
    ->latest()
    ->paginate($request->perPage ?? 50);
```

---

### 3. WAREHOUSE_ID FILTER (`?warehouse_id=1`)

#### Current State
**Already implemented for Products!**

File: `backend/app/Http/Controllers/Api/ProductController.php`
```php
if ($request->warehouseId) {
    $query->where('warehouse_id', $request->warehouseId);
}
```

#### To Use:
```
GET /api/products?warehouseId=1
GET /api/products?search=laptop&warehouseId=1&category=Electronics
```

---

## Implementation Checklist

### For Simple Status Filter (Recommended Approach)

- [ ] Identify target controller (e.g., `WarehouseController`)
- [ ] Add one line in controller's `index()` method:
  ```php
  ->when($request->status, fn($q) => $q->where('status', $request->status))
  ```
- [ ] Test endpoint: `GET /api/warehouses?status=active`
- [ ] Verify database column exists in migration
- [ ] Add database index if needed (performance)

### For Complex Filtering (Best Practice)

- [ ] Create model scope in Model class
- [ ] Update controller to use scope
- [ ] Create/update Request validation class
- [ ] Test with various parameter combinations
- [ ] Document in API documentation
- [ ] Add database indexes for filtered columns

---

## Database Index Recommendations

To improve filter performance, add indexes in migrations:

```php
// In migration file - add to existing table or create new migration
Schema::table('warehouses', function (Blueprint $table) {
    $table->index('status');  // If not already indexed
});

Schema::table('products', function (Blueprint $table) {
    $table->index('category_id');
    $table->index('warehouse_id');
});

Schema::table('sales_reps', function (Blueprint $table) {
    $table->index('status');
});
```

Run: `php artisan migrate`

---

## Testing Your Filters

### Using Laravel Tinker
```bash
php artisan tinker
> Warehouse::where('status', 'active')->count()
> Product::where('warehouse_id', 1)->count()
```

### Using Postman/cURL
```bash
# Test status filter
curl "http://localhost:8000/api/warehouses?status=active"

# Test category filter
curl "http://localhost:8000/api/products?categoryId=1"

# Test warehouse filter
curl "http://localhost:8000/api/products?warehouseId=1"

# Combine filters
curl "http://localhost:8000/api/products?search=laptop&categoryId=1&warehouseId=1&status=active"
```

---

## Response Structure

All filtered endpoints return the same structure:

```json
{
  "data": [
    { /* resource object */ },
    { /* resource object */ }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 50,
    "total": 500,
    "from": 1,
    "to": 50
  }
}
```

---

## Common Issues & Solutions

### Issue: Filter not working
**Solution**: Verify column exists in database
```php
php artisan tinker
> Schema::hasColumn('warehouses', 'status')  // Should return true
```

### Issue: N+1 Query Problem
**Solution**: Use eager loading
```php
// In controller index method
$resources = Model::with(['relationship'])  // Eager load
    ->where('status', 'active')
    ->get();
```

### Issue: Performance degradation with large datasets
**Solution**: Add database index
```php
// In migration
$table->index('status');  // Add index to frequently filtered columns
```

---

## File Locations Quick Reference

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── ProductController.php        ← Add category_id filter here
│   │   │   ├── WarehouseController.php      ← Add status filter here
│   │   │   ├── SalesRepController.php       ← Add status filter here
│   │   │   ├── CustomerController.php       ← Could add status filter
│   │   │   └── SupplierController.php       ← Could add status filter
│   │   └── Requests/Api/
│   │       ├── FilterProductRequest.php     ← Create for validation
│   │       └── FilterWarehouseRequest.php   ← Create for validation
│   └── Models/
│       ├── Product.php                      ← Add byCategoryId scope
│       ├── Warehouse.php                    ← Add byStatus scope
│       ├── SalesRep.php                     ← Add byStatus scope
│       ├── Customer.php                     ← Could add byStatus scope
│       └── Supplier.php                     ← Could add byStatus scope
└── database/
    └── migrations/
        ├── 2026_02_28_000030_create_products_table.php
        ├── 2026_02_28_000020_create_warehouses_table.php
        └── [existing indexes already present]
```

---

## Complete Example: Add Status Filter to Warehouses

### 1. Model Enhancement (`app/Models/Warehouse.php`)
```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    protected $fillable = ['name', 'address', 'status'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Add this scope
    public function scopeByStatus($query, ?string $status)
    {
        if ($status && in_array($status, ['active', 'inactive'])) {
            return $query->where(
