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
import { Plus, Search, Pencil, Trash2, Download, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/api/useSuppliers';
import type { Supplier } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const SupplierPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const { toast } = useToast();

  const { data, isLoading, refetch } = useSuppliers({ per_page: 100, search: searchTerm });
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const suppliers = (data?.data?.data ?? []) as Supplier[];

  const totalUtang = suppliers.reduce((s, sup) => s + (sup.balance || 0), 0);
  const withDebt = suppliers.filter(s => (s.balance || 0) > 0).length;

  const openEdit = (s: Supplier) => {
    setEditItem(s);
    setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '' });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: { name: form.name, phone: form.phone, email: form.email, address: form.address },
        });
        toast({ title: 'Supplier diperbarui', description: `${form.name} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync({ name: form.name, phone: form.phone, email: form.email, address: form.address });
        toast({ title: 'Supplier ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm({ name: '', phone: '', email: '', address: '' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan supplier';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Supplier dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus supplier', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const rows = [['Kode', 'Nama', 'Telepon', 'Email', 'Alamat', 'Saldo Utang', 'Total Transaksi'],
    ...suppliers.map(s => [`SUP-${s.id}`, s.name, s.phone, s.email || '', s.address || '', formatRupiah(s.balance), s.totalTransactions || 0])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'supplier.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Supplier *</Label>
            <Input placeholder="Nama supplier" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>No. Telepon</Label>
              <Input placeholder="08..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Alamat</Label>
            <Input placeholder="Alamat lengkap" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Supplier" value={`${suppliers.length} Supplier`} icon={<Building2 className="h-5 w-5" />} color="primary" />
        <StatCard title="Supplier Berutang" value={`${withDebt} Supplier`} icon={<Building2 className="h-5 w-5" />} color="warning" />
        <StatCard title="Total Utang" value={totalUtang} icon={<Building2 className="h-5 w-5" />} color="destructive" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari supplier..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm({ name: '', phone: '', email: '', address: '' }); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Supplier
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Nama</th>
                    <th className="px-4 py-3 text-left font-semibold">Telepon</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-right font-semibold">Transaksi</th>
                    <th className="px-4 py-3 text-right font-semibold">Saldo Utang</th>
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data supplier.</td></tr>
                  ) : (
                    suppliers.map(s => (
                      <tr key={s.id} className="border-b transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs text-primary">SUP-{s.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-48">{s.address || '-'}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{s.phone || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.email || '-'}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{s.totalTransactions || 0}</td>
                        <td className="px-4 py-3 text-right">
                          {(s.balance || 0) > 0
                            ? <span className="font-semibold text-destructive tabular-nums">{formatRupiah(s.balance || 0)}</span>
                            : <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Supplier</AlertDialogTitle>
                                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus <strong>{s.name}</strong>?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(s.id, s.name)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <FormDialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Supplier Baru" />
      <FormDialog open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Supplier" />
    </MainLayout>
  );
};

export default SupplierPage;
