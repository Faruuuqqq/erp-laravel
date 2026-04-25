import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { ImportDataDialog, type ImportColumnDef } from '@/components/dialogs/ImportDataDialog';
import { DataTable, FormBuilder, type DataTableColumn, type FormSchema } from '@/components/common';

import { Plus, Pencil, Trash2, Phone, MapPin, AlertCircle, Users, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomers';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import type { Customer } from '@/types';

const INITIAL_FORM_VALUES = {
  name: '',
  phone: '',
  phone2: '',
  email: '',
  city: '',
  address: '',
  creditLimit: '0',
  discount: '',
  warehouse: '',
  priceList: '',
  area: '',
  npwp: '',
  notes: '',
};

const customerFormSchema: FormSchema = {
  sections: [
    {
      title: 'Informasi Dasar',
      fieldNames: ['name', 'phone', 'phone2', 'email', 'city'],
    },
    {
      title: 'Alamat & Kredit',
      fieldNames: ['address', 'creditLimit', 'discount'],
    },
    {
      title: 'Preferensi Tambahan',
      fieldNames: ['warehouse', 'priceList', 'area', 'npwp', 'notes'],
    },
  ],
  fields: [
    {
      name: 'name',
      label: 'Nama Customer',
      type: 'text',
      placeholder: 'Nama lengkap pelanggan',
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
      name: 'phone2',
      label: 'Telepon 2',
      type: 'phone',
      placeholder: '08... (opsional)',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'email@example.com',
    },
    {
      name: 'city',
      label: 'Kota',
      type: 'text',
      placeholder: 'Contoh: Jakarta',
      maxLength: 50,
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'textarea',
      placeholder: 'Alamat lengkap pelanggan',
      maxLength: 500,
    },
    {
      name: 'creditLimit',
      label: 'Limit Kredit (Rp)',
      type: 'number',
      placeholder: '0',
      min: 0,
    },
    {
      name: 'discount',
      label: 'Diskon',
      type: 'text',
      placeholder: 'Contoh: 10% / Retail A',
      maxLength: 50,
    },
    {
      name: 'warehouse',
      label: 'Gudang Preferensi',
      type: 'text',
      placeholder: 'Nama gudang default',
      maxLength: 50,
    },
    {
      name: 'priceList',
      label: 'Price List',
      type: 'text',
      placeholder: 'Kategori harga customer',
      maxLength: 50,
    },
    {
      name: 'area',
      label: 'Daerah',
      type: 'text',
      placeholder: 'Area distribusi',
      maxLength: 50,
    },
    {
      name: 'npwp',
      label: 'NPWP',
      type: 'text',
      placeholder: 'Nomor NPWP customer',
      maxLength: 20,
    },
    {
      name: 'notes',
      label: 'Keterangan',
      type: 'textarea',
      placeholder: 'Catatan tambahan customer',
      maxLength: 255,
    },
  ],
};

const CustomerPage = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });

  const { data, isLoading } = useCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers = (data?.data ?? []) as Customer[];

  const totalPiutang = formatCurrency(customers.reduce((sum, c) => sum + Number(c.balance ?? 0), 0));
  const overLimit = customers.filter(c => Number(c.balance ?? 0) > Number(c.creditLimit ?? 0)).length;

  // Table columns with DataTable built-in features
  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '100px',
      render: (id) => `CUS-${id}`,
      sortable: false,
    },
    {
      key: 'name',
      header: 'Nama',
      width: '150px',
      sortable: true,
      filterable: true,
    },
    {
      key: 'phone',
      header: 'Telepon',
      sortable: false,
      filterable: false,
      render: (phone) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          {phone || '-'}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: false,
      filterable: true,
      render: (email) => email || '-',
    },
    {
      key: 'address',
      header: 'Alamat',
      width: '200px',
      sortable: false,
      filterable: false,
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
      filterable: false,
      render: (balance) => (
        <div className="inline-flex min-w-28 items-center justify-end rounded-md bg-orange-50 px-2 py-1">
        <span
          className={`font-semibold tabular-nums ${
            balance > 0 ? 'text-orange-600' : 'text-muted-foreground'
          }`}
        >
          {formatCurrency(balance)}
        </span>
        </div>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Limit Kredit',
      align: 'right',
      sortable: false,
      filterable: false,
      render: (limit) => (
        <span className="tabular-nums text-muted-foreground">{formatCurrency(limit || 0)}</span>
      ),
    },
    {
      key: 'totalTransactions',
      header: 'Transaksi',
      align: 'right',
      sortable: false,
      filterable: false,
      render: (count) => <span className="tabular-nums">{count || 0}</span>,
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (c: Customer) => {
        setEditItem(c);
        setFormValues({
          name: c.name,
          phone: c.phone || '',
          phone2: c.phone2 || '',
          email: c.email || '',
          city: c.city || '',
          address: c.address || '',
          creditLimit: String(c.creditLimit ?? 0),
          discount: c.discount || '',
          warehouse: c.warehouse || '',
          priceList: c.priceList || '',
          area: c.area || '',
          npwp: c.npwp || '',
          notes: c.notes || '',
        });
        setIsAddOpen(true);
      },
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

  const importColumns: ImportColumnDef[] = [
    { key: 'name', label: 'Nama', required: true },
    { key: 'phone', label: 'Telepon', aliases: ['hp', 'no hp', 'phone1'] },
    { key: 'phone2', label: 'Telepon 2', aliases: ['hp2', 'no hp2'] },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'Kota', aliases: ['kota'] },
    { key: 'address', label: 'Alamat', aliases: ['alamat lengkap'] },
    { key: 'creditLimit', label: 'Limit Kredit', aliases: ['limit', 'credit limit', 'credit_limit'] },
    { key: 'discount', label: 'Diskon', aliases: ['diskon'] },
    { key: 'warehouse', label: 'Gudang', aliases: ['gudang'] },
    { key: 'priceList', label: 'Price List', aliases: ['price list', 'pricelist', 'kategori harga'] },
    { key: 'area', label: 'Daerah', aliases: ['daerah', 'area'] },
    { key: 'npwp', label: 'NPWP', aliases: ['npwp'] },
    { key: 'notes', label: 'Keterangan', aliases: ['keterangan', 'catatan'] },
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
                  creditLimit: Number(values.creditLimit || 0),
                  discount: values.discount,
                  warehouse: values.warehouse,
                  priceList: values.priceList,
                  area: values.area,
                  npwp: values.npwp,
                  notes: values.notes,
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
                creditLimit: Number(values.creditLimit || 0),
                discount: values.discount,
                warehouse: values.warehouse,
                priceList: values.priceList,
                area: values.area,
                npwp: values.npwp,
                notes: values.notes,
              });
            }
            setIsAddOpen(false);
            setEditItem(null);
            setFormValues(INITIAL_FORM_VALUES);
          },
          {
            title: editItem ? 'Customer diperbarui' : 'Customer ditambahkan',
            description: `${values.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
            errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} customer`,
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
          title: 'Customer dihapus',
          description: `${name} telah dihapus.`,
          errorTitle: 'Gagal menghapus customer',
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
    <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
      {/* Stats Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Customer"
          value={`${customers.length} Customer`}
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Total Piutang"
          value={totalPiutang}
          icon={<AlertCircle className="h-5 w-5" />}
          color="warning"
        />
        <StatCard
          title="Melebihi Limit"
          value={`${overLimit} Customer`}
          icon={<AlertCircle className="h-5 w-5" />}
          color="destructive"
        />
      </div>

      {/* Add Customer Button */}
      {canCreate('customers') && (
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
            Tambah Customer
          </Button>
        </div>
      )}

      {/* Advanced DataTable with built-in search, sort, pagination, export */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={customers}
            variant="master"
            isLoading={isLoading}
            filterable
            pagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            exportable
            exportFilename="customers"
            actions={actions}
            emptyMessage="Tidak ada customer yang sesuai."
            searchPlaceholder="Cari nama atau email..."
            filterableColumns={['name', 'email']}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog with FormBuilder */}
      <Dialog open={isAddOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[1100px] overflow-hidden p-0 sm:max-h-[92vh]">
          <DialogHeader className="border-b bg-muted/20 px-5 py-3 pr-12 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 text-primary" />
              {isEditMode ? 'Edit Customer' : 'Tambah Customer Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Perbarui informasi customer agar data transaksi dan piutang tetap akurat.'
                : 'Lengkapi data customer baru untuk mulai mencatat transaksi dengan benar.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(92vh-5rem)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
            <FormBuilder
              schema={customerFormSchema}
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

      <ImportDataDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        resource="customers"
        title="Customer"
        columns={importColumns}
      />
    </MainLayout>
  );
};

export default CustomerPage;
