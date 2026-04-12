import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Building2, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/api/useSuppliers';
import type { Supplier as SupplierType } from '@/types';
import { exportToXlsx, type ColumnConfig, getFilenameWithDate } from '@/lib/xlsx-export';

const BLANK_FORM = { name: '', phone: '', email: '', address: '', noRekening: '' };

const Supplier = () => {
   const { canCreate, canEdit, canDelete } = usePermissions();
   const { toast } = useToast();
   const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });
  const [searchTerm, setSearchTerm] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [sortBy, setSortBy] = useState<'nama' | 'kota' | 'telepon'>('nama');
   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
   const [isAddOpen, setIsAddOpen] = useState(false);
   const [editItem, setEditItem] = useState<SupplierType | null>(null);
   const [form, setForm] = useState(BLANK_FORM);
   const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const { data: suppliersData, isLoading } = useSuppliers({ page: currentPage, search: debouncedSearch || undefined, per_page: 20, sort_by: sortBy, sort_direction: sortDirection });
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

   const suppliers = suppliersData?.data ?? [];
   const pagination = suppliersData?.meta;

   const withDebt = suppliers.filter(s => Number(s.balance ?? 0) > 0).length;
   const totalUtang = formatCurrency(suppliers.reduce((sum, s) => sum + Number(s.balance ?? 0), 0));

  const toggleSort = (field: 'nama' | 'kota' | 'telepon') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: 'nama' | 'kota' | 'telepon' }) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const openEdit = useCallback((s: SupplierType) => {
    setEditItem(s);
    setForm({ name: s.name, phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '', noRekening: s.noRekening ?? '' });
  }, []);

   const handleSave = async () => {
     if (!form.name.trim()) return;
     const payload = { name: form.name, phone: form.phone, email: form.email, address: form.address, no_rekening: form.noRekening };
     await executeRetryable(
       async () => {
         if (editItem) {
           await updateMutation.mutateAsync({ id: editItem.id, data: payload });
           setEditItem(null);
         } else {
           await createMutation.mutateAsync(payload);
           setIsAddOpen(false);
         }
         setForm(BLANK_FORM);
       },
       {
         title: editItem ? 'Supplier diperbarui' : 'Supplier ditambahkan',
         description: `${form.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
         errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} supplier`,
       }
     );
   };

    const handleDelete = async (id: string, name: string) => {
      await executeRetryable(
        () => deleteMutation.mutateAsync(id),
        {
          title: 'Supplier dihapus',
          description: `${name} telah dihapus.`,
          errorTitle: 'Gagal menghapus supplier',
        }
      );
    };

    const handleExport = useCallback(() => {
      try {
        const columns: ColumnConfig<SupplierType>[] = [
          { header: 'ID Supplier', key: 'id', width: 12 },
          { header: 'Nama Supplier', key: 'name', width: 30 },
          { header: 'Alamat', key: 'address', width: 35 },
          { header: 'Kota', key: 'city', width: 15 },
          { header: 'Telepon 1', key: 'phone', width: 15 },
          { header: 'Telepon 2', key: 'phone2', width: 15 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'No Rekening', key: 'noRekening', width: 20 },
        ];

        const filename = getFilenameWithDate('Supplier');
        exportToXlsx(
          suppliers,
          filename,
          columns,
          { sheetName: 'Supplier', autoWidth: true }
        );

        toast({
          title: 'Berhasil',
          description: `${suppliers.length} data supplier diunduh dalam format XLSX.`,
        });
      } catch (error) {
        console.error('Export error:', error);
        toast({
          title: 'Gagal',
          description: 'Gagal mengunduh data supplier.',
          variant: 'destructive',
        });
      }
    }, [suppliers, toast]);

  return (
    <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Supplier" value={`${suppliers.length} Supplier`} icon={<Building2 className="h-5 w-5" />} color="primary" />
        <StatCard title="Supplier Berutang" value={`${withDebt} Supplier`} icon={<Building2 className="h-5 w-5" />} color="warning" />
        <StatCard title="Total Utang" value={totalUtang} icon={<Building2 className="h-5 w-5" />} color="destructive" />
      </div>

       <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
         <div className="relative w-full sm:w-72">
           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <Input placeholder="Cari supplier..." className="pl-9 h-9" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
         </div>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleExport} title="Download data supplier dalam format Excel">
             <Download className="mr-1.5 h-4 w-4" />Export XLSX
           </Button>
           {canCreate('suppliers') && (
             <Button size="sm" onClick={() => { setForm(BLANK_FORM); setIsAddOpen(true); }}>
               <Plus className="mr-1.5 h-4 w-4" />Tambah Supplier
             </Button>
           )}
         </div>
      </div>

      <Card>
        <CardContent className="p-0">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Kode</TableHead>
                 <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('nama')}>
                   <div className="flex items-center">Nama Supplier <SortIcon field="nama" /></div>
                 </TableHead>
                 <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('telepon')}>
                   <div className="flex items-center">Telepon <SortIcon field="telepon" /></div>
                 </TableHead>
                 <TableHead>Email</TableHead>
                 <TableHead>No. Rekening</TableHead>
                 <TableHead className="text-right">Saldo Utang</TableHead>
                 {(canEdit('suppliers') || canDelete('suppliers')) && <TableHead className="text-center">Aksi</TableHead>}
               </TableRow>
             </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={(canEdit('suppliers') || canDelete('suppliers')) ? 7 : 6} className="py-10 text-center text-muted-foreground">Memuat data...</TableCell></TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow><TableCell colSpan={(canEdit('suppliers') || canDelete('suppliers')) ? 7 : 6} className="py-10 text-center text-muted-foreground">Tidak ada data supplier.</TableCell></TableRow>
              ) : suppliers.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-primary">{s.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-48">{s.address}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.phone ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{s.email ?? '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.noRekening ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {Number(s.balance ?? 0) > 0
                      ? <span className="font-semibold text-destructive">{formatCurrency(Number(s.balance))}</span>
                      : <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>}
                  </TableCell>
                  {(canEdit('suppliers') || canDelete('suppliers')) && (
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {canEdit('suppliers') && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                         {canDelete('suppliers') && (
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-destructive hover:text-destructive" 
                             onClick={() => setDeleteConfirm({ id: s.id, name: s.name })}
                           >
                             <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                         )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
       </Card>

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

      <Dialog open={isAddOpen || !!editItem} onOpenChange={v => {
        if (!v) { setIsAddOpen(false); setEditItem(null); setForm(BLANK_FORM); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Supplier' : 'Tambah Supplier Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Supplier *</Label>
              <Input id="name" placeholder="Masukkan nama supplier" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="supplier@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" placeholder="Masukkan alamat supplier" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noRekening">No. Rekening</Label>
              <Input id="noRekening" placeholder="Masukkan nomor rekening" value={form.noRekening} onChange={e => setForm(p => ({ ...p, noRekening: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setIsAddOpen(false);
              setEditItem(null);
              setForm(BLANK_FORM);
            }}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {deleteConfirm && (
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          itemName={deleteConfirm.name}
          itemType="Supplier"
          onConfirm={() => {
            handleDelete(deleteConfirm.id, deleteConfirm.name);
            setDeleteConfirm(null);
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </MainLayout>
  );
};

export default Supplier;
