import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, useExpenseCategories } from '@/hooks/api/useExpenses';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface Expense {
  id: string;
  code: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  createdBy?: string;
  createdAt?: string;
}

const BiayaJasa = () => {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [form, setForm] = useState({ date: '', category: '', description: '', amount: '' });
  const { toast } = useToast();

  const { data, isLoading, refetch } = useExpenses({ per_page: 100, search });
  const { data: categoriesData } = useExpenseCategories();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const expenses = (data?.data?.data ?? []) as Expense[];
  const categories = (categoriesData?.data ?? []) as string[];
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const openEdit = (e: Expense) => {
    setEditItem(e);
    setForm({ date: e.date || '', category: e.category || '', description: e.description || '', amount: String(e.amount || 0) });
  };

  const handleSave = async () => {
    if (!form.date || !form.category || !form.description || !form.amount) {
      toast({ title: 'Error', description: 'Semua field wajib diisi', variant: 'destructive' });
      return;
    }
    try {
      const payload = { date: form.date, category: form.category, description: form.description, amount: Number(form.amount) };
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Biaya diperbarui', description: `${form.description} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Biaya ditambahkan', description: `${form.description} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm({ date: '', category: '', description: '', amount: '' });
      refetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan biaya';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, desc: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Biaya dihapus', description: `${desc} telah dihapus.`, variant: 'destructive' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Gagal menghapus biaya', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const rows = [['No. Ref', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah', 'Oleh'],
    ...expenses.map(e => [e.code, e.date, e.category, e.description, e.amount, e.createdBy || ''])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'biaya-jasa.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Tanggal *</Label>
            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Kategori *</Label>
            <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Keterangan *</Label>
            <Input placeholder="Deskripsi biaya" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Jumlah (Rp) *</Label>
            <Input type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Biaya / Jasa" subtitle="Histori biaya operasional di luar transaksi toko">
      <PageHeader title="Biaya / Jasa" actions={
        <>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm({ date: new Date().toISOString().slice(0, 10), category: '', description: '', amount: '' }); setIsAddOpen(true); }}><Plus className="h-4 w-4 mr-1" />Tambah Biaya</Button>
        </>
      } />
      <div className="mb-4 flex gap-3">
        <div className="relative w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Cari biaya..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      {isLoading ? (
        <DataTableContainer>
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-16" />
              </div>
            ))}
          </div>
        </DataTableContainer>
      ) : (
        <DataTableContainer>
          <div className="p-4 border-b flex justify-between text-sm"><span className="text-muted-foreground">{expenses.length} data</span><span className="font-semibold">Total: <CurrencyCell value={total} color="red" /></span></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/30 text-xs text-muted-foreground">{['No. Ref', 'Tanggal', 'Kategori', 'Keterangan', 'Jumlah', 'Oleh', 'Aksi'].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data biaya.</td></tr>
              ) : (
                expenses.map(e => (
                  <tr key={e.id} className="border-b hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{e.code}</td>
                    <td className="px-4 py-2.5">{e.date}</td>
                    <td className="px-4 py-2.5"><span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{e.category}</span></td>
                    <td className="px-4 py-2.5">{e.description}</td>
                    <td className="px-4 py-2.5"><CurrencyCell value={e.amount} color="red" /></td>
                    <td className="px-4 py-2.5 capitalize">{e.createdBy || '-'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Biaya</AlertDialogTitle>
                              <AlertDialogDescription>Hapus biaya <strong>{e.description}</strong>?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(e.id, e.description)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataTableContainer>
      )}
      <FormDialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Biaya Baru" />
      <FormDialog open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Biaya" />
    </MainLayout>
  );
};
export default BiayaJasa;
