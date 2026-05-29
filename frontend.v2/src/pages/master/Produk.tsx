import { useState, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { ImportDataDialog, type ImportColumnDef } from '@/components/dialogs/ImportDataDialog';
import { DataTable, FormBuilder, type DataTableColumn, type FormSchema } from '@/components/common';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Package, AlertTriangle, Upload } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/api/useProducts';
import { useCategories } from '@/hooks/api/useCategories';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import type { Product } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const INITIAL_FORM_VALUES = {
  code: '',
  name: '',
  category: '',
  buyPrice: '',
  sellPrice: '',
  stock: '',
  minStock: '',
  unit: '',
  warehouseId: '',
};

const productFormSchema: FormSchema = {
  sections: [
    {
      title: 'Informasi Dasar',
      fieldNames: ['code', 'name', 'category', 'unit'],
    },
    {
      title: 'Harga',
      fieldNames: ['buyPrice', 'sellPrice'],
    },
    {
      title: 'Stok & Gudang',
      fieldNames: ['stock', 'minStock', 'warehouseId'],
    },
  ],
  fields: [
    {
      name: 'name',
      label: 'Nama Produk',
      type: 'text',
      placeholder: 'Nama produk',
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      name: 'code',
      label: 'Kode Produk',
      type: 'text',
      placeholder: 'Contoh: PRD001',
      required: true,
      minLength: 2,
      maxLength: 20,
      pattern: '^[A-Z0-9\\-]+$',
      description: 'Gunakan huruf kapital, angka, dan tanda strip (-).',
    },
    {
      name: 'category',
      label: 'Kategori',
      type: 'select',
      placeholder: 'Pilih kategori',
      required: true,
      options: [],
    },
    {
      name: 'unit',
      label: 'Satuan',
      type: 'text',
      placeholder: 'Pcs, Kg, dll',
    },
    {
      name: 'buyPrice',
      label: 'Harga Beli (Rp)',
      type: 'number',
      placeholder: '0',
      required: true,
      min: 0,
    },
    {
      name: 'sellPrice',
      label: 'Harga Jual (Rp)',
      type: 'number',
      placeholder: '0',
      required: true,
      min: 0.01,
    },
    {
      name: 'stock',
      label: 'Stok Awal',
      type: 'number',
      placeholder: '0',
      required: true,
      min: 0,
    },
    {
      name: 'minStock',
      label: 'Min. Stok',
      type: 'number',
      placeholder: '0',
      required: true,
      min: 0,
    },
    {
      name: 'warehouseId',
      label: 'Gudang',
      type: 'select',
      options: [],
    },
  ],
};

const ProdukPage = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>();
  const { toast } = useToast();
  const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });

  const { data: productsData, isLoading } = useProducts();
  const { data: categoriesData } = useCategories();
  const { data: warehousesData } = useWarehouses();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = (productsData?.data ?? []) as Product[];
  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const warehouses = useMemo(() => warehousesData?.data ?? [], [warehousesData?.data]);

  // Efficient lookup using Map
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  const warehouseMap = useMemo(() => new Map(warehouses.map(w => [w.id, w.name])), [warehouses]);

  // Filter products based on filters
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (warehouseFilter && p.warehouseId !== warehouseFilter) return false;
      return true;
    });
  }, [products, categoryFilter, warehouseFilter]);

  const totalNilai = formatCurrency(filteredProducts.reduce((s, p) => s + Number(p.buyPrice ?? 0) * Number(p.stock ?? 0), 0));
  const lowStock = filteredProducts.filter(p => Number(p.stock) <= Number(p.minimumStock ?? 0)).length;

  const dynamicFormSchema: FormSchema = {
    ...productFormSchema,
    fields: productFormSchema.fields.map(field => {
      if (field.name === 'category') {
        return {
          ...field,
          options: categories.map(c => ({ value: c.name, label: c.name })),
        };
      }
      if (field.name === 'warehouseId') {
        return {
          ...field,
          options: warehouses.map(w => ({ value: w.id, label: w.name })),
        };
      }
      return field;
    }),
  };

  // Table columns with DataTable built-in features
  const columns: DataTableColumn<Product>[] = [
    {
      key: 'code',
      header: 'Kode',
      width: '80px',
      sortable: false,
      filterable: false,
      render: (code, prod) => code ?? 'P-' + prod.id.slice(0, 4),
    },
    {
      key: 'name',
      header: 'Nama Produk',
      sortable: true,
      filterable: true,
      render: (name, prod) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted shrink-0">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-sm">{name}</div>
            <div className="text-xs text-muted-foreground">{prod.unit}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryId',
      header: 'Kategori',
      sortable: true,
      filterable: true,
      render: (catId, prod) => {
        const categoryName = prod.categoryName ?? categoryMap.get(catId ?? '') ?? '—';
        return (
          <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            {categoryName}
          </span>
        );
      },
    },
    {
      key: 'sellPrice',
      header: 'Harga Jual',
      align: 'right',
      sortable: true,
      filterable: false,
      render: (price) => (
        <span className="font-medium text-sm tabular-nums">{formatCurrency(Number(price))}</span>
      ),
    },
    {
      key: 'buyPrice',
      header: 'Harga Beli',
      align: 'right',
      sortable: false,
      filterable: false,
      render: (price) => <span className="text-sm tabular-nums">{formatCurrency(Number(price))}</span>,
    },
    {
      key: 'stock',
      header: 'Stok / Level',
      sortable: true,
      filterable: false,
      render: (stock, prod) => {
        const isLow = Number(stock) <= Number(prod.minimumStock ?? 0);
        const pct = Math.min(100, Math.round((Number(stock) / (Number(prod.minimumStock ?? 1) * 3)) * 100));
        return (
          <div className="min-w-28">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`font-bold text-sm tabular-nums ${isLow ? 'text-destructive' : ''}`}>{stock}</span>
              <span className="text-xs text-muted-foreground">/ min {prod.minimumStock ?? 0}</span>
            </div>
            <Progress value={pct} className={`h-1 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
          </div>
        );
      },
    },
    {
      key: 'warehouseId',
      header: 'Gudang',
      sortable: false,
      filterable: true,
      render: (warehouseId, prod) => {
        const warehouseName = prod.warehouseName ?? warehouseMap.get(warehouseId ?? '') ?? '—';
        return (
          <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {warehouseName}
          </span>
        );
      },
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (p: Product) => {
        setEditItem(p);
        setFormValues({
          code: p.code || '',
          name: p.name,
          category: p.categoryName || p.category || '',
          buyPrice: String(p.buyPrice ?? ''),
          sellPrice: String(p.sellPrice ?? ''),
          stock: String(p.stock ?? ''),
          minStock: String(p.minimumStock ?? p.minStock ?? ''),
          unit: p.unit ?? '',
          warehouseId: p.warehouseId ?? '',
        });
        setIsAddOpen(true);
      },
      show: () => canEdit('products'),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (p: Product) => setDeleteConfirm({ id: p.id, name: p.name }),
      variant: 'destructive' as const,
      show: () => canDelete('products'),
    },
  ];

  const importColumns: ImportColumnDef[] = [
  { key: 'code',      label: 'Kode',        required: true, aliases: ['kode produk', 'code'] },
  { key: 'name',      label: 'Nama Produk', required: true, aliases: ['nama', 'produk'] },
  { key: 'category',  label: 'Kategori',    required: true, aliases: ['kategori produk'] },
  { key: 'buyPrice',  label: 'Harga Beli',  type: 'number', aliases: ['harga beli', 'buy price', 'buy_price'] },
  { key: 'sellPrice', label: 'Harga Jual',  type: 'number', aliases: ['harga jual', 'sell price', 'sell_price'] },
  { key: 'stock',     label: 'Stok',        type: 'number', aliases: ['stok awal', 'qty', 'quantity'] },
  { key: 'minStock',  label: 'Min. Stok',   type: 'number', aliases: ['min stok', 'minimum stock', 'min_stock'] },
  { key: 'unit',      label: 'Satuan',      aliases: ['satuan', 'uom'] },
  { key: 'warehouse', label: 'Gudang',      aliases: ['gudang', 'warehouse'] },
  ];

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (values: Record<string, any>) => {
      setIsSubmitting(true);
      try {
        await executeRetryable(
          async () => {
            const payload = {
              code: values.code,
              name: values.name,
              category: values.category,
              buyPrice: Number(values.buyPrice),
              sellPrice: Number(values.sellPrice),
              stock: Number(values.stock),
              minStock: Number(values.minStock),
              unit: values.unit,
              warehouseId: values.warehouseId || undefined,
            };

            if (editItem) {
              await updateMutation.mutateAsync({ id: editItem.id, data: payload });
            } else {
              await createMutation.mutateAsync(payload);
            }
            setIsAddOpen(false);
            setEditItem(null);
            setFormValues(INITIAL_FORM_VALUES);
          },
          {
            title: editItem ? 'Produk diperbarui' : 'Produk ditambahkan',
            description: `${values.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
            errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} produk`,
          }
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [editItem, executeRetryable, updateMutation, createMutation]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (id: string, name: string) => {
      await executeRetryable(
        () => deleteMutation.mutateAsync(id),
        {
          title: 'Produk dihapus',
          description: `${name} telah dihapus.`,
          errorTitle: 'Gagal menghapus produk',
        }
      );
    },
    [executeRetryable, deleteMutation]
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsAddOpen(open);

    if (!open) {
      setEditItem(null);
      setFormValues(INITIAL_FORM_VALUES);
    }
  }, []);

  const isEditMode = Boolean(editItem);

  return (
    <MainLayout title="Produk" subtitle="Kelola daftar produk dan kategori">
      {/* Stats Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Produk"
          value={`${products.length} Produk`}
          icon={<Package className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Total Kategori"
          value={`${categories.length} Kategori`}
          icon={<Package className="h-5 w-5" />}
          color="info"
        />
        <StatCard
          title="Nilai Persediaan"
          value={totalNilai}
          icon={<Package className="h-5 w-5" />}
          color="success"
        />
        <StatCard
          title="Stok Rendah"
          value={`${lowStock} Produk`}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={lowStock > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Filter & Action Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Select
            value={categoryFilter ?? 'all'}
            onValueChange={v => setCategoryFilter(v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select
            value={warehouseFilter ?? 'all'}
            onValueChange={v => setWarehouseFilter(v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Gudang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gudang</SelectItem>
              {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {canCreate('products') && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" />
              Import
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditItem(null);
                setFormValues(INITIAL_FORM_VALUES);
                setIsAddOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        )}
      </div>

      {/* Advanced DataTable with built-in search, sort, pagination, export */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredProducts}
            variant="master"
            isLoading={isLoading}
            filterable
            pagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            exportable
            exportFilename="produk"
            actions={actions}
            emptyMessage="Tidak ada produk yang sesuai."
            searchPlaceholder="Cari nama produk..."
            filterableColumns={['name', 'categoryId']}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Produk Dialog with FormBuilder */}
      <Dialog open={isAddOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[1200px] overflow-hidden p-0 sm:max-h-[92vh]">
          <DialogHeader className="border-b bg-muted/20 px-5 py-3 pr-12 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="h-4 w-4 text-primary" />
              {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Perbarui detail produk agar harga, kategori, dan stok tetap sinkron dengan gudang.'
                : 'Isi detail produk baru untuk memulai pencatatan stok, harga, dan kategori.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(92vh-5rem)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
            <FormBuilder
              schema={dynamicFormSchema}
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              layout="grid"
              columns={2}
              density="compact"
              stickyActions
              submitLabel={isEditMode ? 'Perbarui' : 'Tambah'}
              showReset={false}
              className="space-y-4"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          itemName={deleteConfirm.name}
          itemType="Produk"
          itemId={deleteConfirm.id}
          isDeleting={deleteMutation.isPending}
          onConfirm={async () => {
            await handleDelete(deleteConfirm.id, deleteConfirm.name);
            setDeleteConfirm(null);
          }}
          onOpenChange={(open) => {
            if (!open) setDeleteConfirm(null);
          }}
        />
      )}

      <ImportDataDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        resource="products"
        title="Produk"
        columns={importColumns}
      />
    </MainLayout>
  );
};

export default ProdukPage;
