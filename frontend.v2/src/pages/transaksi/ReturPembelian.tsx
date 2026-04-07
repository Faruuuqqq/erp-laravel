import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, RotateCcw, FileDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSuppliers } from '@/hooks/api/useSuppliers';
import { useProducts } from '@/hooks/api/useProducts';
import type { Supplier, Product } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface ReturItem { productId: string; nama: string; qty: number; harga: number; satuan: string; subtotal: number; }

const ReturPembelian = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ReturItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [alasan, setAlasan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastRetur, setLastRetur] = useState('');

  const { data: suppliersData } = useSuppliers({ per_page: 100 });
  const { data: productsData } = useProducts({ per_page: 200 });
  const suppliers = (suppliersData?.data?.data ?? []) as Supplier[];
  const products = (productsData?.data?.data ?? []) as Product[];

  const noRetur = `RTB-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`;

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus > 0', variant: 'destructive' });
    setItems([...items, { productId: product.id, nama: product.name, qty: qtyNum, harga: product.buyPrice, satuan: product.unit, subtotal: product.buyPrice * qtyNum }]);
    setSelectedProduct(''); setQty('1');
    toast({ title: `${product.name} ditambahkan ke retur` });
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSave = () => {
    if (items.length === 0) return toast({ title: 'Belum ada barang retur', variant: 'destructive' });
    if (!alasan) return toast({ title: 'Pilih alasan retur', variant: 'destructive' });
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    setConfirmOpen(false);
    setLastRetur(noRetur);
    setSaved(true);
    toast({ title: 'Retur pembelian berhasil', description: noRetur });
  };

  if (saved) {
    return (
      <MainLayout title="Retur Pembelian" subtitle="Retur berhasil diproses">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Retur Berhasil Diproses</h2>
            <p className="text-muted-foreground mt-1">No. Retur: <span className="font-mono font-semibold text-primary">{lastRetur}</span></p>
            <p className="text-3xl font-bold text-destructive mt-3">{formatRupiah(totalNilai)}</p>
            <p className="text-sm text-muted-foreground">Nilai retur dikurangi dari utang</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.print()}><FileDown className="mr-2 h-4 w-4" />Export PDF</Button>
            <Button onClick={() => { setItems([]); setSaved(false); setSelectedSupplier(''); setAlasan(''); setCatatan(''); }}>Retur Baru</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Retur Pembelian" subtitle="Buat surat retur barang ke supplier">
      <Alert className="mb-4 border-destructive/30 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-sm text-destructive">
          Retur pembelian akan mengurangi stok barang dan menyesuaikan nilai utang ke supplier.
        </AlertDescription>
      </Alert>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4" />Form Retur Pembelian</CardTitle>
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
                  <Label className="text-xs">Supplier</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Alasan Retur</Label>
                  <Select value={alasan} onValueChange={setAlasan}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rusak">Barang Rusak</SelectItem>
                      <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
                      <SelectItem value="tidak_sesuai">Tidak Sesuai Pesanan</SelectItem>
                      <SelectItem value="cacat">Cacat Produksi</SelectItem>
                      <SelectItem value="kelebihan">Kelebihan Pengiriman</SelectItem>
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
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty Retur" className="text-xs h-8" min="1" />
                  <Button onClick={addItem} size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Tambah</Button>
                </div>
              </div>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left w-8">No</th>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Harga</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">Belum ada barang retur</td></tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className="border-b text-sm">
                          <td className="px-3 py-2 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">{item.nama}<p className="text-xs text-muted-foreground">{item.satuan}</p></td>
                          <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.harga)}</td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums text-destructive">{formatRupiah(item.subtotal)}</td>
                          <td className="px-3 py-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </td>
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
            <CardHeader className="pb-3"><CardTitle className="text-base">Ringkasan Retur</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Item</span><span>{items.length} produk</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Qty</span><span className="tabular-nums">{items.reduce((s,i) => s+i.qty,0)} pcs</span></div>
              <div className="rounded-lg border bg-destructive/10 p-3">
                <p className="text-xs text-muted-foreground">Total Nilai Retur</p>
                <p className="text-xl font-bold text-destructive tabular-nums">{formatRupiah(totalNilai)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan retur..." className="text-xs h-8" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setItems([]); setAlasan(''); }}>Reset</Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleSave} disabled={items.length === 0}>Simpan</Button>
              </div>
              <Button variant="outline" className="w-full h-8 text-xs" onClick={() => window.print()}><FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Retur Pembelian</AlertDialogTitle>
            <AlertDialogDescription>
              Retur sebesar <strong>{formatRupiah(totalNilai)}</strong> akan mengurangi stok dan utang ke supplier. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Ya, Proses Retur</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default ReturPembelian;
