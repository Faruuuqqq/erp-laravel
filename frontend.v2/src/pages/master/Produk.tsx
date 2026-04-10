import { useState, useMemo, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { Progress } from '@/components/ui/progress';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/api/useProducts';
import { useCategories } from '@/hooks/api/useCategories';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

const Produk = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', categoryId: '', buyPrice: '', sellPrice: '',
    stock: '', minStock: '', unit: '', warehouseId: '',
  });
  const { toast } = useToast();

  const { data, isLoading, refetch } = useProducts({ 
    per_page: 20, 
    search: debouncedSearch,
    page,
  });
  
  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const isAddOpen = dialogOpen && !editItem;

  const { data: categoriesData } = useCategories();
  const { data: warehousesData } = useWarehouses();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = (data?.data?.data ?? []) as Product[];
  const pagination = data?.data?.meta ? {
    page: data.data.meta.current_page,
    totalPages: data.data.meta.last_page,
    total: data.data.meta.total,
  } : null;
  const categories = (categoriesData?.data ?? []) as { id: string; name: string }[] || [];
  const warehouses = (warehousesData?.data?.data ?? []) as { id: string; name: string; status: string }[];

  const stats = useMemo(() => ({
    totalNilai: products.reduce((s, p) => s + (p.buyPrice || 0) * (p.stock || 0), 0),
    lowStock: products.filter(p => (p.stock || 0) <= (p.minStock || 0)).length,
  }), [products]);

  const columns: ColumnDef<Product>[] = useMemo(() => [
    {
      key: 'code',
      header: 'Kode',
      sortable: true,
      className: 'w-20',
      render: (row) => <span className="font-mono text-xs text-primary">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Nama Produk',
      sortable: true,
      className: 'min-w-40',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted shrink-0">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-sm">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.unit}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortable: true,
      className: 'w-28',
      render: (row) => <Badge variant="secondary" className="text-xs">{row.category || '-'}</Badge>,
    },
    {
      key: 'buyPrice',
      header: 'Harga Beli',
      sortable: true,
      className: 'w-24 text-right',
      render: (row) => <span className="tabular-nums text-muted-foreground">{formatCurrency(row.buyPrice)}</span>,
    },
    {
      key: 'sellPrice',
      header: 'Harga Jual',
      sortable: true,
      className: 'w-24 text-right',
      render: (row) => <span className="font-medium tabular-nums">{formatCurrency(row.sellPrice)}</span>,
    },
    {
      key: 'stock',
      header: 'Stok / Level',
      sortable: true,
      className: 'w-28',
      render: (row) => {
        const isLow = (row.stock || 0) <= (row.minStock || 0);
        const pct = Math.min(100, Math.round(((row.stock || 0) / ((row.minStock || 1) * 3)) * 100));
        return (
          <div className="min-w-28">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`font-bold text-sm tabular-nums ${isLow ? 'text-destructive' : ''}`}>{row.stock}</span>
              <span className="text-xs text-muted-foreground">/ min {row.minStock}</span>
            </div>
            <Progress value={pct} className={`h-1 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
          </div>
        );
      },
    },
    {
      key: 'warehouse',
      header: 'Gudang',
      sortable: false,
      className: 'w-24',
      render: (row) => <span className="text-xs text-muted-foreground">{row.warehouse || '-'}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      sortable: false,
      className: 'w-20 text-center',
      render: (row) => (
        <div className="flex justify-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                <AlertDialogDescription>Hapus <strong>{row.name}</strong>?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(row.id, row.name)}>Hapus</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ], []);

  const openEdit = useCallback((p: Product) => {
    setEditItem(p);
    setForm({
      name: p.name, categoryId: p.categoryId || '',
      buyPrice: String(p.buyPrice), sellPrice: String(p.sellPrice),
      stock: String(p.stock), minStock: String(p.minStock),
      unit: p.unit, warehouseId: p.warehouseId || '',
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return;
    try {
      const cat = categories.find(c => c.id === form.categoryId);
      const payload = {
        name: form.name,
        category: cat?.name || 'Lainnya',
        buyPrice: Number(form.buyPrice) || 0,
        sellPrice: Number(form.sellPrice) || 0,
        stock: Number(form.stock) || 0,
        minStock: Number(form.minStock) || 0,
        unit: form.unit || 'Pcs',
        warehouseId: form.warehouseId || null,
      };

      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Produk diperbarui', description: `${form.name} berhasil diperbarui.` });
        setDialogOpen(false);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Produk ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setDialogOpen(false);
      }
      setForm({ name: '', categoryId: '', buyPrice: '', sellPrice: '', stock: '', minStock: '', unit: '', warehouseId: '' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan produk';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [form, editItem, categories, createMutation, updateMutation, refetch, toast]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Produk dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus produk', variant: 'destructive' });
    }
  }, [deleteMutation, refetch, toast]);

  const handleExport = useCallback(() => {
    const rows = [['Kode', 'Nama', 'Kategori', 'Harga Beli', 'Harga Jual', 'Stok', 'Satuan', 'Min Stok'],
    ...products.map(p => [p.code, p.name, p.category, formatCurrency(p.buyPrice), formatCurrency(p.sellPrice), p.stock, p.unit, p.minStock])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'produk.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [products]);

  const ProdukForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Produk *</Label>
            <Input placeholder="Nama produk" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Kategori *</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(p => ({ ...p, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Satuan</Label>
              <Input placeholder="Pcs, Kg, dll" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Harga Beli (Rp)</Label>
              <Input type="number" placeholder="0" value={form.buyPrice} onChange={e => setForm(p => ({ ...p, buyPrice: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Harga Jual (Rp)</Label>
              <Input type="number" placeholder="0" value={form.sellPrice} onChange={e => setForm(p => ({ ...p, sellPrice: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Stok Awal</Label>
              <Input type="number" placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Min. Stok</Label>
              <Input type="number" placeholder="0" value={form.minStock} onChange={e => setForm(p => ({ ...p, minStock: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Gudang</Label>
            <Select value={form.warehouseId} onValueChange={v => setForm(p => ({ ...p, warehouseId: v }))}>
              <SelectTrigger><SelectValue placeholder="Pilih gudang" /></SelectTrigger>
              <SelectContent>{warehouses.filter(w => w.status === 'aktif').map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Produk" subtitle="Kelola daftar produk dan kategori">
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Produk" value={`${products.length} Produk`} icon={<Package className="h-5 w-5" />} color="primary" />
        <StatCard title="Total Kategori" value={`${categories.length} Kategori`} icon={<Package className="h-5 w-5" />} color="info" />
        <StatCard title="Nilai Persediaan" value={stats.totalNilai} icon={<Package className="h-5 w-5" />} color="success" />
        <StatCard title="Stok Rendah" value={`${stats.lowStock} Produk`} icon={<AlertTriangle className="h-5 w-5" />} color={stats.lowStock > 0 ? 'warning' : 'success'} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari produk..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="rendah">Stok Rendah</SelectItem>
              <SelectItem value="aman">Aman</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm({ name: '', categoryId: '', buyPrice: '', sellPrice: '', stock: '', minStock: '', unit: '', warehouseId: '' }); setDialogOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Produk
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={products}
            columns={columns}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="Tidak ada produk yang sesuai."
            serverSide
            pagination={pagination ? {
              page: pagination.page,
              totalPages: pagination.totalPages,
              onPageChange: setPage,
            } : undefined}
          />
        </CardContent>
      </Card>

      <ProdukForm open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) { setEditItem(null); setForm({ name: '', categoryId: '', buyPrice: '', sellPrice: '', stock: '', minStock: '', unit: '', warehouseId: '' }); } }} title={editItem ? `Edit Produk: ${editItem.name}` : 'Tambah Produk Baru'} />
    </MainLayout>
  );
};

export default Produk;