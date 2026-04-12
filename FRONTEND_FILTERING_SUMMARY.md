# Frontend Filtering Analysis - Comprehensive Summary

## Executive Summary

The React frontend implements filtering across 5 master data pages (Customer, Supplier, Sales, Gudang/Warehouse, Produk/Products) using a hybrid approach:
- **Search:** Debounced API requests (300ms delay)
- **Additional Filters:** Client-side filtering on fetched data
- **State Management:** TanStack Query for server state + useState for local UI state
- **Critical Issue:** NO pagination implementation despite API support

---

## 1. CURRENT FILTERING IMPLEMENTATION BY PAGE

### Customer Page
**Filters:**
- Search bar (API-based, debounced)
- Tab-based status filters (client-side):
  - All / Piutang (has balance) / Over Limit

**UI Components:** Input, Tabs, Badge

**State Management:**
- `searchTerm` (useState) → debounced → API call
- `activeTab` (useState) → client-side filter
- TanStack Query: `useCustomers({ per_page: 20, search: debouncedSearch })`

---

### Supplier Page
**Filters:**
- Search bar only (API-based, debounced)

**UI Components:** Input, Badge

**State Management:**
- `searchTerm` (useState) → debounced → API call
- TanStack Query: `useSuppliers({ perPage: 20, search: debouncedSearch })`

---

### Sales Page
**Filters:**
- Search bar (CLIENT-SIDE filtering, NOT debounced!)

**Issue:** Uses non-debounced searchTerm on full dataset

**UI Components:** Input, Badge

**State Management:**
- `searchTerm` (useState) → client-side filter
- TanStack Query: `useSalesReps({ perPage: 20, search: debouncedSearch })`
- BUT also does client-side filtering on searchTerm!

---

### Gudang (Warehouse) Page
**Filters:**
- Search bar (CLIENT-SIDE filtering, NOT debounced!)

**UI Components:** Input, Badge

**State Management:**
- `searchTerm` (useState) → client-side filter
- TanStack Query: `useWarehouses({ perPage: 20 })`
- No search param sent to API!

---

### Produk (Products) Page
**Filters:**
- Search bar (API-based, debounced)
- Category SELECT dropdown (client-side)
- Stock status SELECT dropdown (client-side)

**UI Components:** Input, Select, Badge, Progress

**State Management:**
- `searchTerm` (useState) → debounced → API call
- `categoryFilter` (useState) → client-side filter
- `statusFilter` (useState) → client-side filter
- TanStack Query: `useProducts({ search: debouncedSearch, perPage: 20 })`

---

## 2. UI COMPONENTS USED

### Form Inputs
- **Input** (text field) - Placeholder: "Cari...", className: "pl-9 h-9"
- **Select** - For dropdown filters
- **Label** - For form fields

### Display
- **Table/TableHeader/TableBody/TableCell/TableHead/TableRow** - Data display
- **Card/CardContent** - Wrapper containers
- **Badge** - Status indicators (variant: default, secondary, outline)
- **Tabs/TabsList/TabsTrigger** - Tab-based filters

### Dialogs
- **Dialog/DialogContent/DialogHeader/DialogTitle** - Add/Edit forms
- **AlertDialog** - Delete confirmations

### Icons (from lucide-react)
- Search, Plus, Pencil, Trash2, Phone, MapPin, AlertCircle, Download, Users, Warehouse, Package, TrendingUp, Building2

### Custom
- **StatCard** - Statistics display

---

## 3. STATE MANAGEMENT ARCHITECTURE

### Local State Pattern
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [categoryFilter, setCategoryFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState('all');
const [activeTab, setActiveTab] = useState('all');
```

### Debounce Pattern
```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
const debouncedSearch = useDebouncedValue(searchTerm, 300);
```

### Server State Pattern (TanStack Query)
```typescript
const { data, isLoading } = useCustomers({ 
  per_page: 20, 
  search: debouncedSearch || undefined 
});
```

### Query Key Factory Pattern
```typescript
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?) => [...customerKeys.lists(), { ...filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};
```

### Optimistic Updates Pattern
```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: keys.lists() });
  const previous = queryClient.getQueryData(keys.lists());
  queryClient.setQueryData(keys.lists(), (old) => ({
    ...old,
    data: [...(old?.data || []), newData]
  }));
  return { previous };
}
```

### Configuration
- **Stale Time:** 5 minutes (300,000ms)
- **Refetch on Focus:** false
- **Toast Limit:** 1 (only one toast shown at a time)
- **Toast Duration:** ~11 days (essentially permanent)

---

## 4. PAGINATION STATUS

**CRITICAL FINDING:** Pagination is NOT implemented!

### What Exists
- Backend returns: `PaginatedResponse<T>` with meta and links
- Frontend requests with fixed `per_page` values (20, 100, 200, 500)
- API types define pagination metadata

### What's Missing
- No pagination UI (no next/prev buttons)
- No page state management
- No user control over page size
- Pagination metadata is received but never displayed/used

### API Response Structure
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
```

---

## 5. ERROR HANDLING

### Toast Notification Pattern
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

try {
  await mutation.mutateAsync(data);
  toast({ title: 'Success', description: 'Saved' });
} catch (err: unknown) {
  const msg = (err as { response?: { data?: { message?: string } } })
    ?.response?.data?.message || 'Default error';
  toast({ title: 'Error', description: msg, variant: 'destructive' });
}
```

### Toast Configuration
- Limit: 1 active toast
- Remove delay: 1,000,000ms (very long)
- Variants: 'default' | 'destructive'

### Error Extraction (from src/lib/api.ts)
```typescript
export const extractErrorMessage = (error: unknown): string => {
  const err = error as any;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) {
    if (typeof err.response.data.error === 'string') return err.response.data.error;
    if (Array.isArray(err.response.data.error)) 
      return err.response.data.error[0]?.message || 'Terjadi kesalahan';
  }
  if (err.response?.data?.errors) {
    const errors = err.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    if (firstKey && Array.isArray(errors[firstKey])) 
      return errors[firstKey][0];
  }
  return err.message || 'Terjadi kesalahan tidak terduga';
};
```

---

## 6. KEY INCONSISTENCIES & ISSUES

### Issue 1: Parameter Naming Inconsistency
| Hook | Param | Status |
|------|-------|--------|
| useCustomers | `per_page` | ✓ Snake case |
| useProducts | `perPage` | ✗ Camel case |
| useSalesReps | `perPage` | ✗ Camel case |
| useSuppliers | `perPage` | ✗ Camel case |
| useWarehouses | `perPage` | ✗ Camel case |

**Solution:** Standardize on `per_page` (snake_case to match Laravel)

### Issue 2: Mixed Filtering Approaches
- Customer: API search + client-side tabs
- Products: API search + client-side dropdowns
- Sales/Gudang: Only client-side filtering (contradicts API setup)

**Solution:** Standardize to API-based filtering with debounce

### Issue 3: Missing Pagination UI
- No page navigation controls
- No total count display
- Fixed page sizes

**Solution:** Implement pagination component with next/prev/page number

### Issue 4: Incomplete Filter Support
Current API params: `{ per_page, search }`
Missing: `sort_by`, `sort_direction`, `status`, `category_id`, `date_from`, `date_to`, etc.

**Solution:** Extend hooks with additional filter parameters

### Issue 5: Client-Side Filtering on API Data
Products page filters by category/status AFTER API fetch
This works now but breaks with pagination (only filters visible page)

**Solution:** Move filtering to server-side OR rem
