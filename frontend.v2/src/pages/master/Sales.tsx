import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { useExportData } from '@/hooks/useExportData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DataTable, FormDialog, type DataTableColumn, type FormField, SearchInput, PaginationControl } from '@/components/common';
import { Plus, Pencil, Trash2, TrendingUp, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import { useSalesReps, useCreateSalesRep, useUpdateSalesRep, useDeleteSalesRep } from '@/hooks/api/useSalesReps';
import type { SalesRep } from '@/types';
import { type ColumnConfig } from '@/lib/xlsx-export';

const BLANK_FORM = { name: '', phone: '', email: '', area: '', status: 'aktif' as 'aktif' | 'nonaktif' };

const Sales = () => {
   const { canCreate, canEdit, canDelete } = usePermissions();
   const { toast } = useToast();
   const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });
   const { exportXlsx } = useExportData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
   const [statusFilter, setStatusFilter] = useState<'aktif' | 'nonaktif' | 'semua'>('semua');
   const [isAddOpen, setIsAddOpen] = useState(false);
   const [editItem, setEditItem] = useState<SalesRep | null>(null);
   const [form, setForm] = useState(BLANK_FORM);
   const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const { data: salesData, isLoading } = useSalesReps({ page: currentPage, search: searchTerm || undefined, per_page: 20, status: statusFilter === 'semua' ? undefined : statusFilter });
  const createMutation = useCreateSalesRep();
  const updateMutation = useUpdateSalesRep();
  const deleteMutation = useDeleteSalesRep();

   const list = salesData?.data ?? [];
   const pagination = salesData?.meta;

   const activeCount = list.filter(s => s.status === 'aktif' || s.status === 'active').length;
   const totalPenjualan = formatCurrency(list.reduce((sum, s) => sum + Number(s.totalSales ?? 0), 0));

  const openEdit = useCallback((s: SalesRep) => {
    setEditItem(s);
    setForm({ name: s.name, phone: s.phone ?? '', email: s.email ?? '', area: s.area ?? '', status: (s.status ?? 'aktif') as 'aktif' | 'nonaktif' });
  }, []);

   const handleSave = async () => {
     if (!form.name.trim()) return;
     const payload = { name: form.name, phone: form.phone, email: form.email, area: form.area, status: form.status };
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
         title: editItem ? 'Sales diperbarui' : 'Sales ditambahkan',
         description: `${form.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
         errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} sales`,
       }
     );
   };

      const handleDelete = async (id: string, name: string) => {
        await executeRetryable(
          () => deleteMutation.mutateAsync(id),
          {
            title: 'Sales dihapus',
            description: `${name} telah dihapus.`,
            errorTitle: 'Gagal menghapus sales',
          }
        );
      };

     const handleExport = useCallback(() => {
       interface SalesExportData {
         code?: string;
         id: string;
         name: string;
         phone?: string;
         email?: string;
         area?: string;
         status?: string;
         totalSales?: number;
       }

       const columns: ColumnConfig<SalesExportData>[] = [
         { header: 'Kode', key: 'code', width: 12 },
         { header: 'Nama Sales', key: 'name', width: 30 },
         { header: 'Telepon', key: 'phone', width: 15 },
         { header: 'Email', key: 'email', width: 25 },
         { header: 'Area Kerja', key: 'area', width: 20 },
         { header: 'Status', key: 'status', width: 12 },
         {
           header: 'Total Penjualan',
           key: 'totalSales',
           format: (value) => typeof value === 'number' ? value : Number(value) || 0,
           width: 15,
         },
       ];

       const salesData = list.map(s => ({
         code: s.code ?? `S-${s.id.slice(0, 4)}`,
         id: s.id,
         name: s.name,
         phone: s.phone ?? '',
         email: s.email ?? '',
         area: s.area ?? '',
         status: s.status === 'aktif' || s.status === 'active' ? 'Aktif' : 'Nonaktif',
         totalSales: Number(s.totalSales ?? 0),
       }));

       exportXlsx({
         filename: 'sales.xlsx',
         data: salesData,
         columns,
       });
      }, [list, exportXlsx]);

    const columns: DataTableColumn<SalesRep>[] = [
      { key: 'code', header: 'Kode', width: '80px', render: (code, sales) => code ?? 'S-' + sales.id.slice(0, 4) },
      { key: 'name', header: 'Nama Sales', sortable: true },
      { key: 'phone', header: 'Telepon', render: (phone) => phone ?? '—' },
      { key: 'email', header: 'Email', render: (email) => email ?? '—' },
      { key: 'area', header: 'Area Kerja', render: (area) => area ?? '—' },
      {
        key: 'status',
        header: 'Status',
        render: (status) => (
          <Badge variant={status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
            {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
          </Badge>
        ),
      },
      {
        key: 'totalSales',
        header: 'Total Penjualan',
        align: 'right',
        render: (sales) => <span className="font-semibold tabular-nums text-primary">{formatCurrency(Number(sales ?? 0))}</span>,
      },
    ];

    const actions = [
      {
        label: 'Edit',
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: (s: SalesRep) => openEdit(s),
        show: () => canEdit('sales_reps'),
      },
      {
        label: 'Delete',
        icon: <Trash2 className="h-3.5 w-3.5" />,
        onClick: (s: SalesRep) => setDeleteConfirm({ id: s.id, name: s.name }),
        variant: 'destructive' as const,
        show: () => canDelete('sales_reps'),
      },
    ];

    const fields: FormField[] = [
      {
        name: 'name',
        label: 'Nama Sales *',
        type: 'text',
        placeholder: 'Nama sales',
        value: form.name,
        onChange: (v) => setForm(p => ({ ...p, name: v })),
        required: true,
        width: 'full',
        validation: (v) => !v?.trim() ? 'Nama sales harus diisi' : null,
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
        name: 'area',
        label: 'Area Kerja',
        type: 'text',
        placeholder: 'Jakarta Utara',
        value: form.area,
        onChange: (v) => setForm(p => ({ ...p, area: v })),
        width: 'half',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        value: form.status,
        onChange: (v) => setForm(p => ({ ...p, status: v })),
        options: [
          { value: 'aktif', label: 'Aktif' },
          { value: 'nonaktif', label: 'Nonaktif' },
        ],
        width: 'half',
      },
    ];

    return (
     <MainLayout title="Sales" subtitle="Kelola daftar sales / marketing">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Sales" value={`${list.length} Sales`} icon={<TrendingUp className="h-5 w-5" />} color="primary" />
        <StatCard title="Sales Aktif" value={`${activeCount} Aktif`} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Penjualan" value={totalPenjualan} icon={<TrendingUp className="h-5 w-5" />} color="info" />
      </div>

       <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={(term) => {
                setSearchTerm(term);
                setCurrentPage(1);
              }}
              placeholder="Cari sales..."
            />
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} title="Download data sales dalam format Excel">
              <Download className="mr-1.5 h-4 w-4" />Export XLSX
            </Button>
            {canCreate('sales_reps') && (
              <Button size="sm" onClick={() => { setForm(BLANK_FORM); setIsAddOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" />Tambah Sales
              </Button>
            )}
          </div>
       </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <DataTable<SalesRep>
                data={list}
                columns={columns}
                isLoading={isLoading}
                actions={actions}
                emptyMessage="Tidak ada data sales yang sesuai."
              />
            </CardContent>
           </Card>
          )}

          {/* Pagination Control */}
          {pagination && (
            <PaginationControl
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              perPage={pagination.per_page}
              onPageChange={setCurrentPage}
              mode="full"
            />
          )}

          <FormDialog
            open={isAddOpen || !!editItem}
            onOpenChange={v => {
              if (!v) { setIsAddOpen(false); setEditItem(null); setForm(BLANK_FORM); }
            }}
            title={editItem ? 'Edit Sales' : 'Tambah Sales Baru'}
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
            itemType="Sales"
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

  export default Sales;
