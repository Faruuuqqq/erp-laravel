import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { CUSTOMERS, formatRupiah } from '@/data/mockData';
import { TrendingUp, AlertTriangle, Search, Download, Printer, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SaldoPiutang = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const withDebt = CUSTOMERS.filter(c => c.totalPiutang > 0);
  const total = CUSTOMERS.reduce((s, c) => s + c.totalPiutang, 0);
  const overLimit = CUSTOMERS.filter(c => c.totalPiutang > c.limitKredit);

  const filtered = CUSTOMERS.filter(c => {
    const matchSearch = c.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.kode.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'piutang') return matchSearch && c.totalPiutang > 0;
    if (statusFilter === 'overlimit') return matchSearch && c.totalPiutang > c.limitKredit;
    if (statusFilter === 'lunas') return matchSearch && c.totalPiutang === 0;
    return matchSearch;
  });

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const content = `
SALDO PIUTANG - TOKOSYNC ERP
Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
${'='.repeat(60)}

Total Piutang    : ${formatRupiah(total)}
Customer Piutang : ${withDebt.length} customer
Melebihi Limit   : ${overLimit.length} customer

${'='.repeat(60)}
${['Kode', 'Nama Customer', 'Telepon', 'Piutang', 'Limit', 'Status'].join('\t')}
${'-'.repeat(60)}
${filtered.filter(c => c.totalPiutang > 0).map(c =>
      [c.kode, c.nama, c.telepon, formatRupiah(c.totalPiutang), formatRupiah(c.limitKredit),
        c.totalPiutang > c.limitKredit ? 'MELEBIHI LIMIT' : 'Normal'].join('\t')
    ).join('\n')}
${'-'.repeat(60)}
GRAND TOTAL: ${formatRupiah(total)}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saldo-piutang-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1.5" />Export PDF
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Piutang" value={total} icon={<TrendingUp className="h-5 w-5" />} color="warning" />
        <StatCard title="Customer Berpiutang" value={`${withDebt.length} Customer`} icon={<TrendingUp className="h-5 w-5" />} color="primary" />
        <StatCard title="Melebihi Limit Kredit" value={`${overLimit.length} Customer`} icon={<AlertTriangle className="h-5 w-5" />} color="destructive" />
      </div>

      {/* Filters */}
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
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data yang sesuai.</td></tr>
              ) : (
                <>
                  {filtered.map(c => {
                    const isOverLimit = c.totalPiutang > c.limitKredit;
                    const sisaLimit = c.limitKredit - c.totalPiutang;
                    return (
                      <tr key={c.id} className={`border-b transition-colors hover:bg-muted/20 ${isOverLimit ? 'bg-destructive/5' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-primary">{c.kode}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{c.nama}</div>
                          {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.telepon}</td>
                        <td className="px-4 py-3">
                          {c.totalPiutang > 0
                            ? <CurrencyCell value={c.totalPiutang} color="red" />
                            : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3"><CurrencyCell value={c.limitKredit} /></td>
                        <td className="px-4 py-3">
                          <CurrencyCell value={Math.abs(sisaLimit)} color={sisaLimit < 0 ? 'red' : 'green'} />
                        </td>
                        <td className="px-4 py-3">
                          {c.totalPiutang === 0
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
