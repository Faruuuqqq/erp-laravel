import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
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
import { Plus, Search, Pencil, Trash2, Warehouse as WarehouseIcon, MapPin, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/api/useWarehouses';
import { useEntityForm } from '@/hooks/forms/useEntityForm';
import { warehouseSchema, WarehouseFormData } from '@/lib/validations/warehouse';
import type { Warehouse } from '@/types';

const Gudang = () => {
  const { data: warehouses, isLoading, error, refetch } = useWarehouses();
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  
  const warehouseForm = useEntityForm({
    schema: warehouseSchema,
    defaultValues: { name: '', address: '' },
    createMutation: createWarehouse,
    updateMutation: updateWarehouse,
    entityId: editingId || undefined,
    onCreateSuccess: () => refetch(),
    onUpdateSuccess: () => refetch(),
  });

  const filteredWarehouses = warehouses?.filter((warehouse: Warehouse) => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const activeWarehouses = warehouses?.filter((w: Warehouse) => w.status === 'active').length || 0;
  const totalProducts = warehouses?.reduce((sum: number, w: Warehouse) => sum + (w.totalProducts || 0), 0) || 0;

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleConfirmDelete = () => {
    deleteWarehouse.mutate(deleteDialog.id);
    setDeleteDialog({ open: false, id: '', name: '' });
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingId(warehouse.id);
    warehouseForm.setIsDialogOpen(true);
    warehouseForm.form.reset({
      name: warehouse.name,
      address: warehouse.address,
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    warehouseForm.setIsDialogOpen(true);
    warehouseForm.form.reset({ name: '', address: '' });
  };

  if (isLoading) {
    return (
      <MainLayout title="Gudang" subtitle="Kelola daftar gudang penyimpanan">
        <PageLoader message="Memuat data gudang..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Gudang" subtitle="Kelola daftar gudang penyimpanan">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <WarehouseIcon className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-4 text-lg font-medium text-destructive">Gagal memuat data gudang</p>
            <Button onClick={() => refetch()} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gudang" subtitle="Kelola daftar gudang penyimpanan">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Gudang</p>
            <p className="text-2xl font-bold">{warehouses?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Gudang Aktif</p>
            <p className="text-2xl font-bold text-success">{activeWarehouses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Produk Tersimpan</p>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari gudang..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={warehouseForm.isDialogOpen} onOpenChange={warehouseForm.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Gudang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Gudang' : 'Tambah Gudang Baru'}</DialogTitle>
            </DialogHeader>
            <Form {...warehouseForm.form}>
              <form onSubmit={warehouseForm.form.handleSubmit(warehouseForm.onSubmit)} className="space-y-4">
                <FormField
                  control={warehouseForm.form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Gudang</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama gudang" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={warehouseForm.form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan alamat gudang" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => warehouseForm.setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={warehouseForm.isPending}>
                    {editingId ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredWarehouses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Tidak ada gudang yang ditemukan
          </div>
        ) : (
          filteredWarehouses.map((warehouse: Warehouse) => (
          <Card key={warehouse.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <WarehouseIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{warehouse.id}</p>
                      <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                        {warehouse.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                    <CardTitle className="mt-1 text-lg">{warehouse.name}</CardTitle>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(warehouse)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(warehouse.id, warehouse.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {warehouse.address || '-'}
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Produk</p>
                    <p className="font-semibold">{warehouse.totalProducts || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={`font-semibold ${warehouse.status === 'active' ? 'text-success' : 'text-muted'}`}>
                    {warehouse.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: '', name: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Gudang?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gudang "{deleteDialog.name}"? Tindakan ini tidak dapat dibatalkan.
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

export default Gudang;
