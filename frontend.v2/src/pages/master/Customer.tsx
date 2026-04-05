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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Pencil, Trash2, Phone, MapPin, AlertCircle, Download, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomers';
import type { Customer } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const CustomerPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
  const { toast } = useToast();

  const { data, isLoading, refetch } = useCustomers({ per_page: 100, search: searchTerm });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers = (data?.data?.data ?? []) as Customer[];

  const totalPiutang = customers.reduce((s, c) => s + (c.balance || 0), 0);
  const overLimit = customers.filter(c => (c.creditLimit || 0) > 0 && (c.balance || 0) > (c.creditLimit || 0)).length;

  const openEdit = (c: Customer) => {
    setEditItem(c);
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', credit_limit: String(c.creditLimit || 0) });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: { name: form.name, phone: form.phone, email: form.email, address: form.address, credit_limit: Number(form.credit_limit) },
        });
        toast({ title: 'Customer diperbarui', description: `${form.name} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync({ name: form.name, phone: form.phone, email: form.email, address: form.address, credit_limit: Number(form.credit_limit) });
        toast({ title: 'Customer ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan customer';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Customer dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus customer', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const rows = [['Kode', 'Nama', 'Telepon', 'Email', 'Alamat', 'Total Piutang', 'Limit Kredit'],
    ...customers.map(c => [`CUS-${c.id}`, c.name, c.phone, c.email || '', c.address || '', formatRupiah(c.balance), formatRupiah(c.creditLimit || 0)])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customer.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Customer *</Label>
            <Input placeholder="Nama customer" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>No. Telepon</Label>
              <Input placeholder="08..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Alamat</Label>
            <Input placeholder="Alamat lengkap" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Limit Kredit (Rp)</Label>
            <Input type="number" placeholder="10000000" value={form.credit_limit} onChange={e => setForm(p => ({ ...p, credit_limit: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Customer" value={`${customers.length} Customer`} icon={<Users className="h-5 w-5" />} color="primary" />
        <StatCard title="Total Piutang" value={totalPiutang} icon={<AlertCircle className="h-5 w-5" />} color="warning" />
        <StatCard title="Melebihi Limit" value={`${overLimit} Customer`} icon={<AlertCircle className="h-5 w-5" />} color="destructive" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari customer..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">Semua ({customers.length})</TabsTrigger>
              <TabsTrigger value="piutang" className="text-xs">Piutang ({customers.filter(c => c.balance > 0).length})</TabsTrigger>
              <TabsTrigger value="overlimit" className="text-xs text-destructive">Over Limit ({overLimit})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' }); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Customer
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
                    <th className="px-4 py-3 text-left font-semibold">Alamat</th>
                    <th className="px-4 py-3 text-right font-semibold">Total Piutang</th>
                    <th className="px-4 py-3 text-right font-semibold">Limit Kredit</th>
                    <th className="px-4 py-3 text-right font-semibold">Transaksi</th>
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Tidak ada customer yang sesuai.</td></tr>
                  ) : (
                    customers.filter(c => {
                      if (activeTab === 'piutang') return c.balance > 0;
                      if (activeTab === 'overlimit') return (c.creditLimit || 0) > 0 && c.balance > (c.creditLimit || 0);
                      return true;
                    }).map(c => {
                      const isOverLimit = (c.creditLimit || 0) > 0 && c.balance > (c.creditLimit || 0);
                      return (
                        <tr key={c.id} className={`border-b transition-colors hover:bg-muted/20 ${isOverLimit ? 'bg-destructive/5' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs text-primary">CUS-{c.id}</td>
                          <td className="px-4 py-3 font-medium">{c.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 shrink-0" />{c.phone || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{c.email || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-1.5 text-muted-foreground max-w-48">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span className="line-clamp-2">{c.address || '-'}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold tabular-nums ${c.balance > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                            {formatRupiah(c.balance)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                            {formatRupiah(c.creditLimit || 0)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {c.totalTransactions || 0}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Customer</AlertDialogTitle>
                                    <AlertDialogDescription>Apakah Anda yakin ingin menghapus <strong>{c.name}</strong>?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(c.id, c.name)}>Hapus</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <FormDialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Customer Baru" />
      <FormDialog open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Customer" />
    </MainLayout>
  );
};

export default CustomerPage;
