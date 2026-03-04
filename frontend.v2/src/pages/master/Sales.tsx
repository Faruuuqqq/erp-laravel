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
import { Plus, Search, Pencil, Trash2, Phone, Mail, MapPin, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/ui/StatCard';
import { SALES_REPS, SalesRep as SalesType, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Sales = () => {
  const [list, setList] = useState<SalesType[]>(SALES_REPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SalesType | null>(null);
  const [form, setForm] = useState({ nama: '', telepon: '', email: '', area: '', status: 'aktif' as 'aktif' | 'nonaktif' });
  const { toast } = useToast();

  const filtered = list.filter(s =>
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = list.filter(s => s.status === 'aktif').length;
  const totalPenjualan = list.reduce((s, r) => s + r.totalPenjualan, 0);

  const openEdit = (s: SalesType) => {
    setEditItem(s);
    setForm({ nama: s.nama, telepon: s.telepon, email: s.email, area: s.area, status: s.status });
  };

  const handleSave = () => {
    if (!form.nama.trim()) return;
    if (editItem) {
      setList(prev => prev.map(s => s.id === editItem.id ? { ...s, ...form } : s));
      toast({ title: 'Sales diperbarui', description: `${form.nama} berhasil diperbarui.` });
      setEditItem(null);
    } else {
      const newS: SalesType = {
        id: `s${Date.now()}`,
        kode: `SLS-${String(list.length + 1).padStart(3, '0')}`,
        ...form,
        totalPenjualan: 0,
      };
      setList(prev => [...prev, newS]);
      toast({ title: 'Sales ditambahkan', description: `${form.nama} berhasil ditambahkan.` });
      setIsAddOpen(false);
    }
    setForm({ nama: '', telepon: '', email: '', area: '', status: 'aktif' });
  };

  const handleDelete = (id: string, nama: string) => {
    setList(prev => prev.filter(s => s.id !== id));
    toast({ title: 'Sales dihapus', description: `${nama} telah dihapus.`, variant: 'destructive' });
  };

  const SalesForm = ({ open, onOpenChange, title }: { open: boolean; onOpenChange: (v: boolean) => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => { onOpenChange(v); if (!v) setEditItem(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5"><Label>Nama Sales *</Label>
            <Input placeholder="Nama sales" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>No. Telepon</Label>
              <Input placeholder="08..." value={form.telepon} onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="email@..." value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Area Kerja</Label>
              <Input placeholder="Jakarta Utara" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v: 'aktif' | 'nonaktif') => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
        <Button size="sm" onClick={() => { setForm({ nama: '', telepon: '', email: '', area: '', status: 'aktif' }); setIsAddOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" />Tambah Sales
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-muted-foreground">Tidak ada data sales yang sesuai.</div>
        ) : filtered.map(s => {
          const initials = s.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <Card key={s.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">{s.kode}</span>
                        <Badge variant={s.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
                          {s.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-0.5 text-base">{s.nama}</CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Sales</AlertDialogTitle>
                          <AlertDialogDescription>Hapus <strong>{s.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(s.id, s.nama)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />{s.telepon}
                </div>
                {s.email && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />{s.email}
                </div>}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">Area: <span className="font-medium text-foreground">{s.area}</span></span>
                </div>
                <div className="border-t pt-2.5 mt-1">
                  <p className="text-xs text-muted-foreground">Total Penjualan</p>
                  <p className="font-bold text-primary text-sm">{formatRupiah(s.totalPenjualan)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SalesForm open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Sales Baru" />
      <SalesForm open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }} title="Edit Sales" />
    </MainLayout>
  );
};

export default Sales;
