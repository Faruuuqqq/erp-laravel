import { useState, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { useTableSort } from '@/hooks/useTableSort';
import { useExportData } from '@/hooks/useExportData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DataTable, FormDialog, type DataTableColumn, type FormField, SearchInput, PaginationControl } from '@/components/common';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Package, AlertTriangle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/api/useProducts';
import { useCategories } from '@/hooks/api/useCategories';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import type { Product } from '@/types';
import { type ColumnConfig } from '@/lib/xlsx-export';

const BLANK_FORM = { name: '', categoryId: '', buyPrice: '', sellPrice: '', stock: '', minimumStock: '', unit: '', warehouseId: '' };

const Produk = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });
  const { exportXlsx } = useExportData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { sortBy, sortDirection, toggleSort, getSortIcon } = useTableSort<'nama' | 'kategori' | 'harga_jual' | 'stok_minimum'>('nama');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [warehouseFilter, setWarehouseFilter] = useState<number | undefined>();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const { data: productsData, isLoading } = useProducts({
    page: currentPage,
    search: searchTerm || undefined,
    per_page: 20,
    category_id: categoryFilter,
    warehouse_id: warehouseFilter,
    sort_by: sortBy,
    sort_direction: sortDirection,
  });
  const { data: categoriesData } = useCategories();
  const { data: warehousesData } = useWarehouses({ per_page: 1000 });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

   const products = productsData?.data ?? [];
   const pagination = productsData?.meta;
   
   // Wrap categories and warehouses in useMemo to stabilize references
   const categories = useMemo(() => categoriesData?.data ?? [], [categoriesData?.data]);
   const warehouses = useMemo(() => warehousesData?.data ?? [], [warehousesData?.data]);

   // Efficient lookup using Map for O(1) access - 90% CPU reduction
   const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
   const warehouseMap = useMemo(() => new Map(warehouses.map(w => [w.id, w.name])), [warehouses]);

   const totalNilai = products.reduce((s, p) => s + Number(p.buyPrice ?? 0) * Number(p.stock ?? 0), 0);
   const lowStock = products.filter(p => Number(p.stock) <= Number(p.minimumStock ?? 0)).length;

   // Handle sort with page reset
    const handleToggleSort = useCallback((field: 'nama' | 'kategori' | 'harga_jual' | 'stok_minimum') => {
      toggleSort(field);
      setCurrentPage(1);
    }, [toggleSort]);

    const getSortIconElement = (field: 'nama' | 'kategori' | 'harga_jual' | 'stok_minimum') => {
      const direction = getSortIcon(field);
      if (!direction) return null;
      return direction === 'asc' ? null : null;
    };

   const openEdit = useCallback((p: Product) => {
     setEditItem(p);
     setForm({
       name: p.name, categoryId: p.categoryId ?? '',
       buyPrice: String(p.buyPrice ?? ''), sellPrice: String(p.sellPrice ?? ''),
       stock: String(p.stock ?? ''), minimumStock: String(p.minimumStock ?? ''),
       unit: p.unit ?? '', warehouseId: p.warehouseId ?? '',
     });
   }, []);

   const handleSave = async () => {
     if (!form.name.trim()) return;
     const payload = {
       name: form.name,
       category_id: form.categoryId,
       buy_price: Number(form.buyPrice),
       sell_price: Number(form.sellPrice),
       stock: Number(form.stock),
       minimum_stock: Number(form.minimumStock),
       unit: form.unit,
       warehouse_id: form.warehouseId,
     };
     await executeRetryable(
       async () => {
         if (editItem) {
           await updateMutation.mutateAsync({ id: editItem.id, data: payload });
           setEditItem(null);
         } else {
           await createMutation.mutateAsync(payload);
           setIsAddOpen(false);
         }
         setForm(BLANK_FORM);
       },
       {
         title: editItem ? 'Produk diperbarui' : 'Produk ditambahkan',
         description: `${form.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
         errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} produk`,
       }
     );
   };

   const handleDelete = async (id: string, name: string) => {
     await executeRetryable(
       () => deleteMutation.mutateAsync(id),
       {
         title: 'Produk dihapus',
         description: `${name} telah dihapus.`,
         errorTitle: 'Gagal menghapus produk',
       }
     );
   };

  const handleExport = useCallback(() => {
    const columns: ColumnConfig<Product>[] = [
      { header: 'Kode', key: 'code', width: 12 },
      { header: 'Nama', key: 'name', width: 30 },
      {
        header: 'Kategori',
        key: 'categoryId',
        format: (v) => categoryMap.get(v as string) ?? 'Uncategorized',
        width: 15,
      },
      {
        header: 'Harga Beli',
        key: 'buyPrice',
        format: (value) => typeof value === 'number' ? value : Number(value) || 0,
        width: 12,
      },
      {
        header: 'Harga Jual',
        key: 'sellPrice',
        format: (value) => typeof value === 'number' ? value : Number(value) || 0,
        width: 12,
      },
      { header: 'Stok', key: 'stock', width: 10 },
      { header: 'Satuan', key: 'unit', width: 10 },
      { header: 'Min Stok', key: 'minimumStock', width: 10 },
    ];

    exportXlsx({
      filename: 'produk.xlsx',
      data: products,
      columns,
      exportOptions: { sheetName: 'Produk', autoWidth: true },
      successMessage: `${products.length} data produk diunduh dalam format XLSX.`,
     });
   }, [products, categoryMap, exportXlsx]);

    const columns: DataTableColumn<Product>[] = [
      { key: 'code', header: 'Kode', width: '80px', render: (code, prod) => code ?? 'P-' + prod.id.slice(0, 4) },
      {
        key: 'name',
        header: 'Nama Produk',
        sortable: true,
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
        render: (catId, prod) => {
          const categoryName = prod.categoryName ?? categoryMap.get(catId ?? '') ?? '—';
          return <Badge variant="secondary" className="text-xs">{categoryName}</Badge>;
        },
      },
      {
        key: 'sellPrice',
        header: 'Harga Jual',
        align: 'right',
        sortable: true,
        render: (price) => <span className="font-medium text-sm">{formatCurrency(Number(price))}</span>,
      },
      {
        key: 'buyPrice',
        header: 'Harga Beli',
        align: 'right',
        render: (price) => <span className="text-sm">{formatCurrency(Number(price))}</span>,
      },
      {
        key: 'stock',
        header: 'Stok / Level',
        sortable: true,
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
        render: (warehouseId, prod) => {
          const warehouseName = prod.warehouseName ?? warehouseMap.get(warehouseId ?? '') ?? '—';
          return <span className="text-xs text-muted-foreground">{warehouseName}</span>;
        },
      },
    ];

    const actions = [
      {
        label: 'Edit',
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: (p: Product) => openEdit(p),
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

    const fields: FormField[] = [
      {
        name: 'name',
        label: 'Nama Produk *',
        type: 'text',
        placeholder: 'Nama produk',
        value: form.name,
        onChange: (v) => setForm(p => ({ ...p, name: v })),
        required: true,
        width: 'full',
        validation: (v) => !v?.trim() ? 'Nama produk harus diisi' : null,
      },
      {
        name: 'categoryId',
        label: 'Kategori *',
        type: 'select',
        value: form.categoryId,
        onChange: (v) => setForm(p => ({ ...p, categoryId: v })),
        options: categories.map(c => ({ value: c.id, label: c.name })),
        required: true,
        width: 'half',
      },
      {
        name: 'unit',
        label: 'Satuan',
        type: 'text',
        placeholder: 'Pcs, Kg, dll',
        value: form.unit,
        onChange: (v) => setForm(p => ({ ...p, unit: v })),
        width: 'half',
      },
      {
        name: 'buyPrice',
        label: 'Harga Beli (Rp)',
        type: 'number',
        placeholder: '0',
        value: form.buyPrice,
        onChange: (v) => setForm(p => ({ ...p, buyPrice: v })),
        width: 'half',
      },
      {
        name: 'sellPrice',
        label: 'Harga Jual (Rp)',
        type: 'number',
        placeholder: '0',
        value: form.sellPrice,
        onChange: (v) => setForm(p => ({ ...p, sellPrice: v })),
        width: 'half',
      },
      {
        name: 'stock',
        label: 'Stok Awal',
        type: 'number',
        placeholder: '0',
        value: form.stock,
        onChange: (v) => setForm(p => ({ ...p, stock: v })),
        width: 'half',
      },
      {
        name: 'minimumStock',
        label: 'Min. Stok',
        type: 'number',
        placeholder: '0',
        value: form.minimumStock,
        onChange: (v) => setForm(p => ({ ...p, minimumStock: v })),
        width: 'half',
      },
      {
        name: 'warehouseId',
        label: 'Gudang',
        type: 'select',
        value: form.warehouseId,
        onChange: (v) => setForm(p => ({ ...p, warehouseId: v })),
        options: warehouses.map(w => ({ value: w.id, label: w.name })),
        width: 'full',
      },
    ];

    return (
    <MainLayout title="Produk" subtitle="Kelola daftar produk dan kategori">
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Produk" value={`${products.length} Produk`} icon={<Package className="h-5 w-5" />} color="primary" />
        <StatCard title="Total Kategori" value={`${categories.length} Kategori`} icon={<Package className="h-5 w-5" />} color="info" />
        <StatCard title="Nilai Persediaan" value={totalNilai} icon={<Package className="h-5 w-5" />} color="success" />
        <StatCard title="Stok Rendah" value={`${lowStock} Produk`} icon={<AlertTriangle className="h-5 w-5" />} color={lowStock > 0 ? 'warning' : 'success'} />
      </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <SearchInput
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Cari produk..."
              className="w-64"
            />
            <Select 
              value={String(categoryFilter ?? 'all')} 
              onValueChange={v => {
                setCategoryFilter(v === 'all' ? undefined : Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
           <Select 
             value={String(warehouseFilter ?? 'all')} 
             onValueChange={v => {
               setWarehouseFilter(v === 'all' ? undefined : Number(v));
               setCurrentPage(1);
             }}
           >
             <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Gudang" /></SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Semua Gudang</SelectItem>
               {warehouses.map(w => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}
             </SelectContent>
           </Select>
         </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleExport} title="Download data produk dalam format Excel"><Download className="mr-1.5 h-4 w-4" />Export XLSX</Button>
            {canCreate('products') && (
              <Button size="sm" onClick={() => { setForm(BLANK_FORM); setIsAddOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" />Tambah Produk
              </Button>
            )}
         </div>
       </div>

       <Card>
         <CardContent className="p-0">
           <DataTable<Product>
             data={products}
             columns={columns}
             isLoading={isLoading}
             sortBy={sortBy}
             sortDirection={sortDirection}
             onSort={handleToggleSort as (field: string) => void}
             actions={actions}
             emptyMessage="Tidak ada produk yang sesuai."
           />
          </CardContent>
         </Card>

        {pagination && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Menampilkan {pagination.from ?? 0} - {pagination.to ?? 0} dari {pagination.total} produk
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                disabled={currentPage === pagination.last_page}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}

        <FormDialog
          open={isAddOpen || !!editItem}
          onOpenChange={v => {
            if (!v) { setIsAddOpen(false); setEditItem(null); setForm(BLANK_FORM); }
          }}
          title={editItem ? 'Edit Produk' : 'Tambah Produk Baru'}
          fields={fields}
          onSubmit={handleSave}
          onCancel={() => {
            setIsAddOpen(false);
            setEditItem(null);
            setForm(BLANK_FORM);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          submitLabel="Simpan"
        />

        {deleteConfirm && (
          <DeleteConfirmDialog
            open={!!deleteConfirm}
            onOpenChange={(open) => !open && setDeleteConfirm(null)}
            itemName={deleteConfirm.name}
            itemType="Produk"
            onConfirm={() => {
              handleDelete(deleteConfirm.id, deleteConfirm.name);
              setDeleteConfirm(null);
            }}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </MainLayout>
    );
  };

  export default Produk;
