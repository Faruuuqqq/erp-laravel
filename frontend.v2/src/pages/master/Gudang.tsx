import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, Pencil, Trash2, MapPin, User, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { WAREHOUSES, Warehouse as WarehouseType, PRODUCTS } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Gudang = () => {
  const [list, setList] = useState<WarehouseType[]>(WAREHOUSES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<WarehouseType | null>(null);
  const [form, setForm] = useState({ nama: '', alamat: '', pengelola: '', status: 'aktif' as 'aktif' | 'nonaktif' });
  const { toast } = useToast();

  const filtered = list.filter(g =>
    g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = list.filter(g => g.status === 'aktif').length;
  const productCount = PRODUCTS.length;

  const openEdit = (g: WarehouseType) => {
    setEditItem(g);
    setForm({ nama: g.nama, alamat: g.alamat, pengelola: g.pengelola, status: g.status });
  };

  const handleSave = () => {
    if (!form.nama.trim()) return;
    if (editItem) {
      setList(prev => prev.map(g => g.id === editItem.id ? { ...g, ...form } : g));
      toast({ title: 'Gudang diperbarui', description: `${form.nama} berhasil diperbarui.` });
      setEditItem(null);
    } else {
      const newG: WarehouseType = {
        id: `g${Date.now()}`,
        kode: `GDG-${String(list.length + 1).padStart(3, '0')}`,
        ...form,
      };
      setList(prev => [...prev, newG]);
      toast({ title: 'Gudang ditambahkan', description: `${form.nama} berhasil ditambahkan.` });
      setIsAddOpen(false);
    }
    setForm({ nama: '', alamat: '', pengelola: '', status: 'aktif' });
  };

  const handleDelete = (id: string, nama: string) => {
    setList(prev => prev.filter(g => g.id !== id));
    toast({ title: 'Gudang dihapus', description: `${nama} telah dihapus.`, variant: 'destructive' });
  };

  const GudangForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Gudang *</Label>
            <Input placeholder="Nama gudang" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Alamat</Label>
            <Input placeholder="Alamat gudang" value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Pengelola</Label>
              <Input placeholder="Nama pengelola" value={form.pengelola} onChange={e => setForm(p => ({ ...p, pengelola: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v: 'aktif' | 'nonaktif') => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
    <MainLayout title="Gudang" subtitle="Kelola daftar gudang penyimpanan">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Gudang" value={`${list.length} Gudang`} icon={<Warehouse className="h-5 w-5" />} color="primary" />
        <StatCard title="Gudang Aktif" value={`${activeCount} Aktif`} icon={<Warehouse className="h-5 w-5" />} color="success" />
        <StatCard title="Total Produk Tersimpan" value={`${productCount} Produk`} icon={<Warehouse className="h-5 w-5" />} color="info" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari gudang..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button size="sm" onClick={() => { setForm({ nama: '', alamat: '', pengelola: '', status: 'aktif' }); setIsAddOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" />Tambah Gudang
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-muted-foreground">Tidak ada gudang yang sesuai.</div>
        ) : filtered.map(g => {
          const gudangProducts = PRODUCTS.filter(p => p.gudangId === g.id);
          return (
            <Card key={g.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Warehouse className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">{g.kode}</span>
                        <Badge variant={g.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
                          {g.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-0.5 text-base">{g.nama}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Gudang</AlertDialogTitle>
                          <AlertDialogDescription>Hapus <strong>{g.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(g.id, g.nama)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2 text-xs">{g.alamat || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">Pengelola: <span className="font-medium text-foreground">{g.pengelola || '—'}</span></span>
                </div>
                <div className="border-t pt-2.5 mt-1">
                  <p className="text-xs text-muted-foreground">Produk tersimpan</p>
                  <p className="font-bold text-primary">{gudangProducts.length} produk</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <GudangForm open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Gudang Baru" />
      <GudangForm open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Gudang" />
    </MainLayout>
  );
};

export default Gudang;
