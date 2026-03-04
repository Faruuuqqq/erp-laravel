import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, RotateCcw, FileDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CUSTOMERS, TRANSACTIONS, PRODUCTS, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface ReturItem { productId: string; nama: string; qty: number; harga: number; satuan: string; subtotal: number; }

const ReturPenjualan = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ReturItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedFaktur, setSelectedFaktur] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [alasan, setAlasan] = useState('');
  const [metodeKembalian, setMetodeKembalian] = useState('');
  const [catatan, setCatatan] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const noRetur = `RTJ-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`;
  const penjualanFakturs = TRANSACTIONS.filter(t => (t.tipe === 'penjualan_tunai' || t.tipe === 'penjualan_kredit') && (!selectedCustomer || t.customerId === selectedCustomer));
  const selectedTrx = TRANSACTIONS.find(t => t.noFaktur === selectedFaktur);

  const addItem = () => {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    const trxItem = selectedTrx?.items.find(i => i.productId === selectedProduct);
    const harga = trxItem?.harga || product.hargaJual;
    setItems([...items, { productId: product.id, nama: product.nama, qty: qtyNum, harga, satuan: product.satuan, subtotal: harga * qtyNum }]);
    setSelectedProduct(''); setQty('1');
    toast({ title: `${product.nama} ditambahkan` });
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSave = () => {
    if (items.length === 0) return toast({ title: 'Belum ada barang retur', variant: 'destructive' });
    if (!alasan) return toast({ title: 'Pilih alasan retur', variant: 'destructive' });
    if (!metodeKembalian) return toast({ title: 'Pilih metode pengembalian', variant: 'destructive' });
    setConfirmOpen(true);
  };

  if (saved) {
    return (
      <MainLayout title="Retur Penjualan" subtitle="Retur berhasil diproses">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
            <CheckCircle2 className="h-10 w-10 text-warning" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Retur Penjualan Diproses</h2>
            <p className="text-muted-foreground mt-1">No. Retur: <span className="font-mono font-semibold text-primary">{noRetur}</span></p>
            <p className="text-3xl font-bold text-warning mt-3">{formatRupiah(totalNilai)}</p>
            <p className="text-sm text-muted-foreground">Nilai retur - metode: {metodeKembalian}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => toast({ title: 'Mengekspor PDF...' })}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
            <Button onClick={() => { setItems([]); setSaved(false); setSelectedFaktur(''); setSelectedCustomer(''); setAlasan(''); setMetodeKembalian(''); setCatatan(''); }}>Retur Baru</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Retur Penjualan" subtitle="Terima retur barang dari customer">
      <Alert className="mb-4 border-warning/30 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-sm text-warning">
          Retur penjualan akan menambah kembali stok barang dan menyesuaikan nilai piutang/kas customer.
        </AlertDescription>
      </Alert>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4" />Form Retur Penjualan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Retur</Label>
                  <Input value={noRetur} disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      {CUSTOMERS.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Faktur Penjualan</Label>
                  <Select value={selectedFaktur} onValueChange={setSelectedFaktur}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih faktur" /></SelectTrigger>
                    <SelectContent>
                      {penjualanFakturs.map(t => <SelectItem key={t.id} value={t.noFaktur}>{t.noFaktur} - {t.customerNama}</SelectItem>)}
                      <SelectItem value="manual">Input Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Alasan Retur</Label>
                  <Select value={alasan} onValueChange={setAlasan}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rusak">Barang Rusak</SelectItem>
                      <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
                      <SelectItem value="tidak_sesuai">Tidak Sesuai Pesanan</SelectItem>
                      <SelectItem value="kelebihan">Kelebihan Order</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pilih Barang Retur</p>
                <div className="grid gap-2 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                      <SelectContent>
                        {(selectedTrx?.items ?? PRODUCTS.map(p => ({ productId: p.id, productNama: p.nama, qty: 0, harga: p.hargaJual, satuan: p.satuan, diskon: 0, subtotal: 0 }))).map(i => (
                          <SelectItem key={i.productId} value={i.productId}>{i.productNama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" className="text-xs h-8" min="1" />
                  <Button onClick={addItem} size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Tambah</Button>
                </div>
              </div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-8">No</TableHead>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs text-right">Harga</TableHead>
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Belum ada barang retur</TableCell></TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={idx} className="text-sm">
                          <TableCell className="text-xs">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.nama}<p className="text-xs text-muted-foreground">{item.satuan}</p></TableCell>
                          <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                          <TableCell className="text-right tabular-nums text-xs">{formatRupiah(item.harga)}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-warning">{formatRupiah(item.subtotal)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3"><CardTitle className="text-base">Ringkasan Retur</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Item</span><span>{items.length} produk</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Qty</span><span className="tabular-nums">{items.reduce((s,i) => s+i.qty,0)}</span></div>
              <div className="rounded-lg border bg-warning/10 p-3">
                <p className="text-xs text-muted-foreground">Total Nilai Retur</p>
                <p className="text-xl font-bold text-warning tabular-nums">{formatRupiah(totalNilai)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pengembalian</Label>
                <Select value={metodeKembalian} onValueChange={setMetodeKembalian}>
                  <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Pengembalian Tunai</SelectItem>
                    <SelectItem value="potong_piutang">Potong Piutang</SelectItem>
                    <SelectItem value="tukar_barang">Tukar Barang</SelectItem>
                    <SelectItem value="kredit_nota">Kredit Nota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan retur..." className="text-xs h-8" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setItems([]); setSelectedFaktur(''); setAlasan(''); setMetodeKembalian(''); }}>Reset</Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={items.length === 0}>Simpan</Button>
              </div>
              <Button variant="outline" className="w-full h-8 text-xs" onClick={() => toast({ title: 'Mengekspor PDF...' })}><FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Retur Penjualan</AlertDialogTitle>
            <AlertDialogDescription>
              Retur senilai <strong>{formatRupiah(totalNilai)}</strong> akan menambah stok dan mengurangi piutang/kas customer. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmOpen(false); setSaved(true); toast({ title: 'Retur berhasil', description: noRetur }); }}>Ya, Proses Retur</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default ReturPenjualan;
