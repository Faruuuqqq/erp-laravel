import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer } from '@/components/ui/DataComponents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowUp, ArrowDown, Download, Printer } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useKartuStok } from '@/hooks/api/useInfo';
import { useProducts } from '@/hooks/api/useProducts';
import type { Product } from '@/types';

const KartuStok = () => {
  const [selectedProduct, setSelectedProduct] = useState('');

  const { data: productsData } = useProducts({ per_page: 200 });
  const products = (productsData?.data?.data ?? []) as Product[];
  const { data, isLoading } = useKartuStok(selectedProduct);

  const productData = data?.data?.data?.product;
  const mutations = data?.data?.data?.mutations ?? [];

  const totalMasuk = mutations.filter((m: any) => m.type === 'masuk').reduce((s: number, m: any) => s + (m.quantity || 0), 0);
  const totalKeluar = mutations.filter((m: any) => m.type === 'keluar').reduce((s: number, m: any) => s + (m.quantity || 0), 0);

  const handlePrint = () => window.print();

  const handleExport = () => {
    if (!productData) return;
    const content = `KARTU STOK - TOKOSYNC ERP\nProduk: ${productData.name} (${productData.code})\nTotal Masuk: ${totalMasuk}\nTotal Keluar: ${totalKeluar}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `kartu-stok-${productData.code}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Kartu Stok" subtitle="Histori pergerakan stok per produk">
      <PageHeader
        title="Kartu Stok"
        description="Audit trail lengkap pergerakan stok per produk"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!selectedProduct}>
              <Printer className="h-4 w-4 mr-1.5" />Cetak
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!selectedProduct}>
              <Download className="h-4 w-4 mr-1.5" />Export
            </Button>
          </>
        }
      />

      <div className="mb-5">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Pilih Produk</label>
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Pilih produk" />
          </SelectTrigger>
          <SelectContent>
            {products.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <span className="font-mono text-xs text-muted-foreground mr-2">{p.code}</span>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {productData && (
        <div className="mb-5 rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{productData.name}</p>
            <p className="text-sm text-muted-foreground">{productData.code} &middot; {productData.unit}</p>
          </div>
        </div>
      )}

      {selectedProduct && !isLoading && (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <StatCard title="Total Masuk" value={`${totalMasuk}`} icon={<ArrowUp className="h-5 w-5" />} color="success" />
          <StatCard title="Total Keluar" value={`${totalKeluar}`} icon={<ArrowDown className="h-5 w-5" />} color="destructive" />
          <StatCard title="Total Mutasi" value={`${mutations.length}`} icon={<Package className="h-5 w-5" />} color="primary" />
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : mutations.length === 0 ? (
        <div className="p-12 text-center rounded-xl border">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">{selectedProduct ? 'Belum ada data pergerakan stok untuk produk ini.' : 'Pilih produk untuk melihat kartu stok.'}</p>
        </div>
      ) : (
        <DataTableContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  {['#', 'Tanggal', 'Tipe', 'Keterangan', 'Referensi', 'Qty'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mutations.map((m: any, i: number) => (
                  <tr key={m.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{m.date?.slice(0, 10) || '-'}</td>
                    <td className="px-4 py-3">
                      {m.type === 'masuk' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-2 py-0.5 text-xs font-semibold text-success">
                          <ArrowUp className="h-3 w-3" />Masuk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-xs font-semibold text-destructive">
                          <ArrowDown className="h-3 w-3" />Keluar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{m.description || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{m.reference || '-'}</td>
                    <td className="px-4 py-3 font-bold tabular-nums">
                      {m.type === 'masuk' ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40 border-t-2">
                  <td colSpan={5} className="px-4 py-3 font-bold text-sm">RINGKASAN</td>
                  <td className="px-4 py-3">
                    <span className="text-success font-bold">+{totalMasuk}</span> / <span className="text-destructive font-bold">-{totalKeluar}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DataTableContainer>
      )}
    </MainLayout>
  );
};
export default KartuStok;
