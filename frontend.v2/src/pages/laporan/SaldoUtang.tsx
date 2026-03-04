import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { SUPPLIERS, formatRupiah } from '@/data/mockData';
import { TrendingDown, Search, Download, Printer, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SaldoUtang = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const withDebt = SUPPLIERS.filter(s => s.totalUtang > 0);
  const total = SUPPLIERS.reduce((s, sup) => s + sup.totalUtang, 0);

  const filtered = SUPPLIERS.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.kode.toLowerCase().includes(search.toLowerCase());
    if (filter === 'utang') return matchSearch && s.totalUtang > 0;
    if (filter === 'lunas') return matchSearch && s.totalUtang === 0;
    return matchSearch;
  });

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const content = `
SALDO UTANG - TOKOSYNC ERP
Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
${'='.repeat(60)}

Total Utang      : ${formatRupiah(total)}
Supplier Berutang: ${withDebt.length} supplier

${'='.repeat(60)}
${['Kode', 'Nama Supplier', 'Telepon', 'Total Utang'].join('\t')}
${'-'.repeat(60)}
${filtered.filter(s => s.totalUtang > 0).map(s =>
      [s.kode, s.nama, s.telepon, formatRupiah(s.totalUtang)].join('\t')
    ).join('\n')}
${'-'.repeat(60)}
GRAND TOTAL: ${formatRupiah(total)}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saldo-utang-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Saldo Utang" subtitle="Daftar utang toko ke supplier">
      <PageHeader
        title="Saldo Utang"
        description="Ringkasan outstanding utang per supplier"
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
        <StatCard title="Total Utang" value={total} icon={<TrendingDown className="h-5 w-5" />} color="destructive" />
        <StatCard title="Supplier Berutang" value={`${withDebt.length} Supplier`} icon={<Building2 className="h-5 w-5" />} color="warning" />
        <StatCard title="Supplier Lunas" value={`${SUPPLIERS.length - withDebt.length} Supplier`} icon={<TrendingDown className="h-5 w-5" />} color="success" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari supplier..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
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
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data yang sesuai.</td></tr>
              ) : (
                <>
                  {filtered.map(s => (
                    <tr key={s.id} className={`border-b transition-colors hover:bg-muted/20 ${s.totalUtang > 0 ? 'bg-destructive/5' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{s.kode}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.nama}</div>
                        {s.email && <div className="text-xs text-muted-foreground">{s.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.telepon}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-48 truncate text-xs">{s.alamat}</td>
                      <td className="px-4 py-3"><CurrencyCell value={s.totalTransaksi} /></td>
                      <td className="px-4 py-3">
                        {s.totalUtang > 0
                          ? <CurrencyCell value={s.totalUtang} color="red" />
                          : <span className="text-success text-xs font-medium">Lunas</span>}
                      </td>
                      <td className="px-4 py-3">
                        {s.totalUtang > 0
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
