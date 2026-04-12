import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Plus, Search, Download, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/api/useExpenses';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Expense } from '@/types';
import { extractErrorMessage } from '@/lib/api';

const BiayaJasa = () => {
  const [search, setSearch] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    description: '',
    amount: 0,
  });

  const { toast } = useToast();
  const { data: expensesResponse, isLoading, refetch } = useExpenses({ search });
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expenses = expensesResponse?.data || [];
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const handleOpenAdd = () => {
    setSelectedExpense(null);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
      amount: 0,
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: Number(expense.amount),
    });
    setIsAddEditOpen(true);
  };

  const handleOpenDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteConfirmOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedExpense) {
        await updateExpense.mutateAsync({ 
          id: selectedExpense.id, 
          data: formData 
        });
        toast({ title: 'Berhasil', description: 'Biaya berhasil diperbarui' });
      } else {
        await createExpense.mutateAsync(formData);
        toast({ title: 'Berhasil', description: 'Biaya berhasil ditambahkan' });
      }
      setIsAddEditOpen(false);
      refetch();
    } catch (error) {
      toast({ 
        title: 'Gagal', 
        description: extractErrorMessage(error),
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    try {
      await deleteExpense.mutateAsync(selectedExpense.id);
      toast({ title: 'Berhasil', description: 'Biaya berhasil dihapus' });
      setIsDeleteConfirmOpen(false);
      refetch();
    } catch (error) {
      toast({ 
        title: 'Gagal', 
        description: extractErrorMessage(error),
        variant: 'destructive' 
      });
    }
  };

  const handleExport = () => {
    const headers = ['No. Ref', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah', 'Oleh'];
    const rows = expenses.map(e => [
      e.code,
      e.date,
      e.category,
      e.description,
      e.amount,
      e.createdBy || '-'
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biaya-jasa-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Biaya / Jasa" subtitle="Histori biaya operasional di luar transaksi toko">
      <PageHeader title="Biaya / Jasa" actions={
        <>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1" />Tambah Biaya
          </Button>
        </>
      } />

      <div className="mb-4 flex gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Cari biaya..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <DataTableContainer>
        <div className="p-4 border-b flex justify-between text-sm">
          <span className="text-muted-foreground">
            {isLoading ? 'Memuat...' : `${expenses.length} data`}
          </span>
          <span className="font-semibold">
            Total: <CurrencyCell value={total} color="red" />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground text-left">
                <th className="px-4 py-2.5 font-medium">No. Ref</th>
                <th className="px-4 py-2.5 font-medium">Tanggal</th>
                <th className="px-4 py-2.5 font-medium">Kategori</th>
                <th className="px-4 py-2.5 font-medium">Keterangan</th>
                <th className="px-4 py-2.5 font-medium">Jumlah</th>
                <th className="px-4 py-2.5 font-medium">Oleh</th>
                <th className="px-4 py-2.5 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Memuat data...</p>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Tidak ada data biaya.
                  </td>
                </tr>
              ) : (
                expenses.map(e => (
                  <tr key={e.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{e.code}</td>
                    <td className="px-4 py-2.5">
                      {format(new Date(e.date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{e.description}</td>
                    <td className="px-4 py-2.5">
                      <CurrencyCell value={Number(e.amount)} color="red" />
                    </td>
                    <td className="px-4 py-2.5 capitalize">{e.createdBy || '-'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(e)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleOpenDelete(e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataTableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedExpense ? 'Edit Biaya' : 'Tambah Biaya Baru'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Input 
                id="category" 
                placeholder="Misal: Operasional, Gaji, Listrik, dll"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input 
                id="amount" 
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Keterangan</Label>
              <Textarea 
                id="description" 
                placeholder="Detail pengeluaran..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createExpense.isPending || updateExpense.isPending}>
              {(createExpense.isPending || updateExpense.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Biaya</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data biaya ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExpense.isPending}
            >
              {deleteExpense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default BiayaJasa;
