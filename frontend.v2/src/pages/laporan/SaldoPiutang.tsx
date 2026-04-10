import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { TrendingUp, AlertTriangle, Search, Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { useSaldoPiutang, printSaldoPiutang } from '@/hooks/api/useInfo';
import { useToast } from '@/hooks/use-toast';

interface PiutangItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  totalTransactions: number;
}

const SaldoPiutang = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const { data, isLoading } = useSaldoPiutang();
  const customers = Array.isArray(data?.data) ? (data.data as PiutangItem[]) : [];

  const withDebt = customers.filter(c => c.balance > 0);
  const total = customers.reduce((s, c) => s + (c.balance || 0), 0);

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'piutang') return matchSearch && c.balance > 0;
    if (statusFilter === 'lunas') return matchSearch && c.balance === 0;
    return matchSearch;
  });

  const handleExport = () => {
    const rows = [['Kode', 'Nama Customer', 'Telepon', 'Email', 'Total Piutang', 'Status'],
    ...filtered.map(c => [`CUS-${c.id}`, c.name, c.phone, c.email, c.balance, c.balance > 0 ? 'Piutang' : 'Lunas'])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'saldo-piutang.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    try {
      await printSaldoPiutang();
      toast({ title: 'PDF berhasil dibuka', description: 'Dokumen dibuka di tab baru' });
    } catch (error) {
      toast({ title: 'Gagal mencetak', description: 'Terjadi kesalahan saat mencetak dokumen', variant: 'destructive' });
    }
  };

  return (
    <MainLayout title="Saldo Piutang" subtitle="Daftar piutang dari customer">
      <PageHeader
        title="Saldo Piutang"
        description="Ringkasan outstanding piutang per customer"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" />Cetak
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1.5" />Export CSV
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Piutang" value={total} icon={<TrendingUp className="h-5 w-5" />} color="warning" />
        <StatCard title="Customer Berpiutang" value={`${withDebt.length} Customer`} icon={<TrendingUp className="h-5 w-5" />} color="primary" />
        <StatCard title="Total Customer" value={`${customers.length} Customer`} icon={<TrendingUp className="h-5 w-5" />} color="info" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari customer..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Customer</SelectItem>
            <SelectItem value="piutang">Punya Piutang</SelectItem>
            <SelectItem value="lunas">Lunas</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0">{filtered.length} data</span>
      </div>

      {isLoading ? (
        <DataTableContainer>
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
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
                  {['Kode', 'Nama Customer', 'Telepon', 'Email', 'Total Piutang', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data yang sesuai.</td></tr>
                ) : (
                  <>
                    {filtered.map(c => (
                      <tr key={c.id} className={`border-b transition-colors hover:bg-muted/20 ${c.balance > 0 ? 'bg-warning/5' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-primary">CUS-{c.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.name}</div>
                          {c.address && <div className="text-xs text-muted-foreground truncate max-w-48">{c.address}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.phone || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.email || '-'}</td>
                        <td className="px-4 py-3">
                          {c.balance > 0
                            ? <CurrencyCell value={c.balance} color="red" />
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {c.balance === 0
                            ? <Badge variant="outline" className="text-success border-success text-xs">Lunas</Badge>
                            : <Badge variant="outline" className="text-warning border-warning text-xs">Piutang</Badge>
                          }
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/40 font-bold border-t-2">
                      <td colSpan={4} className="px-4 py-3 text-sm">GRAND TOTAL PIUTANG</td>
                      <td className="px-4 py-3"><CurrencyCell value={total} color="red" /></td>
                      <td />
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </DataTableContainer>
      )}
    </MainLayout>
  );
};
export default SaldoPiutang;
