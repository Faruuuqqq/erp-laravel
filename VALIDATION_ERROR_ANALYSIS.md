# Validation Error Analysis: "The Selected Status is Invalid"

## Error Reproduction Steps

### Step 1: Open Sales Page
- Navigate to Master → Sales
- Click "Tambah Sales" (Add Sales) button

### Step 2: Fill Form
- Name: "Test Sales"
- Phone: "08123456789"
- Email: "test@example.com"
- Area: "Jakarta"
- **Status: Select "Aktif"** ← This is the problem

### Step 3: Click Save
- Error Toast appears: **"The selected status is invalid"**

## Network Request Captured

### What Frontend SENDS (WRONG)
```json
POST /api/sales HTTP/1.1
Content-Type: application/json

{
  "name": "Test Sales",
  "phone": "08123456789",
  "email": "test@example.com",
  "area": "Jakarta",
  "status": "aktif"           ← WRONG! Backend expects "active"
}
```

### What Backend RECEIVES and VALIDATES
```php
// SalesRepController.php Line 22-28
$data = $request->validate([
    'name'    => ['required', 'string', 'max:100'],
    'phone'   => ['nullable', 'string', 'max:20'],
    'email'   => ['nullable', 'email'],
    'address' => ['nullable', 'string'],
    'status'  => ['nullable', 'in:active,inactive'],
                                    ↑              ↑
                    Only 'active' or 'inactive' allowed
]);
```

### What Backend RETURNS
```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "message": "The selected status is invalid.",
  "errors": {
    "status": ["The selected status is invalid."]
  }
}
```

## Code Location Analysis

### Frontend Form (WRONG)
**File**: `frontend.v2/src/pages/master/Sales.tsx`

```typescript
// Line 28
const BLANK_FORM = { name: '', phone: '', email: '', area: '', status: 'aktif' as 'aktif' | 'nonaktif' };

// Line 60 - What gets sent to API
const payload = { name: form.name, phone: form.phone, email: form.email, area: form.area, status: form.status };
//                                                                                               ↑
//                              Sends 'aktif' instead of 'active'

// Line 212-216 - Form options
<Select value={form.status} onValueChange={(v: 'aktif' | 'nonaktif') => setForm(p => ({ ...p, status: v }))}>
  <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="aktif">Aktif</SelectItem>
    <SelectItem value="nonaktif">Nonaktif</SelectItem>
  </SelectContent>
</Select>
```

### Frontend Types (WRONG)
**File**: `frontend.v2/src/types/api.ts`

```typescript
// Line 100-109
export interface SalesRep {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  area?: string;
  status?: 'aktif' | 'nonaktif';  ← WRONG! Backend stores 'active'/'inactive'
  totalSales?: number;
}

// Line 91-98
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  manager: string;
  status: 'aktif' | 'nonaktif';   ← WRONG! Backend stores 'active'/'inactive'
}
```

### Backend Validation (CORRECT)
**File**: `backend/app/Http/Controllers/Api/SalesRepController.php`

```php
// Lines 27 & 45
'status'  => ['nullable', 'in:active,inactive'],
                               ↑              ↑
                 Only these English values allowed
```

### Database Schema (CORRECT)
**File**: `backend/database/migrations/2026_02_28_000040_create_parties_tables.php`

```php
// Lines 35-45
Schema::create('sales_reps', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100)->index();
    $table->string('phone', 20)->nullable();
    $table->string('email')->nullable();
    $table->text('address')->nullable();
    $table->decimal('total_sales', 15, 2)->default(0);
    $table->enum('status', ['active', 'inactive'])->default('active');
                             ↑              ↑
                      Database enum values (English)
    $table->softDeletes();
    $table->timestamps();
});
```

## The Data Flow Problem

```
1. Frontend Type Definition
   status: 'aktif' | 'nonaktif'
   ↓
2. Form Initialization (Sales.tsx:28)
   status: 'aktif'
   ↓
3. User Action (Select "Aktif")
   status: 'aktif'
   ↓
4. Form Submission (Sales.tsx:60)
   { status: 'aktif' } ← WRONG VALUE
   ↓
5. API Request Payload
   POST /sales { status: 'aktif' }
   ↓
6. Backend Validation (SalesRepController.php:27)
   'status' => ['nullable', 'in:active,inactive']
   ↓
7. VALIDATION FAILS ❌
   'aktif' not in ['active', 'inactive']
   ↓
8. Error Response
   { message: "The selected status is invalid." }
```

## Why This Error Occurs

The application has a **localization mismatch**:

| Component | Uses | Reason |
|-----------|------|--------|
| UI Labels | Indonesian (Aktif/Nonaktif) | User-facing display |
| Database Schema | English (active/inactive) | Standard convention |
| Validation Rules | English (active/inactive) | Backend convention |
| Frontend Types | Indonesian (aktif/nonaktif) | Attempted localization |
| Frontend Pages | Indonesian (aktif/nonaktif) | Uses types directly |

The solution is to have a **transformation layer** that:
- Accepts Indonesian from UI
- Converts to English for API
- Converts back to Indonesian for display

## Expected Database State

```sql
-- Current correct database state:
SELECT id, name, status FROM sales_reps LIMIT 1;
-- Result: 1 | "Budi Santos" | "active"

SELECT id, name, status FROM warehouses LIMIT 1;
-- Result: 1 | "Gudang Utama CC" | "active"
```

## Summary

| Issue | Details |
|-------|---------|
| **Frontend sends** | `status: 'aktif'` |
| **Backend expects** | `status: 'active'` |
| **Validation rule** | `in:active,inactive` |
| **Error message** | "The selected status is invalid." |
| **Root cause** | Type definitions use Indonesian values but backend uses English |
| **Solution** | Add transformation layer in API hooks |

