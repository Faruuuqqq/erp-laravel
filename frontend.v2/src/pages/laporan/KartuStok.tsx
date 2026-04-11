import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer } from '@/components/ui/DataComponents';
import { useProducts } from '@/hooks/api/useProducts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, ArrowUp, ArrowDown } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import PrintLayout from '@/components/print/PrintLayout';
import { KartuStokPrint } from '@/components/print/KartuStokPrint';

const KartuStok = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: productsData } = useProducts({ per_page: 999 });
  const products = productsData?.data ?? [];

  const product = products.find(p => p.id === selectedProduct);

  const { data: mutationsData, isLoading } = useQuery({
    queryKey: ['stock-mutations', selectedProduct, fromDate, toDate],
    queryFn: () => api.get<{ data: { product: any, mutations: Array<{ id: string; productId: string; type: string; quantity: number; stockAfter: number; reference: string; notes: string; createdAt: string }> } }>(
      '/info/kartu-stok',
      { product_id: selectedProduct, from: fromDate || undefined, to: toDate || undefined } as Record<string, unknown>
    ),
    enabled: !!selectedProduct,
  });

  const mutations = mutationsData?.data?.mutations ?? [];
  const totalMasuk = mutations.filter(m => m.type === 'IN' || m.type === 'in').reduce((s, m) => s + m.quantity, 0);
  const totalKeluar = mutations.filter(m => m.type === 'OUT' || m.type === 'out').reduce((s, m) => s + m.quantity, 0);

  const printEntries = mutations.map(m => ({
    tanggal: m.createdAt,
    keterangan: m.notes ?? m.type,
    referensi: m.reference,
    masuk: (m.type === 'IN' || m.type === 'in') ? m.quantity : 0,
    keluar: (m.type === 'OUT' || m.type === 'out') ? m.quantity : 0,
    saldo: m.stockAfter,
  }));

  return (
    <MainLayout title="Kartu Stok" subtitle="Histori pergerakan stok per produk">
      <PageHeader
        title="Kartu Stok"
        description="Audit trail lengkap pergerakan stok per produk"
        actions={
          <PrintLayout buttonLabel="Cetak Kartu Stok" buttonSize="sm" buttonVariant="outline" hideButton={!selectedProduct}>
            <KartuStokPrint
              productName={product?.name ?? ''}
              productCode={product?.code ?? ''}
              satuan={product?.unit}
              periodFrom={fromDate}
              periodTo={toDate}
              entries={printEntries}
              hargaBeli={product ? Number(product.buyPrice) : undefined}
            />
          </PrintLayout>
        }
      />

      {/* Product Selector */}
      <div className="mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
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
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Dari</label>
          <Input type="date" className="h-9" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Sampai</label>
          <Input type="date" className="h-9" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
      </div>

      {/* Product Info Card */}
      {product && (
        <div className="mb-5 rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {product.code} &middot; {product.categoryName}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-muted-foreground">
                Harga Beli: <span className="font-medium text-foreground">{formatCurrency(Number(product.buyPrice))}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                Harga Jual: <span className="font-medium text-foreground">{formatCurrency(Number(product.sellPrice))}</span>
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-3xl font-bold tabular-nums ${Number(product.stock) <= Number(product.minimumStock ?? 0) ? 'text-destructive' : 'text-primary'}`}>
              {product.stock}
            </p>
            <p className="text-xs text-muted-foreground">{product.unit} tersisa</p>
            {Number(product.stock) <= Number(product.minimumStock ?? 0) && (
              <Badge variant="destructive" className="mt-1 text-xs">Stok Rendah</Badge>
            )}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Masuk" value={`${totalMasuk} ${product?.unit ?? ''}`} icon={<ArrowUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Keluar" value={`${totalKeluar} ${product?.unit ?? ''}`} icon={<ArrowDown className="h-5 w-5" />} color="destructive" />
        <StatCard title="Saldo Akhir" value={`${product?.stock ?? 0} ${product?.unit ?? ''}`} icon={<Package className="h-5 w-5" />} color="primary" />
      </div>

      {/* Movement Table */}
      <DataTableContainer>
        {!selectedProduct ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Pilih produk untuk melihat kartu stok.</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Memuat data...</div>
        ) : mutations.length === 0 ? (
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
                {mutations.map((m, i) => (
                  <tr key={m.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(m.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3">{m.notes ?? m.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{m.reference}</td>
                    <td className="px-4 py-3">
                      {(m.type === 'IN' || m.type === 'in') && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-2 py-0.5 text-xs font-semibold text-success">
                          <ArrowUp className="h-3 w-3" />+{m.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(m.type === 'OUT' || m.type === 'out') && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-xs font-semibold text-destructive">
                          <ArrowDown className="h-3 w-3" />-{m.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-base">{m.stockAfter}</td>
                  </tr>
                ))}
                <tr className="bg-muted/40 border-t-2">
                  <td colSpan={4} className="px-4 py-3 font-bold text-sm">RINGKASAN</td>
                  <td className="px-4 py-3"><span className="text-success font-bold">+{totalMasuk}</span></td>
                  <td className="px-4 py-3"><span className="text-destructive font-bold">-{totalKeluar}</span></td>
                  <td className="px-4 py-3 font-bold text-base text-primary">{product?.stock}</td>
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


