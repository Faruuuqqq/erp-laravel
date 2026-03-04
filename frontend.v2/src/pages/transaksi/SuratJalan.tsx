import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, FileText, Printer, Truck, FileDown, Eye } from 'lucide-react';
import { PRODUCTS, CUSTOMERS, SALES_REPS, WAREHOUSES, formatRupiah } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface SJItem {
  productId: string;
  nama: string;
  qty: number;
  satuan: string;
  keterangan: string;
}

const SuratJalan = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<SJItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('1');
  const [keterangan, setKeterangan] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSales, setSelectedSales] = useState('');
  const [selectedGudang, setSelectedGudang] = useState('');
  const [alamatKirim, setAlamatKirim] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [catatan, setCatatan] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const noSJ = `SJ-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`;
  const customer = CUSTOMERS.find(c => c.id === selectedCustomer);
  const gudang = WAREHOUSES.find(g => g.id === selectedGudang);
  const sales = SALES_REPS.find(s => s.id === selectedSales);
  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const addItem = () => {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk terlebih dahulu', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus lebih dari 0', variant: 'destructive' });
    setItems([...items, { productId: product.id, nama: product.nama, qty: qtyNum, satuan: product.satuan, keterangan }]);
    setSelectedProduct(''); setQty('1'); setKeterangan('');
    toast({ title: `${product.nama} ditambahkan` });
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const handlePrint = () => {
    setPreviewOpen(false);
    setTimeout(() => window.print(), 200);
    toast({ title: 'Mencetak Surat Jalan...' });
  };

  const handleExportPdf = () => {
    toast({ title: 'Mengekspor ke PDF...', description: `${noSJ}.pdf` });
  };

  return (
    <MainLayout title="Surat Jalan" subtitle="Buat surat jalan untuk pengiriman barang">
      <Alert className="mb-4 border-primary/30 bg-primary/5">
        <FileText className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-primary">
          Surat jalan tidak mencantumkan harga. Hanya digunakan sebagai bukti serah terima barang kepada penerima.
        </AlertDescription>
      </Alert>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                Form Surat Jalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">No. Surat Jalan</Label>
                  <Input value={noSJ} disabled className="text-xs font-mono bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer / Penerima</Label>
                  <Select value={selectedCustomer} onValueChange={(v) => {
                    setSelectedCustomer(v);
                    const c = CUSTOMERS.find(c => c.id === v);
                    if (c) setAlamatKirim(c.alamat);
                  }}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>
                      {CUSTOMERS.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Alamat Pengiriman</Label>
                  <Input value={alamatKirim} onChange={e => setAlamatKirim(e.target.value)} placeholder="Alamat tujuan pengiriman" className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Gudang Pengirim</Label>
                  <Select value={selectedGudang} onValueChange={setSelectedGudang}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih gudang" /></SelectTrigger>
                    <SelectContent>
                      {WAREHOUSES.filter(g => g.status === 'aktif').map(g => <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Pengirim / Driver</Label>
                  <Input value={pengirim} onChange={e => setPengirim(e.target.value)} placeholder="Nama pengirim & kendaraan" className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sales</Label>
                  <Select value={selectedSales} onValueChange={setSelectedSales}>
                    <SelectTrigger className="text-xs"><SelectValue placeholder="Pilih sales" /></SelectTrigger>
                    <SelectContent>
                      {SALES_REPS.filter(s => s.status === 'aktif').map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tambah Barang</p>
                <div className="grid gap-2 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                      <SelectContent>
                        {PRODUCTS.map(p => <SelectItem key={p.id} value={p.id}>{p.nama} (Stok: {p.stok})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" className="text-xs h-8" min="1" />
                  <Input value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Keterangan" className="text-xs h-8" />
                  <Button onClick={addItem} size="sm" className="h-8 text-xs"><Plus className="mr-1 h-3.5 w-3.5" />Tambah</Button>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-8">No</TableHead>
                      <TableHead className="text-xs">Nama Barang</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs">Satuan</TableHead>
                      <TableHead className="text-xs">Keterangan</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Belum ada barang ditambahkan</TableCell></TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={idx} className="text-sm">
                          <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.nama}</TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">{item.qty}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.satuan}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.keterangan || '-'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jenis Barang</span>
                <span className="font-medium">{items.length} produk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Qty</span>
                <span className="font-medium tabular-nums">{totalQty} pcs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Penerima</span>
                <span className="font-medium truncate max-w-[120px]">{customer?.nama || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gudang</span>
                <span className="font-medium truncate max-w-[120px]">{gudang?.nama || '-'}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs">Catatan</Label>
                <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan pengiriman..." className="text-xs h-8" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { setItems([]); setSelectedCustomer(''); setSelectedGudang(''); setAlamatKirim(''); setPengirim(''); }}>Reset</Button>
                <Button className="flex-1 h-9 text-sm" onClick={() => {
                  if (items.length === 0) return toast({ title: 'Belum ada barang', variant: 'destructive' });
                  if (!selectedCustomer) return toast({ title: 'Pilih customer', variant: 'destructive' });
                  toast({ title: 'Surat Jalan disimpan', description: noSJ });
                }}>Simpan</Button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="h-9 text-sm" onClick={() => setPreviewOpen(true)}>
                  <Eye className="mr-1.5 h-3.5 w-3.5" />Preview & Cetak
                </Button>
                <Button variant="outline" className="h-8 text-xs" onClick={handleExportPdf}>
                  <FileDown className="mr-1.5 h-3.5 w-3.5" />Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Surat Jalan</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-6 bg-white text-black print:shadow-none" id="surat-jalan-print">
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h1 className="text-2xl font-bold">SURAT JALAN</h1>
              <p className="text-sm">TokoSync ERP - Sistem Manajemen Toko</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p><strong>No. Surat Jalan:</strong> {noSJ}</p>
                <p><strong>Tanggal:</strong> {today}</p>
                <p><strong>Sales:</strong> {sales?.nama || '-'}</p>
              </div>
              <div>
                <p><strong>Kepada:</strong> {customer?.nama || '-'}</p>
                <p><strong>Alamat:</strong> {alamatKirim || customer?.alamat || '-'}</p>
                <p><strong>Gudang:</strong> {gudang?.nama || '-'}</p>
              </div>
            </div>
            {pengirim && <p className="text-sm mb-4"><strong>Pengirim/Driver:</strong> {pengirim}</p>}
            <table className="w-full border-collapse border border-black text-sm mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-2 py-1 text-left">No</th>
                  <th className="border border-black px-2 py-1 text-left">Nama Barang</th>
                  <th className="border border-black px-2 py-1 text-right">Qty</th>
                  <th className="border border-black px-2 py-1 text-left">Satuan</th>
                  <th className="border border-black px-2 py-1 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-2 py-1">{idx + 1}</td>
                    <td className="border border-black px-2 py-1">{item.nama}</td>
                    <td className="border border-black px-2 py-1 text-right">{item.qty}</td>
                    <td className="border border-black px-2 py-1">{item.satuan}</td>
                    <td className="border border-black px-2 py-1">{item.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="border border-black px-2 py-1 font-bold text-right">Total</td>
                  <td className="border border-black px-2 py-1 text-right font-bold">{totalQty}</td>
                  <td colSpan={2} className="border border-black px-2 py-1"></td>
                </tr>
              </tfoot>
            </table>
            {catatan && <p className="text-sm mb-4 italic">Catatan: {catatan}</p>}
            <div className="grid grid-cols-3 gap-4 mt-8 text-sm text-center">
              <div><p className="mb-16">Pengirim</p><p>(_____________)</p><p>{pengirim || '...'}</p></div>
              <div><p className="mb-16">Penerima</p><p>(_____________)</p><p>{customer?.nama || '...'}</p></div>
              <div><p className="mb-16">Diketahui Oleh</p><p>(_____________)</p><p>Admin / Owner</p></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Tutup</Button>
            <Button variant="outline" onClick={handleExportPdf}><FileDown className="mr-1.5 h-4 w-4" />Export PDF</Button>
            <Button onClick={handlePrint}><Printer className="mr-1.5 h-4 w-4" />Cetak</Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SuratJalan;
