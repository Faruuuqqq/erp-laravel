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
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, TrendingUp, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/ui/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { useSalesReps, useCreateSalesRep, useUpdateSalesRep, useDeleteSalesRep } from '@/hooks/api/useSalesReps';
import { formatCurrency } from '@/lib/utils';

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
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<SalesRep | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', status: 'active' });
  const { toast } = useToast();

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const isAddOpen = dialogOpen && !editItem;

  const { data, isLoading, refetch } = useSalesReps({ per_page: 20, search: debouncedSearch, page });
  const createMutation = useCreateSalesRep();
  const updateMutation = useUpdateSalesRep();
  const deleteMutation = useDeleteSalesRep();

  const list = (data?.data?.data ?? []) as SalesRep[];

  const pagination = data?.data?.meta ? {
    page: data.data.meta.current_page,
    totalPages: data.data.meta.last_page,
    total: data.data.meta.total,
  } : null;

  const stats = useMemo(() => ({
    activeCount: list.filter(s => s.status === 'active').length,
    totalPenjualan: list.reduce((s, r) => s + (r.totalSales || 0), 0),
  }), [list]);

  const columns: ColumnDef<SalesRep>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Sales',
      sortable: true,
      className: 'w-40',
      render: (row) => {
        const initials = row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.name}</div>
              <div className="text-xs text-muted-foreground font-mono">#{row.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Kontak',
      sortable: false,
      className: 'w-32',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{row.phone || '-'}</span>
          </div>
          {row.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground text-xs truncate max-w-40">{row.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Area',
      sortable: true,
      className: 'max-w-40',
      render: (row) => <span className="text-muted-foreground truncate block">{row.address || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-24 text-center',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'default' : 'secondary'} className="text-xs">
          {row.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'totalSales',
      header: 'Total Penjualan',
      sortable: true,
      className: 'w-32 text-right',
      render: (row) => <span className="font-semibold text-primary tabular-nums">{formatCurrency(row.totalSales || 0)}</span>,
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
                <AlertDialogTitle>Hapus Sales</AlertDialogTitle>
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

  const openEdit = useCallback((s: SalesRep) => {
    setEditItem(s);
    setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', status: s.status });
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return;
    try {
      const payload = { name: form.name, phone: form.phone, email: form.email, address: form.address, status: form.status };
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Sales diperbarui', description: `${form.name} berhasil diperbarui.` });
        setDialogOpen(false);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Sales ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setDialogOpen(false);
      }
      setForm({ name: '', phone: '', email: '', address: '', status: 'active' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan sales';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [form, editItem, createMutation, updateMutation, refetch, toast]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Sales dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus sales', variant: 'destructive' });
    }
  }, [deleteMutation, refetch, toast]);

  const handleExport = useCallback(() => {
    const rows = [
      ['ID', 'Nama', 'Telepon', 'Email', 'Alamat / Area', 'Status', 'Total Penjualan'],
      ...list.map(s => [
        s.id,
        s.name,
        s.phone || '-',
        s.email || '-',
        s.address || '-',
        s.status === 'active' ? 'Aktif' : 'Nonaktif',
        (s.totalSales || 0).toString(),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [list]);

  const SalesForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
        <StatCard title="Sales Aktif" value={`${stats.activeCount} Aktif`} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Penjualan" value={stats.totalPenjualan} icon={<TrendingUp className="h-5 w-5" />} color="info" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari sales..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm({ name: '', phone: '', email: '', address: '', status: 'active' }); setDialogOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Sales
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={list}
            columns={columns}
            keyField="id"
            isLoading={isLoading}
            emptyMessage="Tidak ada data sales."
            serverSide
            pagination={pagination ? {
              page: pagination.page,
              totalPages: pagination.totalPages,
              onPageChange: setPage,
            } : undefined}
          />
        </CardContent>
      </Card>

      <SalesForm open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) { setEditItem(null); setForm({ name: '', phone: '', email: '', address: '', status: 'active' }); } }} title={editItem ? `Edit Sales: ${editItem.name}` : 'Tambah Sales Baru'} />
    </MainLayout>
  );
};

export default Sales;