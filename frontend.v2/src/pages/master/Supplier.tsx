import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { ImportDataDialog, type ImportColumnDef } from '@/components/dialogs/ImportDataDialog';
import { DataTable, FormBuilder, type DataTableColumn, type FormSchema } from '@/components/common';
import { Plus, Pencil, Trash2, Building2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/api/useSuppliers';
import type { Supplier as SupplierType } from '@/types';

const INITIAL_FORM_VALUES = {
  name: '',
  phone: '',
  phone2: '',
  email: '',
  city: '',
  address: '',
  noRekening: '',
};

const supplierFormSchema: FormSchema = {
  sections: [
    {
      title: 'Informasi Dasar',
      fieldNames: ['name', 'phone', 'phone2', 'email', 'city'],
    },
    {
      title: 'Alamat & Rekening',
      fieldNames: ['address', 'noRekening'],
    },
  ],
  fields: [
    {
      name: 'name',
      label: 'Nama Supplier',
      type: 'text',
      placeholder: 'Nama lengkap supplier',
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      name: 'phone',
      label: 'Telepon',
      type: 'phone',
      placeholder: '08...',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'email@example.com',
    },
    {
      name: 'phone2',
      label: 'Telepon 2',
      type: 'phone',
      placeholder: '08... (opsional)',
    },
    {
      name: 'city',
      label: 'Kota',
      type: 'text',
      placeholder: 'Contoh: Bandung',
      maxLength: 50,
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'textarea',
      placeholder: 'Alamat lengkap supplier',
      maxLength: 500,
    },
    {
      name: 'noRekening',
      label: 'No. Rekening',
      type: 'text',
      placeholder: 'Nomor rekening supplier',
    },
  ],
};

const SupplierPage = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editItem, setEditItem] = useState<SupplierType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });

  const { data, isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const suppliers = (data?.data ?? []) as SupplierType[];

  const withDebt = suppliers.filter(s => Number(s.balance ?? 0) > 0).length;
  const totalUtang = formatCurrency(suppliers.reduce((sum, s) => sum + Number(s.balance ?? 0), 0));

  // Table columns with DataTable built-in features
  const columns: DataTableColumn<SupplierType>[] = [
    {
      key: 'code',
      header: 'Kode',
      width: '80px',
      sortable: false,
      filterable: false,
    },
    {
      key: 'name',
      header: 'Nama Supplier',
      sortable: true,
      filterable: true,
      render: (name, supplier) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-48">{supplier.address}</div>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Kota',
      sortable: false,
      filterable: true,
      render: (city) => (
        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {city ?? '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telepon',
      sortable: true,
      filterable: false,
      render: (phone) => phone ?? '—',
    },
    {
      key: 'email',
      header: 'Email',
      sortable: false,
      filterable: true,
      render: (email) => email ?? '—',
    },
    {
      key: 'noRekening',
      header: 'No. Rekening',
      sortable: false,
      filterable: false,
      render: (noRek) => noRek ?? '—',
    },
    {
      key: 'balance',
      header: 'Saldo Utang',
      align: 'right',
      sortable: true,
      filterable: false,
      render: (balance) =>
        Number(balance ?? 0) > 0 ? (
          <div className="inline-flex min-w-28 items-center justify-end rounded-md bg-destructive/10 px-2 py-1">
            <span className="font-semibold tabular-nums text-destructive">{formatCurrency(Number(balance))}</span>
          </div>
        ) : (
          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Lunas</span>
        ),
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (s: SupplierType) => {
        setEditItem(s);
        setFormValues({
          name: s.name,
          phone: s.phone || '',
          phone2: s.phone2 || '',
          email: s.email || '',
          city: s.city || '',
          address: s.address || '',
          noRekening: s.noRekening || '',
        });
        setIsAddOpen(true);
      },
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

  const importColumns: ImportColumnDef[] = [
    { key: 'name', label: 'Nama Supplier', required: true, aliases: ['nama', 'supplier'] },
    { key: 'phone', label: 'Telepon', aliases: ['hp', 'no hp'] },
    { key: 'phone2', label: 'Telepon 2', aliases: ['hp2', 'no hp2'] },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'Kota', aliases: ['kota'] },
    { key: 'address', label: 'Alamat', aliases: ['alamat lengkap'] },
    { key: 'noRekening', label: 'No. Rekening', aliases: ['rekening', 'no rekening', 'no_rekening'] },
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
                  phone: values.phone,
                  phone2: values.phone2,
                  email: values.email,
                  city: values.city,
                  address: values.address,
                  noRekening: values.noRekening,
                },
              });
            } else {
              await createMutation.mutateAsync({
                name: values.name,
                phone: values.phone,
                phone2: values.phone2,
                email: values.email,
                city: values.city,
                address: values.address,
                noRekening: values.noRekening,
              });
            }
            setIsAddOpen(false);
            setEditItem(null);
            setFormValues(INITIAL_FORM_VALUES);
          },
          {
            title: editItem ? 'Supplier diperbarui' : 'Supplier ditambahkan',
            description: `${values.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
            errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} supplier`,
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
          title: 'Supplier dihapus',
          description: `${name} telah dihapus.`,
          errorTitle: 'Gagal menghapus supplier',
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
    <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
      {/* Stats Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Supplier"
          value={`${suppliers.length} Supplier`}
          icon={<Building2 className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Supplier Berutang"
          value={`${withDebt} Supplier`}
          icon={<Building2 className="h-5 w-5" />}
          color="warning"
        />
        <StatCard
          title="Total Utang"
          value={totalUtang}
          icon={<Building2 className="h-5 w-5" />}
          color="destructive"
        />
      </div>

      {/* Add Supplier Button */}
      {canCreate('suppliers') && (
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
            Tambah Supplier
          </Button>
        </div>
      )}

      {/* Advanced DataTable with built-in search, sort, pagination, export */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={suppliers}
            variant="master"
            isLoading={isLoading}
            filterable
            pagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            exportable
            exportFilename="suppliers"
            actions={actions}
            emptyMessage="Tidak ada supplier yang sesuai."
            searchPlaceholder="Cari nama atau kota..."
            filterableColumns={['name', 'city', 'email']}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Supplier Dialog with FormBuilder */}
      <Dialog open={isAddOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[1000px] overflow-hidden p-0 sm:max-h-[92vh]">
          <DialogHeader className="border-b bg-muted/20 px-5 py-3 pr-12 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-4 w-4 text-primary" />
              {isEditMode ? 'Edit Supplier' : 'Tambah Supplier Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Perbarui profil supplier agar informasi kontak dan pembayaran tetap sinkron.'
                : 'Masukkan data supplier baru untuk mempercepat proses pembelian dan pencatatan utang.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(92vh-5rem)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
            <FormBuilder
              schema={supplierFormSchema}
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
          itemType="supplier"
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
        resource="suppliers"
        title="Supplier"
        columns={importColumns}
      />
    </MainLayout>
  );
};

export default SupplierPage;
