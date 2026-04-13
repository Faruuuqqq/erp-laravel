import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { useExportData } from '@/hooks/useExportData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DataTable, FormDialog, type DataTableColumn, type FormField, SearchInput, PaginationControl } from '@/components/common';
import { Plus, Pencil, Trash2, Warehouse, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/api/useWarehouses';
import { type ColumnConfig } from '@/lib/xlsx-export';

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
   const { exportXlsx } = useExportData();
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

     const handleExport = useCallback(() => {
       interface WarehouseData {
         code?: string;
         id: string;
         name: string;
         address?: string;
         manager?: string;
         status?: string;
       }

       const columns: ColumnConfig<WarehouseData>[] = [
         { header: 'Kode', key: 'code', width: 12 },
         { header: 'Nama Gudang', key: 'name', width: 30 },
         { header: 'Alamat', key: 'address', width: 35 },
         { header: 'Pengelola', key: 'manager', width: 20 },
         { header: 'Status', key: 'status', width: 12 },
       ];

       const warehouses = list.map(w => ({
         code: w.code ?? `W-${w.id.slice(0, 4)}`,
         id: w.id,
         name: w.name,
         address: w.address ?? '',
         manager: w.manager ?? '',
         status: w.status === 'aktif' || w.status === 'active' ? 'Aktif' : 'Nonaktif',
       }));

       exportXlsx({
         filename: 'gudang.xlsx',
         data: warehouses,
         columns,
       });
      }, [list, exportXlsx]);

     const setField = useCallback(<K extends keyof WarehouseForm>(key: K, val: WarehouseForm[K]) =>
       setForm(p => ({ ...p, [key]: val })), []);

    const columns: DataTableColumn<typeof list[0]>[] = [
      { key: 'code', header: 'Kode', width: '80px', render: (code, warehouse) => code ?? 'W-' + warehouse.id.slice(0, 4) },
      { key: 'name', header: 'Nama Gudang', sortable: true },
      { key: 'address', header: 'Alamat', render: (addr) => <span className="max-w-48 line-clamp-2">{addr || '—'}</span> },
      { key: 'manager', header: 'Pengelola', render: (manager) => manager || '—' },
      {
        key: 'status',
        header: 'Status',
        render: (status) => (
          <Badge variant={status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
            {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
          </Badge>
        ),
      },
    ];

    const actions = [
      {
        label: 'Edit',
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: (g: typeof list[0]) => openEdit(g),
        show: () => canEdit('master.warehouses'),
      },
      {
        label: 'Delete',
        icon: <Trash2 className="h-3.5 w-3.5" />,
        onClick: (g: typeof list[0]) => setDeleteConfirm({ id: g.id, name: g.name }),
        variant: 'destructive' as const,
        show: () => canDelete('master.warehouses'),
      },
    ];

    const fields: FormField[] = [
      {
        name: 'name',
        label: 'Nama Gudang *',
        type: 'text',
        placeholder: 'Nama gudang',
        value: form.name,
        onChange: (v) => setField('name', v),
        required: true,
        width: 'full',
        validation: (v) => !v?.trim() ? 'Nama gudang harus diisi' : null,
      },
      {
        name: 'address',
        label: 'Alamat',
        type: 'text',
        placeholder: 'Alamat gudang',
        value: form.address,
        onChange: (v) => setField('address', v),
        width: 'full',
      },
      {
        name: 'manager',
        label: 'Pengelola',
        type: 'text',
        placeholder: 'Nama pengelola',
        value: form.manager,
        onChange: (v) => setField('manager', v),
        width: 'half',
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        value: form.status,
        onChange: (v) => setField('status', v),
        options: [
          { value: 'aktif', label: 'Aktif' },
          { value: 'nonaktif', label: 'Nonaktif' },
        ],
        width: 'half',
      },
    ];

    return (
     <MainLayout title="Gudang" subtitle="Kelola daftar gudang penyimpanan">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Gudang" value={`${list.length} Gudang`} icon={<Warehouse className="h-5 w-5" />} color="primary" />
        <StatCard title="Gudang Aktif" value={`${activeCount} Aktif`} icon={<Warehouse className="h-5 w-5" />} color="success" />
        <StatCard title="Gudang Nonaktif" value={`${list.length - activeCount} Nonaktif`} icon={<Warehouse className="h-5 w-5" />} color="warning" />
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
              placeholder="Cari gudang..."
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
            <Button variant="outline" size="sm" onClick={handleExport} title="Download data gudang dalam format Excel">
              <Download className="mr-1.5 h-4 w-4" />Export XLSX
            </Button>
            {canCreate('master.warehouses') && (
              <Button size="sm" onClick={() => { setForm(BLANK_FORM()); setIsAddOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" />Tambah Gudang
              </Button>
            )}
          </div>
       </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <DataTable
                data={list}
                columns={columns}
                isLoading={isLoading}
                actions={actions}
                emptyMessage="Tidak ada gudang yang sesuai."
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
            open={isAddOpen || !!editId}
            onOpenChange={v => {
              if (!v) { setIsAddOpen(false); setEditId(null); setForm(BLANK_FORM()); }
            }}
            title={editId ? 'Edit Gudang' : 'Tambah Gudang Baru'}
            fields={fields}
            onSubmit={handleSave}
            onCancel={() => {
              setIsAddOpen(false);
              setEditId(null);
              setForm(BLANK_FORM());
            }}
            isSubmitting={createWh.isPending || updateWh.isPending}
            submitLabel="Simpan"
          />

        {deleteConfirm && (
          <DeleteConfirmDialog
            itemName={deleteConfirm.name}
            itemType="gudang"
            itemId={deleteConfirm.id}
            isDeleting={deleteWh.isPending}
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

  export default Gudang;
