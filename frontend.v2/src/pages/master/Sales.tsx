import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import { useSalesReps, useCreateSalesRep, useUpdateSalesRep, useDeleteSalesRep } from '@/hooks/api/useSalesReps';
import type { SalesRep } from '@/types';

const BLANK_FORM = { name: '', phone: '', email: '', area: '', status: 'aktif' as 'aktif' | 'nonaktif' };

const Sales = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SalesRep | null>(null);
  const [form, setForm] = useState(BLANK_FORM);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const { data: salesData, isLoading } = useSalesReps({ search: debouncedSearch || undefined, perPage: 200 });
  const createMutation = useCreateSalesRep();
  const updateMutation = useUpdateSalesRep();
  const deleteMutation = useDeleteSalesRep();

  const list = salesData?.data ?? [];
  const activeCount = list.filter(s => s.status === 'aktif').length;
  const totalPenjualan = list.reduce((s, r) => s + Number(r.totalSales ?? 0), 0);

  const filtered = list.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEdit = useCallback((s: SalesRep) => {
    setEditItem(s);
    setForm({ name: s.name, phone: s.phone ?? '', email: s.email ?? '', area: s.area ?? '', status: (s.status ?? 'aktif') as 'aktif' | 'nonaktif' });
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name, phone: form.phone, email: form.email, area: form.area, status: form.status };
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: payload });
        toast({ title: 'Sales diperbarui', description: `${form.name} berhasil diperbarui.` });
        setEditItem(null);
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Sales ditambahkan', description: `${form.name} berhasil ditambahkan.` });
        setIsAddOpen(false);
      }
      setForm(BLANK_FORM);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal menyimpan data sales';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

   const handleDelete = async (id: string, name: string) => {
     try {
       await deleteMutation.mutateAsync(id);
       toast({ title: 'Sales dihapus', description: `${name} telah dihapus.`, variant: 'destructive' });
     } catch {
       toast({ title: 'Error', description: 'Gagal menghapus sales', variant: 'destructive' });
     }
   };

   return (
     <MainLayout title="Sales" subtitle="Kelola daftar sales / marketing">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Sales" value={`${list.length} Sales`} icon={<TrendingUp className="h-5 w-5" />} color="primary" />
        <StatCard title="Sales Aktif" value={`${activeCount} Aktif`} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Penjualan" value={totalPenjualan} icon={<TrendingUp className="h-5 w-5" />} color="info" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari sales..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        {canCreate('sales_reps') && (
          <Button size="sm" onClick={() => { setForm(BLANK_FORM); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Sales
          </Button>
        )}
      </div>

       {isLoading ? (
         <div className="py-12 text-center text-muted-foreground">Memuat data...</div>
       ) : (
         <Card>
           <CardContent className="p-0">
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Kode</TableHead>
                     <TableHead>Nama Sales</TableHead>
                     <TableHead>Telepon</TableHead>
                     <TableHead>Email</TableHead>
                     <TableHead>Area Kerja</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right">Total Penjualan</TableHead>
                     {(canEdit('sales_reps') || canDelete('sales_reps')) && <TableHead className="text-center">Aksi</TableHead>}
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filtered.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={(canEdit('sales_reps') || canDelete('sales_reps')) ? 8 : 7} className="py-10 text-center text-muted-foreground">Tidak ada data sales yang sesuai.</TableCell>
                     </TableRow>
                   ) : filtered.map(s => (
                     <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs text-primary">{s.code ?? 'S-' + s.id.slice(0, 4)}</TableCell>
                       <TableCell className="font-medium">{s.name}</TableCell>
                       <TableCell className="text-muted-foreground">{s.phone ?? '—'}</TableCell>
                       <TableCell className="text-muted-foreground text-xs">{s.email ?? '—'}</TableCell>
                       <TableCell className="text-muted-foreground">{s.area ?? '—'}</TableCell>
                       <TableCell>
                         <Badge variant={s.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
                           {s.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right font-semibold tabular-nums text-primary">{formatCurrency(Number(s.totalSales ?? 0))}</TableCell>
                       {(canEdit('sales_reps') || canDelete('sales_reps')) && (
                         <TableCell>
                           <div className="flex justify-center gap-1">
                             {canEdit('sales_reps') && (
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                                 <Pencil className="h-3.5 w-3.5" />
                               </Button>
                             )}
                             {canDelete('sales_reps') && (
                               <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                     <Trash2 className="h-3.5 w-3.5" />
                                   </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                   <AlertDialogHeader>
                                     <AlertDialogTitle>Hapus Sales</AlertDialogTitle>
                                     <AlertDialogDescription>Hapus <strong>{s.name}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel>Batal</AlertDialogCancel>
                                     <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(s.id, s.name)}>Hapus</AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                             )}
                           </div>
                         </TableCell>
                       )}
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           </CardContent>
         </Card>
       )}

       <Dialog open={isAddOpen || !!editItem} onOpenChange={v => {
         if (!v) { setIsAddOpen(false); setEditItem(null); setForm(BLANK_FORM); }
       }}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editItem ? 'Edit Sales' : 'Tambah Sales Baru'}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-1">
             <div className="space-y-1.5">
               <Label>Nama Sales *</Label>
               <Input placeholder="Nama sales" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label>No. Telepon</Label>
                 <Input placeholder="08..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
               </div>
               <div className="space-y-1.5">
                 <Label>Email</Label>
                 <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label>Area Kerja</Label>
                 <Input placeholder="Jakarta Utara" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} />
               </div>
               <div className="space-y-1.5">
                 <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: 'aktif' | 'nonaktif') => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="aktif">Aktif</SelectItem>
                     <SelectItem value="nonaktif">Nonaktif</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={() => {
                 setIsAddOpen(false);
                 setEditItem(null);
                 setForm(BLANK_FORM);
               }}>Batal</Button>
               <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                 {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </MainLayout>
   );
 };

 export default Sales;
