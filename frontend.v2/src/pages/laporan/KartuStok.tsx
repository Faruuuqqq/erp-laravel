import { Fragment, useState, useMemo, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer } from '@/components/ui/DataComponents';
import { useProducts } from '@/hooks/api/useProducts';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  ArrowUp,
  ArrowDown,
  Printer,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import { usePrint } from '@/contexts/usePrint';
import { KartuStokPrint } from '@/components/print/KartuStokPrint';
import { resolveDirection } from '@/constants/stockDirection';
import { useToast } from '@/components/ui/use-toast';
import { exportToExcel, formatDateRange } from '@/lib/export';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type {
  StockMutationResponse,
  QueryParams,
  Product as ApiProduct,
} from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockMutation {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  stockAfter: number;
  reference: string;
  notes: string;
  createdAt: string;
}

interface ProcessedMutation extends StockMutation {
  _dir: 'IN' | 'OUT';
  _runningBalance: number;
}

interface PrintEntry {
  tanggal: string;
  keterangan: string;
  referensi: string;
  masuk: number;
  keluar: number;
  saldo: number;
}

// ─── Expanded Detail Component ────────────────────────────────────────────────

interface ProductDetailProps {
  product: ApiProduct;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
  const { toast } = useToast();
  const { printDocument } = usePrint();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Validate date range
  const isDateRangeValid = useMemo(() => {
    if (!fromDate || !toDate) return true;
    try {
      return new Date(fromDate) <= new Date(toDate);
    } catch {
      return false;
    }
  }, [fromDate, toDate]);

  // Fetch stock mutations for this product
  const { data: mutationsData, isLoading, isError } = useQuery({
    queryKey: ['stock-mutations', product.id, fromDate, toDate],
    queryFn: async () => {
      const params: QueryParams = {
        product_id: product.id,
        from: fromDate || undefined,
        to: toDate || undefined,
      };

      try {
        const response = await api.get<StockMutationResponse>(
          '/info/kartu-stok',
          params
        );
        return response.data;
      } catch (err: unknown) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };
        const message =
          apiError?.response?.data?.message ??
          'Gagal memuat data kartu stok';
        throw new Error(message);
      }
    },
    enabled: isDateRangeValid,
    retry: 2,
  });

  // Extract data
  const raw = useMemo(
    () => mutationsData?.data?.mutations ?? [],
    [mutationsData?.data?.mutations]
  );
  const openingStock =
    mutationsData?.data?.product?.openingStock ?? 0;

  // Build running balance
  const { mutations, totalMasuk, totalKeluar, saldoAkhirPeriode, printEntries } =
    useMemo(() => {
      let runningBalance = openingStock;
      const processedMutations: ProcessedMutation[] = raw.map(m => {
        const dir = resolveDirection(m.type);
        runningBalance =
          dir === 'IN'
            ? runningBalance + m.quantity
            : runningBalance - m.quantity;
        return { ...m, _dir: dir, _runningBalance: runningBalance };
      });

      const totalIn = processedMutations
        .filter(m => m._dir === 'IN')
        .reduce((s, m) => s + m.quantity, 0);
      const totalOut = processedMutations
        .filter(m => m._dir === 'OUT')
        .reduce((s, m) => s + m.quantity, 0);

      const finalBalance =
        processedMutations.length > 0
          ? processedMutations[processedMutations.length - 1]._runningBalance
          : openingStock;

      const entries: PrintEntry[] = [
        {
          tanggal: fromDate || (raw[0]?.createdAt ?? ''),
          keterangan: 'Saldo Awal',
          referensi: '',
          masuk: 0,
          keluar: 0,
          saldo: openingStock,
        },
        ...processedMutations.map(m => ({
          tanggal: m.createdAt,
          keterangan: m.notes ?? m.type,
          referensi: m.reference,
          masuk: m._dir === 'IN' ? m.quantity : 0,
          keluar: m._dir === 'OUT' ? m.quantity : 0,
          saldo: m._runningBalance,
        })),
      ];

      return {
        mutations: processedMutations,
        totalMasuk: totalIn,
        totalKeluar: totalOut,
        saldoAkhirPeriode: finalBalance,
        printEntries: entries,
      };
    }, [raw, openingStock, fromDate]);

  // Handle print
  const handlePrint = useCallback(async () => {
    try {
      printDocument(
        <KartuStokPrint
          productName={product.name}
          productCode={product.code ?? ''}
          satuan={product.unit}
          periodFrom={fromDate}
          periodTo={toDate}
          entries={printEntries}
          hargaBeli={
            product.buyPrice ? Number(product.buyPrice) : undefined
          }
        />
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Gagal mencetak kartu stok';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [product, fromDate, toDate, printEntries, printDocument, toast]);

  // Handle XLSX export
  const handleExportXLSX = useCallback(() => {
    try {
      const filename = `kartu-stok-${product.code}-${formatDateRange(fromDate || 'all', toDate || 'all')}`;
      exportToExcel(
        printEntries.map((entry) => ({
          Tanggal: entry.tanggal,
          Keterangan: entry.keterangan,
          'No. Referensi': entry.referensi,
          'Masuk (qty)': entry.masuk,
          'Keluar (qty)': entry.keluar,
          'Saldo (qty)': entry.saldo,
        })),
        filename,
        { sheetName: `${product.code} - ${product.name}` }
      );
      toast({
        title: 'Sukses',
        description: 'Data kartu stok berhasil diekspor ke Excel',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Gagal mengekspor data kartu stok';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [product, printEntries, fromDate, toDate, toast]);

  return (
    <div className="px-4 pb-5 pt-3 space-y-4 bg-muted/10 border-t border-dashed">
      {/* Header: Product info + Date filters + Actions */}
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              {product.code} &middot; {product.categoryName ?? product.category}
              <span className="mx-2">|</span>
              Beli: {formatCurrency(Number(product.buyPrice ?? 0))}
              <span className="mx-1">&middot;</span>
              Jual: {formatCurrency(Number(product.sellPrice ?? 0))}
            </p>
          </div>
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Dari
            </label>
            <Input
              type="date"
              className="h-8 text-xs w-36"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Sampai
            </label>
            <Input
              type="date"
              className="h-8 text-xs w-36"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
          <Button
            onClick={handlePrint}
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak
          </Button>
          <Button
            onClick={handleExportXLSX}
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Date validation warning */}
      {!isDateRangeValid && (
        <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
          Tanggal mulai harus lebih awal atau sama dengan tanggal akhir
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Total Masuk"
          value={`${totalMasuk} ${product.unit ?? ''}`}
          icon={<ArrowUp className="h-4 w-4" />}
          color="success"
        />
        <StatCard
          title="Total Keluar"
          value={`${totalKeluar} ${product.unit ?? ''}`}
          icon={<ArrowDown className="h-4 w-4" />}
          color="destructive"
        />
        <StatCard
          title={
            mutations.length > 0
              ? 'Saldo Akhir Periode'
              : 'Saldo Awal Periode'
          }
          value={`${saldoAkhirPeriode} ${product.unit ?? ''}`}
          icon={<Package className="h-4 w-4" />}
          color="primary"
        />
      </div>

      {/* Mutation Table */}
      <div className="rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Memuat data pergerakan stok...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            Gagal memuat data kartu stok
          </div>
        ) : mutations.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Belum ada data pergerakan stok untuk produk ini.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-10 text-xs">#</TableHead>
                <TableHead className="text-xs">Tanggal</TableHead>
                <TableHead className="text-xs">Keterangan</TableHead>
                <TableHead className="text-xs">No. Referensi</TableHead>
                <TableHead className="text-xs">Masuk</TableHead>
                <TableHead className="text-xs">Keluar</TableHead>
                <TableHead className="text-xs">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Opening balance row */}
              <TableRow className="bg-muted/20 italic">
                <TableCell className="text-muted-foreground text-xs">
                  —
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                  {fromDate
                    ? new Date(fromDate).toLocaleDateString('id-ID')
                    : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs" colSpan={2}>
                  Saldo Awal
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="font-bold tabular-nums">
                  {openingStock}
                </TableCell>
              </TableRow>

              {/* Data rows */}
              {mutations.map((m, i) => (
                <TableRow
                  key={m.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {new Date(m.createdAt).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-xs">
                    {m.notes ?? m.type}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary">
                    {m.reference}
                  </TableCell>
                  <TableCell>
                    {m._dir === 'IN' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-2 py-0.5 text-xs font-semibold text-success">
                        <ArrowUp className="h-3 w-3" />
                        +{m.quantity}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {m._dir === 'OUT' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-xs font-semibold text-destructive">
                        <ArrowDown className="h-3 w-3" />
                        -{m.quantity}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold tabular-nums">
                    {m._runningBalance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            {/* Summary row in footer */}
            <TableFooter>
              <TableRow className="bg-muted/40">
                <TableCell colSpan={4} className="font-bold text-xs">
                  RINGKASAN PERIODE
                </TableCell>
                <TableCell>
                  <span className="text-success font-bold text-xs">
                    +{totalMasuk}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-destructive font-bold text-xs">
                    -{totalKeluar}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-sm text-primary">
                  {saldoAkhirPeriode}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PER_PAGE = 25;

const KartuStok = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data: productsData, isLoading } = useProducts({ per_page: 999 });
  const products = useMemo(
    () => productsData?.data ?? [],
    [productsData?.data]
  );

  // Extract unique categories
  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.categoryName ?? p.category).filter(Boolean))) as string[],
    [products]
  );

  // Apply filters
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        !debouncedSearch ||
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (p.code ?? '').toLowerCase().includes(debouncedSearch.toLowerCase());
      const cat = p.categoryName ?? p.category;
      const matchCategory = categoryFilter === 'all' || cat === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, debouncedSearch, categoryFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginatedItems = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  // Reset page when filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value);
    setPage(1);
  }, []);

  // Toggle expand
  const handleRowClick = useCallback((productId: string) => {
    setExpandedProductId(prev => (prev === productId ? null : productId));
  }, []);

  return (
    <MainLayout
      title="Kartu Stok"
      subtitle="Histori pergerakan stok per produk"
    >
      <PageHeader
        title="Kartu Stok"
        description="Audit trail lengkap pergerakan stok per produk — klik produk untuk melihat detail"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            className="pl-9 h-9"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0">
          {filtered.length} produk
        </span>
      </div>

      {/* Product List Table */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          Memuat data produk...
        </div>
      ) : (
        <DataTableContainer>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-3 text-left font-semibold w-8" />
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">Kode</th>
                  <th className="px-3 py-3 text-left font-semibold">Nama Produk</th>
                  <th className="px-3 py-3 text-left font-semibold">Kategori</th>
                  <th className="px-3 py-3 text-right font-semibold">Stok</th>
                  <th className="px-3 py-3 text-left font-semibold">Satuan</th>
                  <th className="px-3 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada produk yang sesuai.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((p: ApiProduct) => {
                    const isExpanded = expandedProductId === p.id;
                    const isLowStock =
                      Number(p.stock ?? 0) <= Number(p.minimumStock ?? p.minStock ?? 0);

                    return (
                      <Fragment key={p.id}>
                        <tr
                          className={`border-b transition-colors cursor-pointer select-none ${
                            isExpanded
                              ? 'bg-primary/5 border-primary/20'
                              : 'hover:bg-muted/20'
                          } ${isLowStock && !isExpanded ? 'bg-warning/5' : ''}`}
                          onClick={() => handleRowClick(p.id)}
                        >
                          <td className="px-3 py-3 text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-primary" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-primary whitespace-nowrap">
                            {p.code}
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-medium">{p.name}</span>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="secondary" className="text-xs">
                              {p.categoryName ?? p.category ?? '-'}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span
                              className={`font-bold tabular-nums ${
                                isLowStock ? 'text-destructive' : ''
                              }`}
                            >
                              {p.stock ?? 0}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground text-xs">
                            {p.unit ?? 'pcs'}
                          </td>
                          <td className="px-3 py-3">
                            {isLowStock ? (
                              <Badge variant="destructive" className="text-xs">
                                Stok Rendah
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-success border-success text-xs">
                                Aman
                              </Badge>
                            )}
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr className="border-b border-primary/20">
                            <td colSpan={7} className="p-0">
                              <ProductDetail product={p} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between gap-4 px-1">
            <p className="text-xs text-muted-foreground">
              Halaman {page} dari {totalPages} &bull; Total {filtered.length} produk
            </p>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  &larr; Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Berikutnya &rarr;
                </Button>
              </div>
            )}
          </div>
        </DataTableContainer>
      )}
    </MainLayout>
  );
};

export default KartuStok;
