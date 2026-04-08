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
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/ui/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSalesReps, useCreateSalesRep, useUpdateSalesRep, useDeleteSalesRep } from '@/hooks/api/useSalesReps';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface SalesRep {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  totalSales: number;
}

const Sales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SalesRep | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', status: 'active' });
  const { toast } = useToast();

  const { data, isLoading, refetch } = useSalesReps({ per_page: 100, search: searchTerm });
  const createMutation = useCreateSalesRep();
  const updateMutation = useUpdateSalesRep();
  const deleteMutation = useDeleteSalesRep();

  const list = (data?.data?.data ?? []) as SalesRep[];

  const activeCount = list.filter(s => s.status === 'active').length;
  const totalPenjualan = list.reduce((s, r) => s + (r.totalSales || 0), 0);

  const openEdit = (s: SalesRep) => {
    setEditItem(s);
    setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', status: s.status });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      const payload = { name: form.name, phone: form.phone, email: form.email, address: form.address, status: form.status };
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Sales diperbarui', description: `${form.name} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Sales ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm({ name: '', phone: '', email: '', address: '', status: 'active' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan sales';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Sales dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus sales', variant: 'destructive' });
    }
  };

  const SalesForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Sales *</Label>
            <Input placeholder="Nama sales" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>No. Telepon</Label>
              <Input placeholder="08..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Alamat / Area Kerja</Label>
            <Input placeholder="Jakarta Utara" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
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
    <MainLayout title="Sales" subtitle="Kelola daftar sales / marketing">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Sales" value={`${list.length} Sales`} icon={<TrendingUp className="h-5 w-5" />} color="primary" />
        <StatCard title="Sales Aktif" value={`${activeCount} Aktif`} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Penjualan" value={totalPenjualan} icon={<TrendingUp className="h-5 w-5" />} color="info" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari sales..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button size="sm" onClick={() => { setForm({ name: '', phone: '', email: '', address: '', status: 'active' }); setIsAddOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" />Tambah Sales
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-muted-foreground">Tidak ada data sales.</div>
          ) : list.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(s => {
            const initials = s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <Card key={s.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-muted-foreground">#{s.id}</span>
                          <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <CardTitle className="mt-0.5 text-base">{s.name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Sales</AlertDialogTitle>
                            <AlertDialogDescription>Hapus <strong>{s.name}</strong>?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(s.id, s.name)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />{s.phone || '-'}
                  </div>
                  {s.email && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />{s.email}
                  </div>}
                  {s.address && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs truncate max-w-48">{s.address}</span>
                  </div>}
                  <div className="border-t pt-2.5 mt-1">
                    <p className="text-xs text-muted-foreground">Total Penjualan</p>
                    <p className="font-bold text-primary text-sm">{formatRupiah(s.totalSales || 0)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SalesForm open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Sales Baru" />
      <SalesForm open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Sales" />
    </MainLayout>
  );
};

export default Sales;
