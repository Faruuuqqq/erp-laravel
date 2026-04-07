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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/api/useWarehouses';

interface WarehouseType {
  id: string;
  name: string;
  address: string;
  status: string;
  totalProducts: number;
}

const Gudang = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<WarehouseType | null>(null);
  const [form, setForm] = useState({ name: '', address: '', status: 'active' });
  const { toast } = useToast();

  const { data, isLoading, refetch } = useWarehouses({ per_page: 100, search: searchTerm });
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  const list = (data?.data?.data ?? []) as WarehouseType[];

  const activeCount = list.filter(g => g.status === 'active').length;
  const productCount = list.reduce((s, g) => s + (g.totalProducts || 0), 0);

  const openEdit = (g: WarehouseType) => {
    setEditItem(g);
    setForm({ name: g.name, address: g.address || '', status: g.status });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      const payload = { name: form.name, address: form.address };
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Gudang diperbarui', description: `${form.name} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Gudang ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm({ name: '', address: '', status: 'active' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan gudang';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Gudang dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus gudang', variant: 'destructive' });
    }
  };

  const GudangForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Gudang *</Label>
            <Input placeholder="Nama gudang" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Alamat</Label>
            <Input placeholder="Alamat gudang" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
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
        <Button size="sm" onClick={() => { setForm({ name: '', address: '', status: 'active' }); setIsAddOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" />Tambah Gudang
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-muted-foreground">Tidak ada data gudang.</div>
          ) : list.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(g => (
            <Card key={g.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Warehouse className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">#{g.id}</span>
                        <Badge variant={g.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {g.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-0.5 text-base">{g.name}</CardTitle>
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
                          <AlertDialogDescription>Hapus <strong>{g.name}</strong>?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(g.id, g.name)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2 text-xs">{g.address || '—'}</span>
                </div>
                <div className="border-t pt-2.5 mt-1">
                  <p className="text-xs text-muted-foreground">Produk tersimpan</p>
                  <p className="font-bold text-primary">{g.totalProducts || 0} produk</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GudangForm open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Gudang Baru" />
      <GudangForm open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Gudang" />
    </MainLayout>
  );
};

export default Gudang;
