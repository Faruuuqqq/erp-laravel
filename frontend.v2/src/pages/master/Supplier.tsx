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
import { Plus, Search, Pencil, Trash2, Building2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { PaginationControl } from '@/components/common';
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
  const { sortBy, sortDirection, toggleSort, getSortIcon } = useTableSort<'nama' | 'kota' | 'telepon'>('nama');
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

   const columns: DataTableColumn<SupplierType>[] = [
    { key: 'code', header: 'Kode', width: '80px' },
    {
      key: 'name',
      header: 'Nama Supplier',
      sortable: true,
      render: (name, supplier) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-48">{supplier.address}</div>
        </div>
      ),
    },
    { key: 'city', header: 'Kota', render: (city) => city ?? '—' },
    { key: 'phone', header: 'Telepon', sortable: true, render: (phone) => phone ?? '—' },
    { key: 'email', header: 'Email', render: (email) => email ?? '—' },
    { key: 'noRekening', header: 'No. Rekening', render: (noRek) => noRek ?? '—' },
    {
      key: 'balance',
      header: 'Saldo Utang',
      align: 'right',
      render: (balance) =>
        Number(balance ?? 0) > 0 ? (
          <span className="font-semibold text-destructive">{formatCurrency(Number(balance))}</span>
        ) : (
          <Badge variant="outline" className="text-success border-success text-xs">
            Lunas
          </Badge>
        ),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (s: SupplierType) => openEdit(s),
      show: () => canEdit('suppliers'),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (s: SupplierType) => setDeleteConfirm({ id: s.id, name: s.name }),
      variant: 'destructive' as const,
      show: () => canDelete('suppliers'),
    },
  ];

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'Nama Supplier *',
      type: 'text',
      placeholder: 'Masukkan nama supplier',
      value: form.name,
      onChange: (v) => setForm(p => ({ ...p, name: v })),
      required: true,
      width: 'full',
      validation: (v) => !v?.trim() ? 'Nama harus diisi' : null,
    },
    {
      name: 'phone',
      label: 'Telepon',
      type: 'text',
      placeholder: '08xxxxxxxxxx',
      value: form.phone,
      onChange: (v) => setForm(p => ({ ...p, phone: v })),
      width: 'half',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'supplier@example.com',
      value: form.email,
      onChange: (v) => setForm(p => ({ ...p, email: v })),
      width: 'half',
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'text',
      placeholder: 'Masukkan alamat supplier',
      value: form.address,
      onChange: (v) => setForm(p => ({ ...p, address: v })),
      width: 'full',
    },
    {
      name: 'noRekening',
      label: 'No. Rekening',
      type: 'text',
      placeholder: 'Masukkan nomor rekening',
      value: form.noRekening,
      onChange: (v) => setForm(p => ({ ...p, noRekening: v })),
      width: 'full',
    },
  ];

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
           <DataTable<SupplierType>
             data={suppliers}
             columns={columns}
             isLoading={isLoading}
             sortBy={sortBy}
             sortDirection={sortDirection}
             onSort={toggleSort}
             actions={actions}
             emptyMessage="Tidak ada data supplier."
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
             label="supplier"
           />
         )}

       <FormDialog
         open={isAddOpen || !!editItem}
         onOpenChange={v => {
           if (!v) { setIsAddOpen(false); setEditItem(null); setForm(BLANK_FORM); }
         }}
         title={editItem ? 'Edit Supplier' : 'Tambah Supplier Baru'}
         fields={fields}
         onSubmit={handleSave}
         onCancel={() => {
           setIsAddOpen(false);
           setEditItem(null);
           setForm(BLANK_FORM);
         }}
         isSubmitting={createMutation.isPending || updateMutation.isPending}
         submitLabel="Simpan"
       />

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
