import { useState } from 'react';
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { Progress } from '@/components/ui/progress';
import { PRODUCTS, CATEGORIES, WAREHOUSES, Product as ProductType, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Produk = () => {
  const [products, setProducts] = useState<ProductType[]>(PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductType | null>(null);
  const [form, setForm] = useState({
    nama: '', kategoriId: '', hargaBeli: '', hargaJual: '',
    stok: '', stokMinimum: '', satuan: '', gudangId: '',
  });
  const { toast } = useToast();

  const filtered = products.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.kategoriId === categoryFilter;
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'rendah' && p.stok <= p.stokMinimum) ||
      (statusFilter === 'aman' && p.stok > p.stokMinimum);
    return matchSearch && matchCat && matchStatus;
  });

  const totalNilai = products.reduce((s, p) => s + p.hargaBeli * p.stok, 0);
  const lowStock = products.filter(p => p.stok <= p.stokMinimum).length;

  const openEdit = (p: ProductType) => {
    setEditItem(p);
    setForm({
      nama: p.nama, kategoriId: p.kategoriId,
      hargaBeli: String(p.hargaBeli), hargaJual: String(p.hargaJual),
      stok: String(p.stok), stokMinimum: String(p.stokMinimum),
      satuan: p.satuan, gudangId: p.gudangId,
    });
  };

  const handleSave = () => {
    if (!form.nama.trim() || !form.kategoriId) return;
    const cat = CATEGORIES.find(c => c.id === form.kategoriId);
    const gudang = WAREHOUSES.find(g => g.id === form.gudangId);
    if (editItem) {
      setProducts(prev => prev.map(p => p.id === editItem.id ? {
        ...p, nama: form.nama, kategoriId: form.kategoriId, kategoriNama: cat?.nama || '',
        hargaBeli: Number(form.hargaBeli), hargaJual: Number(form.hargaJual),
        stok: Number(form.stok), stokMinimum: Number(form.stokMinimum),
        satuan: form.satuan, gudangId: form.gudangId, gudangNama: gudang?.nama || '',
      } : p));
      toast({ title: 'Produk diperbarui', description: `${form.nama} berhasil diperbarui.` });
      setEditItem(null);
    } else {
      const newP: ProductType = {
        id: `p${Date.now()}`,
        kode: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        nama: form.nama, kategoriId: form.kategoriId, kategoriNama: cat?.nama || '',
        hargaBeli: Number(form.hargaBeli), hargaJual: Number(form.hargaJual),
        stok: Number(form.stok), stokMinimum: Number(form.stokMinimum),
        satuan: form.satuan, gudangId: form.gudangId, gudangNama: gudang?.nama || '',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setProducts(prev => [...prev, newP]);
      toast({ title: 'Produk ditambahkan', description: `${form.nama} berhasil ditambahkan.` });
      setIsAddOpen(false);
    }
    setForm({ nama: '', kategoriId: '', hargaBeli: '', hargaJual: '', stok: '', stokMinimum: '', satuan: '', gudangId: '' });
  };

  const handleDelete = (id: string, nama: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Produk dihapus', description: `${nama} telah dihapus.`, variant: 'destructive' });
  };

  const handleExport = () => {
    const rows = [['Kode', 'Nama', 'Kategori', 'Harga Beli', 'Harga Jual', 'Stok', 'Satuan', 'Min Stok'],
    ...filtered.map(p => [p.kode, p.nama, p.kategoriNama, formatRupiah(p.hargaBeli), formatRupiah(p.hargaJual), p.stok, p.satuan, p.stokMinimum])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'produk.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const ProdukForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Produk *</Label>
            <Input placeholder="Nama produk" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Kategori *</Label>
              <Select value={form.kategoriId} onValueChange={v => setForm(p => ({ ...p, kategoriId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Satuan</Label>
              <Input placeholder="Pcs, Kg, dll" value={form.satuan} onChange={e => setForm(p => ({ ...p, satuan: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Harga Beli (Rp)</Label>
              <Input type="number" placeholder="0" value={form.hargaBeli} onChange={e => setForm(p => ({ ...p, hargaBeli: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Harga Jual (Rp)</Label>
              <Input type="number" placeholder="0" value={form.hargaJual} onChange={e => setForm(p => ({ ...p, hargaJual: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Stok Awal</Label>
              <Input type="number" placeholder="0" value={form.stok} onChange={e => setForm(p => ({ ...p, stok: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Min. Stok</Label>
              <Input type="number" placeholder="0" value={form.stokMinimum} onChange={e => setForm(p => ({ ...p, stokMinimum: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Gudang</Label>
            <Select value={form.gudangId} onValueChange={v => setForm(p => ({ ...p, gudangId: v }))}>
              <SelectTrigger><SelectValue placeholder="Pilih gudang" /></SelectTrigger>
              <SelectContent>{WAREHOUSES.filter(g => g.status === 'aktif').map(g => <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Produk" subtitle="Kelola daftar produk dan kategori">
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <StatCard title="Total Produk" value={`${products.length} Produk`} icon={<Package className="h-5 w-5" />} color="primary" />
        <StatCard title="Total Kategori" value={`${CATEGORIES.length} Kategori`} icon={<Package className="h-5 w-5" />} color="info" />
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
              {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
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
          <Button size="sm" onClick={() => { setForm({ nama: '', kategoriId: '', hargaBeli: '', hargaJual: '', stok: '', stokMinimum: '', satuan: '', gudangId: '' }); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Produk
          </Button>
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
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Tidak ada produk yang sesuai.</TableCell></TableRow>
                ) : filtered.map(p => {
                  const isLow = p.stok <= p.stokMinimum;
                  const pct = Math.min(100, Math.round((p.stok / (p.stokMinimum * 3)) * 100));
                  return (
                    <TableRow key={p.id} className={isLow ? 'bg-warning/5' : ''}>
                      <TableCell className="font-mono text-xs text-primary">{p.kode}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted shrink-0">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{p.nama}</div>
                            <div className="text-xs text-muted-foreground">{p.satuan}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{p.kategoriNama}</Badge></TableCell>
                      <TableCell className="text-right text-sm">{formatRupiah(p.hargaBeli)}</TableCell>
                      <TableCell className="text-right font-medium text-sm">{formatRupiah(p.hargaJual)}</TableCell>
                      <TableCell>
                        <div className="min-w-28">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`font-bold text-sm tabular-nums ${isLow ? 'text-destructive' : ''}`}>{p.stok}</span>
                            <span className="text-xs text-muted-foreground">/ min {p.stokMinimum}</span>
                          </div>
                          <Progress value={pct} className={`h-1 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.gudangNama}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                <AlertDialogDescription>Hapus <strong>{p.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(p.id, p.nama)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ProdukForm open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Produk Baru" />
      <ProdukForm open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Produk" />
    </MainLayout>
  );
};

export default Produk;
