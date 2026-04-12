import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, AlertTriangle, Search, Download, Printer } from 'lucide-react';
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
import { useSaldoPiutang } from '@/hooks/api/useInfo';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency } from '@/lib/utils';

interface PiutangCustomer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  creditLimit: number;
}

const SaldoPiutang = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { canPrint } = usePermissions();

  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading } = useSaldoPiutang({
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const customers: PiutangCustomer[] = (data?.data as PiutangCustomer[]) ?? [];

  const withDebt = customers.filter(c => c.balance > 0);
  const total = customers.reduce((s, c) => s + c.balance, 0);
  const overLimit = customers.filter(c => c.creditLimit > 0 && c.balance > c.creditLimit);

  // Client-side filter only as fallback if API doesn't support status filter
  const filtered = customers.filter(c => {
    if (statusFilter === 'piutang') return c.balance > 0;
    if (statusFilter === 'overlimit') return c.creditLimit > 0 && c.balance > c.creditLimit;
    if (statusFilter === 'lunas') return c.balance === 0;
    return true;
  });

  const handleExportPDF = useCallback(() => {
    const content = `SALDO PIUTANG - TOKOSYNC ERP\nDicetak: ${new Date().toLocaleDateString('id-ID')}\n${'='.repeat(60)}\nTotal Piutang: ${formatCurrency(total)}\nCustomer: ${withDebt.length}\n${'='.repeat(60)}\n${filtered.filter(c => c.balance > 0).map(c => `${c.code}\t${c.name}\t${formatCurrency(c.balance)}\t${c.creditLimit > 0 && c.balance > c.creditLimit ? 'OVER LIMIT' : 'Normal'}`).join('\n')}\n${'='.repeat(60)}\nGRAND TOTAL: ${formatCurrency(total)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `saldo-piutang-${new Date().toISOString().slice(0, 10)}.txt`; a.click();
    URL.revokeObjectURL(url);
  }, [filtered, total, withDebt.length]);

  return (
    <MainLayout title="Saldo Piutang" subtitle="Daftar piutang dari customer">
      <PageHeader
        title="Saldo Piutang"
        description="Ringkasan outstanding piutang per customer"
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
        <StatCard title="Total Piutang" value={isLoading ? '...' : total} icon={<TrendingUp className="h-5 w-5" />} color="warning" />
        <StatCard title="Customer Berpiutang" value={isLoading ? '...' : `${withDebt.length} Customer`} icon={<TrendingUp className="h-5 w-5" />} color="primary" />
        <StatCard title="Melebihi Limit Kredit" value={isLoading ? '...' : `${overLimit.length} Customer`} icon={<AlertTriangle className="h-5 w-5" />} color="destructive" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari customer..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Customer</SelectItem>
            <SelectItem value="piutang">Punya Piutang</SelectItem>
            <SelectItem value="overlimit">Melebihi Limit</SelectItem>
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
            <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              Tidak ada data yang sesuai.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Kode</TableHead>
                <TableHead>Nama Customer</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Total Piutang</TableHead>
                <TableHead>Limit Kredit</TableHead>
                <TableHead>Sisa Limit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => {
                const isOverLimit = c.creditLimit > 0 && c.balance > c.creditLimit;
                const sisaLimit = c.creditLimit - c.balance;
                return (
                  <TableRow
                    key={c.id}
                    className={`transition-colors hover:bg-muted/20 ${isOverLimit ? 'bg-destructive/5' : ''}`}
                  >
                    <TableCell className="font-mono text-xs text-primary">{c.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                    <TableCell>
                      {c.balance > 0 ? <CurrencyCell value={c.balance} color="red" /> : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell><CurrencyCell value={c.creditLimit} /></TableCell>
                    <TableCell>
                      {c.creditLimit > 0 ? <CurrencyCell value={Math.abs(sisaLimit)} color={sisaLimit < 0 ? 'red' : 'green'} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {c.balance === 0
                        ? <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>
                        : isOverLimit
                          ? <Badge variant="destructive" className="text-xs">Melebihi Limit</Badge>
                          : <Badge variant="outline" className="text-warning border-warning text-xs">Piutang</Badge>
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

            <TableFooter>
              <TableRow className="bg-muted/40">
                <TableCell colSpan={3} className="font-bold text-sm">
                  GRAND TOTAL PIUTANG
                </TableCell>
                <TableCell><CurrencyCell value={total} color="red" /></TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </DataTableContainer>
    </MainLayout>
  );
};

export default SaldoPiutang;
