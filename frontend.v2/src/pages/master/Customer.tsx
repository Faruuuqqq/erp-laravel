import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DataTable, FormBuilder, type DataTableColumn, type FormSchema } from '@/components/common';

import { Plus, Pencil, Trash2, Phone, MapPin, AlertCircle, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomers';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import type { Customer } from '@/types';

const INITIAL_FORM_VALUES = {
  name: '',
  phone: '',
  email: '',
  address: '',
  credit_limit: '10000000',
};

const customerFormSchema: FormSchema = {
  sections: [
    {
      title: 'Informasi Dasar',
      fieldNames: ['name', 'phone', 'email'],
    },
    {
      title: 'Alamat & Kredit',
      fieldNames: ['address', 'credit_limit'],
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
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'email@example.com',
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'textarea',
      placeholder: 'Alamat lengkap pelanggan',
      required: true,
      maxLength: 500,
    },
    {
      name: 'credit_limit',
      label: 'Limit Kredit (Rp)',
      type: 'number',
      placeholder: '10000000',
      required: true,
      min: 0,
    },
  ],
};

const CustomerPage = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [isAddOpen, setIsAddOpen] = useState(false);
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
        <span
          className={`font-semibold tabular-nums ${
            balance > 0 ? 'text-orange-600' : 'text-muted-foreground'
          }`}
        >
          {formatCurrency(balance)}
        </span>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Limit Kredit',
      align: 'right',
      sortable: false,
      filterable: false,
      render: (limit) => formatCurrency(limit || 0),
    },
    {
      key: 'totalTransactions',
      header: 'Transaksi',
      align: 'right',
      sortable: false,
      filterable: false,
      render: (count) => count || 0,
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
          email: c.email || '',
          address: c.address || '',
          credit_limit: String(c.creditLimit || 10000000),
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
                  email: values.email,
                  address: values.address,
                  credit_limit: Number(values.credit_limit),
                },
              });
            } else {
              await createMutation.mutateAsync({
                name: values.name,
                phone: values.phone,
                email: values.email,
                address: values.address,
                credit_limit: Number(values.credit_limit),
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

  // Handle add/edit dialog close
  const handleDialogClose = () => {
    setIsAddOpen(false);
    setEditItem(null);
    setFormValues(INITIAL_FORM_VALUES);
  };

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
        <div className="mb-4 flex justify-end">
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
      <Dialog open={isAddOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Edit Customer' : 'Tambah Customer Baru'}
            </DialogTitle>
          </DialogHeader>
          <FormBuilder
            schema={customerFormSchema}
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            layout="vertical"
            submitLabel={editItem ? 'Perbarui' : 'Tambah'}
            showReset={false}
          />
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
    </MainLayout>
  );
};

export default CustomerPage;
