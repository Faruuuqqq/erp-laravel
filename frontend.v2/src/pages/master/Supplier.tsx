import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Building2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { SUPPLIERS, Supplier as SupplierType, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Supplier = () => {
  const [suppliers, setSuppliers] = useState<SupplierType[]>(SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SupplierType | null>(null);
  const [form, setForm] = useState({ nama: '', telepon: '', email: '', alamat: '' });
  const { toast } = useToast();

  const filtered = suppliers.filter(s =>
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUtang = suppliers.reduce((s, sup) => s + sup.totalUtang, 0);
  const withDebt = suppliers.filter(s => s.totalUtang > 0).length;

  const openEdit = (s: SupplierType) => {
    setEditItem(s);
    setForm({ nama: s.nama, telepon: s.telepon, email: s.email, alamat: s.alamat });
  };

  const handleSave = () => {
    if (!form.nama.trim()) return;
    if (editItem) {
      setSuppliers(prev => prev.map(s => s.id === editItem.id ? { ...s, ...form } : s));
      toast({ title: 'Supplier diperbarui', description: `${form.nama} berhasil diperbarui.` });
      setEditItem(null);
    } else {
      const newSupplier: SupplierType = {
        id: `sup${Date.now()}`,
        kode: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
        ...form,
        totalUtang: 0,
        totalTransaksi: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setSuppliers(prev => [...prev, newSupplier]);
      toast({ title: 'Supplier ditambahkan', description: `${form.nama} berhasil ditambahkan.` });
      setIsAddOpen(false);
    }
    setForm({ nama: '', telepon: '', email: '', alamat: '' });
  };

  const handleDelete = (id: string, nama: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast({ title: 'Supplier dihapus', description: `${nama} telah dihapus.`, variant: 'destructive' });
  };

  const handleExport = () => {
    const rows = [
      ['Kode', 'Nama', 'Telepon', 'Email', 'Alamat', 'Total Utang', 'Total Transaksi'],
      ...filtered.map(s => [s.kode, s.nama, s.telepon, s.email, s.alamat, formatRupiah(s.totalUtang), formatRupiah(s.totalTransaksi)]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'supplier.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Supplier *</Label>
            <Input placeholder="Nama supplier" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>No. Telepon</Label>
              <Input placeholder="021-..." value={form.telepon} onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Alamat</Label>
            <Input placeholder="Alamat lengkap" value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { onOpenChange(false); setEditItem(null); setForm({ nama: '', telepon: '', email: '', alamat: '' }); }}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Supplier" subtitle="Kelola data supplier toko Anda">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Supplier" value={`${suppliers.length} Supplier`} icon={<Building2 className="h-5 w-5" />} color="primary" />
        <StatCard title="Supplier Berutang" value={`${withDebt} Supplier`} icon={<Building2 className="h-5 w-5" />} color="warning" />
        <StatCard title="Total Utang" value={totalUtang} icon={<Building2 className="h-5 w-5" />} color="destructive" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari supplier..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />Export CSV
          </Button>
          <Button size="sm" onClick={() => { setForm({ nama: '', telepon: '', email: '', alamat: '' }); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Supplier</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total Transaksi</TableHead>
                <TableHead className="text-right">Saldo Utang</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Tidak ada data supplier.</TableCell></TableRow>
              ) : filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-primary">{s.kode}</TableCell>
                  <TableCell>
                    <div className="font-medium">{s.nama}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-48">{s.alamat}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.telepon}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{s.email || '—'}</TableCell>
                  <TableCell className="text-right font-medium">{formatRupiah(s.totalTransaksi)}</TableCell>
                  <TableCell className="text-right">
                    {s.totalUtang > 0
                      ? <span className="font-semibold text-destructive">{formatRupiah(s.totalUtang)}</span>
                      : <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Supplier</AlertDialogTitle>
                            <AlertDialogDescription>Apakah Anda yakin ingin menghapus <strong>{s.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(s.id, s.nama)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FormDialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Supplier Baru" />
      <FormDialog open={!!editItem} onOpenChange={(v) => { if (!v) setEditItem(null); }} title="Edit Supplier" />
    </MainLayout>
  );
};

export default Supplier;
