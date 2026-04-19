import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTableSort } from '@/hooks/useTableSort';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Plus, Search, Download, Pencil, Trash2, Loader2, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/api/useExpenses';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { StatCard } from '@/components/ui/StatCard';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Expense } from '@/types';
import { extractErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { exportTransactionsToXlsx, getFilenameWithDate } from '@/lib/xlsx-export';

const BiayaJasa = () => {
  const [search, setSearch] = useState('');
  const { sortBy, sortDirection, toggleSort, getSortIcon } = useTableSort<'tanggal' | 'kategori' | 'jumlah'>('tanggal');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExportingXlsx, setIsExportingXlsx] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    description: '',
    amount: 0,
  });

  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const debouncedSearch = useDebouncedValue(search, 300);
  
  const { data: expensesResponse, isLoading, refetch } = useExpenses({
    search: debouncedSearch || undefined,
    sort_by: sortBy,
    sort_direction: sortDirection,
    from: fromDate || undefined,
    to: toDate || undefined,
  });
  
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expenses = expensesResponse?.data || [];
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const average = expenses.length > 0 ? total / expenses.length : 0;
  const count = expenses.length;

  const handleOpenAdd = useCallback(() => {
    setSelectedExpense(null);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      description: '',
      amount: 0,
    });
    setIsAddEditOpen(true);
  }, []);

  const handleOpenEdit = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: Number(expense.amount),
    });
    setIsAddEditOpen(true);
  }, []);

  const handleOpenDelete = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleSave = async () => {
    try {
      if (!formData.category.trim() || !formData.date || formData.amount < 0) {
        toast({
          title: 'Validasi',
          description: 'Tanggal, kategori, dan jumlah harus diisi.',
          variant: 'destructive',
        });
        return;
      }

      if (selectedExpense) {
        await updateExpense.mutateAsync({
          id: selectedExpense.id,
          data: formData,
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
        variant: 'destructive',
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
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    const headers = ['No. Ref', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah', 'Oleh'];
    const rows = expenses.map(e => [
      e.code,
      e.date,
      e.category,
      e.description || '-',
      e.amount,
      e.createdBy || '-',
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

  const handleExportXlsx = useCallback(async () => {
    setIsExportingXlsx(true);
    try {
      const headers = ['No. Ref', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah', 'Oleh'];
      const data = expenses.map(e => [
        e.code,
        e.date,
        e.category,
        e.description || '-',
        Number(e.amount),
        e.createdBy || '-',
      ]);

      await exportTransactionsToXlsx({
        filename: getFilenameWithDate('biaya-jasa'),
        headers,
        data,
        currencyColumns: [4],
        rightAlignColumns: [4],
      });

      toast({ title: 'Berhasil', description: `${expenses.length} data biaya diekspor ke XLSX` });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengekspor ke XLSX', variant: 'destructive' });
      console.error(error);
    } finally {
      setIsExportingXlsx(false);
    }
  }, [expenses, toast]);

  return (
    <MainLayout title="Biaya / Jasa" subtitle="Histori biaya operasional di luar transaksi toko">
      {/* Stat Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Biaya"
          value={formatCurrency(total)}
          icon={<DollarSign className="h-5 w-5" />}
          color="destructive"
        />
        <StatCard
          title="Jumlah Transaksi"
          value={`${count} Biaya`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Rata-rata Biaya"
          value={formatCurrency(average)}
          icon={<DollarSign className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Cari biaya..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div>
              <Label htmlFor="from-date" className="text-xs text-muted-foreground mb-1 block">Dari Tanggal</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="to-date" className="text-xs text-muted-foreground mb-1 block">Sampai Tanggal</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

         {/* Action Buttons */}
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleExport}>
             <Download className="h-4 w-4 mr-1" />Export CSV
           </Button>
           <Button variant="outline" size="sm" onClick={handleExportXlsx} disabled={isExportingXlsx}>
             <Download className="h-4 w-4 mr-1" />{isExportingXlsx ? 'Exporting...' : 'Export XLSX'}
           </Button>
           {canCreate('expenses') && (
             <Button size="sm" onClick={handleOpenAdd}>
               <Plus className="h-4 w-4 mr-1" />Tambah Biaya
             </Button>
           )}
         </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Ref</TableHead>
                 <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('tanggal')}>
                   <div className="flex items-center">
                     Tanggal
                     {getSortIcon('tanggal') === 'asc' && <ArrowUp className="h-3 w-3 ml-1" />}
                     {getSortIcon('tanggal') === 'desc' && <ArrowDown className="h-3 w-3 ml-1" />}
                   </div>
                 </TableHead>
                 <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('kategori')}>
                   <div className="flex items-center">
                     Kategori
                     {getSortIcon('kategori') === 'asc' && <ArrowUp className="h-3 w-3 ml-1" />}
                     {getSortIcon('kategori') === 'desc' && <ArrowDown className="h-3 w-3 ml-1" />}
                   </div>
                 </TableHead>
                <TableHead>Keterangan</TableHead>
                 <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => toggleSort('jumlah')}>
                   <div className="flex items-center justify-end">
                     Jumlah
                     {getSortIcon('jumlah') === 'asc' && <ArrowUp className="h-3 w-3 ml-1" />}
                     {getSortIcon('jumlah') === 'desc' && <ArrowDown className="h-3 w-3 ml-1" />}
                   </div>
                 </TableHead>
                <TableHead>Oleh</TableHead>
                {(canEdit('expenses') || canDelete('expenses')) && <TableHead className="text-center">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={(canEdit('expenses') || canDelete('expenses')) ? 7 : 6} className="py-10 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Memuat data...</p>
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={(canEdit('expenses') || canDelete('expenses')) ? 7 : 6} className="py-10 text-center text-muted-foreground">
                    Tidak ada data biaya.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs text-primary">{e.code}</TableCell>
                    <TableCell>
                      {format(new Date(e.date), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>
                      <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.description || '—'}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {formatCurrency(Number(e.amount))}
                    </TableCell>
                    <TableCell className="capitalize text-sm">{e.createdBy || '—'}</TableCell>
                    {(canEdit('expenses') || canDelete('expenses')) && (
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          {canEdit('expenses') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(e)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete('expenses') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleOpenDelete(e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedExpense ? 'Edit Biaya' : 'Tambah Biaya Baru'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori *</Label>
              <Input
                id="category"
                placeholder="Misal: Operasional, Gaji, Listrik, dll"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Keterangan (Opsional)</Label>
              <Textarea
                id="description"
                placeholder="Detail pengeluaran..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>Batal</Button>
            <Button
              onClick={handleSave}
              disabled={createExpense.isPending || updateExpense.isPending}
            >
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
