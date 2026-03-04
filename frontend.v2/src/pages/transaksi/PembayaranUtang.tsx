import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Receipt, Check, FileDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { SUPPLIERS, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface UtangItem {
  id: string;
  faktur: string;
  supplierId: string;
  supplierNama: string;
  tanggal: string;
  total: number;
  terbayar: number;
  sisa: number;
  overdue: boolean;
}

const utangData: UtangItem[] = [
  { id: 'u1', faktur: 'PB-2025-027-001', supplierId: 'sup1', supplierNama: 'PT Indofood Sukses Makmur', tanggal: '27-02-2025', total: 1_450_000, terbayar: 0, sisa: 1_450_000, overdue: false },
  { id: 'u2', faktur: 'PB-2025-015-001', supplierId: 'sup1', supplierNama: 'PT Indofood Sukses Makmur', tanggal: '15-02-2025', total: 12_500_000, terbayar: 1_450_000, sisa: 11_050_000, overdue: true },
  { id: 'u3', faktur: 'PB-2025-010-002', supplierId: 'sup3', supplierNama: 'CV Distributor Sembako Jaya', tanggal: '10-02-2025', total: 8_200_000, terbayar: 0, sisa: 8_200_000, overdue: true },
  { id: 'u4', faktur: 'PB-2025-005-003', supplierId: 'sup4', supplierNama: 'PT Wings Surya', tanggal: '05-02-2025', total: 3_800_000, terbayar: 0, sisa: 3_800_000, overdue: true },
];

const PembayaranUtang = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saved, setSaved] = useState(false);

  const filtered = utangData.filter(u => {
    const matchSearch = u.faktur.toLowerCase().includes(searchTerm.toLowerCase()) || u.supplierNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSupplier = filterSupplier === 'all' || u.supplierId === filterSupplier;
    return matchSearch && matchSupplier;
  });

  const totalSelected = utangData.filter(u => selectedItems.includes(u.id)).reduce((s, u) => s + u.sisa, 0);
  const jumlahBayarNum = parseFloat(jumlahBayar) || 0;

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (selectedItems.length === 0) return toast({ title: 'Pilih faktur terlebih dahulu', variant: 'destructive' });
    if (!metodePembayaran) return toast({ title: 'Pilih metode pembayaran', variant: 'destructive' });
    if (jumlahBayarNum <= 0) return toast({ title: 'Masukkan jumlah yang dibayar', variant: 'destructive' });
    setSaved(true);
    toast({ title: 'Pembayaran utang berhasil dicatat', description: `${selectedItems.length} faktur dibayar` });
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
            <p className="text-3xl font-bold text-primary mt-3">{formatRupiah(jumlahBayarNum)}</p>
            <p className="text-sm text-muted-foreground mt-1">{selectedItems.length} faktur utang diselesaikan</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => toast({ title: 'Mengekspor PDF...' })}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
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
                      {SUPPLIERS.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
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
                      <TableHead className="text-xs">Supplier</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                      <TableHead className="text-xs text-right">Terbayar</TableHead>
                      <TableHead className="text-xs text-right">Sisa</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(item => (
                      <TableRow key={item.id} className={`text-sm cursor-pointer ${selectedItems.includes(item.id) ? 'bg-primary/5' : ''}`} onClick={() => toggleItem(item.id)}>
                        <TableCell><Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleItem(item.id)} /></TableCell>
                        <TableCell className="font-mono text-xs text-primary font-semibold">{item.faktur}</TableCell>
                        <TableCell className="font-medium max-w-[140px] truncate">{item.supplierNama}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.tanggal}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{formatRupiah(item.total)}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs text-success">{formatRupiah(item.terbayar)}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-destructive">{formatRupiah(item.sisa)}</TableCell>
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
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={selectedItems.length === 0}>
                  <Check className="mr-1.5 h-4 w-4" />Bayar
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

export default PembayaranUtang;
