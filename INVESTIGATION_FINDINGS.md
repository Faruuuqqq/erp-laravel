# Investigation Report: "Selected Status is Invalid" Error

## Overview
Complete investigation of the status validation error affecting Sales and Gudang pages.

---

## 1. ISSUE IDENTIFIED

### Error Message
```
"The selected status is invalid."
```

### Affected Features
- Sales (Master Data) → Add/Edit Sales Rep
- Gudang (Master Data) → Add/Edit Warehouse

### Root Cause
**Localization mismatch**: Frontend sends Indonesian status values ('aktif'/'nonaktif') but backend validates English values ('active'/'inactive').

---

## 2. BACKEND ANALYSIS

### 2.1 SalesRepController.php
**Location**: `D:\projectan\erp_laravel\backend\app\Http\Controllers\Api\SalesRepController.php`

**Store Method (Line 20-31)**:
```php
public function store(Request $request): JsonResponse
{
    $data = $request->validate([
        'name'    => ['required', 'string', 'max:100'],
        'phone'   => ['nullable', 'string', 'max:20'],
        'email'   => ['nullable', 'email'],
        'address' => ['nullable', 'string'],
        'status'  => ['nullable', 'in:active,inactive'],  // ← Line 27
    ]);
    // ...
}
```

**Update Method (Line 38-49)**:
```php
public function update(Request $request, SalesRep $sale): JsonResponse
{
    $data = $request->validate([
        'name'    => ['sometimes', 'required', 'string', 'max:100'],
        'phone'   => ['nullable', 'string', 'max:20'],
        'email'   => ['nullable', 'email'],
        'address' => ['nullable', 'string'],
        'status'  => ['nullable', 'in:active,inactive'],  // ← Line 45
    ]);
    // ...
}
```

**Validation Rule**: `in:active,inactive`
- Accepts: `'active'` or `'inactive'` (English)
- Rejects: `'aktif'` or `'nonaktif'` (Indonesian)

### 2.2 WarehouseController.php
**Location**: `D:\projectan\erp_laravel\backend\app\Http\Controllers\Api\WarehouseController.php`

**Store Method (Line 20-29)**:
```php
public function store(Request $request): JsonResponse
{
    $data = $request->validate([
        'name'    => ['required', 'string', 'max:100'],
        'address' => ['nullable', 'string'],
        'status'  => ['nullable', 'in:active,inactive'],  // ← Line 25
    ]);
    // ...
}
```

**Update Method (Line 36-45)**:
```php
public function update(Request $request, Warehouse $warehouse): JsonResponse
{
    $data = $request->validate([
        'name'    => ['sometimes', 'required', 'string', 'max:100'],
        'address' => ['nullable', 'string'],
        'status'  => ['nullable', 'in:active,inactive'],  // ← Line 41
    ]);
    // ...
}
```

**Validation Rule**: `in:active,inactive`
- Accepts: `'active'` or `'inactive'` (English)
- Rejects: `'aktif'` or `'nonaktif'` (Indonesian)

### 2.3 Database Schema

**Sales Reps Table**
**File**: `D:\projectan\erp_laravel\backend\database\migrations\2026_02_28_000040_create_parties_tables.php`

```php
Schema::create('sales_reps', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100)->index();
    $table->string('phone', 20)->nullable();
    $table->string('email')->nullable();
    $table->text('address')->nullable();
    $table->decimal('total_sales', 15, 2)->default(0);
    $table->enum('status', ['active', 'inactive'])->default('active');  // ← Line 42
    $table->softDeletes();
    $table->timestamps();
});
```

**Enum Definition**: `['active', 'inactive']`
- Allowed values: `'active'`, `'inactive'`
- Default: `'active'`

**Warehouses Table**
**File**: `D:\projectan\erp_laravel\backend\database\migrations\2026_02_28_000020_create_warehouses_table.php`

```php
Schema::create('warehouses', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100);
    $table->text('address')->nullable();
    $table->enum('status', ['active', 'inactive'])->default('active');  // ← Line 15
    $table->timestamps();
});
```

**Enum Definition**: `['active', 'inactive']`
- Allowed values: `'active'`, `'inactive'`
- Default: `'active'`

### 2.4 Models (No Transformation)

**SalesRep Model**
**File**: `D:\projectan\erp_laravel\backend\app\Models\SalesRep.php`

```php
class SalesRep extends Model
{
    use SoftDeletes;
    protected $table = 'sales_reps';
    protected $fillable = ['name', 'phone', 'email', 'address', 'status'];
}
```

No casts or transformations applied.

**Warehouse Model**
**File**: `D:\projectan\erp_laravel\backend\app\Models\Warehouse.php`

```php
class Warehouse extends Model
{
    protected $fillable = ['name', 'address', 'status'];
    // ...
}
```

No casts or transformations applied.

### 2.5 Current Database Values (Verified)

Using `php artisan tinker`:

**Sales Rep**:
```json
{
    "id": 1,
    "name": "Budi Santos",
    "status": "active",
    "created_at": "2026-04-11 08:38:00",
    "updated_at": "2026-04-11 12:27:09"
}
```

**Warehouse**:
```json
{
    "id": 1,
    "name": "Gudang Utama CC",
    "status": "active",
    "created_at": "2026-04-11 08:38:00",
    "updated_at": "2026-04-11 12:30:19"
}
```

**Conclusion**: Database stores `'active'` or `'inactive'` (English values).

---

## 3. FRONTEND ANALYSIS

### 3.1 Type Definitions (WRONG)

**File**: `D:\projectan\erp_laravel\frontend.v2\src\types\api.ts`

**Warehouse Interface (Lines 91-98)**:
```typescript
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  status: 'aktif' | 'nonaktif';  // ← WRONG! Backend stores 'active'/'inactive'
}
```

**SalesRep Interface (Lines 100-109)**:
```typescript
export interface SalesRep {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  area?: string;
  status?: 'aktif' | 'nonaktif';  // ← WRONG! Backend stores 'active'/'inactive'
  totalSales?: number;
}
```

**Problem**: Types expect Indonesian values but API returns English values.

### 3.2 Sales Page (WRONG)

**File**: `D:\projectan\erp_laravel\frontend.v2\src\pages\master\Sales.tsx`

**Form Initialization (Line 28)**:
```typescript
const BLANK_FORM = { name: '', phone: '', email: '', area: '', status: 'aktif' as 'aktif' | 'nonaktif' };
```

**Form Submission (Lines 58-76)**:
```typescript
const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, phone: form.phone, email: form.email, area: form.area, status: form.status };
    //                                                                                              ↑
    //                        Sends 'aktif' or 'nonaktif' → WRONG!
    try {
        if (editItem) {
            await updateMutation.mutateAsync({ id: editItem.id, data: payload });
            // ...
        } else {
            await createMutation.mutateAsync(payload);
            // ...
        }
    } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan data sales';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
};
```

**Status Select (Lines 212-218)**:
```typescript
<Select value={form.status} onValueChange={(v: 'aktif' | 'nonaktif') => setForm(p => ({ ...p, status: v }))}>
  <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="aktif">Aktif</SelectItem>          // ← User sees "Aktif"
    <SelectItem value="nonaktif">Nonaktif</SelectItem>    // ← User sees "Nonaktif"
  </SelectContent>
</Select>
```

**Problem**: Form sends `'aktif'` or `'nonaktif'` directly to API without conversion.

### 3.3 Gudang Page (WRONG)

**File**: `D:\projectan\erp_laravel\frontend.v2\src\pages\master\Gudang.tsx`

**Form Interface (Lines 25-30)**:
```typescript
interface WarehouseForm {
  name: string;
  address: string;
  manager: string;
  status: 'aktif' | 'nonaktif';  // ← WRONG!
}

const BLANK_FORM = (): WarehouseForm => ({ name: '', address: '', manager: '', status: 'aktif' });
```

**Form Submission (Lines 60-77)**:
```typescript
const handleSave = useCallback(async () => {
    if (!form.name.trim()) return toast({ title: 'Nama gudang harus diisi', variant: 'destructive' });
    try {
        if (editId) {
            await updateWh.mutateAsync({ id: editI
