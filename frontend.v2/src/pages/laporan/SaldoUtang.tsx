import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, Search, Download, Printer, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSaldoUtang } from '@/hooks/api/useInfo';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { exportToExcel } from '@/lib/export';

interface UtangSupplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  totalTransactions: number;
}

const SaldoUtang = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { canPrint } = usePermissions();
  const { toast } = useToast();

  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading } = useSaldoUtang({
    search: debouncedSearch || undefined,
    status: filter !== 'all' ? filter : undefined,
  });
  const suppliers: UtangSupplier[] = (data?.data as UtangSupplier[]) ?? [];

  const withDebt = suppliers.filter(s => s.balance > 0);
  const total = suppliers.reduce((s, sup) => s + sup.balance, 0);

  // Client-side filter as fallback if API doesn't support status
  const filtered = suppliers.filter(s => {
    if (filter === 'utang') return s.balance > 0;
    if (filter === 'lunas') return s.balance === 0;
    return true;
  });

  const handleExportXLSX = useCallback(() => {
    try {
      const data = filtered.map(item => ({
        'Kode': item.code,
        'Nama Supplier': item.name,
        'Telepon': item.phone,
        'Email': item.email || '-',
        'Alamat': item.address || '-',
        'Total Transaksi': item.totalTransactions,
        'Saldo Utang': item.balance,
        'Status': item.balance > 0 ? 'Ada Utang' : 'Lunas',
      }));

      exportToExcel(
        data,
        `saldo-utang-${new Date().toISOString().slice(0, 10)}`,
        { sheetName: 'Saldo Utang' }
      );

      toast({
        title: 'Sukses',
        description: 'Data berhasil diekspor ke Excel'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Gagal mengekspor data',
        variant: 'destructive'
      });
    }
  }, [filtered, toast]);

  return (
    <MainLayout title="Saldo Utang" subtitle="Daftar utang toko ke supplier">
      <PageHeader
        title="Saldo Utang"
        description="Ringkasan outstanding utang per supplier"
        actions={
          <>
            {canPrint('__owner_only__') && (
              <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" />Cetak</Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportXLSX}><Download className="h-4 w-4 mr-1.5" />Export XLSX</Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Utang" value={isLoading ? '...' : total} icon={<TrendingDown className="h-5 w-5" />} color="destructive" />
        <StatCard title="Supplier Berutang" value={isLoading ? '...' : `${withDebt.length} Supplier`} icon={<Building2 className="h-5 w-5" />} color="warning" />
        <StatCard title="Supplier Lunas" value={isLoading ? '...' : `${suppliers.length - withDebt.length} Supplier`} icon={<TrendingDown className="h-5 w-5" />} color="success" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari supplier..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Supplier</SelectItem>
            <SelectItem value="utang">Ada Utang</SelectItem>
            <SelectItem value="lunas">Lunas</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0">{filtered.length} data</span>
      </div>

      <DataTableContainer>
        {isLoading ? (
          <div className="p-8 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              Tidak ada data yang sesuai.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Kode</TableHead>
                <TableHead>Nama Supplier</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Total Transaksi</TableHead>
                <TableHead>Saldo Utang</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow
                  key={s.id}
                  className={`transition-colors hover:bg-muted/20 ${s.balance > 0 ? 'bg-destructive/5' : ''}`}
                >
                  <TableCell className="font-mono text-xs text-primary">{s.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    {s.email && <div className="text-xs text-muted-foreground">{s.email}</div>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                  <TableCell className="text-muted-foreground max-w-48 truncate text-xs">{s.address}</TableCell>
                  <TableCell><CurrencyCell value={s.totalTransactions} /></TableCell>
                  <TableCell>
                    {s.balance > 0 ? <CurrencyCell value={s.balance} color="red" /> : <span className="text-success text-xs font-medium">Lunas</span>}
                  </TableCell>
                  <TableCell>
                    {s.balance > 0
                      ? <Badge variant="destructive" className="text-xs">Ada Utang</Badge>
                      : <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <TableFooter>
              <TableRow className="bg-muted/40">
                <TableCell colSpan={5} className="font-bold text-sm">
                  GRAND TOTAL UTANG
                </TableCell>
                <TableCell><CurrencyCell value={total} color="red" /></TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </DataTableContainer>
    </MainLayout>
  );
};

export default SaldoUtang;
