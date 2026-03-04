import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClipboardList, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface KartuStokItem {
  id: string;
  tanggal: string;
  keterangan: string;
  tipe: 'masuk' | 'keluar';
  qty: number;
  saldo: number;
  referensi: string;
}

const kartuStokData: KartuStokItem[] = [
  { id: '1', tanggal: '2024-01-01', keterangan: 'Saldo Awal', tipe: 'masuk', qty: 100, saldo: 100, referensi: '-' },
  { id: '2', tanggal: '2024-01-05', keterangan: 'Pembelian dari PT Sumber Makmur', tipe: 'masuk', qty: 50, saldo: 150, referensi: 'PB-2024-001' },
  { id: '3', tanggal: '2024-01-08', keterangan: 'Penjualan ke Toko Makmur', tipe: 'keluar', qty: 20, saldo: 130, referensi: 'PJ-2024-001' },
  { id: '4', tanggal: '2024-01-10', keterangan: 'Penjualan ke CV Sejahtera', tipe: 'keluar', qty: 15, saldo: 115, referensi: 'PK-2024-002' },
  { id: '5', tanggal: '2024-01-12', keterangan: 'Retur dari UD Bahagia', tipe: 'masuk', qty: 5, saldo: 120, referensi: 'RTJ-2024-001' },
  { id: '6', tanggal: '2024-01-15', keterangan: 'Pembelian dari CV Berkah Jaya', tipe: 'masuk', qty: 30, saldo: 150, referensi: 'PB-2024-002' },
  { id: '7', tanggal: '2024-01-18', keterangan: 'Penjualan ke PT Sentosa', tipe: 'keluar', qty: 30, saldo: 120, referensi: 'PK-2024-003' },
];

const produkList = [
  { id: 'PRD001', nama: 'Beras Premium 5kg' },
  { id: 'PRD002', nama: 'Minyak Goreng 2L' },
  { id: 'PRD003', nama: 'Indomie Goreng' },
  { id: 'PRD004', nama: 'Gula Pasir 1kg' },
];

const KartuStok = () => {
  const [selectedProduct, setSelectedProduct] = useState('PRD001');

  const totalMasuk = kartuStokData.filter(k => k.tipe === 'masuk').reduce((sum, k) => sum + k.qty, 0);
  const totalKeluar = kartuStokData.filter(k => k.tipe === 'keluar').reduce((sum, k) => sum + k.qty, 0);
  const saldoAkhir = kartuStokData[kartuStokData.length - 1]?.saldo || 0;

  return (
    <MainLayout title="Kartu Stok" subtitle="Histori pergerakan stok per produk">
      {/* Product Selection */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Pilih Produk</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="mt-1 w-72">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {produkList.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.id} - {prod.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ArrowUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Masuk</p>
                <p className="text-2xl font-bold text-success">{totalMasuk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <ArrowDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Keluar</p>
                <p className="text-2xl font-bold text-destructive">{totalKeluar}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Akhir</p>
                <p className="text-2xl font-bold text-primary">{saldoAkhir}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kartu Stok Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Kartu Stok - Beras Premium 5kg
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Referensi</TableHead>
                <TableHead className="text-right">Masuk</TableHead>
                <TableHead className="text-right">Keluar</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kartuStokData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.keterangan}</TableCell>
                  <TableCell>
                    {item.referensi !== '-' ? (
                      <span className="font-medium text-primary">{item.referensi}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.tipe === 'masuk' && (
                      <Badge variant="default" className="bg-success">+{item.qty}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.tipe === 'keluar' && (
                      <Badge variant="destructive">-{item.qty}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">{item.saldo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default KartuStok;
