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
import { useSaldoPiutang } from '@/hooks/api/useInfo';
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

  const { data, isLoading } = useSaldoPiutang();
  const customers: PiutangCustomer[] = (data as { data?: PiutangCustomer[] })?.data ?? [];

  const withDebt = customers.filter(c => c.balance > 0);
  const total = customers.reduce((s, c) => s + c.balance, 0);
  const overLimit = customers.filter(c => c.creditLimit > 0 && c.balance > c.creditLimit);

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'piutang') return matchSearch && c.balance > 0;
    if (statusFilter === 'overlimit') return matchSearch && c.creditLimit > 0 && c.balance > c.creditLimit;
    if (statusFilter === 'lunas') return matchSearch && c.balance === 0;
    return matchSearch;
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
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" />Cetak</Button>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                {['Kode', 'Nama Customer', 'Telepon', 'Total Piutang', 'Limit Kredit', 'Sisa Limit', 'Status'].map(h => (
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
                  {filtered.map(c => {
                    const isOverLimit = c.creditLimit > 0 && c.balance > c.creditLimit;
                    const sisaLimit = c.creditLimit - c.balance;
                    return (
                      <tr key={c.id} className={`border-b transition-colors hover:bg-muted/20 ${isOverLimit ? 'bg-destructive/5' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-primary">{c.code}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.name}</div>
                          {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                        <td className="px-4 py-3">
                          {c.balance > 0 ? <CurrencyCell value={c.balance} color="red" /> : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3"><CurrencyCell value={c.creditLimit} /></td>
                        <td className="px-4 py-3">
                          {c.creditLimit > 0 ? <CurrencyCell value={Math.abs(sisaLimit)} color={sisaLimit < 0 ? 'red' : 'green'} /> : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {c.balance === 0
                            ? <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>
                            : isOverLimit
                              ? <Badge variant="destructive" className="text-xs">Melebihi Limit</Badge>
                              : <Badge variant="outline" className="text-warning border-warning text-xs">Piutang</Badge>
                          }
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-muted/40 font-bold border-t-2">
                    <td colSpan={3} className="px-4 py-3 text-sm">GRAND TOTAL PIUTANG</td>
                    <td className="px-4 py-3"><CurrencyCell value={total} color="red" /></td>
                    <td colSpan={3} />
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

export default SaldoPiutang;
