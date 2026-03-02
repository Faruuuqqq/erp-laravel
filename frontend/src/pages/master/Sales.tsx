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
import { Plus, Search, Pencil, Trash2, Phone, Mail, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSales, useCreateSales, useUpdateSales, useDeleteSales } from '@/hooks/api/useSales';
import { useEntityForm } from '@/hooks/forms/useEntityForm';
import { salesSchema, SalesFormData } from '@/lib/validations/sales';
import { Sales } from '@/types';
import { formatCurrency } from '@/lib/utils';

const Sales = () => {
  const { data: salesList, isLoading, error, refetch } = useSales();
  const createSales = useCreateSales();
  const updateSales = useUpdateSales();
  const deleteSales = useDeleteSales();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  
  const salesForm = useEntityForm({
    schema: salesSchema,
    defaultValues: { name: '', phone: '', email: '', address: '' },
    createMutation: createSales,
    updateMutation: updateSales,
    entityId: editingId || undefined,
    onCreateSuccess: () => refetch(),
    onUpdateSuccess: () => refetch(),
    transformCreateData: (data: SalesFormData) => ({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
    }),
    transformUpdateData: (data: SalesFormData) => ({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
    }),
  });

  const filteredSales = salesList?.filter((sales: Sales) => {
    const matchesSearch = sales.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sales.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const activeSales = salesList?.filter((s: Sales) => s.status === 'active').length || 0;
  const totalTransactions = salesList?.reduce((sum: number, s: Sales) => sum + (s.totalTransactions || 0), 0) || 0;
  const totalSales = salesList?.reduce((sum: number, s: Sales) => sum + (s.totalSales || 0), 0) || 0;

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleConfirmDelete = () => {
    deleteSales.mutate(deleteDialog.id);
    setDeleteDialog({ open: false, id: '', name: '' });
  };

  const handleEdit = (sales: Sales) => {
    setEditingId(sales.id);
    salesForm.setIsDialogOpen(true);
    salesForm.form.reset({
      name: sales.name,
      phone: sales.phone,
      email: sales.email,
      address: sales.address,
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    salesForm.setIsDialogOpen(true);
    salesForm.form.reset({ name: '', phone: '', email: '', address: '' });
  };

  if (isLoading) {
    return (
      <MainLayout title="Sales" subtitle="Kelola daftar sales/marketing">
        <PageLoader message="Memuat data sales..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Sales" subtitle="Kelola daftar sales/marketing">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <Users className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-4 text-lg font-medium text-destructive">Gagal memuat data sales</p>
            <Button onClick={() => refetch()} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Sales" subtitle="Kelola daftar sales/marketing">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{salesList?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sales Aktif</p>
                <p className="text-2xl font-bold text-success">{activeSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari sales..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={salesForm.isDialogOpen} onOpenChange={salesForm.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Sales
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Sales' : 'Tambah Sales Baru'}</DialogTitle>
            </DialogHeader>
            <Form {...salesForm.form}>
              <form onSubmit={salesForm.form.handleSubmit(salesForm.onSubmit)} className="space-y-4">
                <FormField
                  control={salesForm.form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Sales</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama sales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={salesForm.form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan no. telepon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={salesForm.form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Masukkan email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={salesForm.form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Kerja</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan area kerja" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => salesForm.setIsDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={salesForm.isPending}>
                    {editingId ? 'Update' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSales.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Tidak ada sales yang ditemukan
          </div>
        ) : (
          filteredSales.map((sales: Sales) => (
          <Card key={sales.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {sales.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{sales.id}</p>
                      <Badge variant={sales.status === 'active' ? 'default' : 'secondary'}>
                        {sales.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </div>
                    <CardTitle className="mt-1 text-lg">{sales.name}</CardTitle>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(sales)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(sales.id, sales.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {sales.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {sales.email || '-'}
              </div>
              <p className="text-sm">
                <span className="text-muted-foreground">Area: </span>
                <span className="font-medium">{sales.area || '-'}</span>
              </p>
              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Penjualan</p>
                  <p className="font-semibold text-primary">{formatCurrency(sales.totalSales || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transaksi</p>
                  <p className="font-semibold">{sales.totalTransactions || 0}</p>
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
            <AlertDialogTitle>Hapus Sales?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus sales "{deleteDialog.name}"? Tindakan ini tidak dapat dibatalkan.
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

export default Sales;
