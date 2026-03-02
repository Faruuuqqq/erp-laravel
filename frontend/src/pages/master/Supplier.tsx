import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/page-loader';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { usePaginatedSuppliers } from '@/hooks/api/usePaginated';
import { useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/api/useSuppliers';
import { useEntityForm } from '@/hooks/forms/useEntityForm';
import { supplierSchema, SupplierFormData } from '@/lib/validations/supplier';
import { Supplier } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

const Supplier = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  
  const { data, isLoading, error, refetch } = usePaginatedSuppliers({ 
    search: searchTerm,
    page,
    perPage,
  });
  
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  
  const supplierForm = useEntityForm({
    schema: supplierSchema,
    defaultValues: { name: '', phone: '', email: '', address: '' },
    createMutation: createSupplier,
    updateMutation: updateSupplier,
    entityId: editingId || undefined,
    onCreateSuccess: () => refetch(),
    onUpdateSuccess: () => refetch(),
  });

  const suppliers = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.last_page || 1;
  const totalItems = meta?.total || 0;

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleConfirmDelete = () => {
    deleteSupplier.mutate(deleteDialog.id);
    setDeleteDialog({ open: false, id: '', name: '' });
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    supplierForm.setIsDialogOpen(true);
    supplierForm.form.reset({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    supplierForm.setIsDialogOpen(true);
    supplierForm.form.reset({ name: '', phone: '', email: '', address: '' });
  };

  if (isLoading) {
    return (
      <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
        <PageLoader message="Memuat data supplier..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mx-auto h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-sm text-muted-foreground mb-4">Tidak dapat mengambil data supplier dari server. Silakan coba lagi.</p>
            <Button onClick={() => refetch()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="mx-auto h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-muted-foreground mb-4">Terjadi kesalahan saat memuat data supplier. Silakan coba lagi.</p>
            <Button onClick={() => refetch()} className="w-full">
              Coba Lagi
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Supplier</p>
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
            placeholder="Cari supplier..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Dialog open={supplierForm.isDialogOpen} onOpenChange={supplierForm.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Supplier' : 'Tambah Supplier Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={supplierForm.form.handleSubmit(supplierForm.onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Supplier</Label>
                <Input id="name" placeholder="Masukkan nama supplier" {...supplierForm.form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input id="phone" placeholder="Masukkan no. telepon" {...supplierForm.form.register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Masukkan email" {...supplierForm.form.register('email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" placeholder="Masukkan alamat lengkap" {...supplierForm.form.register('address')} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  supplierForm.setIsDialogOpen(false);
                  supplierForm.form.reset();
                }}>
                  Batal
                </Button>
                <Button type="submit" disabled={supplierForm.isPending}>
                  {supplierForm.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Supplier</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="text-right">Total Transaksi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Tidak ada supplier yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium text-primary">{supplier.id}</TableCell>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{supplier.address}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(supplier.totalTransactions)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(supplier)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(supplier.id, supplier.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            <AlertDialogTitle>Hapus Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus supplier "{deleteDialog.name}"? Tindakan ini tidak dapat dibatalkan.
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

export default Supplier;
