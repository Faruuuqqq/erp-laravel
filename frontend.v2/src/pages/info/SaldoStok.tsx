import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Package, Warehouse, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface StokItem {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  gudang: string;
  stok: number;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  nilaiPersediaan: number;
}

const stokData: StokItem[] = [
  { id: '1', kode: 'PRD001', nama: 'Beras Premium 5kg', kategori: 'Sembako', gudang: 'Gudang Utama', stok: 120, satuan: 'Karung', hargaBeli: 65000, hargaJual: 75000, nilaiPersediaan: 7800000 },
  { id: '2', kode: 'PRD002', nama: 'Minyak Goreng 2L', kategori: 'Sembako', gudang: 'Gudang Utama', stok: 85, satuan: 'Botol', hargaBeli: 28000, hargaJual: 35000, nilaiPersediaan: 2380000 },
  { id: '3', kode: 'PRD003', nama: 'Indomie Goreng', kategori: 'Makanan', gudang: 'Gudang Utama', stok: 500, satuan: 'Pcs', hargaBeli: 2500, hargaJual: 3500, nilaiPersediaan: 1250000 },
  { id: '4', kode: 'PRD004', nama: 'Aqua 600ml', kategori: 'Minuman', gudang: 'Gudang Cabang', stok: 200, satuan: 'Botol', hargaBeli: 3000, hargaJual: 4000, nilaiPersediaan: 600000 },
  { id: '5', kode: 'PRD005', nama: 'Gula Pasir 1kg', kategori: 'Sembako', gudang: 'Gudang Utama', stok: 150, satuan: 'Kg', hargaBeli: 14000, hargaJual: 18000, nilaiPersediaan: 2100000 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const SaldoStok = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gudangFilter, setGudangFilter] = useState('all');

  const filteredData = stokData.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGudang = gudangFilter === 'all' || item.gudang === gudangFilter;
    return matchSearch && matchGudang;
  });

  const totalStok = stokData.reduce((sum, item) => sum + item.stok, 0);
  const totalNilai = stokData.reduce((sum, item) => sum + item.nilaiPersediaan, 0);

  return (
    <MainLayout title="Saldo Stok" subtitle="Informasi stok dan nilai persediaan barang">
      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Produk</p>
                <p className="text-2xl font-bold">{stokData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Unit</p>
                <p className="text-2xl font-bold">{totalStok.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Warehouse className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nilai Persediaan</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalNilai)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Package className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Rendah</p>
                <p className="text-2xl font-bold text-destructive">{stokData.filter(s => s.stok < 100).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={gudangFilter} onValueChange={setGudangFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Gudang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Gudang</SelectItem>
            <SelectItem value="Gudang Utama">Gudang Utama</SelectItem>
            <SelectItem value="Gudang Cabang">Gudang Cabang</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Stok Barang</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Harga Beli</TableHead>
                <TableHead className="text-right">Nilai Persediaan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-primary">{item.kode}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell><Badge variant="secondary">{item.kategori}</Badge></TableCell>
                  <TableCell>{item.gudang}</TableCell>
                  <TableCell className={`text-right font-medium ${item.stok < 100 ? 'text-destructive' : ''}`}>
                    {item.stok} {item.satuan}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.hargaBeli)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(item.nilaiPersediaan)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={4} className="font-bold">TOTAL</TableCell>
                <TableCell className="text-right font-bold">{totalStok}</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right text-lg font-bold text-primary">{formatCurrency(totalNilai)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default SaldoStok;
