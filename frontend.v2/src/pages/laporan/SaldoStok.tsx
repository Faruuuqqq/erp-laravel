import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, CurrencyCell } from '@/components/ui/DataComponents';
import { StatCard } from '@/components/ui/StatCard';
import { PRODUCTS, CATEGORIES, formatRupiah } from '@/data/mockData';
import { Package, AlertTriangle, Search, Download, Printer, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

const SaldoStok = () => {
  const [search, setSearch] = useState('');
  const [katFilter, setKatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalNilai = PRODUCTS.reduce((s, p) => s + p.hargaBeli * p.stok, 0);
  const totalUnit = PRODUCTS.reduce((s, p) => s + p.stok, 0);
  const lowStock = PRODUCTS.filter(p => p.stok <= p.stokMinimum);
  const totalNilaiJual = PRODUCTS.reduce((s, p) => s + p.hargaJual * p.stok, 0);

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kode.toLowerCase().includes(search.toLowerCase());
    const matchKat = katFilter === 'all' || p.kategoriId === katFilter;
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'rendah' && p.stok <= p.stokMinimum) ||
      (statusFilter === 'aman' && p.stok > p.stokMinimum);
    return matchSearch && matchKat && matchStatus;
  });

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const content = `
SALDO STOK - TOKOSYNC ERP [OWNER ONLY]
Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
${'='.repeat(70)}

Nilai Persediaan (Beli) : ${formatRupiah(totalNilai)}
Nilai Persediaan (Jual) : ${formatRupiah(totalNilaiJual)}
Total Unit              : ${totalUnit.toLocaleString('id-ID')}
Produk Stok Rendah      : ${lowStock.length} produk

${'='.repeat(70)}
${['Kode', 'Nama Produk', 'Kategori', 'Stok', 'Min', 'Harga Beli', 'Nilai Persediaan', 'Status'].join('\t')}
${'-'.repeat(70)}
${filtered.map(p =>
      [p.kode, p.nama, p.kategoriNama, `${p.stok} ${p.satuan}`, p.stokMinimum,
        formatRupiah(p.hargaBeli), formatRupiah(p.hargaBeli * p.stok),
        p.stok <= p.stokMinimum ? 'STOK RENDAH' : 'Aman'].join('\t')
    ).join('\n')}
${'-'.repeat(70)}
TOTAL NILAI PERSEDIAAN: ${formatRupiah(totalNilai)}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saldo-stok-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Saldo Stok" subtitle="Total stok dan nilai persediaan (Owner only)">
      <PageHeader
        title="Saldo Stok"
        description="Nilai persediaan berdasarkan harga beli — akses terbatas Owner"
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
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <StatCard title="Nilai Persediaan (Beli)" value={totalNilai} icon={<Package className="h-5 w-5" />} color="primary" />
        <StatCard title="Nilai Potensi Jual" value={totalNilaiJual} icon={<TrendingUp className="h-5 w-5" />} color="success" />
        <StatCard title="Total Unit Stok" value={`${totalUnit.toLocaleString('id-ID')} Unit`} icon={<Package className="h-5 w-5" />} color="info" />
        <StatCard title="Stok Rendah" value={`${lowStock.length} Produk`} icon={<AlertTriangle className="h-5 w-5" />} color={lowStock.length > 0 ? 'warning' : 'success'} />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari produk..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={katFilter} onValueChange={setKatFilter}>
          <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="rendah">Stok Rendah</SelectItem>
            <SelectItem value="aman">Aman</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground shrink-0">{filtered.length} produk</span>
      </div>

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
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data yang sesuai.</td></tr>
              ) : (
                <>
                  {filtered.map(p => {
                    const pct = Math.min(100, Math.round((p.stok / (p.stokMinimum * 3)) * 100));
                    const isLow = p.stok <= p.stokMinimum;
                    return (
                      <tr key={p.id} className={`border-b transition-colors hover:bg-muted/20 ${isLow ? 'bg-warning/5' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-primary">{p.kode}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.nama}</div>
                          <div className="text-xs text-muted-foreground">{p.gudangNama}</div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{p.kategoriNama}</Badge></td>
                        <td className="px-4 py-3">
                          <span className={`font-bold tabular-nums ${isLow ? 'text-destructive' : ''}`}>{p.stok}</span>
                          <span className="text-muted-foreground"> / {p.stokMinimum} {p.satuan}</span>
                        </td>
                        <td className="px-4 py-3 min-w-24">
                          <Progress value={pct} className={`h-1.5 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                          <span className="text-[10px] text-muted-foreground">{pct}%</span>
                        </td>
                        <td className="px-4 py-3"><CurrencyCell value={p.hargaBeli} /></td>
                        <td className="px-4 py-3"><CurrencyCell value={p.hargaJual} /></td>
                        <td className="px-4 py-3 font-semibold"><CurrencyCell value={p.hargaBeli * p.stok} /></td>
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
                    <td className="px-4 py-3"><CurrencyCell value={totalNilai} /></td>
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
export default SaldoStok;
