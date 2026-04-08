import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Wallet, Check, FileDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useCreateTransaction } from '@/hooks/api/useTransactions';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import type { Customer } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface PiutangItem {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerNama: string;
  date: string;
  total: number;
  remaining: number;
}

const PembayaranPiutang = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [jumlahDiterima, setJumlahDiterima] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saved, setSaved] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);
  const [lastCount, setLastCount] = useState(0);

  const { data: customersData } = useCustomers({ per_page: 100 });
  const customers = (customersData?.data?.data ?? []) as Customer[];
  const createMutation = useCreateTransaction();

  const piutangData: PiutangItem[] = customers
    .filter(c => (c.balance || 0) > 0)
    .map(c => ({
      id: `piutang-${c.id}`,
      invoiceNumber: `PJ-UTG-${c.id}`,
      customerId: c.id,
      customerNama: c.name,
      date: new Date().toISOString().slice(0, 10),
      total: c.balance || 0,
      remaining: c.balance || 0,
    }));

  const filtered = piutangData.filter(p => {
    const matchSearch = p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || p.customerNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCustomer = filterCustomer === 'all' || p.customerId === filterCustomer;
    return matchSearch && matchCustomer;
  });

  const totalSelected = piutangData.filter(p => selectedItems.includes(p.id)).reduce((s, p) => s + p.remaining, 0);
  const jumlahDiterimaNum = parseFloat(jumlahDiterima) || 0;
  const sisa = totalSelected - jumlahDiterimaNum;

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (selectedItems.length === 0) return toast({ title: 'Pilih faktur terlebih dahulu', variant: 'destructive' });
    if (!metodePembayaran) return toast({ title: 'Pilih metode pembayaran', variant: 'destructive' });
    if (jumlahDiterimaNum <= 0) return toast({ title: 'Masukkan jumlah yang diterima', variant: 'destructive' });

    try {
      const selectedPiutang = piutangData.filter(p => selectedItems.includes(p.id));
      const firstCustomer = selectedPiutang[0];

      await createMutation.mutateAsync({
        type: 'pembayaran_piutang',
        invoiceNumber: `BYR-PIU-${new Date().getTime()}`,
        date: new Date().toISOString().slice(0, 10),
        customerId: firstCustomer.customerId,
        subtotal: jumlahDiterimaNum,
        discount: 0,
        tax: 0,
        total: jumlahDiterimaNum,
        paid: jumlahDiterimaNum,
        remaining: 0,
        status: 'completed',
        notes: catatan,
        items: selectedPiutang.map(p => ({
          productId: null,
          quantity: 1,
          price: p.remaining,
          discount: 0,
          description: `Pembayaran piutang ${p.invoiceNumber}`,
        })),
      });

      setLastAmount(jumlahDiterimaNum);
      setLastCount(selectedItems.length);
      setSaved(true);
      toast({ title: 'Pembayaran piutang berhasil dicatat', description: `${selectedItems.length} faktur dibayar` });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan pembayaran';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  if (saved) {
    return (
      <MainLayout title="Pembayaran Piutang" subtitle="Pembayaran berhasil dicatat">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Check className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Pembayaran Diterima</h2>
            <p className="text-3xl font-bold text-success mt-3">{formatRupiah(lastAmount)}</p>
            <p className="text-sm text-muted-foreground mt-1">{lastCount} faktur diselesaikan</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { setSelectedItems([]); setSaved(false); setJumlahDiterima(''); setMetodePembayaran(''); setCatatan(''); }}>Input Baru</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Pembayaran Piutang" subtitle="Terima pembayaran piutang dari customer">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4" />
                  Daftar Piutang Customer
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-52">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Cari faktur/customer..." className="pl-8 text-xs h-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                    <SelectTrigger className="w-40 text-xs h-8"><SelectValue placeholder="Semua" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Customer</SelectItem>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
                      <th className="px-3 py-2 text-left">Customer</th>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-right">Sisa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">Tidak ada piutang.</td></tr>
                    ) : (
                      filtered.map(item => (
                        <tr key={item.id} className={`border-b cursor-pointer ${selectedItems.includes(item.id) ? 'bg-primary/5' : ''}`} onClick={() => toggleItem(item.id)}>
                          <td className="px-3 py-2"><Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleItem(item.id)} /></td>
                          <td className="px-3 py-2 font-mono text-xs text-primary font-semibold">{item.invoiceNumber}</td>
                          <td className="px-3 py-2 font-medium">{item.customerNama}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{item.date}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.total)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold text-warning">{formatRupiah(item.remaining)}</td>
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
              <CardTitle className="text-base">Form Penerimaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Terima</Label>
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
                    <SelectItem value="cek">Cek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-success/10 p-3">
                <p className="text-xs text-muted-foreground">Total Dipilih ({selectedItems.length} faktur)</p>
                <p className="text-xl font-bold text-success tabular-nums">{formatRupiah(totalSelected)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jumlah Diterima (Rp)</Label>
                <Input type="number" value={jumlahDiterima} onChange={e => setJumlahDiterima(e.target.value)} placeholder="0" className="text-right text-lg font-bold h-10" />
              </div>
              {jumlahDiterimaNum > 0 && (
                <div className={`flex justify-between rounded-lg p-2.5 text-sm ${sisa <= 0 ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <span className={sisa <= 0 ? 'text-success' : 'text-warning'}>
                    {sisa <= 0 ? 'Lebih bayar' : 'Sisa piutang'}
                  </span>
                  <span className={`font-bold tabular-nums ${sisa <= 0 ? 'text-success' : 'text-warning'}`}>{formatRupiah(Math.abs(sisa))}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan penerimaan..." className="text-xs h-8" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setSelectedItems([])}>Batal</Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={selectedItems.length === 0 || createMutation.isPending}>
                  <Check className="mr-1.5 h-4 w-4" />Terima
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PembayaranPiutang;
