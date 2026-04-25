import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { ImportDataDialog, type ImportColumnDef } from '@/components/dialogs/ImportDataDialog';
import { DataTable, FormBuilder, type DataTableColumn, type FormSchema } from '@/components/common';
import { Plus, Pencil, Trash2, Warehouse, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/api/useWarehouses';
import type { Warehouse as WarehouseType } from '@/types';


const INITIAL_FORM_VALUES = {
  name: '',
  address: '',
  status: 'aktif',
};

const warehouseFormSchema: FormSchema = {
  sections: [
    {
      title: 'Informasi Dasar',
      fieldNames: ['name', 'address'],
    },
    {
      title: 'Status Gudang',
      fieldNames: ['status'],
    },
  ],
  fields: [
    {
      name: 'name',
      label: 'Nama Gudang',
      type: 'text',
      placeholder: 'Nama gudang',
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'textarea',
      placeholder: 'Alamat gudang',
      maxLength: 500,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'aktif', label: 'Aktif' },
        { value: 'nonaktif', label: 'Nonaktif' },
      ],
    },
  ],
};

const GudangPage = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editItem, setEditItem] = useState<WarehouseType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });

  const { data, isLoading } = useWarehouses();
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  const warehouses = (data?.data ?? []) as WarehouseType[];

  const activeCount = warehouses.filter(w => w.status === 'aktif' || w.status === 'active').length;

  // Table columns with DataTable built-in features
  const columns: DataTableColumn<WarehouseType>[] = [
    {
      key: 'code',
      header: 'Kode',
      width: '80px',
      sortable: false,
      filterable: false,
      render: (code, warehouse) => code ?? 'W-' + warehouse.id.slice(0, 4),
    },
    {
      key: 'name',
      header: 'Nama Gudang',
      sortable: true,
      filterable: true,
    },
    {
      key: 'address',
      header: 'Alamat',
      sortable: false,
      filterable: false,
      render: (addr) => <span className="max-w-48 line-clamp-2">{addr || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (status) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            status === 'aktif'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (w: WarehouseType) => {
        setEditItem(w);
        setFormValues({
          name: w.name,
          address: w.address || '',
          status: (w.status as 'aktif' | 'nonaktif') || 'aktif',
        });
        setIsAddOpen(true);
      },
      show: () => canEdit('master.warehouses'),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (w: WarehouseType) => setDeleteConfirm({ id: w.id, name: w.name }),
      variant: 'destructive' as const,
      show: () => canDelete('master.warehouses'),
    },
  ];

  const importColumns: ImportColumnDef[] = [
    { key: 'name', label: 'Nama Gudang', required: true, aliases: ['nama', 'gudang'] },
    { key: 'address', label: 'Alamat', aliases: ['alamat lengkap'] },
    { key: 'status', label: 'Status', aliases: ['status'] },
  ];

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (values: Record<string, any>) => {
      setIsSubmitting(true);
      try {
        await executeRetryable(
          async () => {
            if (editItem) {
              await updateMutation.mutateAsync({
                id: editItem.id,
                data: {
                  name: values.name,
                  address: values.address,
                  status: values.status,
                },
              });
            } else {
              await createMutation.mutateAsync({
                name: values.name,
                address: values.address,
                status: values.status,
              });
            }
            setIsAddOpen(false);
            setEditItem(null);
            setFormValues(INITIAL_FORM_VALUES);
          },
          {
            title: editItem ? 'Gudang diperbarui' : 'Gudang ditambahkan',
            description: `${values.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
            errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} gudang`,
          }
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [editItem, executeRetryable, updateMutation, createMutation]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (id: string, name: string) => {
      await executeRetryable(
        () => deleteMutation.mutateAsync(id),
        {
          title: 'Gudang dihapus',
          description: `${name} telah dihapus.`,
          errorTitle: 'Gagal menghapus gudang',
        }
      );
    },
    [executeRetryable, deleteMutation]
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsAddOpen(open);

    if (!open) {
      setEditItem(null);
      setFormValues(INITIAL_FORM_VALUES);
    }
  }, []);

  const isEditMode = Boolean(editItem);

  return (
    <MainLayout title="Gudang" subtitle="Kelola daftar gudang penyimpanan">
      {/* Stats Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Gudang"
          value={`${warehouses.length} Gudang`}
          icon={<Warehouse className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Gudang Aktif"
          value={`${activeCount} Aktif`}
          icon={<Warehouse className="h-5 w-5" />}
          color="success"
        />
        <StatCard
          title="Gudang Nonaktif"
          value={`${warehouses.length - activeCount} Nonaktif`}
          icon={<Warehouse className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {/* Add Gudang Button */}
      {canCreate('master.warehouses') && (
        <div className="mb-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-1.5 h-4 w-4" />
            Import
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditItem(null);
              setFormValues(INITIAL_FORM_VALUES);
              setIsAddOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Gudang
          </Button>
        </div>
      )}

      {/* Advanced DataTable with built-in search, sort, pagination, export */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={warehouses}
            variant="master"
            isLoading={isLoading}
            filterable
            pagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            exportable
            exportFilename="gudang"
            actions={actions}
            emptyMessage="Tidak ada gudang yang sesuai."
            searchPlaceholder="Cari nama gudang..."
            filterableColumns={['name', 'status']}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Gudang Dialog with FormBuilder */}
      <Dialog open={isAddOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[940px] overflow-hidden p-0 sm:max-h-[92vh]">
          <DialogHeader className="border-b bg-muted/20 px-5 py-3 pr-12 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Warehouse className="h-4 w-4 text-primary" />
              {isEditMode ? 'Edit Gudang' : 'Tambah Gudang Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Perbarui informasi gudang agar alur stok dan distribusi tetap akurat.'
                : 'Tambahkan gudang baru untuk mengelola penyimpanan dan distribusi barang.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(92vh-5rem)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
            <FormBuilder
              schema={warehouseFormSchema}
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              layout="grid"
              columns={2}
              density="compact"
              stickyActions
              submitLabel={isEditMode ? 'Perbarui' : 'Tambah'}
              showReset={false}
              className="space-y-4"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          itemName={deleteConfirm.name}
          itemType="gudang"
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

      <ImportDataDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        resource="warehouses"
        title="Gudang"
        columns={importColumns}
      />
    </MainLayout>
  );
};

export default GudangPage;
