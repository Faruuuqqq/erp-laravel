# Quick Reference: Status Validation Mismatch

## Problem
Frontend sends `'aktif'`/`'nonaktif'` but backend validates `'active'`/`'inactive'` only.

## Critical Files & Lines

### Backend (What it expects)
| File | Line | Content |
|------|------|---------|
| SalesRepController.php | 27 | `'status' => ['nullable', 'in:active,inactive']` |
| SalesRepController.php | 45 | `'status' => ['nullable', 'in:active,inactive']` |
| WarehouseController.php | 25 | `'status' => ['nullable', 'in:active,inactive']` |
| WarehouseController.php | 41 | `'status' => ['nullable', 'in:active,inactive']` |
| 2026_02_28_000040_create_parties_tables.php | 42 | `$table->enum('status', ['active', 'inactive'])` |
| 2026_02_28_000020_create_warehouses_table.php | 15 | `$table->enum('status', ['active', 'inactive'])` |

**Backend Accepts**: `'active'` or `'inactive'` (English)

### Frontend (What it sends - WRONG)
| File | Line | Content |
|------|------|---------|
| Sales.tsx | 28 | `const BLANK_FORM = { status: 'aktif' as 'aktif' \| 'nonaktif' }` |
| Sales.tsx | 60 | `const payload = { ... status: form.status }` ← sends 'aktif' |
| Sales.tsx | 212-216 | Select with values "aktif"/"nonaktif" |
| Gudang.tsx | 29 | `status: 'aktif' \| 'nonaktif'` |
| Gudang.tsx | 64 | `status: form.status` ← sends 'aktif' |
| Gudang.tsx | 207-211 | Select with values "aktif"/"nonaktif" |

**Frontend Sends**: `'aktif'` or `'nonaktif'` (Indonesian) ❌

### Frontend Types (WRONG)
| File | Line | Content |
|------|------|---------|
| api.ts | 97 | `status: 'aktif' \| 'nonaktif';` in Warehouse |
| api.ts | 107 | `status?: 'aktif' \| 'nonaktif';` in SalesRep |

**Types Expect**: `'aktif'` or `'nonaktif'` (Indonesian) ❌

### No Transformation Layer
| File | Status |
|------|--------|
| useSalesReps.ts | ⚠️ No transformation - passes directly |
| useWarehouses.ts | ⚠️ No transformation - passes directly |

## Current Database State (Verified)
```
sales_reps[1].status = "active" ✓
warehouses[1].status = "active" ✓
```

## Error Flow
```
Frontend Form: 'aktif'
    ↓
API Hook: send as-is
    ↓
Backend Validation: expects 'active' or 'inactive'
    ↓
❌ Validation fails: "The selected status is invalid"
```

## Files That Need Changes
1. ✗ `frontend.v2/src/types/api.ts` - Update Warehouse & SalesRep types
2. ✗ `frontend.v2/src/pages/master/Sales.tsx` - Fix form initialization and submission
3. ✗ `frontend.v2/src/pages/master/Gudang.tsx` - Fix form initialization and submission
4. ✗ `frontend.v2/src/hooks/api/useSalesReps.ts` - Add status transformation
5. ✗ `frontend.v2/src/hooks/api/useWarehouses.ts` - Add status transformation

## Backend Files (CORRECT - No changes needed)
✓ All backend validation and database schema are correct

## Solution Summary
Create a transformation mapping:
```
Outgoing (Frontend → Backend): 'aktif' → 'active', 'nonaktif' → 'inactive'
Incoming (Backend → Frontend): 'active' → 'aktif', 'inactive' → 'nonaktif'
```

