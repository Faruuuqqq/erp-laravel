import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRetryableAction } from '@/hooks/useRetryableAction';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { DataTable, FormBuilder, type DataTableColumn, type FormSchema } from '@/components/common';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/StatCard';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import { useSalesReps, useCreateSalesRep, useUpdateSalesRep, useDeleteSalesRep } from '@/hooks/api/useSalesReps';
import type { SalesRep } from '@/types';


const INITIAL_FORM_VALUES = {
  name: '',
  phone: '',
  email: '',
  address: '',
  area: '',
  status: 'aktif',
};

const salesFormSchema: FormSchema = {
  sections: [
    {
      title: 'Informasi Dasar',
      fieldNames: ['name', 'phone', 'email', 'address'],
    },
    {
      title: 'Area Kerja & Status',
      fieldNames: ['area', 'status'],
    },
  ],
  fields: [
    {
      name: 'name',
      label: 'Nama Sales',
      type: 'text',
      placeholder: 'Nama sales',
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      name: 'phone',
      label: 'No. Telepon',
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
      name: 'area',
      label: 'Area Kerja',
      type: 'text',
      placeholder: 'Jakarta Utara',
    },
    {
      name: 'address',
      label: 'Alamat',
      type: 'textarea',
      placeholder: 'Alamat sales',
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

const SalesPage = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SalesRep | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { execute: executeRetryable } = useRetryableAction({ maxRetries: 3, delayMs: 1000 });

  const { data, isLoading } = useSalesReps();
  const createMutation = useCreateSalesRep();
  const updateMutation = useUpdateSalesRep();
  const deleteMutation = useDeleteSalesRep();

  const salesReps = (data?.data ?? []) as SalesRep[];

  const activeCount = salesReps.filter(s => s.status === 'aktif' || s.status === 'active').length;
  const totalPenjualan = formatCurrency(salesReps.reduce((sum, s) => sum + Number(s.totalSales ?? 0), 0));

  // Table columns with DataTable built-in features
  const columns: DataTableColumn<SalesRep>[] = [
    {
      key: 'code',
      header: 'Kode',
      width: '80px',
      sortable: false,
      filterable: false,
      render: (code, sales) => code ?? 'S-' + sales.id.slice(0, 4),
    },
    {
      key: 'name',
      header: 'Nama Sales',
      sortable: true,
      filterable: true,
    },
    {
      key: 'phone',
      header: 'Telepon',
      sortable: false,
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
      key: 'area',
      header: 'Area Kerja',
      sortable: false,
      filterable: true,
      render: (area) => area ?? '—',
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
    {
      key: 'totalSales',
      header: 'Total Penjualan',
      align: 'right',
      sortable: true,
      filterable: false,
      render: (sales) => (
        <div className="inline-flex min-w-28 items-center justify-end rounded-md bg-primary/10 px-2 py-1">
          <span className="font-semibold tabular-nums text-primary">{formatCurrency(Number(sales ?? 0))}</span>
        </div>
      ),
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'Edit',
      icon: <Pencil className="h-3.5 w-3.5" />,
      onClick: (s: SalesRep) => {
        setEditItem(s);
        setFormValues({
          name: s.name,
          phone: s.phone || '',
          email: s.email || '',
          address: s.address || '',
          area: s.area || '',
          status: (s.status ?? 'aktif') as 'aktif' | 'nonaktif',
        });
        setIsAddOpen(true);
      },
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
                  area: values.area,
                  status: values.status,
                },
              });
            } else {
              await createMutation.mutateAsync({
                name: values.name,
                phone: values.phone,
                email: values.email,
                address: values.address,
                area: values.area,
                status: values.status,
              });
            }
            setIsAddOpen(false);
            setEditItem(null);
            setFormValues(INITIAL_FORM_VALUES);
          },
          {
            title: editItem ? 'Sales diperbarui' : 'Sales ditambahkan',
            description: `${values.name} berhasil ${editItem ? 'diperbarui' : 'ditambahkan'}.`,
            errorTitle: `Gagal ${editItem ? 'memperbarui' : 'menambahkan'} sales`,
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
          title: 'Sales dihapus',
          description: `${name} telah dihapus.`,
          errorTitle: 'Gagal menghapus sales',
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
    <MainLayout title="Sales" subtitle="Kelola daftar sales / marketing">
      {/* Stats Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Sales"
          value={`${salesReps.length} Sales`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Sales Aktif"
          value={`${activeCount} Aktif`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="success"
        />
        <StatCard
          title="Total Penjualan"
          value={totalPenjualan}
          icon={<TrendingUp className="h-5 w-5" />}
          color="info"
        />
      </div>

      {/* Add Sales Button */}
      {canCreate('sales_reps') && (
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
            Tambah Sales
          </Button>
        </div>
      )}

      {/* Advanced DataTable with built-in search, sort, pagination, export */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={salesReps}
            variant="master"
            isLoading={isLoading}
            filterable
            pagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            exportable
            exportFilename="sales"
            actions={actions}
            emptyMessage="Tidak ada data sales yang sesuai."
            searchPlaceholder="Cari nama atau email..."
            filterableColumns={['name', 'email', 'area', 'status']}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Sales Dialog with FormBuilder */}
      <Dialog open={isAddOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-[1000px] overflow-hidden p-0 sm:max-h-[92vh]">
          <DialogHeader className="border-b bg-muted/20 px-5 py-3 pr-12 sm:px-6">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
              {isEditMode ? 'Edit Sales' : 'Tambah Sales Baru'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Perbarui data sales agar area kerja dan performa penjualan tetap terpantau.'
                : 'Tambahkan data sales baru untuk memperluas cakupan area dan monitoring penjualan.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(92vh-5rem)] overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
            <FormBuilder
              schema={salesFormSchema}
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
          itemType="Sales"
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

export default SalesPage;
