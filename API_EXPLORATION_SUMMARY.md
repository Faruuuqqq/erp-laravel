# API Structure Exploration - Executive Summary

## Overview
This document summarizes the complete exploration of the Laravel backend API structure, including current endpoints, their capabilities, and where to implement new filtering features.

## Key Findings

### Current API Architecture
- **Framework**: Laravel 11 with RESTful design
- **Response Format**: JSON with standardized pagination
- **Database**: Features soft deletes, indexed columns, and eager loading optimization
- **Search**: Implemented via model scopes across most resources
- **Filtering**: Limited - only type/status for transactions, search for text fields

### Core API Endpoints (6 Master Data Resources)

| Endpoint | Search | Pagination | Status | Category | Warehouse | Date Filter |
|----------|--------|-----------|--------|----------|-----------|-------------|
| `/api/categories` | ✗ | ✗ | ✗ | N/A | ✗ | ✗ |
| `/api/products` | ✓ (name/code) | ✓ | ✗ | ✓ (by name) | ✓ (by ID) | ✗ |
| `/api/customers` | ✓ (name/phone) | ✓ | ✗ | ✗ | ✗ | ✗ |
| `/api/suppliers` | ✓ (name/phone) | ✓ | ✗ | ✗ | ✗ | ✗ |
| `/api/warehouses` | ✓ (name) | ✓ | ✓ (exists) | ✗ | N/A | ✗ |
| `/api/sales` | ✓ (name) | ✓ | ✓ (exists) | ✗ | ✗ | ✗ |
| `/api/transactions` | ✓ (invoice) | ✓ | ✓ | ✗ | ✗ | ✓ (from/to) |

---

## 1. CURRENT QUERY PARAMETER SUPPORT

### Universally Supported Parameters
- `perPage`: integer (default 50) - controls pagination size

### Endpoint-Specific Parameters

**Products (`GET /api/products`)**
```
?search=value           # Search by name or code
?category=name          # Filter by category name
?warehouseId=1          # Filter by warehouse ID
?perPage=50             # Pagination size
```

**Customers/Suppliers (`GET /api/customers`, `GET /api/suppliers`)**
```
?search=value           # Search by name or phone
?perPage=50             # Pagination size
```

**Warehouses/SalesReps (`GET /api/warehouses`, `GET /api/sales`)**
```
?search=value           # Search by name
?perPage=50             # Pagination size
# Status filtering exists but not exposed in controller
```

**Transactions (`GET /api/transactions`)**
```
?search=value           # Search by invoice number
?type=pembelian         # Filter by transaction type
?status=completed       # Filter by status
?from=2026-04-01        # Start date filter
?to=2026-04-30          # End date filter
?perPage=25             # Pagination size
```

---

## 2. REQUEST/RESPONSE HANDLER STRUCTURE

### Standard Controller Pattern
All controllers follow the same flow:

```
1. INDEX (GET /api/resource)
   → Build query with relationships
   → Apply search scope
   → Apply additional filters
   → Sort by latest
   → Paginate
   → Return transformed collection

2. STORE (POST /api/resource)
   → Validate request
   → Create model
   → Return 201 with resource

3. SHOW (GET /api/resource/{id})
   → Get model
   → Return single resource

4. UPDATE (PUT /api/resource/{id})
   → Validate request
   → Update model
   → Return updated resource

5. DESTROY (DELETE /api/resource/{id})
   → Delete model (soft delete)
   → Return success message
```

### Response Structure
**Paginated Endpoint:**
```json
{
  "data": [
    { /* resource */ },
    { /* resource */ }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 50,
    "total": 500
  }
}
```

**Single Resource:**
```json
{
  "data": { /* resource */ },
  "message": "Success message"
}
```

### Model Scope Pattern (for reusable query logic)
All models implement a `search()` scope:
```php
public function scopeSearch($query, ?string $search)
{
    if ($search) {
        return $query->where('name', 'like', "%{$search}%");
    }
    return $query;
}
```

### Resource Transformation
All responses use Resource classes to transform models:
- Converts underscored database fields to camelCase
- Eager loads and includes relationships
- Calculates aggregate data (e.g., totalTransactions)

---

## 3. WHERE TO ADD FILTERS

### Priority 1: Status Filters (Easiest - Column Already Exists)

**Warehouses** - Add to controller `index()` method:
```php
->when($request->status, fn($q) => $q->where('status', $request->status))
```

**SalesReps** - Same pattern, column already exists

**Products** - Would require adding status column via migration first

### Priority 2: Category ID Filter (Already Partially Implemented)

**Products** - Currently filters by category **name**, should add ID support:
- File: `app/Http/Controllers/Api/ProductController.php` (line 23-25)
- Change: Accept `categoryId` parameter instead of just `category`
- Add model scope: `byCategoryId($query, $categoryId)`

### Priority 3: Warehouse Filter for Other Resources

**Products** - Already implemented with `warehouseId` parameter

**Other Resources** - Not applicable (warehouse is separate resource)

---

## 4. DATABASE QUERIES AND FILTERING

### Query Execution Flow
```
HTTP Request with ?param=value
    ↓
Controller receives Request object
    ↓
Query Builder starts: Model::with(['relationships'])
    ↓
Apply scopes: ->search($request->search)
    ↓
Apply filters: ->when($request->status, fn($q) => ...)
    ↓
Apply sorting: ->latest()
    ↓
Apply pagination: ->paginate($perPage)
    ↓
Eloquent executes SQL query
    ↓
Transform models: ResourceClass::collection($models)
    ↓
Return JSON response with 'data' and 'meta'
```

### Database Indexes (Already Present)
- `products.code` - unique, indexed
- `products.name` - indexed
- `products.category_id` - foreign key, auto-indexed
- `products.warehouse_id` - foreign key, auto-indexed
- `customers.name`, `suppliers.name`, `sales_reps.name` - indexed
- `transactions.invoice_number` - unique, indexed

### Columns NOT Currently Indexed (Performance Risk)
- `transactions.type` - frequently filtered
- `transactions.status` - frequently filtered
- `transactions.date` - used for range queries
- `warehouses.status` - could benefit from index
- `sales_reps.status` - could benefit from index

---

## 5. IMPLEMENTATION LOCATIONS

### Controller Files (Where filtering logic goes)
```
backend/app/Http/Controllers/Api/
├── ProductController.php          ← Add categoryId filter logic here
├── WarehouseController.php         ← Add status filter logic here
├── SalesRepController.php          ← Add status filter logic here
├── CustomerController.php          ← Could add status filter
├── SupplierController.php          ← Could add status filter
└── TransactionController.php       ← Already has type/status/date filters
```

### Model Files (Where query scopes go)
```
backend/app/Models/
├── Product.php                    ← Add byCategoryId scope
├── Warehouse.php                  ← Add byStatus scope
├── SalesRep.php                   ← Add byStatus scope
├── Customer.php                   ← Could add byStatus scope
└── Supplier.php                   ← Could add byStatus scope
```

### Resource Files (Response formatting - already good)
```
backend/app/Http/Resources/
├── ProductResource.php            ← Already transforms data well
├── WarehouseResource.php
├── SalesRepResource.php
├── CustomerResource.php
└── SupplierResource.php
```

### Validation Files (Optional but recommended)
```
backend/app/Http/Requests/Api/
├── FilterProductRequest.php       ← Create for categoryId validation
└── FilterWarehouseRequest.php     ← Create for status validation
```

---

## 6. IMMEDIATE ACTION ITEMS

### Quick Win (5 minutes per endpoint)
1. **Expose Warehouse status filter**
   - File: `WarehouseController.php`
   - Change: Add `->when($request->status, fn($q) => $q->where('status', $request->status))`
   - Test: `GET /api/warehouses?status=active`

2. **Expose SalesReps status filter**
   - File: `SalesRepController.php`
   - Same pattern as warehouses
   - Test: `GET /api/sales?status=active`

### Medium Priority (15-30 minutes)
3. **Add categoryId parameter to Products**
   - File: `ProductController.php`
   - Add: `->when($request->categoryId, fn($q) => $q->where('category_id', $request->categoryId))`
   - Keep existing `category` param for backward compatibility
   - Test: `GET /api/products?categoryId=1`

4. **A
