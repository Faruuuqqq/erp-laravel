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
import { useSaldoUtang } from '@/hooks/api/useInfo';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency } from '@/lib/utils';

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

  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading } = useSaldoUtang({
    search: debouncedSearch || undefined,
    status: filter !== 'all' ? filter : undefined,
  });
  const suppliers: UtangSupplier[] = (data as { data?: UtangSupplier[] })?.data ?? [];

  const withDebt = suppliers.filter(s => s.balance > 0);
  const total = suppliers.reduce((s, sup) => s + sup.balance, 0);

  // Client-side filter as fallback if API doesn't support status
  const filtered = suppliers.filter(s => {
    if (filter === 'utang') return s.balance > 0;
    if (filter === 'lunas') return s.balance === 0;
    return true;
  });

  const handleExportPDF = useCallback(() => {
    const content = `SALDO UTANG - TOKOSYNC ERP\nDicetak: ${new Date().toLocaleDateString('id-ID')}\n${'='.repeat(60)}\nTotal Utang: ${formatCurrency(total)}\nSupplier: ${withDebt.length}\n${'='.repeat(60)}\n${filtered.filter(s => s.balance > 0).map(s => `${s.code}\t${s.name}\t${formatCurrency(s.balance)}`).join('\n')}\n${'='.repeat(60)}\nGRAND TOTAL: ${formatCurrency(total)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `saldo-utang-${new Date().toISOString().slice(0, 10)}.txt`; a.click();
    URL.revokeObjectURL(url);
  }, [filtered, total, withDebt.length]);

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
            <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="h-4 w-4 mr-1.5" />Export</Button>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                {['Kode', 'Nama Supplier', 'Telepon', 'Alamat', 'Total Transaksi', 'Saldo Utang', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-2"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data yang sesuai.</td></tr>
              ) : (
                <>
                  {filtered.map(s => (
                    <tr key={s.id} className={`border-b transition-colors hover:bg-muted/20 ${s.balance > 0 ? 'bg-destructive/5' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{s.code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.name}</div>
                        {s.email && <div className="text-xs text-muted-foreground">{s.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-48 truncate text-xs">{s.address}</td>
                      <td className="px-4 py-3"><CurrencyCell value={s.totalTransactions} /></td>
                      <td className="px-4 py-3">
                        {s.balance > 0 ? <CurrencyCell value={s.balance} color="red" /> : <span className="text-success text-xs font-medium">Lunas</span>}
                      </td>
                      <td className="px-4 py-3">
                        {s.balance > 0
                          ? <Badge variant="destructive" className="text-xs">Ada Utang</Badge>
                          : <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-bold border-t-2">
                    <td colSpan={5} className="px-4 py-3 text-sm">GRAND TOTAL UTANG</td>
                    <td className="px-4 py-3"><CurrencyCell value={total} color="red" /></td>
                    <td />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </DataTableContainer>
    </MainLayout>
  );
};

export default SaldoUtang;
