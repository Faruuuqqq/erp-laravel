import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/page-loader';
import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Phone, MapPin, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePaginatedCustomers } from '@/hooks/api/usePaginated';
import { useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomers';
import { useEntityForm } from '@/hooks/forms/useEntityForm';
import { customerSchema, CustomerFormData } from '@/lib/validations/customer';
import { formatCurrency } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

const Customer = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  
  const { data, isLoading, error, refetch } = usePaginatedCustomers({ 
    search: searchTerm,
    withBalance: true,
    page,
    perPage,
  });
  
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  
  const customerForm = useEntityForm({
    schema: customerSchema,
    defaultValues: { name: '', phone: '', email: '', address: '' },
    createMutation: createCustomer,
    updateMutation: updateCustomer,
    entityId: editingId || undefined,
    onCreateSuccess: () => refetch(),
    onUpdateSuccess: () => refetch(),
  });

  const customers = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.last_page || 1;
  const totalItems = meta?.total || 0;

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleConfirmDelete = () => {
    deleteCustomer.mutate(deleteDialog.id);
    setDeleteDialog({ open: false, id: '', name: '' });
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    customerForm.setIsDialogOpen(true);
    customerForm.form.reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    customerForm.setIsDialogOpen(true);
    customerForm.form.reset({ name: '', phone: '', email: '', address: '' });
  };

  if (isLoading) {
    return (
      <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
        <PageLoader message="Memuat data customer..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-lg font-medium text-destructive">Gagal memuat data customer</p>
            <Button onClick={() => refetch()} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="mx-auto h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-muted-foreground mb-4">Terjadi kesalahan saat memuat data customer. Silakan coba lagi.</p>
            <Button onClick={() => refetch()} className="w-full">
              Coba Lagi
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Customer</p>
            <p className="text-2xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Halaman</p>
            <p className="text-2xl font-bold">{meta?.current_page || 1} / {totalPages}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari customer..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Dialog open={customerForm.isDialogOpen} onOpenChange={customerForm.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Customer' : 'Tambah Customer Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={customerForm.form.handleSubmit(customerForm.onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Customer</Label>
                <Input id="name" placeholder="Masukkan nama customer" {...customerForm.form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input id="phone" placeholder="Masukkan no. telepon" {...customerForm.form.register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Masukkan email" {...customerForm.form.register('email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" placeholder="Masukkan alamat lengkap" {...customerForm.form.register('address')} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  customerForm.setIsDialogOpen(false);
                  customerForm.form.reset();
                }}>
                  Batal
                </Button>
                <Button type="submit" disabled={customerForm.isPending}>
                  {customerForm.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customer Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Tidak ada customer yang ditemukan
          </div>
        ) : (
          customers.map((customer) => (
            <Card key={customer.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{customer.id}</p>
                    {customer.balance > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Piutang
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(customer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(customer.id, customer.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-1 text-lg">{customer.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {customer.phone}
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {customer.address}
                </div>
                <div className="grid grid-cols-2 gap-2 border-t pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Transaksi</p>
                    <p className="font-semibold text-primary">{formatCurrency(customer.totalTransactions)}</p>
                  </div>
                  {customer.balance > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Piutang</p>
                      <p className="font-semibold text-destructive">{formatCurrency(customer.balance)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={perPage}
            onPageChange={setPage}
            onItemsPerPageChange={(newPerPage) => {
              setPerPage(newPerPage);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: '', name: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus customer "{deleteDialog.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Customer;
