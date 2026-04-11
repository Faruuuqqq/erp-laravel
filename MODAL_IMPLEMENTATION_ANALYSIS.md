# Master Data Pages: Create/Edit Modal Implementations Analysis

## Overview
This document provides a comprehensive analysis of how Create/Edit modal implementations are structured across all master data pages in the application.

---

## Master Data Pages Summary

| Page | File | Create Modal | Edit Modal | Shared Dialog | Type |
|------|------|--------------|-----------|--------------|------|
| Customer | `Customer.tsx` | ✓ | ✓ | FormDialog | Combined |
| Product | `Produk.tsx` | ✓ | ✓ | ProdukForm | Combined |
| Supplier | `Supplier.tsx` | ✓ | ✓ | FormDialog | Combined |
| Warehouse | `Gudang.tsx` | ✓ | ✓ | GudangFormDialog | Combined |
| Sales Rep | `Sales.tsx` | ✓ | ✓ | SalesForm | Combined |

---

## Detailed Analysis by Page

### 1. CUSTOMER PAGE (`Customer.tsx`)

**Modal Component**: `FormDialog`
**Location**: Inline component inside the page (lines 95-119)
**Type**: Shared Modal (Create & Edit)

#### Implementation Details:
```tsx
// Modal State Management
const [isAddOpen, setIsAddOpen] = useState(false);                    // Create modal
const [editItem, setEditItem] = useState<Customer | null>(null);     // Edit modal
const [form, setForm] = useState({                                   // Form state
  name: '', phone: '', email: '', address: '', credit_limit: '10000000'
});
```

#### Modal Behavior:
- **Shared Modal**: Same `FormDialog` component handles both Create and Edit
- **Title Switching**: Title changes based on context ("Tambah Customer Baru" vs "Edit Customer")
- **State Management**: 
  - Create: `isAddOpen` state
  - Edit: `editItem` state (null when closed)

#### Form Handling:
```tsx
const handleSave = async () => {
  if (editItem) {
    // Update customer
    await updateMutation.mutateAsync({ id: editItem.id, data: {...} });
  } else {
    // Create new customer
    await createMutation.mutateAsync({...});
  }
  setForm(BLANK_FORM);
};
```

#### UI Components Used:
- ✓ `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle`
- ✓ `Input` (text, email, number)
- ✓ `Label`
- ✓ `Button`
- ✓ `AlertDialog` (for delete confirmation)

#### Data Submission:
- **Mutations**: `useCreateCustomer()`, `useUpdateCustomer()`, `useDeleteCustomer()`
- **Pattern**: Async/await with try-catch
- **Feedback**: Toast notifications for success/error
- **Refetch**: Manual `refetch()` call after success

---

### 2. PRODUCT PAGE (`Produk.tsx`)

**Modal Component**: `ProdukForm`
**Location**: Inline component inside the page (lines 127-169)
**Type**: Shared Modal (Create & Edit)
**Extended Width**: `className="max-w-lg"` (larger than standard)

#### Implementation Details:
```tsx
// Modal State Management
const [isAddOpen, setIsAddOpen] = useState(false);
const [editItem, setEditItem] = useState<Product | null>(null);
const [form, setForm] = useState(BLANK_FORM);  // More complex form
```

#### Form Structure:
```tsx
const BLANK_FORM = { 
  name: '', categoryId: '', buyPrice: '', sellPrice: '', 
  stock: '', minimumStock: '', unit: '', warehouseId: '' 
};
```

#### Special Features:
- **useCallback Hook**: `openEdit()` uses `useCallback` for optimization
- **Field Mapping**: Converts form field names to API payload format
  - `categoryId` → `category_id`
  - `buyPrice` → `buy_price`
  - `minimumStock` → `minimum_stock`

#### UI Components Used:
- ✓ Dialog components (same as Customer)
- ✓ `Input` (text, number)
- ✓ `Label`
- ✓ `Button`
- ✓ **Select** (for category and warehouse dropdowns)
- ✓ `AlertDialog` (for delete confirmation)

#### Data Submission:
- **Mutations**: `useCreateProduct()`, `useUpdateProduct()`, `useDeleteProduct()`
- **Advanced Features**: Query cache management with optimistic updates
- **Refetch**: Automatic via `onSettled()` in mutation

---

### 3. SUPPLIER PAGE (`Supplier.tsx`)

**Modal Component**: `FormDialog`
**Location**: Inline component inside the page (lines 91-115)
**Type**: Shared Modal (Create & Edit)
**Consistency**: Very similar to Customer page

#### Implementation Details:
```tsx
// Modal State Management
const [isAddOpen, setIsAddOpen] = useState(false);
const [editItem, setEditItem] = useState<SupplierType | null>(null);
const [form, setForm] = useState(BLANK_FORM);
```

#### Form Structure:
```tsx
const BLANK_FORM = { 
  name: '', phone: '', email: '', address: '', noRekening: '' 
};
```

#### Key Differences from Customer:
- **Additional Field**: `noRekening` (bank account number)
- **openEdit Hook**: Uses `useCallback` for optimization
- **Custom Cleanup**: Lines 109-110 show explicit form reset on cancel

#### Data Submission:
- **Mutations**: `useCreateSupplier()`, `useUpdateSupplier()`, `useDeleteSupplier()`
- **Error Handling**: Same try-catch pattern as Customer
- **Refetch**: Not explicitly shown (handled by mutations)

---

### 4. WAREHOUSE PAGE (`Gudang.tsx`)

**Modal Component**: `GudangFormDialog`
**Location**: Inline component inside the page (lines 90-124)
**Type**: Shared Modal (Create & Edit)
**Unique Features**: Most comprehensive implementation

#### Implementation Details:
```tsx
// Modal State Management
const [isAddOpen, setIsAddOpen] = useState(false);
const [editId, setEditId] = useState<string | null>(null);  // Different: stores ID
const [form, setForm] = useState<WarehouseForm>(BLANK_FORM());
```

#### Form Structure:
```tsx
interface WarehouseForm {
  name: string;
  address: string;
  manager: string;
  status: 'aktif' | 'nonaktif';
}

const BLANK_FORM = (): WarehouseForm => ({...});  // Factory function
```

#### Advanced Features:
- **Type-Safe Form**: Explicit interface for form state
- **setField Utility**: Generic field setter (line 87-88)
- **Factory Function**: `BLANK_FORM()` returns fresh object
- **useCallback**: All handlers use `useCallback` for optimization
- **Loading States**: Button shows "Menyimpan..." text during submission

#### UI Components Used:
- ✓ Dialog components
- ✓ `Input` (text)
- ✓ `Label`
- ✓ `Button` (with loading state text)
- ✓ **Select** (for status dropdown)
- ✓ `AlertDialog` (for delete confirmation)
- ✓ `Skeleton` (for loading state)

#### Data Submission:
- **Mutations**: `useCreateWarehouse()`, `useUpdateWarehouse()`, `useDeleteWarehouse()`
- **Advanced Cleanup**: Explicit state reset on modal close
- **Form Reset**: Full reset with `BLANK_FORM()`

---

### 5. SALES REP PAGE (`Sales.tsx`)

**Modal Component**: `SalesForm`
**Location**: Inline component inside the page (lines 85-118)
**Type**: Shared Modal (Create & Edit)
**Similar to**: Customer and Supplier patterns

#### Implementation Details:
```tsx
// Modal State Management
const [isAddOpen, setIsAddOpen] = useState(false);
const [editItem, setEditItem] = useState<SalesRep | null>(null);
const [form, setForm] = useState(BLANK_FORM);
```

#### Form Structure:
```tsx
const BLANK_FORM = { 
  name: '', phone: '', email: '', area: '', status: 'aktif' as 'aktif' | 'nonaktif' 
};
```

#### Special Features:
- **Status Field**: Dropdown with status options ('aktif' | 'nonaktif')
- **openEdit Hook**: Uses `useCallback` for optimization
- **Type Casting**: Explicit type casting for status field

#### UI Components Used:
- ✓ Dialog components
- ✓ `Input` (text, email)
- ✓ `Label`
- ✓ `Button`
- ✓ **Select** (for status dropdown)
- ✓ `AlertDialog` (for delete confirmation)

#### Data Submission:
- **Mutations**: `useCreateSalesRep()`, `useUpdateSalesRep()`, `useDeleteSalesRep()`
- **Error Handling**: Standard try-catch pattern
- **Toast Feedback**: Success and error notifications

---

## Common Patterns Identified

### 1. Modal State Management Pattern
All pages follow this pattern:
```tsx
// Create modal state
const [isAddOpen, setIsAddOpen] = useState(false);

// Edit modal state (all except Gudang which uses editId)
const [editItem, setEditItem] = useState<Type | null>(null);

// Form state
const [form, setForm] = useState(BLANK_FORM);
```

### 2. Form Handling Pattern
```tsx
const handleSave = async () => {
  if (!form.name.trim()) return;  // Validation
  try {
    if (editItem) {
      // Update
      await updateMutation.mutateAsync({...});
      setEditItem(null);
    } else {
      // Create
