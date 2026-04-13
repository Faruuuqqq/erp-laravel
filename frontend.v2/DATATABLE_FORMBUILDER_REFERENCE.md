# DataTable & FormBuilder - Quick Reference Guide

## DataTable Component

### Basic Usage
```typescript
import { DataTable, type DataTableColumn } from '@/components/common';

const columns: DataTableColumn<Customer>[] = [
  {
    key: 'name',
    header: 'Nama',
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    filterable: true,
  },
  {
    key: 'phone',
    header: 'Telepon',
    sortable: false,
  },
];

<DataTable
  columns={columns}
  data={customers}
  isLoading={isLoading}
  filterable
  pagination
  exportable
  exportFilename="customers"
/>
```

### With Row Click Handler
```typescript
<DataTable
  columns={columns}
  data={customers}
  onRowClick={(customer) => {
    // Navigate or open detail view
    navigate(`/customers/${customer.id}`);
  }}
/>
```

### With Row Selection
```typescript
const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

<DataTable
  columns={columns}
  data={customers}
  selectable
  onRowSelect={(selected) => {
    setSelectedCustomers(selected);
  }}
/>
```

### With Custom Cell Rendering
```typescript
const columns: DataTableColumn<Customer>[] = [
  {
    key: 'name',
    header: 'Nama',
    render: (value, row) => (
      <div className="font-semibold">{value}</div>
    ),
  },
  {
    key: 'balance',
    header: 'Saldo Piutang',
    render: (value) => (
      <span className="text-red-600">
        {formatCurrency(value)}
      </span>
    ),
  },
];
```

### With Actions (Edit/Delete)
```typescript
import { Pencil, Trash2 } from 'lucide-react';

<DataTable
  columns={columns}
  data={customers}
  actions={[
    {
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      onClick: (customer) => handleEdit(customer),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: (customer) => handleDelete(customer),
      show: (customer) => customer.id !== 'admin', // Conditional action
    },
  ]}
/>
```

### Column Configuration
```typescript
interface DataTableColumn<T> {
  key: keyof T;                                    // Field name
  header: string;                                 // Display name
  sortable?: boolean;                            // Allow sorting (default: true if sortBy provided)
  filterable?: boolean;                          // Include in search (default: false)
  width?: string;                                // CSS width (e.g., '200px')
  align?: 'left' | 'center' | 'right';          // Text alignment
  render?: (value: any, row: T) => ReactNode;   // Custom cell render
  visible?: boolean;                             // Column visibility toggle
}
```

---

## FormBuilder Component

### Basic Usage
```typescript
import { FormBuilder, type FormSchema } from '@/components/common';

const customerSchema: FormSchema = {
  fields: [
    {
      name: 'name',
      label: 'Nama Pelanggan',
      type: 'text',
      required: true,
      placeholder: 'Masukkan nama...',
      minLength: 3,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
    },
    {
      name: 'phone',
      label: 'Telepon',
      type: 'phone',
      required: true,
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'textarea',
      required: true,
      maxLength: 500,
    },
  ],
};

const [values, setValues] = useState({ name: '', email: '', phone: '', address: '' });
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (formValues: any) => {
  setIsSubmitting(true);
  try {
    await api.post('/customers', formValues);
    toast({ title: 'Customer ditambahkan' });
  } catch (error) {
    toast({ title: 'Error', variant: 'destructive' });
  } finally {
    setIsSubmitting(false);
  }
};

<FormBuilder
  schema={customerSchema}
  values={values}
  onChange={setValues}
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  layout="vertical"
  submitLabel="Simpan"
  showReset
/>
```

### With Form Sections
```typescript
const customerSchema: FormSchema = {
  sections: [
    {
      title: 'Informasi Dasar',
      description: 'Data pribadi pelanggan',
      fieldNames: ['name', 'email', 'phone'],
    },
    {
      title: 'Lokasi',
      description: 'Alamat pengiriman',
      fieldNames: ['address', 'city', 'province', 'zipcode'],
    },
    {
      title: 'Pengaturan',
      description: 'Preferensi pelanggan',
      fieldNames: ['creditLimit', 'isActive'],
    },
  ],
  fields: [
    // ... all fields here
  ],
};
```

### With Conditional Fields
```typescript
const schema: FormSchema = {
  fields: [
    {
      name: 'hasWarehouse',
      label: 'Memiliki gudang sendiri?',
      type: 'checkbox',
    },
    {
      name: 'warehouseId',
      label: 'Pilih Gudang',
      type: 'select',
      options: warehouses.map(w => ({ label: w.name, value: w.id })),
      showIf: (values) => values.hasWarehouse === true,
    },
    {
      name: 'warehouseName',
      label: 'Nama Gudang Baru',
      type: 'text',
      showIf: (values) => values.hasWarehouse === true && !values.warehouseId,
    },
  ],
};
```

### With Custom Validation
```typescript
const schema: FormSchema = {
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validate: async (value) => {
        if (!value) return;
        const exists = await checkEmailExists(value);
        return exists ? 'Email sudah terdaftar' : undefined;
      },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      minLength: 8,
      validate: (value) => {
        if (!/[A-Z]/.test(value)) return 'Harus mengandung huruf besar';
        if (!/[0-9]/.test(value)) return 'Harus mengandung angka';
        return undefined;
      },
    },
  ],
};
```

### With Select Options
```typescript
{
  name: 'category',
  label: 'Kategori Produk',
  type: 'select',
  required: true,
  options: [
    { label: 'Elektronik', value: 'elektronik' },
    { label: 'Pakaian', value: 'pakaian' },
    { label: 'Makanan', value: 'makanan' },
  ],
}
```

### With Radio Options
```typescript
{
  name: 'paymentMethod',
  label: 'Metode Pembayaran',
  type: 'radio',
  required: true,
  options: [
    { label: 'Transfer Bank', value: 'bank' },
    { label: 'Kartu Kredit', value: 'cc' },
    { label: 'Cash', value: 'cash' },
  ],
}
```

### Layout Options
```typescript
// Vertical layout (default)
<FormBuilder layout="vertical" />

// Horizontal layout (side-by-side)
<FormBuilder layout="horizontal" />

// Grid layout (3 columns)
<FormBuilder layout="grid" columns={3} />
```

---

## Field Types Reference

| Type | HTML Type | Use Case |
|------|-----------|----------|
| `text` | text | General text input |
| `email` | email | Email addresses |
| `phone` | tel | Phone numbers |
| `url` | url | Website URLs |
| `number` | number | Numeric input |
| `password` | password | Password fields |
| `select` | select | Dropdown selection |
| `checkbox` | checkbox | Toggle option |
| `radio` | radio | Single choice from multiple |
| `date` | date | Date picker |
| `datetime-local` | datetime-local | Date + time picker |
| `textarea` | textarea | Multi-line text |

---

## Common Validation Patterns

### Email Validation
```typescript
{
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  // Built-in email validation included
}
```

### Phone Number Validation
```typescript
{
  name: 'phone',
  label: 'Telepon',
  type: 'phone',
  required: true,
  // Validates 10+ digits
}
```

### Custom Pattern
```typescript
{
  name: 'SKU',
  label: 'SKU Produk',
  type: 'text',
  pattern: '^[A-Z]{3}-\\d{6}$',  // e.g., ABC-123456
  // Error: "Format SKU tidak valid" (auto-generated)
}
```

### Min/Max Length
```typescript
{
  name: 'productName',
  label: 'Nama Produk',
  type: 'text',
  minLength: 3,    // Error: "Nama Produk minimal 3 karakter"
  maxLength: 100,  // Error: "Nama Produk maksimal 100 karakter"
}
```

### Min/Max Values (Number)
```typescript
{
  name: 'price',
  label: 'Harga',
  type: 'number',
  min: 1000,       // Error: "Harga minimal 1000"
  max: 1000000,    // Error: "Harga maksimal 1000000"
}
```

---

## Integration Examples

### DataTable + FormBuilder (Master Page Pattern)

```typescript
// 1. Define columns for table
const columns: DataTableColumn<Customer>[] = [...];

// 2. Define schema for form
const formSchema: FormSchema = {...};

// 3. Render both
export function CustomerPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const { data: customers } = useCustomers();
  
  return (
    <div className="space-y-4">
      <Button onClick={() => setIsAddOpen(true)}>
        Tambah Customer
      </Button>
      
      <DataTable
        columns={columns}
        data={customers}
        exportable
        onRowClick={(customer) => {
          // Open edit dialog
        }}
      />
      
      {isAddOpen && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <FormBuilder
              schema={formSchema}
              values={formValues}
              onChange={setFormValues}
              onSubmit={async (values) => {
                await api.post('/customers', values);
                setIsAddOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

---

## Migration Checklist

When refactoring a page from manual implementation to DataTable/FormBuilder:

### DataTable Migration
- [ ] Extract columns array
- [ ] Mark sortable columns
- [ ] Mark filterable columns
- [ ] Remove manual sort/filter state
- [ ] Remove manual pagination state
- [ ] Remove useDebouncedValue hook
- [ ] Remove manual filter/sort logic
- [ ] Remove pagination controls
- [ ] Replace table JSX with `<DataTable />`
- [ ] Update action handlers
- [ ] Test sorting, filtering, pagination
- [ ] Test export functionality

### FormBuilder Migration
- [ ] Extract form fields
- [ ] Create FormSchema object
- [ ] Define validation rules
- [ ] Remove form state (useState hooks)
- [ ] Remove manual validation logic
- [ ] Remove error state management
- [ ] Replace form JSX with `<FormBuilder />`
- [ ] Update onSubmit handler
- [ ] Test field rendering
- [ ] Test validation
- [ ] Test form submission

---

**Last Updated**: April 13, 2026  
**Version**: 1.0  
**Status**: Ready for production
