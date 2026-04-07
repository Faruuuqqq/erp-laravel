import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Receipt, Check, FileDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import type { Supplier } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface UtangItem {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierNama: string;
  date: string;
  total: number;
  paid: number;
  remaining: number;
}

const PembayaranUtang = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saved, setSaved] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);
  const [lastCount, setLastCount] = useState(0);

  const { data: suppliersData } = useSuppliers({ per_page: 100 });
  const suppliers = (suppliersData?.data?.data ?? []) as Supplier[];
  const createMutation = useCreateTransaction();

  const utangData: UtangItem[] = suppliers
    .filter(s => (s.balance || 0) > 0)
    .map(s => ({
      id: `utang-${s.id}`,
      invoiceNumber: `PB-UTG-${s.id}`,
      supplierId: s.id,
      supplierNama: s.name,
      date: new Date().toISOString().slice(0, 10),
      total: s.balance || 0,
      paid: 0,
      remaining: s.balance || 0,
    }));

  const filtered = utangData.filter(u => {
    const matchSearch = u.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || u.supplierNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSupplier = filterSupplier === 'all' || u.supplierId === filterSupplier;
    return matchSearch && matchSupplier;
  });

  const totalSelected = utangData.filter(u => selectedItems.includes(u.id)).reduce((s, u) => s + u.remaining, 0);
  const jumlahBayarNum = parseFloat(jumlahBayar) || 0;

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (selectedItems.length === 0) return toast({ title: 'Pilih faktur terlebih dahulu', variant: 'destructive' });
    if (!metodePembayaran) return toast({ title: 'Pilih metode pembayaran', variant: 'destructive' });
    if (jumlahBayarNum <= 0) return toast({ title: 'Masukkan jumlah yang dibayar', variant: 'destructive' });

    try {
      const selectedUtang = utangData.filter(u => selectedItems.includes(u.id));
      const firstSupplier = selectedUtang[0];

      await createMutation.mutateAsync({
        type: 'pembayaran_utang',
        invoiceNumber: `BYR-UTG-${new Date().getTime()}`,
        date: new Date().toISOString().slice(0, 10),
        supplierId: firstSupplier.supplierId,
        subtotal: jumlahBayarNum,
        discount: 0,
        tax: 0,
        total: jumlahBayarNum,
        paid: jumlahBayarNum,
        remaining: 0,
        status: 'completed',
        notes: catatan,
        items: selectedUtang.map(u => ({
          productId: null,
          quantity: 1,
          price: u.remaining,
          discount: 0,
          description: `Pembayaran utang ${u.invoiceNumber}`,
        })),
      });

      setLastAmount(jumlahBayarNum);
      setLastCount(selectedItems.length);
      setSaved(true);
      toast({ title: 'Pembayaran utang berhasil dicatat', description: `${selectedItems.length} faktur dibayar` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan pembayaran';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  if (saved) {
    return (
      <MainLayout title="Pembayaran Utang" subtitle="Pembayaran berhasil dicatat">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Pembayaran Berhasil</h2>
            <p className="text-3xl font-bold text-primary mt-3">{formatRupiah(lastAmount)}</p>
            <p className="text-sm text-muted-foreground mt-1">{lastCount} faktur utang diselesaikan</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
            <Button onClick={() => { setSelectedItems([]); setSaved(false); setJumlahBayar(''); setMetodePembayaran(''); setCatatan(''); }}>Input Baru</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Pembayaran Utang" subtitle="Bayar utang ke supplier/distributor">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Daftar Utang ke Supplier
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Cari..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                    <SelectTrigger className="w-40 text-xs h-8"><SelectValue placeholder="Semua" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Supplier</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 w-10"></th>
                      <th className="px-3 py-2 text-left">No. Faktur</th>
                      <th className="px-3 py-2 text-left">Supplier</th>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-right">Sisa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">Tidak ada utang.</td></tr>
                    ) : (
                      filtered.map(item => (
                        <tr key={item.id} className={`border-b cursor-pointer ${selectedItems.includes(item.id) ? 'bg-primary/5' : ''}`} onClick={() => toggleItem(item.id)}>
                          <td className="px-3 py-2"><Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleItem(item.id)} /></td>
                          <td className="px-3 py-2 font-mono text-xs text-primary font-semibold">{item.invoiceNumber}</td>
                          <td className="px-3 py-2 font-medium max-w-[140px] truncate">{item.supplierNama}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{item.date}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.total)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold text-destructive">{formatRupiah(item.remaining)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Form Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Bayar</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="text-xs h-8" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pembayaran</Label>
                <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="giro">Giro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Total Dipilih ({selectedItems.length} faktur)</p>
                <p className="text-xl font-bold text-primary tabular-nums">{formatRupiah(totalSelected)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Dibayar (Rp)</Label>
                <Input type="number" value={jumlahBayar} onChange={e => setJumlahBayar(e.target.value)} placeholder="0" className="text-right text-lg font-bold h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan pembayaran..." className="text-xs h-8" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setSelectedItems([])}>Batal</Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={selectedItems.length === 0 || createMutation.isPending}>
                  <Check className="mr-1.5 h-4 w-4" />Bayar
                </Button>
              </div>
              <Button variant="outline" className="w-full h-8 text-xs" onClick={() => window.print()}>
                <FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PembayaranUtang;
