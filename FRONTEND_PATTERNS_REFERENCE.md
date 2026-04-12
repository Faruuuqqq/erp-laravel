# Frontend Filtering Patterns - Quick Reference

## UI Component Patterns

### Pattern 1: Search Input
```typescript
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
**Used In:** All 5 pages

---

### Pattern 2: Debounced Search to API
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 300);
const { data, isLoading } = useCustomers({ per_page: 20, search: debouncedSearch || undefined });
```
**Used In:** Customer, Products, Supplier
**NOT Used In:** Sales, Gudang (they filter client-side)

---

### Pattern 3: Filter Tabs
```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="h-9">
    <TabsTrigger value="all" className="text-xs">Semua ({customers.length})</TabsTrigger>
    <TabsTrigger value="piutang" className="text-xs">Piutang ({count})</TabsTrigger>
    <TabsTrigger value="overlimit" className="text-xs text-destructive">Over Limit ({overLimit})</TabsTrigger>
  </TabsList>
</Tabs>

// Then filter client-side:
customers.filter(c => {
  if (activeTab === 'piutang') return c.balance > 0;
  if (activeTab === 'overlimit') return (c.creditLimit || 0) > 0 && c.balance > (c.creditLimit || 0);
  return true;
})
```
**Used In:** Customer page only

---

### Pattern 4: Filter Dropdowns
```typescript
<Select value={categoryFilter} onValueChange={setCategoryFilter}>
  <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Kategori" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Semua Kategori</SelectItem>
    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
  </SelectContent>
</Select>

// Then filter client-side:
const filtered = products.filter(p => categoryFilter === 'all' || p.categoryId === categoryFilter)
```
**Used In:** Products page for Category and Stock Status

---

### Pattern 5: Statistics Cards
```typescript
<div className="mb-5 grid gap-4 sm:grid-cols-3">
  <StatCard 
    title="Total Customer" 
    value={`${customers.length} Customer`} 
    icon={<Users className="h-5 w-5" />} 
    color="primary" 
  />
  <StatCard 
    title="Total Piutang" 
    value={totalPiutang} 
    icon={<AlertCircle className="h-5 w-5" />} 
    color="warning" 
  />
</div>
```
**Used In:** All 5 pages

---

### Pattern 6: Status Badge
```typescript
<Badge variant={s.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
  {s.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
</Badge>
```
**Used In:** Sales, Gudang, Products

---

### Pattern 7: Data Table
```typescript
<Card>
  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            {/* more columns */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={7} className="py-10 text-center">Loading...</TableCell></TableRow>
          ) : data.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="py-10 text-center">No data</TableCell></TableRow>
          ) : data.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
```
**Used In:** All 5 pages

---

### Pattern 8: Action Buttons Row
```typescript
<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex flex-wrap gap-3">
    {/* Filters */}
  </div>
  <div className="flex gap-2 shrink-0">
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-1.5 h-4 w-4" />Export CSV
    </Button>
    {canCreate('customers') && (
      <Button size="sm" onClick={() => setIsAddOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" />Tambah Customer
      </Button>
    )}
  </div>
</div>
```
**Used In:** All 5 pages (pattern)

---

### Pattern 9: Add/Edit Dialog
```typescript
<Dialog open={isAddOpen || !!editItem} onOpenChange={v => {
  if (!v) {
    setIsAddOpen(false);
    setEditItem(null);
    setForm(BLANK_FORM);
  }
}}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {editItem ? 'Edit Customer' : 'Tambah Customer Baru'}
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4 pt-1">
      {/* Form fields */}
    </div>
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" onClick={() => {/* close */}}>Batal</Button>
      <Button onClick={handleSave} disabled={isMutating}>
        {isMutating ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </div>
  </DialogContent>
</Dialog>
```
**Used In:** All 5 pages (pattern)

---

### Pattern 10: Delete Confirmation
```typescript
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Hapus Customer</AlertDialogTitle>
      <AlertDialogDescription>Apakah Anda yakin ingin menghapus <strong>{name}</strong>?</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Batal</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(id, name)}>
        Hapus
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```
**Used In:** All 5 pages (pattern)

---

## State Management Patterns

### Pattern A: Search State
```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 300);
```

### Pattern B: Filter State
```typescript
const [categoryFilter, setCategoryFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState('all');
```

### Pattern C: Tab State
```typescript
const [activeTab, setActiveTab] = useState('all');
```

### Pattern D: Dialog State
```typescript
const [isAddOpen, setIsAddOpen] = useState(false);
const [editItem, setEditItem] = useState<Customer | null>(null);
```

### Pattern E: Form State
```typescript
const [form, setForm] = useState({ 
  name: '', 
  phone: '', 
  email: '', 
  address: '', 
  credit_limit: '10000000' 
});

// Update pattern:
onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
```

---

## API Hook Patterns

### Pattern 1: Query Hook with Debounce
```typescript
const debouncedSearch = useDebouncedValue(searchTerm, 300);
const { data, isLoading } = useCustomers({ 
  per_page: 20, 
  search: debouncedSearch || undefined 
});
```

### Pattern 2: Query Key Factory
```typescript
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?) => [...customerKeys.lists(), { ...filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};
```

### Pattern 3: useQuery with Config
```typescript
export const useCustomers = (params?: CustomerQueryParams) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Customer>>('/customers', params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
```

### Pattern 4: Mutation with Optimistic Update
```typescript
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/customers', data),
    onMutate: async (newCustomer) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      const pr
