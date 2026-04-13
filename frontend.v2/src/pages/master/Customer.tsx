import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTableSort } from '@/hooks/useTableSort';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DataTable, FormDialog, type DataTableColumn, type FormField, PaginationControl } from '@/components/common';

import { Plus, Search, Pencil, Trash2, Phone, MapPin, AlertCircle, Download, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import type { Customer } from '@/types';
import { exportToXlsx, type ColumnConfig, getFilenameWithDate } from '@/lib/xlsx-export';

const CustomerPage = () => {
  const { isOwner } = useAuth();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { sortBy, sortDirection, toggleSort, getSortIcon } = useTableSort<'nama' | 'kota' | 'total_piutang'>('nama');
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
           { header: 'ID Customer', key: 'id', format: (v) => `CUS-${v}`, width: 12 },
           { header: 'Nama Customer', key: 'name', width: 30 },
           { header: 'Alamat', key: 'address', width: 35 },
           { header: 'Kota', key: 'city', width: 15 },
           { header: 'Telepon 1', key: 'phone', width: 15 },
           { header: 'Telepon 2', key: 'phone2', width: 15 },
           { header: 'Email', key: 'email', width: 25 },
           {
             header: 'Limit Kredit',
             key: 'creditLimit',
             format: (value) => typeof value === 'number' ? value : Number(value) || 0,
             width: 15,
           },
           {
             header: 'Discount',
             key: 'discount',
             format: (value) => typeof value === 'number' ? value : Number(value) || 0,
             width: 12,
           },
           { header: 'Gudang', key: 'warehouse', width: 20 },
           { header: 'Price List', key: 'priceList', width: 20 },
           { header: 'Daerah', key: 'area', width: 15 },
           { header: 'Keterangan', key: 'notes', width: 30 },
           { header: 'NPWP', key: 'npwp', width: 20 },
           {
             header: 'Total Piutang',
             key: 'balance',
             format: (value) => typeof value === 'number' ? value : Number(value) || 0,
             width: 15,
           },
         ];

         const filename = getFilenameWithDate('Customer');
         exportToXlsx(
           customers,
           filename,
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

  const columns: DataTableColumn<Customer>[] = [
    { key: 'id', header: 'ID', width: '100px', render: (id) => `CUS-${id}` },
    { key: 'name', header: 'Nama', width: '150px', sortable: true },
    {
      key: 'phone',
      header: 'Telepon',
      render: (phone) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          {phone || '-'}
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (email) => email || '-' },
    {
      key: 'address',
      header: 'Alamat',
      width: '200px',
      render: (address) => (
        <div className="flex items-start gap-1.5 text-muted-foreground max-w-48">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{address || '-'}</span>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Total Piutang',
      align: 'right',
      sortable: true,
      render: (balance) => (
        <span className={`font-semibold tabular-nums ${balance > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
          {formatCurrency(balance)}
        </span>
      ),
    },
    { key: 'creditLimit', header: 'Limit Kredit', align: 'right', render: (limit) => formatCurrency(limit || 0) },
    { key: 'totalTransactions', header: 'Transaksi', align: 'right', render: (count) => count || 0 },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (c: Customer) => openEdit(c),
      show: () => canEdit('customers'),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (c: Customer) => setDeleteConfirm({ id: c.id, name: c.name }),
      variant: 'destructive' as const,
      show: () => canDelete('customers'),
    },
  ];

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Nama Customer *',
      type: 'text',
      placeholder: 'Nama lengkap',
      value: form.name,
      onChange: (v) => setForm(p => ({ ...p, name: v })),
      required: true,
      width: 'full',
      validation: (v) => !v?.trim() ? 'Nama harus diisi' : null,
    },
    {
      name: 'phone',
      label: 'No. Telepon',
      type: 'text',
      placeholder: '08...',
      value: form.phone,
      onChange: (v) => setForm(p => ({ ...p, phone: v })),
      width: 'half',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'email@...',
      value: form.email,
      onChange: (v) => setForm(p => ({ ...p, email: v })),
      width: 'half',
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'text',
      placeholder: 'Alamat lengkap',
      value: form.address,
      onChange: (v) => setForm(p => ({ ...p, address: v })),
      width: 'full',
    },
    {
      name: 'credit_limit',
      label: 'Limit Kredit (Rp)',
      type: 'number',
      placeholder: '10000000',
      value: form.credit_limit,
      onChange: (v) => setForm(p => ({ ...p, credit_limit: v })),
      width: 'full',
    },
  ];

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

       <Card>
         <CardContent className="p-0">
           <DataTable<Customer>
             data={customers}
             columns={columns}
             isLoading={isLoading}
             sortBy={sortBy}
             sortDirection={sortDirection}
             onSort={toggleSort}
             actions={actions}
             emptyMessage="Tidak ada customer yang sesuai."
           />
         </CardContent>
       </Card>

       {/* Pagination UI */}
         {pagination && (
           <PaginationControl
             currentPage={pagination.current_page}
             onPageChange={setCurrentPage}
             totalPages={pagination.last_page}
             totalItems={pagination.total}
             itemsPerPage={pagination.per_page}
             type="simple"
             label="customer"
           />
         )}

       <FormDialog
         open={isAddOpen || !!editItem}
         onOpenChange={(open) => {
           if (!open) {
             setIsAddOpen(false);
             setEditItem(null);
             setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
           }
         }}
         title={editItem ? 'Edit Customer' : 'Tambah Customer Baru'}
         fields={fields}
         onSubmit={handleSave}
         onCancel={() => {
           setIsAddOpen(false);
           setEditItem(null);
           setForm({ name: '', phone: '', email: '', address: '', credit_limit: '10000000' });
         }}
         isSubmitting={createMutation.isPending || updateMutation.isPending}
         submitLabel="Simpan"
       />

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
