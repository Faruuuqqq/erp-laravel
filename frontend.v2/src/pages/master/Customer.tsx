import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';

import { Plus, Search, Pencil, Trash2, Phone, MapPin, AlertCircle, Download, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import type { Customer } from '@/types';
import { exportToXlsx, type ColumnConfig } from '@/lib/xlsx-export';

const CustomerPage = () => {
  const { isOwner } = useAuth();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'nama' | 'kota' | 'total_piutang'>('nama');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
   const { toast } = useToast();
   const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const { data, isLoading } = useCustomers({ page: currentPage, per_page: 20, search: debouncedSearch || undefined, sort_by: sortBy, sort_direction: sortDirection });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

   const customers = (data?.data ?? []) as Customer[];
   const pagination = data?.meta;

   const totalPiutang = formatCurrency(customers.reduce((sum, c) => sum + Number(c.balance ?? 0), 0));
   const overLimit = customers.filter(c => Number(c.balance ?? 0) > Number(c.creditLimit ?? 0)).length;

  const toggleSort = (field: 'nama' | 'kota' | 'total_piutang') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: 'nama' | 'kota' | 'total_piutang' }) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const openEdit = (c: Customer) => {
    setEditItem(c);
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', credit_limit: String(c.creditLimit || 0) });
  };

   const handleSave = async () => {
     if (!form.name.trim()) return;
     await executeRetryable(
       async () => {
         if (editItem) {
           await updateMutation.mutateAsync({
             id: editItem.id,
             data: { name: form.name, phone: form.phone, email: form.email, address: form.address, credit_limit: Number(form.credit_limit) },
           });
           setEditItem(null);
         } else {
           await createMutation.mutateAsync({ name: form.name, phone: form.phone, email: form.email, address: form.address, credit_limit: Number(form.credit_limit) });
           setIsAddOpen(false);
         }
         setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
       },
       {
         title: editItem ? 'Customer diperbarui' : 'Customer ditambahkan',
         description: `${form.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
         errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} customer`,
       }
     );
   };

     const handleDelete = async (id: string, name: string) => {
       await executeRetryable(
         () => deleteMutation.mutateAsync(id),
         {
           title: 'Customer dihapus',
           description: `${name} telah dihapus.`,
           errorTitle: 'Gagal menghapus customer',
         }
       );
     };

    const handleExport = useCallback(() => {
      try {
        const columns: ColumnConfig<Customer>[] = [
          { header: 'Kode', key: 'id', format: (v) => `CUS-${v}`, width: 12 },
          { header: 'Nama', key: 'name', width: 30 },
          { header: 'Telepon', key: 'phone', width: 15 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Alamat', key: 'address', width: 35 },
          {
            header: 'Total Piutang',
            key: 'balance',
            format: (value) => typeof value === 'number' ? value : Number(value) || 0,
            width: 15,
          },
          {
            header: 'Limit Kredit',
            key: 'creditLimit',
            format: (value) => typeof value === 'number' ? value : Number(value) || 0,
            width: 15,
          },
        ];

        exportToXlsx(
          customers,
          'customer.xlsx',
          columns,
          { sheetName: 'Customer', autoWidth: true }
        );

        toast({
          title: 'Berhasil',
          description: `${customers.length} data customer diunduh dalam format XLSX.`,
        });
      } catch (error) {
        console.error('Export error:', error);
        toast({
          title: 'Gagal',
          description: 'Gagal mengunduh data customer.',
          variant: 'destructive',
        });
      }
    }, [customers, toast]);

  return (
    <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Customer" value={`${customers.length} Customer`} icon={<Users className="h-5 w-5" />} color="primary" />
        <StatCard title="Total Piutang" value={totalPiutang} icon={<AlertCircle className="h-5 w-5" />} color="warning" />
        <StatCard title="Melebihi Limit" value={`${overLimit} Customer`} icon={<AlertCircle className="h-5 w-5" />} color="destructive" />
      </div>

       <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
         <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <Input placeholder="Cari customer..." className="pl-9 h-9" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
         </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleExport} title="Download data customer dalam format Excel"><Download className="mr-1.5 h-4 w-4" />Export XLSX</Button>
            {canCreate('customers') && (
              <Button size="sm" onClick={() => { setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' }); setIsAddOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" />Tambah Customer
              </Button>
            )}
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
                     <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('nama')}>
                       <div className="flex items-center">Nama <SortIcon field="nama" /></div>
                     </th>
                     <th className="px-4 py-3 text-left font-semibold">Telepon</th>
                     <th className="px-4 py-3 text-left font-semibold">Email</th>
                     <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('kota')}>
                       <div className="flex items-center">Alamat <SortIcon field="kota" /></div>
                     </th>
                     <th className="px-4 py-3 text-right font-semibold cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('total_piutang')}>
                       <div className="flex items-center justify-end">Total Piutang <SortIcon field="total_piutang" /></div>
                     </th>
                     <th className="px-4 py-3 text-right font-semibold">Limit Kredit</th>
                     <th className="px-4 py-3 text-right font-semibold">Transaksi</th>
                     <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                   </tr>
                 </thead>
                 <tbody>
                   {customers.length === 0 ? (
                     <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Tidak ada customer yang sesuai.</td></tr>
                   ) : (
                     customers.map(c => {
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
                            {formatCurrency(c.balance)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                            {formatCurrency(c.creditLimit || 0)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {c.totalTransactions || 0}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1">
                              {canEdit('customers') && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                              )}
                               {canDelete('customers') && (
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm({ id: c.id, name: c.name })}><Trash2 className="h-3.5 w-3.5" /></Button>
                               )}
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

      {/* ✅ BEST PRACTICE: Dialog inline JSX (not nested function) */}
      <Dialog open={isAddOpen || !!editItem} onOpenChange={v => {
        if (!v) {
          setIsAddOpen(false);
          setEditItem(null);
          setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Edit Customer' : 'Tambah Customer Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Nama Customer *</Label>
              <Input 
                placeholder="Nama customer" 
                value={form.name} 
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>No. Telepon</Label>
                <Input 
                  placeholder="08..." 
                  value={form.phone} 
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} 
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="email@..." 
                  value={form.email} 
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Alamat</Label>
              <Input 
                placeholder="Alamat lengkap" 
                value={form.address} 
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))} 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Limit Kredit (Rp)</Label>
              <Input 
                type="number" 
                placeholder="10000000" 
                value={form.credit_limit} 
                onChange={e => setForm(p => ({ ...p, credit_limit: e.target.value }))} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddOpen(false);
                  setEditItem(null);
                  setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
                }}
              >
                Batal
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
       </Dialog>

       {deleteConfirm && (
         <DeleteConfirmDialog
           itemName={deleteConfirm.name}
           itemType="customer"
           itemId={deleteConfirm.id}
           isDeleting={deleteMutation.isPending}
           onConfirm={async () => {
             await handleDelete(deleteConfirm.id, deleteConfirm.name);
             setDeleteConfirm(null);
           }}
           onOpenChange={(open) => {
             if (!open) setDeleteConfirm(null);
           }}
         />
       )}
     </MainLayout>
   );
 };

 export default CustomerPage;
