import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Wallet, Check, FileDown, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { CUSTOMERS, TRANSACTIONS, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface PiutangItem {
  id: string;
  faktur: string;
  customerId: string;
  customerNama: string;
  tanggal: string;
  total: number;
  sisa: number;
  overdue: boolean;
}

const piutangData: PiutangItem[] = [
  { id: 'p1', faktur: 'PJ-2025-027-001', customerId: 'cus3', customerNama: 'CV Sumber Rejeki', tanggal: '27-02-2025', total: 4_600_000, sisa: 4_600_000, overdue: false },
  { id: 'p2', faktur: 'PJ-2025-026-005', customerId: 'cus5', customerNama: 'UD Berkah Bersama', tanggal: '26-02-2025', total: 4_560_000, sisa: 4_560_000, overdue: false },
  { id: 'p3', faktur: 'PK-2025-020-003', customerId: 'cus1', customerNama: 'Toko Makmur Jaya', tanggal: '20-02-2025', total: 7_500_000, sisa: 5_500_000, overdue: true },
  { id: 'p4', faktur: 'PK-2025-015-001', customerId: 'cus5', customerNama: 'UD Berkah Bersama', tanggal: '15-02-2025', total: 18_200_000, sisa: 17_540_000, overdue: true },
  { id: 'p5', faktur: 'PK-2025-010-002', customerId: 'cus4', customerNama: 'Toko Aneka Sembako', tanggal: '10-02-2025', total: 4_200_000, sisa: 4_200_000, overdue: true },
];

const PembayaranPiutang = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [jumlahDiterima, setJumlahDiterima] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saved, setSaved] = useState(false);

  const filtered = piutangData.filter(p => {
    const matchSearch = p.faktur.toLowerCase().includes(searchTerm.toLowerCase()) || p.customerNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCustomer = filterCustomer === 'all' || p.customerId === filterCustomer;
    return matchSearch && matchCustomer;
  });

  const totalSelected = piutangData.filter(p => selectedItems.includes(p.id)).reduce((s, p) => s + p.sisa, 0);
  const jumlahDiterimaNum = parseFloat(jumlahDiterima) || 0;
  const sisa = totalSelected - jumlahDiterimaNum;

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (selectedItems.length === 0) return toast({ title: 'Pilih faktur terlebih dahulu', variant: 'destructive' });
    if (!metodePembayaran) return toast({ title: 'Pilih metode pembayaran', variant: 'destructive' });
    if (jumlahDiterimaNum <= 0) return toast({ title: 'Masukkan jumlah yang diterima', variant: 'destructive' });
    setSaved(true);
    toast({ title: 'Pembayaran piutang berhasil dicatat', description: `${selectedItems.length} faktur dibayar` });
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
            <p className="text-3xl font-bold text-success mt-3">{formatRupiah(jumlahDiterimaNum)}</p>
            <p className="text-sm text-muted-foreground mt-1">{selectedItems.length} faktur diselesaikan</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
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
                      {CUSTOMERS.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10 text-xs"></TableHead>
                      <TableHead className="text-xs">No. Faktur</TableHead>
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                      <TableHead className="text-xs text-right">Sisa</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(item => (
                      <TableRow key={item.id} className={`text-sm cursor-pointer ${selectedItems.includes(item.id) ? 'bg-primary/5' : ''}`} onClick={() => toggleItem(item.id)}>
                        <TableCell><Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleItem(item.id)} /></TableCell>
                        <TableCell className="font-mono text-xs text-primary font-semibold">{item.faktur}</TableCell>
                        <TableCell className="font-medium">{item.customerNama}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.tanggal}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatRupiah(item.total)}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-warning">{formatRupiah(item.sisa)}</TableCell>
                        <TableCell>
                          <Badge variant={item.overdue ? 'destructive' : 'secondary'} className="text-xs">
                            {item.overdue ? 'Jatuh Tempo' : 'Aktif'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={selectedItems.length === 0}>
                  <Check className="mr-1.5 h-4 w-4" />Terima
                </Button>
              </div>
              <Button variant="outline" className="w-full h-8 text-xs" onClick={() => toast({ title: 'Mengekspor PDF...' })}>
                <FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PembayaranPiutang;
