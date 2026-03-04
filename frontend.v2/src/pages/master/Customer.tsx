import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Pencil, Trash2, Phone, MapPin, AlertCircle, Download, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { CUSTOMERS, Customer as CustomerType, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const Customer = () => {
  const [customers, setCustomers] = useState<CustomerType[]>(CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CustomerType | null>(null);
  const [form, setForm] = useState({ nama: '', telepon: '', email: '', alamat: '', limitKredit: '10000000' });
  const { toast } = useToast();

  const filtered = customers.filter(c => {
    const matchSearch = c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.kode.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'piutang') return matchSearch && c.totalPiutang > 0;
    if (activeTab === 'overlimit') return matchSearch && c.totalPiutang > c.limitKredit;
    return matchSearch;
  });

  const totalPiutang = customers.reduce((s, c) => s + c.totalPiutang, 0);
  const withPiutang = customers.filter(c => c.totalPiutang > 0).length;
  const overLimit = customers.filter(c => c.totalPiutang > c.limitKredit).length;

  const openEdit = (c: CustomerType) => {
    setEditItem(c);
    setForm({ nama: c.nama, telepon: c.telepon, email: c.email, alamat: c.alamat, limitKredit: String(c.limitKredit) });
  };

  const handleSave = () => {
    if (!form.nama.trim()) return;
    if (editItem) {
      setCustomers(prev => prev.map(c => c.id === editItem.id
        ? { ...c, ...form, limitKredit: Number(form.limitKredit) } : c));
      toast({ title: 'Customer diperbarui', description: `${form.nama} berhasil diperbarui.` });
      setEditItem(null);
    } else {
      const newC: CustomerType = {
        id: `cus${Date.now()}`,
        kode: `CUS-${String(customers.length + 1).padStart(3, '0')}`,
        ...form,
        limitKredit: Number(form.limitKredit),
        totalPiutang: 0,
        totalTransaksi: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setCustomers(prev => [...prev, newC]);
      toast({ title: 'Customer ditambahkan', description: `${form.nama} berhasil ditambahkan.` });
      setIsAddOpen(false);
    }
    setForm({ nama: '', telepon: '', email: '', alamat: '', limitKredit: '10000000' });
  };

  const handleDelete = (id: string, nama: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Customer dihapus', description: `${nama} telah dihapus.`, variant: 'destructive' });
  };

  const handleExport = () => {
    const rows = [['Kode', 'Nama', 'Telepon', 'Email', 'Total Piutang', 'Limit Kredit'],
    ...filtered.map(c => [c.kode, c.nama, c.telepon, c.email, formatRupiah(c.totalPiutang), formatRupiah(c.limitKredit)])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customer.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const FormDialog = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Customer *</Label>
            <Input placeholder="Nama customer" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>No. Telepon</Label>
              <Input placeholder="08..." value={form.telepon} onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5"><Label>Alamat</Label>
            <Input placeholder="Alamat lengkap" value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Limit Kredit (Rp)</Label>
            <Input type="number" placeholder="10000000" value={form.limitKredit} onChange={e => setForm(p => ({ ...p, limitKredit: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout title="Customer" subtitle="Kelola data customer toko Anda">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Customer" value={`${customers.length} Customer`} icon={<Users className="h-5 w-5" />} color="primary" />
        <StatCard title="Total Piutang" value={totalPiutang} icon={<AlertCircle className="h-5 w-5" />} color="warning" />
        <StatCard title="Melebihi Limit" value={`${overLimit} Customer`} icon={<AlertCircle className="h-5 w-5" />} color="destructive" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari customer..." className="pl-9 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs">Semua ({customers.length})</TabsTrigger>
              <TabsTrigger value="piutang" className="text-xs">Piutang ({withPiutang})</TabsTrigger>
              <TabsTrigger value="overlimit" className="text-xs text-destructive">Over Limit ({overLimit})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm({ nama: '', telepon: '', email: '', alamat: '', limitKredit: '10000000' }); setIsAddOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" />Tambah Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-muted-foreground">Tidak ada customer yang sesuai.</div>
        ) : filtered.map(c => {
          const isOverLimit = c.totalPiutang > c.limitKredit;
          return (
            <Card key={c.id} className={`transition-shadow hover:shadow-md ${isOverLimit ? 'border-destructive/40' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">{c.kode}</span>
                      {c.totalPiutang > 0 && (
                        <Badge variant={isOverLimit ? 'destructive' : 'outline'} className={`text-xs ${!isOverLimit ? 'text-warning border-warning' : ''}`}>
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {isOverLimit ? 'Over Limit' : 'Piutang'}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-1 text-base">{c.nama}</CardTitle>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Customer</AlertDialogTitle>
                          <AlertDialogDescription>Apakah Anda yakin ingin menghapus <strong>{c.nama}</strong>?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(c.id, c.nama)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />{c.telepon}
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{c.alamat}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t pt-2.5 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Transaksi</p>
                    <p className="font-semibold text-primary text-sm">{formatRupiah(c.totalTransaksi)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Piutang / Limit</p>
                    <p className={`font-semibold text-sm ${c.totalPiutang > 0 ? (isOverLimit ? 'text-destructive' : 'text-warning') : 'text-muted-foreground'}`}>
                      {formatRupiah(c.totalPiutang)}
                    </p>
                    <p className="text-xs text-muted-foreground">/ {formatRupiah(c.limitKredit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <FormDialog open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Customer Baru" />
      <FormDialog open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Customer" />
    </MainLayout>
  );
};

export default Customer;
