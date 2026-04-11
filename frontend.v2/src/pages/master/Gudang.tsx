import { useState, useCallback, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/api/useWarehouses';

interface WarehouseForm {
  name: string;
  address: string;
  manager: string;
  status: 'aktif' | 'nonaktif';
}

const BLANK_FORM = (): WarehouseForm => ({ name: '', address: '', manager: '', status: 'aktif' });

const Gudang = () => {
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<WarehouseForm>(BLANK_FORM());

  const { data, isLoading } = useWarehouses({ perPage: 100 });
  const createWh = useCreateWarehouse();
  const updateWh = useUpdateWarehouse();
  const deleteWh = useDeleteWarehouse();

  const list = data?.data ?? [];
  const filtered = list.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = list.filter(g => g.status === 'aktif').length;

  const openEdit = useCallback((g: typeof list[0]) => {
    setEditId(g.id);
    setForm({ name: g.name, address: g.address ?? '', manager: g.manager ?? '', status: (g.status as 'aktif' | 'nonaktif') ?? 'aktif' });
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return toast({ title: 'Nama gudang harus diisi', variant: 'destructive' });
    try {
      if (editId) {
        await updateWh.mutateAsync({ id: editId, data: { name: form.name, address: form.address, manager: form.manager, status: form.status } });
        toast({ title: 'Gudang diperbarui', description: `${form.name} berhasil diperbarui.` });
        setEditId(null);
      } else {
        await createWh.mutateAsync({ name: form.name, address: form.address, manager: form.manager, status: form.status });
        toast({ title: 'Gudang ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm(BLANK_FORM());
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [form, editId, createWh, updateWh, toast]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    try {
      await deleteWh.mutateAsync(id);
      toast({ title: 'Gudang dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menghapus';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [deleteWh, toast]);

  const setField = useCallback(<K extends keyof WarehouseForm>(key: K, val: WarehouseForm[K]) =>
    setForm(p => ({ ...p, [key]: val })), []);

  const GudangFormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) { setEditId(null); setForm(BLANK_FORM()); } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Gudang *</Label>
            <Input placeholder="Nama gudang" value={form.name} onChange={e => setField('name', e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label>Alamat</Label>
            <Input placeholder="Alamat gudang" value={form.address} onChange={e => setField('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Pengelola</Label>
              <Input placeholder="Nama pengelola" value={form.manager} onChange={e => setField('manager', e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v: 'aktif' | 'nonaktif') => setField('status', v)}>
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
            <Button onClick={handleSave} disabled={createWh.isPending || updateWh.isPending}>
              {(createWh.isPending || updateWh.isPending) ? 'Menyimpan...' : 'Simpan'}
            </Button>
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
        <StatCard title="Gudang Nonaktif" value={`${list.length - activeCount} Nonaktif`} icon={<Warehouse className="h-5 w-5" />} color="warning" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari gudang..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        {canCreate('master.warehouses') && (
          <Button size="sm" onClick={() => { setForm(BLANK_FORM()); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Gudang
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-muted-foreground">Tidak ada gudang yang sesuai.</div>
          ) : filtered.map(g => (
            <Card key={g.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Warehouse className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">{g.code}</span>
                        <Badge variant={g.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
                          {g.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-0.5 text-base">{g.name}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {canEdit('master.warehouses') && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                    )}
                    {canDelete('master.warehouses') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Gudang</AlertDialogTitle>
                            <AlertDialogDescription>Hapus <strong>{g.name}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(g.id, g.name)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2 text-xs">{g.address || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">Pengelola: <span className="font-medium text-foreground">{g.manager || '—'}</span></span>
                </div>
                {g.productCount !== undefined && (
                  <div className="border-t pt-2.5 mt-1">
                    <p className="text-xs text-muted-foreground">Produk tersimpan</p>
                    <p className="font-bold text-primary">{g.productCount} produk</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GudangFormDialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Gudang Baru" />
      <GudangFormDialog open={!!editId} onOpenChange={v => { if (!v) { setEditId(null); setForm(BLANK_FORM()); } }} title="Edit Gudang" />
    </MainLayout>
  );
};

export default Gudang;
