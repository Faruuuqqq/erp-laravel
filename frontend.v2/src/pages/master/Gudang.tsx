import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
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
   const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
   const [statusFilter, setStatusFilter] = useState<'aktif' | 'nonaktif' | 'semua'>('semua');
   const [isAddOpen, setIsAddOpen] = useState(false);
   const [editId, setEditId] = useState<string | null>(null);
   const [form, setForm] = useState<WarehouseForm>(BLANK_FORM());
   const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useWarehouses({ page: currentPage, per_page: 20, status: statusFilter === 'semua' ? undefined : statusFilter });
  const createWh = useCreateWarehouse();
  const updateWh = useUpdateWarehouse();
  const deleteWh = useDeleteWarehouse();

   const list = data?.data ?? [];
   const pagination = data?.meta;

   const activeCount = list.filter(w => w.status === 'aktif' || w.status === 'active').length;

  const openEdit = useCallback((g: typeof list[0]) => {
    setEditId(g.id);
    setForm({ name: g.name, address: g.address ?? '', manager: g.manager ?? '', status: (g.status as 'aktif' | 'nonaktif') ?? 'aktif' });
  }, []);

   const handleSave = useCallback(async () => {
     if (!form.name.trim()) return toast({ title: 'Nama gudang harus diisi', variant: 'destructive' });
     await executeRetryable(
       async () => {
         if (editId) {
           await updateWh.mutateAsync({ id: editId, data: { name: form.name, address: form.address, manager: form.manager, status: form.status } });
           setEditId(null);
         } else {
           await createWh.mutateAsync({ name: form.name, address: form.address, manager: form.manager, status: form.status });
           setIsAddOpen(false);
         }
         setForm(BLANK_FORM());
       },
       {
         title: editId ? 'Gudang diperbarui' : 'Gudang ditambahkan',
         description: `${form.name} berhasil ${editId ? 'diperbarui' : 'ditambahkan'}.`,
         errorTitle: `Gagal ${editId ? 'memperbarui' : 'menambahkan'} gudang`,
       }
     );
   }, [form, editId, createWh, updateWh, toast, executeRetryable]);

   const handleDelete = useCallback(async (id: string, name: string) => {
     await executeRetryable(
       () => deleteWh.mutateAsync(id),
       {
         title: 'Gudang dihapus',
         description: `${name} telah dihapus.`,
         errorTitle: 'Gagal menghapus gudang',
       }
     );
   }, [deleteWh, executeRetryable]);

   const setField = useCallback(<K extends keyof WarehouseForm>(key: K, val: WarehouseForm[K]) =>
     setForm(p => ({ ...p, [key]: val })), []);

   return (
     <MainLayout title="Gudang" subtitle="Kelola daftar gudang penyimpanan">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Gudang" value={`${list.length} Gudang`} icon={<Warehouse className="h-5 w-5" />} color="primary" />
        <StatCard title="Gudang Aktif" value={`${activeCount} Aktif`} icon={<Warehouse className="h-5 w-5" />} color="success" />
        <StatCard title="Gudang Nonaktif" value={`${list.length - activeCount} Nonaktif`} icon={<Warehouse className="h-5 w-5" />} color="warning" />
      </div>

       <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
         <div className="flex gap-3">
           <div className="relative w-72">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
             <Input placeholder="Cari gudang..." className="pl-9 h-9" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
           </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as 'aktif' | 'nonaktif' | 'semua'); setCurrentPage(1); }}>
             <SelectTrigger className="w-48">
               <SelectValue placeholder="Filter Status" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="semua">Semua Status</SelectItem>
               <SelectItem value="aktif">Aktif</SelectItem>
               <SelectItem value="nonaktif">Nonaktif</SelectItem>
             </SelectContent>
           </Select>
         </div>
        {canCreate('master.warehouses') && (
          <Button size="sm" onClick={() => { setForm(BLANK_FORM()); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Gudang
          </Button>
        )}
      </div>

       {isLoading ? (
         <div className="py-12 text-center text-muted-foreground">Memuat data...</div>
       ) : (
         <Card>
           <CardContent className="p-0">
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Kode</TableHead>
                     <TableHead>Nama Gudang</TableHead>
                     <TableHead>Alamat</TableHead>
                     <TableHead>Pengelola</TableHead>
                     <TableHead>Status</TableHead>
                     {(canEdit('master.warehouses') || canDelete('master.warehouses')) && <TableHead className="text-center">Aksi</TableHead>}
                   </TableRow>
                 </TableHeader>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={(canEdit('master.warehouses') || canDelete('master.warehouses')) ? 6 : 5} className="py-10 text-center text-muted-foreground">Tidak ada gudang yang sesuai.</TableCell>
                      </TableRow>
                    ) : list.map(g => (
                     <TableRow key={g.id}>
                        <TableCell className="font-mono text-xs text-primary">{g.code ?? 'W-' + g.id.slice(0, 4)}</TableCell>
                       <TableCell className="font-medium">{g.name}</TableCell>
                       <TableCell className="text-muted-foreground text-sm max-w-48 line-clamp-2">{g.address || '—'}</TableCell>
                       <TableCell className="text-muted-foreground">{g.manager || '—'}</TableCell>
                       <TableCell>
                         <Badge variant={g.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
                           {g.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                         </Badge>
                       </TableCell>
                       {(canEdit('master.warehouses') || canDelete('master.warehouses')) && (
                         <TableCell>
                           <div className="flex justify-center gap-1">
                             {canEdit('master.warehouses') && (
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}>
                                 <Pencil className="h-3.5 w-3.5" />
                               </Button>
                             )}
                             {canDelete('master.warehouses') && (
                               <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                     <Trash2 className="h-3.5 w-3.5" />
                                   </Button>
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
                         </TableCell>
                       )}
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           </CardContent>
          </Card>
        )}

        {/* Pagination UI */}
        {pagination && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-4 bg-card">
            <div className="text-sm text-muted-foreground">
              Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} total
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Halaman {pagination.current_page} dari {pagination.last_page}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isAddOpen || !!editId} onOpenChange={v => {
          if (!v) { setIsAddOpen(false); setEditId(null); setForm(BLANK_FORM()); }
        }}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editId ? 'Edit Gudang' : 'Tambah Gudang Baru'}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-1">
             <div className="space-y-1.5">
               <Label>Nama Gudang *</Label>
               <Input placeholder="Nama gudang" value={form.name} onChange={e => setField('name', e.target.value)} />
             </div>
             <div className="space-y-1.5">
               <Label>Alamat</Label>
               <Input placeholder="Alamat gudang" value={form.address} onChange={e => setField('address', e.target.value)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label>Pengelola</Label>
                 <Input placeholder="Nama pengelola" value={form.manager} onChange={e => setField('manager', e.target.value)} />
               </div>
               <div className="space-y-1.5">
                 <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: 'aktif' | 'nonaktif') => setField('status', v)}>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="aktif">Aktif</SelectItem>
                     <SelectItem value="nonaktif">Nonaktif</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => {
                 setIsAddOpen(false);
                 setEditId(null);
                 setForm(BLANK_FORM());
               }}>Batal</Button>
               <Button onClick={handleSave} disabled={createWh.isPending || updateWh.isPending}>
                 {(createWh.isPending || updateWh.isPending) ? 'Menyimpan...' : 'Simpan'}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </MainLayout>
   );
 };

 export default Gudang;
