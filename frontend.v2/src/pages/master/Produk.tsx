import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, Download } from 'lucide-react';
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

const BLANK_FORM = { name: '', categoryId: '', buyPrice: '', sellPrice: '', stock: '', minimumStock: '', unit: '', warehouseId: '' };

const Produk = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState(BLANK_FORM);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const { data: productsData, isLoading } = useProducts({ search: debouncedSearch || undefined, perPage: 200 });
  const { data: categoriesData } = useCategories();
  const { data: warehousesData } = useWarehouses();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const warehouses = warehousesData?.data ?? [];

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'rendah' && Number(p.stock) <= Number(p.minimumStock ?? 0)) ||
      (statusFilter === 'aman' && Number(p.stock) > Number(p.minimumStock ?? 0));
    return matchCat && matchStatus;
  });

  const totalNilai = products.reduce((s, p) => s + Number(p.buyPrice ?? 0) * Number(p.stock ?? 0), 0);
  const lowStock = products.filter(p => Number(p.stock) <= Number(p.minimumStock ?? 0)).length;

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
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Produk diperbarui', description: `${form.name} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Produk ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm(BLANK_FORM);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan produk';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Produk dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus produk', variant: 'destructive' });
    }
  };

   const handleExport = () => {
     const rows = [['Kode', 'Nama', 'Kategori', 'Harga Beli', 'Harga Jual', 'Stok', 'Satuan', 'Min Stok'],
       ...filtered.map(p => [p.code ?? '', p.name, p.categoryName ?? '', formatCurrency(Number(p.buyPrice)), formatCurrency(Number(p.sellPrice)), p.stock, p.unit, p.minimumStock])];
     const csv = rows.map(r => r.join(',')).join('\n');
     const blob = new Blob([csv], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a'); a.href = url; a.download = 'produk.csv'; a.click();
     URL.revokeObjectURL(url);
   };

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
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari produk..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
          {canCreate('products') && (
            <Button size="sm" onClick={() => { setForm(BLANK_FORM); setIsAddOpen(true); }}>
              <Plus className="mr-1.5 h-4 w-4" />Tambah Produk
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Harga Beli</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead>Stok / Level</TableHead>
                  <TableHead>Gudang</TableHead>
                  {canEdit('products') || canDelete('products') ? <TableHead className="text-center">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={(canEdit('products') || canDelete('products')) ? 8 : 7} className="py-10 text-center text-muted-foreground">Memuat data...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={(canEdit('products') || canDelete('products')) ? 8 : 7} className="py-10 text-center text-muted-foreground">Tidak ada produk yang sesuai.</TableCell></TableRow>
                ) : filtered.map(p => {
                  const isLow = Number(p.stock) <= Number(p.minimumStock ?? 0);
                  const pct = Math.min(100, Math.round((Number(p.stock) / (Number(p.minimumStock ?? 1) * 3)) * 100));
                  return (
                    <TableRow key={p.id} className={isLow ? 'bg-warning/5' : ''}>
                      <TableCell className="font-mono text-xs text-primary">{p.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted shrink-0">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.unit}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{p.categoryName}</Badge></TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(Number(p.buyPrice))}</TableCell>
                      <TableCell className="text-right font-medium text-sm">{formatCurrency(Number(p.sellPrice))}</TableCell>
                      <TableCell>
                        <div className="min-w-28">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`font-bold text-sm tabular-nums ${isLow ? 'text-destructive' : ''}`}>{p.stock}</span>
                            <span className="text-xs text-muted-foreground">/ min {p.minimumStock ?? 0}</span>
                          </div>
                          <Progress value={pct} className={`h-1 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.warehouseName}</TableCell>
                      {(canEdit('products') || canDelete('products')) && (
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            {canEdit('products') && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                            )}
                            {canDelete('products') && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                    <AlertDialogDescription>Hapus <strong>{p.name}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(p.id, p.name)}>Hapus</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
       </Card>

       <Dialog open={isAddOpen || !!editItem} onOpenChange={v => {
         if (!v) { setIsAddOpen(false); setEditItem(null); setForm(BLANK_FORM); }
       }}>
         <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle>{editItem ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-1">
             <div className="space-y-1.5">
               <Label>Nama Produk *</Label>
               <Input placeholder="Nama produk" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label>Kategori *</Label>
                 <Select value={form.categoryId} onValueChange={v => setForm(p => ({ ...p, categoryId: v }))}>
                   <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                   <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                 </Select>
               </div>
               <div className="space-y-1.5">
                 <Label>Satuan</Label>
                 <Input placeholder="Pcs, Kg, dll" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label>Harga Beli (Rp)</Label>
                 <Input type="number" placeholder="0" value={form.buyPrice} onChange={e => setForm(p => ({ ...p, buyPrice: e.target.value }))} />
               </div>
               <div className="space-y-1.5">
                 <Label>Harga Jual (Rp)</Label>
                 <Input type="number" placeholder="0" value={form.sellPrice} onChange={e => setForm(p => ({ ...p, sellPrice: e.target.value }))} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label>Stok Awal</Label>
                 <Input type="number" placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
               </div>
               <div className="space-y-1.5">
                 <Label>Min. Stok</Label>
                 <Input type="number" placeholder="0" value={form.minimumStock} onChange={e => setForm(p => ({ ...p, minimumStock: e.target.value }))} />
               </div>
             </div>
             <div className="space-y-1.5">
               <Label>Gudang</Label>
               <Select value={form.warehouseId} onValueChange={v => setForm(p => ({ ...p, warehouseId: v }))}>
                 <SelectTrigger><SelectValue placeholder="Pilih gudang" /></SelectTrigger>
                 <SelectContent>{warehouses.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
               </Select>
             </div>
             <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => {
                 setIsAddOpen(false);
                 setEditItem(null);
                 setForm(BLANK_FORM);
               }}>Batal</Button>
               <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                 {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </MainLayout>
   );
 };

 export default Produk;
