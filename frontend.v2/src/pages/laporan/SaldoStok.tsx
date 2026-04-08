import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, Search, Download, Printer, TrendingUp, AlertCircle } from 'lucide-react';
import { useStockReport, printStockReport } from '@/hooks/api/useReports';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { exportToCSV } from '@/lib/export';

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

// Stock level thresholds
const STOCK_LEVELS = {
  CRITICAL: 10,
  LOW: 50,
};

const getStockLevel = (stock: number) => {
  if (stock < STOCK_LEVELS.CRITICAL) return { level: 'CRITICAL', label: 'Kritis', color: 'text-red-600', bgColor: 'bg-red-50', badgeVariant: 'destructive' };
  if (stock < STOCK_LEVELS.LOW) return { level: 'LOW', label: 'Rendah', color: 'text-yellow-600', bgColor: 'bg-yellow-50', badgeVariant: 'outline' };
  return { level: 'NORMAL', label: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50', badgeVariant: 'default' };
};

const SaldoStok = () => {
  const [search, setSearch] = useState('');
  const [katFilter, setKatFilter] = useState('all');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useStockReport();
  const { data: warehousesData } = useWarehouses();

  const items = data?.data?.data?.items ?? [];
  const totalValue = data?.data?.data?.totalValue ?? 0;
  const warehouses = warehousesData?.data ?? [];

  const categories = Array.from(new Set(items.map((p: any) => p.category).filter(Boolean)));

  const totalNilai = totalValue;
  const totalUnit = items.reduce((s: number, p: any) => s + (p.stock || 0), 0);
  const criticalItems = items.filter((p: any) => p.stock < STOCK_LEVELS.CRITICAL);
  const lowItems = items.filter((p: any) => p.stock >= STOCK_LEVELS.CRITICAL && p.stock < STOCK_LEVELS.LOW);
  const totalNilaiJual = items.reduce((s: number, p: any) => s + (p.stock || 0) * (p.sellPrice || 0), 0);

  const filtered = items.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchKat = katFilter === 'all' || p.category === katFilter;
    const matchStockLevel = stockLevelFilter === 'all' ||
      (stockLevelFilter === 'critical' && p.stock < STOCK_LEVELS.CRITICAL) ||
      (stockLevelFilter === 'low' && p.stock >= STOCK_LEVELS.CRITICAL && p.stock < STOCK_LEVELS.LOW) ||
      (stockLevelFilter === 'normal' && p.stock >= STOCK_LEVELS.LOW);
    const matchWarehouse = warehouseFilter === 'all' || (p.warehouseId === warehouseFilter);
    return matchSearch && matchKat && matchStockLevel && matchWarehouse;
  });

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const url = await printStockReport();
      window.open(url, '_blank');
      toast({ title: 'PDF berhasil dibuat', description: 'Laporan stok telah dibuka di tab baru.' });
    } catch {
      toast({ title: 'Error', description: 'Gagal membuat PDF laporan stok.', variant: 'destructive' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsPrinting(true);
      const url = await printStockReport();
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-stok-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      toast({ title: 'PDF berhasil diunduh', description: 'Laporan stok telah diunduh.' });
    } catch {
      toast({ title: 'Error', description: 'Gagal mengunduh PDF laporan stok.', variant: 'destructive' });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        'Kode Produk', 'Nama Produk', 'Kategori', 'Warehouse', 'Stok', 'Unit',
        'Level Stok', 'Harga Beli', 'Harga Jual', 'Nilai Persediaan (Beli)',
      ];

      const rows = filtered.map((p: any) => {
        const level = getStockLevel(p.stock || 0);
        const warehouse = warehouses.find((w: any) => w.id === p.warehouseId);
        return [
          p.code,
          p.name,
          p.category || '-',
          warehouse?.name || '-',
          p.stock,
          p.unit,
          level.label,
          formatRupiah(p.buyPrice || 0),
          formatRupiah(p.sellPrice || 0),
          formatRupiah(p.stockValue || 0),
        ];
      });

      exportToCSV(headers, rows, `saldo-stok-${new Date().toISOString().slice(0, 10)}.csv`);
      toast({ title: 'Sukses', description: 'File CSV berhasil diunduh.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Gagal mengekspor data CSV.', variant: 'destructive' });
    }
  };

  return (
    <MainLayout title="Saldo Stok" subtitle="Total stok dan nilai persediaan (Owner only)">
      <PageHeader
        title="Saldo Stok"
        description="Nilai persediaan berdasarkan harga beli — akses terbatas Owner"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
              <Printer className="h-4 w-4 mr-1.5" />{isPrinting ? 'Generating...' : 'Cetak'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isPrinting}>
              <Download className="h-4 w-4 mr-1.5" />{isPrinting ? 'Generating...' : 'Export PDF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filtered.length === 0}>
              <Download className="h-4 w-4 mr-1.5" />Export CSV
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-5">
        {isLoading ? (
          <>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-32" /></div>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-32" /></div>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-32" /></div>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-24" /></div>
            <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between mb-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-5 rounded" /></div><Skeleton className="h-7 w-24" /></div>
          </>
        ) : (
          <>
            <StatCard title="Nilai Persediaan (Beli)" value={totalNilai} icon={<Package className="h-5 w-5" />} color="primary" />
            <StatCard title="Nilai Potensi Jual" value={totalNilaiJual} icon={<TrendingUp className="h-5 w-5" />} color="success" />
            <StatCard title="Total Unit Stok" value={`${totalUnit.toLocaleString('id-ID')} Unit`} icon={<Package className="h-5 w-5" />} color="info" />
            <StatCard title="Stok Kritis" value={`${criticalItems.length}`} icon={<AlertTriangle className="h-5 w-5" />} color={criticalItems.length > 0 ? 'destructive' : 'success'} />
            <StatCard title="Stok Rendah" value={`${lowItems.length}`} icon={<AlertCircle className="h-5 w-5" />} color={lowItems.length > 0 ? 'warning' : 'success'} />
          </>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-72 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari produk atau kode..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={katFilter} onValueChange={setKatFilter}>
          <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Warehouse" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Warehouse</SelectItem>
            {warehouses.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockLevelFilter} onValueChange={setStockLevelFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Level Stok" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Level</SelectItem>
            <SelectItem value="critical">Kritis (&lt; 10)</SelectItem>
            <SelectItem value="low">Rendah (10-50)</SelectItem>
            <SelectItem value="normal">Normal (&gt; 50)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0 whitespace-nowrap">{filtered.length} produk</span>
      </div>

      {isLoading ? (
        <DataTableContainer>
          <div className="space-y-2 p-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 px-4 py-3 border-b">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </DataTableContainer>
      ) : (
        <DataTableContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  {['Kode Produk', 'Nama Produk', 'Kategori', 'Warehouse', 'Stok', 'Level', 'Harga Beli', 'Harga Jual', 'Nilai Persediaan', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data yang sesuai.</td></tr>
                ) : (
                  <>
                    {filtered.map((p: any) => {
                      const stockLevel = getStockLevel(p.stock || 0);
                      const warehouse = warehouses.find((w: any) => w.id === p.warehouseId);
                      const pct = Math.min(100, Math.round(((p.stock || 0) / (STOCK_LEVELS.LOW * 3)) * 100));
                      return (
                        <tr key={p.id} className={`border-b transition-colors hover:bg-muted/20 ${stockLevel.bgColor}`}>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{p.code}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{p.name}</div>
                          </td>
                          <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{p.category || '-'}</Badge></td>
                          <td className="px-4 py-3 text-xs">{warehouse?.name || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold tabular-nums ${stockLevel.color}`}>{p.stock}</span>
                            <span className="text-muted-foreground"> {p.unit}</span>
                          </td>
                          <td className="px-4 py-3 min-w-32">
                            <div className="space-y-1">
                              <Progress value={pct} className={`h-2 ${
                                stockLevel.level === 'CRITICAL' ? '[&>div]:bg-red-600' :
                                stockLevel.level === 'LOW' ? '[&>div]:bg-yellow-600' :
                                '[&>div]:bg-green-600'
                              }`} />
                              <Badge variant={stockLevel.badgeVariant as any} className="text-xs w-fit">{stockLevel.label}</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3"><CurrencyCell value={p.buyPrice || 0} /></td>
                          <td className="px-4 py-3"><CurrencyCell value={p.sellPrice || 0} /></td>
                          <td className="px-4 py-3 font-semibold"><CurrencyCell value={p.stockValue || 0} /></td>
                          <td className="px-4 py-3 text-center">
                            {stockLevel.level === 'CRITICAL'
                              ? <Badge variant="destructive" className="text-xs animate-pulse">Kritis!</Badge>
                              : stockLevel.level === 'LOW'
                                ? <Badge variant="outline" className="text-warning border-warning text-xs">Rendah</Badge>
                                : <Badge variant="outline" className="text-success border-success text-xs">Aman</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-muted/40 font-bold border-t-2">
                      <td colSpan={8} className="px-4 py-3 text-sm">TOTAL NILAI PERSEDIAAN</td>
                      <td className="px-4 py-3"><CurrencyCell value={totalNilai} /></td>
                      <td />
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </DataTableContainer>
      )}

      {/* Legend */}
      {!isLoading && filtered.length > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm font-semibold mb-2">Legenda Level Stok:</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs animate-pulse">Kritis</Badge>
              <span className="text-xs text-muted-foreground">Kurang dari {STOCK_LEVELS.CRITICAL} unit</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-warning border-warning text-xs">Rendah</Badge>
              <span className="text-xs text-muted-foreground">{STOCK_LEVELS.CRITICAL}-{STOCK_LEVELS.LOW} unit</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-success border-success text-xs">Aman</Badge>
              <span className="text-xs text-muted-foreground">Lebih dari {STOCK_LEVELS.LOW} unit</span>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
export default SaldoStok;