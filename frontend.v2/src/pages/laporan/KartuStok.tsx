import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { PRODUCTS, STOCK_MOVEMENTS, formatRupiah } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowUp, ArrowDown, Download, Printer } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

const KartuStok = () => {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const product = PRODUCTS.find(p => p.id === selectedProduct)!;
  const movements = STOCK_MOVEMENTS.filter(m => m.productId === selectedProduct);
  const totalMasuk = movements.filter(m => m.tipe === 'masuk').reduce((s, m) => s + m.qty, 0);
  const totalKeluar = movements.filter(m => m.tipe === 'keluar').reduce((s, m) => s + m.qty, 0);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const content = `
KARTU STOK - TOKOSYNC ERP
Produk  : ${product.nama} (${product.kode})
Gudang  : ${product.gudangNama}
Dicetak : ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
${'='.repeat(70)}

Stok Saat Ini : ${product.stok} ${product.satuan}
Total Masuk   : ${totalMasuk} ${product.satuan}
Total Keluar  : ${totalKeluar} ${product.satuan}

${'='.repeat(70)}
${['Tanggal', 'Keterangan', 'Referensi', 'Masuk', 'Keluar', 'Saldo'].join('\t')}
${'-'.repeat(70)}
${movements.map(m =>
      [m.tanggal, m.keterangan, m.referensi,
        m.tipe === 'masuk' ? `+${m.qty}` : '',
        m.tipe === 'keluar' ? `-${m.qty}` : '',
        m.saldo].join('\t')
    ).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kartu-stok-${product.kode}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Kartu Stok" subtitle="Histori pergerakan stok per produk">
      <PageHeader
        title="Kartu Stok"
        description="Audit trail lengkap pergerakan stok per produk"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" />Cetak
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1.5" />Export PDF
            </Button>
          </>
        }
      />

      {/* Product Selector */}
      <div className="mb-5">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Pilih Produk</label>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Pilih produk" />
          </SelectTrigger>
          <SelectContent>
            {PRODUCTS.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <span className="font-mono text-xs text-muted-foreground mr-2">{p.kode}</span>
                {p.nama}
                {p.stok <= p.stokMinimum && <span className="ml-2 text-destructive text-xs">(Stok Rendah)</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Info Card */}
      {product && (
        <div className="mb-5 rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{product.nama}</p>
            <p className="text-sm text-muted-foreground">
              {product.kode} &middot; {product.kategoriNama} &middot; {product.gudangNama}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-muted-foreground">
                Harga Beli: <span className="font-medium text-foreground">{formatRupiah(product.hargaBeli)}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                Harga Jual: <span className="font-medium text-foreground">{formatRupiah(product.hargaJual)}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                Min Stok: <span className="font-medium text-foreground">{product.stokMinimum} {product.satuan}</span>
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-3xl font-bold tabular-nums ${product.stok <= product.stokMinimum ? 'text-destructive' : 'text-primary'}`}>
              {product.stok}
            </p>
            <p className="text-xs text-muted-foreground">{product.satuan} tersisa</p>
            {product.stok <= product.stokMinimum && (
              <Badge variant="destructive" className="mt-1 text-xs">Stok Rendah</Badge>
            )}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Masuk" value={`${totalMasuk} ${product?.satuan}`} icon={<ArrowUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Keluar" value={`${totalKeluar} ${product?.satuan}`} icon={<ArrowDown className="h-5 w-5" />} color="destructive" />
        <StatCard title="Saldo Akhir" value={`${product?.stok || 0} ${product?.satuan}`} icon={<Package className="h-5 w-5" />} color="primary" />
      </div>

      {/* Movement Table */}
      <DataTableContainer>
        {movements.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Belum ada data pergerakan stok untuk produk ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  {['#', 'Tanggal', 'Keterangan', 'No. Referensi', 'Masuk', 'Keluar', 'Saldo'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((m, i) => (
                  <tr key={m.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{m.tanggal}</td>
                    <td className="px-4 py-3">{m.keterangan}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{m.referensi}</td>
                    <td className="px-4 py-3">
                      {m.tipe === 'masuk' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-2 py-0.5 text-xs font-semibold text-success">
                          <ArrowUp className="h-3 w-3" />+{m.qty}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {m.tipe === 'keluar' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-xs font-semibold text-destructive">
                          <ArrowDown className="h-3 w-3" />-{m.qty}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-base">{m.saldo}</td>
                  </tr>
                ))}
                <tr className="bg-muted/40 border-t-2">
                  <td colSpan={4} className="px-4 py-3 font-bold text-sm">RINGKASAN</td>
                  <td className="px-4 py-3">
                    <span className="text-success font-bold">+{totalMasuk}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-destructive font-bold">-{totalKeluar}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-base text-primary">{product?.stok}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </DataTableContainer>
    </MainLayout>
  );
};
export default KartuStok;
