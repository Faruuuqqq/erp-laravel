# Frontend Filtering UI & State Management Analysis

## Current Implementation Overview

### Pages Analyzed
1. **Customer.tsx** - Master customer list
2. **Supplier.tsx** - Master supplier list  
3. **Sales.tsx** - Master sales representative list
4. **Gudang.tsx** (Warehouse) - Master warehouse list
5. **Produk.tsx** (Products) - Master product list

---

## 1. FILTERING UI PATTERNS

### A. Search Implementation

#### Pattern Used:
- **Local state** with **debounced API calls**
- 300ms debounce delay via `useDebouncedValue()` hook

#### Components Used:
```typescript
// Input component with Search icon
<div className="relative w-64">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input 
    placeholder="Cari customer..." 
    className="pl-9 h-9" 
    value={searchTerm} 
    onChange={e => setSearchTerm(e.target.value)} 
  />
</div>
```

#### Implementation Pattern:
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 300);
const { data, isLoading } = useCustomers({ per_page: 20, search: debouncedSearch || undefined });
```

**Current Issues:**
- Search is ONLY applied on debounce (300ms delay)
- No immediate local filtering
- API parameter naming inconsistencies: `per_page` vs `perPage`, `search` parameter

---

### B. Filter UI Components by Page

#### 1. **Customer Page** ✓
Filters Implemented:
- Search bar (text input)
- Tab-based filters (CLIENT-SIDE):
  - "Semua" (All)
  - "Piutang" (Accounts Receivable) - filter by `balance > 0`
  - "Over Limit" - filter by `balance > creditLimit`

```typescript
// Tab filtering is CLIENT-SIDE on filtered data
customers.filter(c => {
  if (activeTab === 'piutang') return c.balance > 0;
  if (activeTab === 'overlimit') return (c.creditLimit || 0) > 0 && c.balance > (c.creditLimit || 0);
  return true;
})
```

UI Components:
- `Input` - search field
- `Tabs` - status filtering
- `Badge` - status indicators

---

#### 2. **Supplier Page** ✓
Filters Implemented:
- Search bar (text input)
- No additional filters

UI Components:
- `Input` - search field
- `Badge` - "Lunas" (Paid) status indicator

---

#### 3. **Sales Page** ✓
Filters Implemented:
- Search bar (text input) - searches both name and code
- No additional filters

```typescript
// CLIENT-SIDE search on non-debounced searchTerm
const filtered = list.filter(s =>
  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (s.code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Issue:** Uses NON-DEBOUNCED search term directly on filtered array!

UI Components:
- `Input` - search field
- `Badge` - status indicator (Aktif/Nonaktif)

---

#### 4. **Gudang Page** (Warehouse) ✓
Filters Implemented:
- Search bar (text input) - searches name and code
- No additional filters

```typescript
// CLIENT-SIDE search
const filtered = list.filter(g =>
  g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (g.code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Issue:** Uses NON-DEBOUNCED search on all data

UI Components:
- `Input` - search field
- `Badge` - status indicator

---

#### 5. **Produk Page** (Products) ✓
Filters Implemented:
- Search bar (text input) - most advanced filtering
- Category SELECT dropdown (CLIENT-SIDE)
- Status SELECT dropdown (CLIENT-SIDE):
  - "Semua" (All)
  - "Stok Rendah" (Low Stock)
  - "Aman" (Safe)

```typescript
// Client-side filtering on products array
const filtered = products.filter(p => {
  const matchCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
  const matchStatus = statusFilter === 'all' ||
    (statusFilter === 'rendah' && Number(p.stock) <= Number(p.minimumStock ?? 0)) ||
    (statusFilter === 'aman' && Number(p.stock) > Number(p.minimumStock ?? 0));
  return matchCat && matchStatus;
});
```

UI Components:
- `Input` - search field
- `Select` + `SelectTrigger` + `SelectContent` - category dropdown
- `Select` + `SelectTrigger` + `SelectContent` - status dropdown
- `Badge` - category badges
- `Progress` - stock level indicator

---

### C. Shared UI Component List

```
Common across all pages:
- Button (+ variant="outline", size="sm")
- Input (placeholder, className with "pl-9 h-9")
- Label
- Card / CardContent
- Table / TableHeader / TableBody / TableCell / TableHead / TableRow
- Badge (variant="default", "secondary", "outline")
- Select / SelectTrigger / SelectContent / SelectValue / SelectItem
- Dialog / DialogContent / DialogHeader / DialogTitle
- AlertDialog components (for delete confirmation)
- Icons: Search, Plus, Pencil, Trash2, etc. (from lucide-react)

Statistics Cards:
- StatCard (custom component)
  - title, value, icon, color (primary/info/success/warning/destructive)
```

---

## 2. STATE MANAGEMENT APPROACH

### A. Local State Management

#### Search Term State
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [categoryFilter, setCategoryFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState('all');
const [activeTab, setActiveTab] = useState('all');
```

**Pattern:** useState for simple filters

---

### B. Server State Management (TanStack Query)

#### Query Hooks Pattern

All use TanStack React Query (v4/v5) with standardized query key factory:

```typescript
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: CustomerQueryParams) =>
    [...customerKeys.lists(), { page: filters?.page ?? 1, perPage: filters?.per_page ?? 20, search: filters?.search ?? '' }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export const useCustomers = (params?: CustomerQueryParams) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Customer>>('/customers', params),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    refetchOnWindowFocus: false,
  });
};
```

#### Query Parameters Interface

Each hook has its own params interface:

**useCustomers:**
```typescript
interface CustomerQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}
```

**useProducts / useSalesReps / useSuppliers / useWarehouses:**
```typescript
// Generic params object or:
{ page?: number; perPage?: number; search?: string }
```

**ISSUE:** Inconsistent naming - `per_page` vs `perPage`

---

### C. State Management Flow

#### Example: Customer Page
```
1. User types in search input
   ↓
2. searchTerm state updated (instant)
   ↓
3. useDebouncedValue hook delays (300ms)
   ↓
4. debouncedSearch updated → triggers useQuery
   ↓
5. Query key changes → new API request
   ↓
6. API response updates query cache
   ↓
7. Component re-renders with new data
```

#### Example: Produk Page (LOCAL FILTERING)
```
1. User changes category/status filter
   ↓
2. Local state updated instantly
   ↓
3. filtered array computed via useMemo/filter()
   ↓
4. Component re-renders with filtered data
   ↓
(No API call made - filtering is CLIENT-SIDE!)
```

---

### D. Mutation Management

All CRUD operations use optimistic updates:

```typescript
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => api.post('/customers', data),
    onMutate: async (newCustomer) => {
      // 1. Cancel outgoing refetch
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      
      // 2. Snapshot previous data (for rollback)
      const previousCustomers = queryClient.getQueryData(customerKeys.lists());
      
      // 3. Optimistically update cache
      queryClient.setQueryData(customerKeys.lists(), (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...newCustomer, id: tempId }],
      }));
      
      return { previousCustomers, tempId };
    },
    onSuccess: (result, newCustomer, context) => {
      // Replace temp ID with real ID from server
      queryCl
