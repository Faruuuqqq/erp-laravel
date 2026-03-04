import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader, DataTableContainer, StatusBadge, CurrencyCell } from '@/components/ui/DataComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EXPENSES, formatRupiah } from '@/data/mockData';
import { Plus, Search, Download } from 'lucide-react';

const BiayaJasa = () => {
  const [search, setSearch] = useState('');
  const filtered = EXPENSES.filter(e =>
    e.keterangan.toLowerCase().includes(search.toLowerCase()) ||
    e.kategori.toLowerCase().includes(search.toLowerCase())
  );
  const total = filtered.reduce((s, e) => s + e.jumlah, 0);
  return (
    <MainLayout title="Biaya / Jasa" subtitle="Histori biaya operasional di luar transaksi toko">
      <PageHeader title="Biaya / Jasa" actions={
        <>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Tambah Biaya</Button>
        </>
      } />
      <div className="mb-4 flex gap-3">
        <div className="relative w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Cari biaya..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <DataTableContainer>
        <div className="p-4 border-b flex justify-between text-sm"><span className="text-muted-foreground">{filtered.length} data</span><span className="font-semibold">Total: <CurrencyCell value={total} color="red" /></span></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/30 text-xs text-muted-foreground">{['No. Ref','Tanggal','Kategori','Keterangan','Jumlah','Oleh'].map(h=><th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>)}</tr></thead>
          <tbody>{filtered.map(e=><tr key={e.id} className="border-b hover:bg-muted/20"><td className="px-4 py-2.5 font-mono text-xs text-primary">{e.noRef}</td><td className="px-4 py-2.5">{e.tanggal}</td><td className="px-4 py-2.5"><span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{e.kategori}</span></td><td className="px-4 py-2.5">{e.keterangan}</td><td className="px-4 py-2.5"><CurrencyCell value={e.jumlah} color="red" /></td><td className="px-4 py-2.5 capitalize">{e.createdBy}</td></tr>)}</tbody>
        </table>
      </DataTableContainer>
    </MainLayout>
  );
};
export default BiayaJasa;
