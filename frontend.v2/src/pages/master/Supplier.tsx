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
import { Plus, Search, Pencil, Trash2, Download, Building2, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/api/useSuppliers';
import { formatCurrency } from '@/lib/utils';
import type { Supplier } from '@/types';

const SupplierPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    supplierId: '',
    name: '',
    phone1: '',
    phone2: '',
    email: '',
    address: '',
    city: '',
    contactPerson: '',
    bankAccount: '',
  });
  const { toast } = useToast();

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const isAddOpen = dialogOpen && !editItem;

  const { data, isLoading, refetch } = useSuppliers({ per_page: 20, search: debouncedSearch, page });
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const suppliers = (data?.data?.data ?? []) as Supplier[];

  const pagination = data?.data?.meta ? {
    page: data.data.meta.current_page,
    totalPages: data.data.meta.last_page,
    total: data.data.meta.total,
  } : null;

  const stats = useMemo(() => ({
    totalUtang: suppliers.reduce((s, sup) => s + (sup.balance || 0), 0),
    withDebt: suppliers.filter(s => (s.balance || 0) > 0).length,
  }), [suppliers]);

  const columns: ColumnDef<Supplier>[] = useMemo(() => [
    {
      key: 'supplierId',
      header: 'ID Supplier',
      sortable: true,
      className: 'w-24',
      render: (row) => <span className="font-mono text-xs font-semibold text-primary">{row.supplierId || '-'}</span>,
    },
    {
      key: 'name',
      header: 'Nama',
      sortable: true,
      className: 'w-40',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'address',
      header: 'Alamat',
      sortable: false,
      className: 'max-w-40',
      render: (row) => <span className="truncate text-muted-foreground">{row.address || '-'}</span>,
    },
    {
      key: 'city',
      header: 'Kota',
      sortable: true,
      className: 'w-28',
      render: (row) => <span className="text-muted-foreground">{row.city || '-'}</span>,
    },
    {
      key: 'phone1',
      header: 'Telepon',
      sortable: false,
      className: 'w-32',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{row.phone1 || '-'}</span>
          </div>
          {row.phone2 && <div className="text-xs text-muted-foreground pl-5">{row.phone2}</div>}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      className: 'w-40',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-muted-foreground">{row.email || '-'}</span>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Saldo Utang',
      sortable: true,
      className: 'w-32 text-right',
      render: (row) => (row.balance || 0) > 0
        ? <span className="font-semibold text-destructive tabular-nums">{formatCurrency(row.balance || 0)}</span>
        : <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>,
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
                <AlertDialogTitle>Hapus Supplier</AlertDialogTitle>
                <AlertDialogDescription>Apakah Anda yakin ingin menghapus <strong>{row.name}</strong>?</AlertDialogDescription>
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

  const openEdit = (s: Supplier) => {
    setEditItem(s);
    setForm({
      supplierId: s.supplierId || '',
      name: s.name,
      phone1: s.phone1 || '',
      phone2: s.phone2 || '',
      email: s.email || '',
      address: s.address || '',
      city: s.city || '',
      contactPerson: s.contactPerson || '',
      bankAccount: s.bankAccount || '',
    });
  };

  const handleSave = useCallback(async () => {
    if (!form.supplierId.trim() || !form.name.trim()) {
      toast({ title: 'Error', description: 'ID Supplier dan Nama wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      const payload = { ...form };
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Supplier diperbarui', description: `${form.name} berhasil diperbarui.` });
        setDialogOpen(false);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Supplier ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setDialogOpen(false);
      }
      setForm({ supplierId: '', name: '', phone1: '', phone2: '', email: '', address: '', city: '', contactPerson: '', bankAccount: '' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan supplier';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [form, editItem, createMutation, updateMutation, refetch, toast]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Supplier dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus supplier', variant: 'destructive' });
    }
  }, [deleteMutation, refetch, toast]);

  const handleExport = useCallback(() => {
    const rows = [
      ['ID', 'Nama', 'Alamat', 'Kota', 'Telepon 1', 'Telepon 2', 'Email', 'Kontak', 'No. Rekening', 'Saldo Utang', 'Total Transaksi'],
      ...suppliers.map(s => [
        s.supplierId || '-',
        s.name,
        s.address || '-',
        s.city || '-',
        s.phone1 || '-',
        s.phone2 || '-',
        s.email || '-',
        s.contactPerson || '-',
        s.bankAccount || '-',
        formatCurrency(s.balance),
        s.totalTransactions || 0,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supplier.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [suppliers]);

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>ID Supplier *</Label>
              <Input placeholder="SUP-001" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Supplier *</Label>
              <Input placeholder="Nama supplier" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Alamat</Label>
            <Input placeholder="Alamat lengkap" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Kota</Label>
              <Input placeholder="Kota" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Kontak Person</Label>
              <Input placeholder="Nama kontak" value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Telepon 1</Label>
              <Input placeholder="08..." value={form.phone1} onChange={e => setForm(p => ({ ...p, phone1: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Telepon 2</Label>
              <Input placeholder="08..." value={form.phone2} onChange={e => setForm(p => ({ ...p, phone2: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>No. Rekening</Label>
              <Input placeholder="1234567890" value={form.bankAccount} onChange={e => setForm(p => ({ ...p, bankAccount: e.target.value }))} />
            </div>
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
    <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Supplier" value={`${suppliers.length} Supplier`} icon={<Building2 className="h-5 w-5" />} color="primary" />
        <StatCard title="Supplier Berutang" value={`${stats.withDebt} Supplier`} icon={<Building2 className="h-5 w-5" />} color="warning" />
        <StatCard title="Total Utang" value={stats.totalUtang} icon={<Building2 className="h-5 w-5" />} color="destructive" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari supplier..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm({ supplierId: '', name: '', phone1: '', phone2: '', email: '', address: '', city: '', contactPerson: '', bankAccount: '' }); setDialogOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={suppliers}
            columns={columns}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="Tidak ada data supplier."
            serverSide
            pagination={pagination ? {
              page: pagination.page,
              totalPages: pagination.totalPages,
              onPageChange: setPage,
            } : undefined}
          />
        </CardContent>
      </Card>

      <FormDialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) { setEditItem(null); setForm({ supplierId: '', name: '', phone1: '', phone2: '', email: '', address: '', city: '', contactPerson: '', bankAccount: '' }); } }} title={editItem ? `Edit Supplier: ${editItem.name}` : 'Tambah Supplier Baru'} />
    </MainLayout>
  );
};

export default SupplierPage;