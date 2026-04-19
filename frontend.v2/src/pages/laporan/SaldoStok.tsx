import { useState, useCallback, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, Search, Download, Printer, TrendingUp } from 'lucide-react';
import { useStockReport, printStockReport } from '@/hooks/api/useReports';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { usePrint } from '@/contexts/usePrint';
import { SaldoStokPrint } from '@/components/print/SaldoStokPrint';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/export';

interface StockItem {
  id: string;
  code: string;
  name: string;
  category?: string;
  warehouseName?: string;
  stock: number;
  unit?: string;
  buyPrice?: number;
  sellPrice?: number;
  stockValue?: number;
}

const SaldoStok = () => {
  const [search, setSearch] = useState('');
  const [katFilter, setKatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 25;
  const { toast } = useToast();
  const { canPrint } = usePermissions();
  const { user } = useAuth();
  const { printDocument } = usePrint();

  // Debounce search with 400ms delay
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useStockReport();
  const items = useMemo(() => (data?.data?.items as StockItem[]) ?? [], [data?.data?.items]);
  const totalValue = data?.data?.totalValue ?? 0;

  const categories = useMemo(() => Array.from(new Set((items as StockItem[]).map(p => p.category).filter(Boolean))), [items]);

  const totalNilai = totalValue;
  const totalUnit = useMemo(() => (items as StockItem[]).reduce((s, p) => s + (p.stock || 0), 0), [items]);
  const lowStockItems = useMemo(() => (items as StockItem[]).filter(p => p.stock <= 0), [items]);
  const totalNilaiJual = useMemo(() => (items as StockItem[]).reduce((s, p) => s + (p.stock || 0) * (p.sellPrice || 0), 0), [items]);

  // Apply filters with advanced options
  const filtered = useMemo(() => {
    const result = (items as StockItem[]).filter(p => {
      const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchKat = katFilter === 'all' || p.category === katFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'rendah' && p.stock <= 0) ||
        (statusFilter === 'aman' && p.stock > 0);

      // Advanced stock range filter
      const minStockVal = minStock ? parseInt(minStock) : 0;
      const maxStockVal = maxStock ? parseInt(maxStock) : Infinity;
      const matchStockRange = p.stock >= minStockVal && p.stock <= maxStockVal;

      // Advanced value range filter
      const minValueVal = minValue ? parseInt(minValue) : 0;
      const maxValueVal = maxValue ? parseInt(maxValue) : Infinity;
      const matchValueRange = (p.stockValue || 0) >= minValueVal && (p.stockValue || 0) <= maxValueVal;

      return matchSearch && matchKat && matchStatus && matchStockRange && matchValueRange;
    });
    return result;
  }, [items, debouncedSearch, katFilter, statusFilter, minStock, maxStock, minValue, maxValue]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedItems = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  const handleFilterChange = useCallback(() => {
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setKatFilter('all');
    setStatusFilter('all');
    setMinStock('');
    setMaxStock('');
    setMinValue('');
    setMaxValue('');
    setPage(1);
  }, []);

  const handlePrint = useCallback(() => {
    printDocument(
      <SaldoStokPrint
        printedBy={user?.name}
        filterKategori={katFilter !== 'all' ? katFilter : undefined}
        items={paginatedItems.map(p => ({
          kode: p.code ?? '',
          nama: p.name ?? '',
          kategori: p.category ?? '',
          gudang: p.warehouseName ?? '',
          saldo: p.stock ?? 0,
          satuan: p.unit ?? 'pcs',
          hargaBeli: p.buyPrice ?? 0,
          nilaiPersediaan: p.stockValue ?? 0,
        }))}
      />
    );
  }, [printDocument, user?.name, katFilter, paginatedItems]);

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

  const handleExportXLSX = useCallback(() => {
    try {
      exportToExcel(
        filtered.map(p => ({
          'Kode Produk': p.code,
          'Nama Produk': p.name,
          'Kategori': p.category || '-',
          'Stok': p.stock,
          'Satuan': p.unit || 'pcs',
          'Harga Beli': p.buyPrice || 0,
          'Harga Jual': p.sellPrice || 0,
          'Nilai Persediaan': p.stockValue || 0,
        })),
        `saldo-stok-${new Date().toISOString().slice(0, 10)}`,
        { sheetName: 'Saldo Stok' }
      );
      toast({ title: 'Sukses', description: 'Data saldo stok berhasil diekspor ke Excel' });
    } catch (err: unknown) {
      toast({ title: 'Error', description: 'Gagal mengekspor data', variant: 'destructive' });
    }
  }, [filtered, toast]);

  return (
    <MainLayout title="Saldo Stok" subtitle="Total stok dan nilai persediaan (Owner only)">
      <PageHeader
        title="Saldo Stok"
        description="Nilai persediaan berdasarkan harga beli — akses terbatas Owner"
        actions={
          <>
            {canPrint('__owner_only__') && (
              <>
                <Button variant="outline" size="sm" onClick={handlePrint} disabled={isPrinting}>
                  <Printer className="h-4 w-4 mr-1.5" />Cetak
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isPrinting}>
                  <Download className="h-4 w-4 mr-1.5" />{isPrinting ? 'Generating...' : 'Export PDF'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportXLSX} disabled={isPrinting}>
                  <Download className="h-4 w-4 mr-1.5" />Export XLSX
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <StatCard title="Nilai Persediaan (Beli)" value={totalNilai} icon={<Package className="h-5 w-5" />} color="primary" />
        <StatCard title="Nilai Potensi Jual" value={totalNilaiJual} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Unit Stok" value={`${totalUnit.toLocaleString('id-ID')} Unit`} icon={<Package className="h-5 w-5" />} color="info" />
        <StatCard title="Stok Rendah" value={`${lowStockItems.length} Produk`} icon={<AlertTriangle className="h-5 w-5" />} color={lowStockItems.length > 0 ? 'warning' : 'success'} />
      </div>

      <div className="mb-4 space-y-3">
        {/* Primary Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              className="pl-9 h-9"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
            />
          </div>
          <Select value={katFilter} onValueChange={(value) => {
            setKatFilter(value);
            handleFilterChange();
          }}>
            <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            handleFilterChange();
          }}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="rendah">Stok Rendah</SelectItem>
              <SelectItem value="aman">Aman</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground shrink-0">{filtered.length} produk</span>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex gap-2 items-end flex-1">
            <div className="flex-1 max-w-32">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Stok</label>
              <Input
                type="number"
                placeholder="0"
                className="h-8 text-sm"
                value={minStock}
                onChange={e => {
                  setMinStock(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>
            <div className="flex-1 max-w-32">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Stok</label>
              <Input
                type="number"
                placeholder="999"
                className="h-8 text-sm"
                value={maxStock}
                onChange={e => {
                  setMaxStock(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>
            <div className="flex-1 max-w-32">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Nilai</label>
              <Input
                type="number"
                placeholder="0"
                className="h-8 text-sm"
                value={minValue}
                onChange={e => {
                  setMinValue(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>
            <div className="flex-1 max-w-32">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Nilai</label>
              <Input
                type="number"
                placeholder="999999"
                className="h-8 text-sm"
                value={maxValue}
                onChange={e => {
                  setMaxValue(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs"
          >
            Reset Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : (
        <DataTableContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  {['Kode', 'Nama Produk', 'Kategori', 'Stok / Min', 'Level', 'Harga Beli', 'Harga Jual', 'Nilai Persediaan', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data yang sesuai.</td></tr>
                ) : (
                  <>
                    {paginatedItems.map((p: StockItem) => {
                      const pct = Math.min(100, Math.round(((p.stock || 0) / (10 * 3)) * 100));
                      const isLow = (p.stock || 0) <= 0;
                      return (
                        <tr key={p.id} className={`border-b transition-colors hover:bg-muted/20 ${isLow ? 'bg-warning/5' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs text-primary">{p.code}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{p.name}</div>
                          </td>
                          <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{p.category || '-'}</Badge></td>
                          <td className="px-4 py-3">
                            <span className={`font-bold tabular-nums ${isLow ? 'text-destructive' : ''}`}>{p.stock}</span>
                            <span className="text-muted-foreground"> {p.unit}</span>
                          </td>
                          <td className="px-4 py-3 min-w-24">
                            <Progress value={pct} className={`h-1.5 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                            <span className="text-[10px] text-muted-foreground">{pct}%</span>
                          </td>
                          <td className="px-4 py-3"><CurrencyCell value={p.buyPrice || 0} /></td>
                          <td className="px-4 py-3"><CurrencyCell value={p.sellPrice || 0} /></td>
                          <td className="px-4 py-3 font-semibold"><CurrencyCell value={p.stockValue || 0} /></td>
                          <td className="px-4 py-3">
                            {isLow
                              ? <Badge variant="destructive" className="text-xs">Stok Rendah</Badge>
                              : <Badge variant="outline" className="text-success border-success text-xs">Aman</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-muted/40 font-bold border-t-2">
                      <td colSpan={7} className="px-4 py-3 text-sm">TOTAL NILAI PERSEDIAAN</td>
                      <td className="px-4 py-3"><CurrencyCell value={filtered.reduce((s, p) => s + (p.stockValue || 0), 0)} /></td>
                      <td />
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Halaman {page} dari {totalPages} • Total {filtered.length} data
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </DataTableContainer>
      )}
    </MainLayout>
  );
};
export default SaldoStok;
