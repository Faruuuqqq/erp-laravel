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
import { Plus, Search, Pencil, Trash2, MapPin, Warehouse, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/api/useWarehouses';
import { formatCurrency } from '@/lib/utils';

interface WarehouseType {
  id: string;
  name: string;
  address: string;
  status: string;
  totalProducts: number;
}

const Gudang = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<WarehouseType | null>(null);
  const [form, setForm] = useState({ name: '', address: '', status: 'active' });
  const { toast } = useToast();

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const isAddOpen = dialogOpen && !editItem;

  const { data, isLoading, refetch } = useWarehouses({ per_page: 20, search: debouncedSearch, page });
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  const list = (data?.data?.data ?? []) as WarehouseType[];

  const pagination = data?.data?.meta ? {
    page: data.data.meta.current_page,
    totalPages: data.data.meta.last_page,
    total: data.data.meta.total,
  } : null;

  const stats = useMemo(() => ({
    activeCount: list.filter(g => g.status === 'active').length,
    productCount: list.reduce((s, g) => s + (g.totalProducts || 0), 0),
  }), [list]);

  const columns: ColumnDef<WarehouseType>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Gudang',
      sortable: true,
      className: 'w-40',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Warehouse className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-xs text-muted-foreground font-mono">#{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Alamat',
      sortable: false,
      className: 'max-w-48',
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
      key: 'totalProducts',
      header: 'Total Produk',
      sortable: true,
      className: 'w-28 text-center',
      render: (row) => <span className="font-semibold text-primary">{row.totalProducts || 0}</span>,
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
                <AlertDialogTitle>Hapus Gudang</AlertDialogTitle>
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

  const openEdit = useCallback((g: WarehouseType) => {
    setEditItem(g);
    setForm({ name: g.name, address: g.address || '', status: g.status });
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return;
    try {
      const payload = { name: form.name, address: form.address };
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Gudang diperbarui', description: `${form.name} berhasil diperbarui.` });
        setDialogOpen(false);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Gudang ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setDialogOpen(false);
      }
      setForm({ name: '', address: '', status: 'active' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan gudang';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }, [form, editItem, createMutation, updateMutation, refetch, toast]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Gudang dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus gudang', variant: 'destructive' });
    }
  }, [deleteMutation, refetch, toast]);

  const handleExport = useCallback(() => {
    const rows = [
      ['ID', 'Nama Gudang', 'Alamat', 'Status', 'Total Produk'],
      ...list.map(g => [
        g.id,
        g.name,
        g.address || '-',
        g.status === 'active' ? 'Aktif' : 'Nonaktif',
        g.totalProducts || 0,
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gudang.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [list]);

  const GudangForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
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
        <StatCard title="Gudang Aktif" value={`${stats.activeCount} Aktif`} icon={<Warehouse className="h-5 w-5" />} color="success" />
        <StatCard title="Total Produk Tersimpan" value={`${stats.productCount} Produk`} icon={<Warehouse className="h-5 w-5" />} color="info" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari gudang..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
          <Button size="sm" onClick={() => { setForm({ name: '', address: '', status: 'active' }); setDialogOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Gudang
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
            emptyMessage="Tidak ada data gudang."
            serverSide
            pagination={pagination ? {
              page: pagination.page,
              totalPages: pagination.totalPages,
              onPageChange: setPage,
            } : undefined}
          />
        </CardContent>
      </Card>

      <GudangForm open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) { setEditItem(null); setForm({ name: '', address: '', status: 'active' }); } }} title={editItem ? `Edit Gudang: ${editItem.name}` : 'Tambah Gudang Baru'} />
    </MainLayout>
  );
};

export default Gudang;