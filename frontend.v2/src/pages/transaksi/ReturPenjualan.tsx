import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, RotateCcw, FileDown, CheckCircle2, AlertTriangle, Loader2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/api/useCustomers';
import { useProducts } from '@/hooks/api/useProducts';
import { useCreateReturnSale, printReturnSale } from '@/hooks/api/useReturns';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import type { Customer, Product } from '@/types';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const METODE_LABEL: Record<string, string> = {
  tunai: 'Pengembalian Tunai',
  potong_piutang: 'Potong Piutang',
  tukar_barang: 'Tukar Barang',
  kredit_nota: 'Kredit Nota',
};

interface ReturItem {
  productId: string;
  nama: string;
  qty: number;
  harga: number;
  satuan: string;
  subtotal: number;
}

const ReturPenjualan = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ReturItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [alasan, setAlasan] = useState('');
  const [metodeKembalian, setMetodeKembalian] = useState('');
  const [catatan, setCatatan] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastRetur, setLastRetur] = useState('');
  const [returDate, setReturDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: customersData, isLoading: customersLoading } = useCustomers({ per_page: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ per_page: 200 });
  const createMutation = useCreateReturnSale();

  const customers = (customersData?.data?.data ?? []) as Customer[];
  const products = (productsData?.data?.data ?? []) as Product[];
  const isDataLoading = customersLoading || productsLoading;

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus > 0', variant: 'destructive' });

    // Check if product already in items
    const existingIdx = items.findIndex(i => i.productId === product.id);
    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].qty += qtyNum;
      updated[existingIdx].subtotal = updated[existingIdx].qty * updated[existingIdx].harga;
      setItems(updated);
    } else {
      setItems([...items, {
        productId: product.id,
        nama: product.name,
        qty: qtyNum,
        harga: product.sellPrice,
        satuan: product.unit,
        subtotal: product.sellPrice * qtyNum,
      }]);
    }

    setSelectedProduct('');
    setQty('1');
    toast({ title: `${product.name} ditambahkan` });
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);

  const handleSave = () => {
    if (!selectedCustomer) return toast({ title: 'Pilih customer', variant: 'destructive' });
    if (items.length === 0) return toast({ title: 'Belum ada barang retur', variant: 'destructive' });
    if (!alasan) return toast({ title: 'Pilih alasan retur', variant: 'destructive' });
    if (!metodeKembalian) return toast({ title: 'Pilih metode pengembalian', variant: 'destructive' });
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    setConfirmOpen(false);

    try {
      const payload = {
        customer_id: selectedCustomer,
        date: returDate,
        reason: alasan,
        refund_method: metodeKembalian,
        notes: catatan || undefined,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.nama,
          quantity: item.qty,
          price: item.harga,
        })),
      };

      const response = await createMutation.mutateAsync(payload);
      const returnNumber = response.data?.data?.return_number || response.data?.return_number || 'RTJ-XXXXX';

      setLastRetur(returnNumber);
      setSaved(true);
      toast({ title: 'Retur penjualan berhasil', description: returnNumber });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal menyimpan retur penjualan';
      toast({ title: 'Gagal', description: message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setItems([]);
    setSaved(false);
    setSelectedCustomer('');
    setAlasan('');
    setMetodeKembalian('');
    setCatatan('');
    setReturDate(new Date().toISOString().split('T')[0]);
  };

  if (saved) {
    const handlePrint = async () => {
      try {
        if (lastRetur) {
          await printReturnSale(lastRetur);
          toast({ title: 'PDF berhasil dibuka', description: 'Dokumen dibuka di tab baru' });
        }
      } catch (error) {
        toast({ title: 'Gagal mencetak', description: 'Terjadi kesalahan saat mencetak dokumen', variant: 'destructive' });
      }
    };

    return (
      <MainLayout title="Retur Penjualan" subtitle="Retur berhasil diproses">
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
            <CheckCircle2 className="h-10 w-10 text-warning" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Retur Penjualan Diproses</h2>
            <p className="text-muted-foreground mt-1">
              No. Retur: <span className="font-mono font-semibold text-primary">{lastRetur}</span>
            </p>
            <p className="text-3xl font-bold text-warning mt-3">{formatRupiah(totalNilai)}</p>
            <p className="text-sm text-muted-foreground">
              Nilai retur - metode: {METODE_LABEL[metodeKembalian] || metodeKembalian}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={resetForm}>Retur Baru</Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-1.5" />Cetak PDF
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show skeleton loaders while data is loading
  if (isDataLoading) {
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
                <CardTitle className="flex items-center gap-2 text-base">
                  <RotateCcw className="h-4 w-4" />
                  Form Retur Penjualan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9 md:col-span-2" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-9" />
                </div>
                <div className="rounded-lg border bg-muted/30 p-3.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Pilih Barang Retur
                  </p>
                  <div className="grid gap-2 md:grid-cols-4">
                    <Skeleton className="h-8 md:col-span-2" />
                    <Skeleton className="h-8" />
                    <Skeleton className="h-8" />
                  </div>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <div className="space-y-2 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4 py-2 border-b">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ringkasan Retur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-8 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
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
              <CardTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="h-4 w-4" />
                Form Retur Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input
                    type="date"
                    value={returDate}
                    onChange={e => setReturDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Customer *</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Pilih customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Alasan Retur *</Label>
                  <Select value={alasan} onValueChange={setAlasan}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Pilih alasan" />
                    </SelectTrigger>
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

              {/* Product selection */}
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Pilih Barang Retur
                </p>
                <div className="grid gap-2 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    placeholder="Qty"
                    className="text-xs h-8"
                    min="1"
                  />
                  <Button onClick={addItem} size="sm" className="h-8 text-xs">
                    <Plus className="mr-1 h-3.5 w-3.5" />Tambah
                  </Button>
                </div>
              </div>

              {/* Items table */}
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
                      <tr>
                        <td colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          Belum ada barang retur
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className="border-b text-sm">
                          <td className="px-3 py-2 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">
                            {item.nama}
                            <p className="text-xs text-muted-foreground">{item.satuan}</p>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.harga)}</td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums text-warning">
                            {formatRupiah(item.subtotal)}
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => removeItem(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

        {/* Summary sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan Retur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Item</span>
                <span>{items.length} produk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Qty</span>
                <span className="tabular-nums">{items.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <div className="rounded-lg border bg-warning/10 p-3">
                <p className="text-xs text-muted-foreground">Total Nilai Retur</p>
                <p className="text-xl font-bold text-warning tabular-nums">{formatRupiah(totalNilai)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pengembalian *</Label>
                <Select value={metodeKembalian} onValueChange={setMetodeKembalian}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
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
                <Input
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Catatan retur..."
                  className="text-xs h-8"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={() => { setItems([]); setAlasan(''); setMetodeKembalian(''); }}
                >
                  Reset
                </Button>
                <Button
                  className="flex-1 h-9 text-sm"
                  onClick={handleSave}
                  disabled={items.length === 0 || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Retur Penjualan</AlertDialogTitle>
            <AlertDialogDescription>
              Retur senilai <strong>{formatRupiah(totalNilai)}</strong> akan menambah stok dan mengurangi piutang/kas customer.
              Tindakan ini tidak dapat dibatalkan.
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

export default ReturPenjualan;
