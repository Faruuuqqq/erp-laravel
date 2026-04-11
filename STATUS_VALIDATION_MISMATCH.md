# "Selected Status is Invalid" Error Investigation Report

## Executive Summary
The error occurs because there's a **mismatch between frontend and backend status values**:
- **Frontend sends**: `'aktif'` or `'nonaktif'` (Indonesian)
- **Backend expects**: `'active'` or `'inactive'` (English)
- **Database stores**: `'active'` or `'inactive'` (enum values)

## Detailed Findings

### 1. Backend Validation (Controllers)

#### SalesRepController.php (Lines 27 & 45)
```php
'status' => ['nullable', 'in:active,inactive'],
```
**Accepted values**: `active`, `inactive` (English)

#### WarehouseController.php (Lines 25 & 41)
```php
'status' => ['nullable', 'in:active,inactive'],
```
**Accepted values**: `active`, `inactive` (English)

### 2. Database Schema (Migrations)

#### sales_reps table (2026_02_28_000040_create_parties_tables.php, Line 42)
```php
$table->enum('status', ['active', 'inactive'])->default('active');
```
**Database enum**: `['active', 'inactive']`
**Default value**: `'active'`

#### warehouses table (2026_02_28_000020_create_warehouses_table.php, Line 15)
```php
$table->enum('status', ['active', 'inactive'])->default('active');
```
**Database enum**: `['active', 'inactive']`
**Default value**: `'active'`

### 3. Actual Database Values
```
Sales_reps.status = "active" (verified via tinker)
Warehouses.status = "active" (verified via tinker)
```

### 4. Frontend Type Definitions (src/types/api.ts)

#### Warehouse interface (Lines 91-98)
```typescript
export interface Warehouse {
  status: 'aktif' | 'nonaktif';  // Indonesian values
}
```

#### SalesRep interface (Lines 100-109)
```typescript
export interface SalesRep {
  status?: 'aktif' | 'nonaktif';  // Indonesian values
}
```

### 5. Frontend Pages Sending Wrong Status Values

#### Sales.tsx (Line 28)
```typescript
const BLANK_FORM = { status: 'aktif' as 'aktif' | 'nonaktif' };
```
**Sends to API**: `status: 'aktif'` or `'nonaktif'`

#### Gudang.tsx (Line 29)
```typescript
status: 'aktif' | 'nonaktif';
```
**Sends to API**: `status: 'aktif'` or `'nonaktif'`

### 6. API Hooks (No Transformation)

Both hooks pass data directly without transformation:
- `useSalesReps.ts` - passes status as-is
- `useWarehouses.ts` - passes status as-is

## Error Trace

1. **Frontend form initializes** with `status: 'aktif'`
2. **User saves form** with `{ status: 'aktif' }`
3. **API sends** POST/PUT request with `{ status: 'aktif' }`
4. **Backend validation** checks `in:active,inactive`
5. **Validation fails** because `'aktif' !== 'active'` and `'aktif' !== 'inactive'`
6. **Error returned**: "The selected status is invalid"

## Issue Breakdown

| Component | Value | Issue |
|-----------|-------|-------|
| **Backend expects** | `'active'` or `'inactive'` | English enum |
| **Frontend sends** | `'aktif'` or `'nonaktif'` | Indonesian values |
| **Database stores** | `'active'` or `'inactive'` | English enum |
| **API responses** | `'active'` or `'inactive'` | Backend return |
| **Frontend expects** | `'aktif'` or `'nonaktif'` | But receives `'active'` |

## Solutions Required

### Option 1: Frontend → Backend (Recommended for consistency)
Convert status values when sending to backend:
```typescript
// In API hooks or pages before sending
const statusMapping = { 'aktif': 'active', 'nonaktif': 'inactive' };
const payload = { ...form, status: statusMapping[form.status] };
```

### Option 2: Backend → Frontend
Change backend to accept Indonesian values (not recommended for internationalization)

### Option 3: Backend Transformer
Add a resource transformer to convert responses:
```php
// In SalesRepResource.php
'status' => $this->status === 'active' ? 'aktif' : 'nonaktif',
```

### Option 4: Frontend Type Transformation
Update type definitions to match backend:
```typescript
status: 'active' | 'inactive';  // Match backend
```

## Files Requiring Changes

### Files to Fix (Core Issue)
1. `frontend.v2/src/pages/master/Sales.tsx` - Change `'aktif'` to `'active'`
2. `frontend.v2/src/pages/master/Gudang.tsx` - Change `'aktif'` to `'active'`
3. `frontend.v2/src/types/api.ts` - Update type definitions
4. `frontend.v2/src/hooks/api/useSalesReps.ts` - Add status transformation
5. `frontend.v2/src/hooks/api/useWarehouses.ts` - Add status transformation

### Recommended Approach: Add Transformation Layer in Hooks

**useSalesReps.ts**:
```typescript
const statusMap = { 'aktif': 'active', 'nonaktif': 'inactive' };
const reverseStatusMap = { 'active': 'aktif', 'inactive': 'nonaktif' };

export const useCreateSalesRep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/sales', {
      ...data,
      status: data.status ? statusMap[data.status as keyof typeof statusMap] : undefined
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });
};
```

## Testing Steps

1. Open Sales page → Try to add/edit with status = 'Aktif'
2. Check Network tab → Should send `'active'` not `'aktif'`
3. Verify DB → Should store `'active'`
4. Refresh page → Should display as `'Aktif'` (converted back)
5. Repeat for Gudang page
