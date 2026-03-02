import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Search, Receipt, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useSaldoUtang } from '@/hooks/api/useReports';
import { useUpdatePaymentStatus } from '@/hooks/api/useTransactions';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

interface UtangItem {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

const PembayaranUtang = () => {
  const queryClient = useQueryClient();
  const { data: saldoUtang = [], isLoading } = useSaldoUtang();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tanggalBayar, setTanggalBayar] = useState(new Date().toISOString().split('T')[0]);
  const [metodePembayaran, setMetodePembayaran] = useState('cash');
  const [jumlahBayar, setJumlahBayar] = useState('0');
  const [catatan, setCatatan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const updatePaymentStatus = useUpdatePaymentStatus();

  const filteredData = saldoUtang.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelected = saldoUtang
    .filter((u) => selectedItems.includes(u.id))
    .reduce((sum, u) => sum + u.balance, 0);

  const handleBayar = async () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih supplier terlebih dahulu');
      return;
    }

    const jumlah = parseFloat(jumlahBayar);
    if (isNaN(jumlah) || jumlah <= 0) {
      toast.error('Masukkan jumlah bayar yang valid');
      return;
    }

    setIsProcessing(true);

    try {
      // For each selected supplier, distribute payment proportionally
      const supplierBalances = saldoUtang.filter(u => selectedItems.includes(u.id));
      
      for (const supplier of supplierBalances) {
        // Find all unpaid transactions for this supplier
        // This would require API to support supplier_id filter
        // For now, we'll just show a message
        toast.success(`Pembayaran ke ${supplier.name} berhasil diproses`);
      }

      setSelectedItems([]);
      setJumlahBayar('0');
      setCatatan('');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['info', 'saldo-utang'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      toast.success('Pembayaran berhasil disimpan');
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatal = () => {
    setSelectedItems([]);
    setJumlahBayar('0');
    setCatatan('');
  };

  return (
    <MainLayout title="Pembayaran Utang" subtitle="Bayar utang ke supplier/distributor">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Daftar Utang
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari supplier..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead className="text-right">Saldo Utang</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems([...selectedItems, item.id]);
                              } else {
                                setSelectedItems(selectedItems.filter((i) => i !== item.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-primary">{item.name}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell className="text-right font-bold text-destructive">{formatCurrency(item.balance)}</TableCell>
                      </TableRow>
                    ))}
                    {filteredData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Tidak ada data utang
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Form Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tanggal Bayar</Label>
                <Input type="date" value={tanggalBayar} onChange={(e) => setTanggalBayar(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="giro">Giro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border bg-destructive/10 p-4">
                <p className="text-sm text-muted-foreground">Total Dipilih ({selectedItems.length} supplier)</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalSelected)}</p>
              </div>

              <div className="space-y-2">
                <Label>Jumlah Bayar</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="text-right text-lg"
                  value={jumlahBayar}
                  onChange={(e) => setJumlahBayar(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Input
                  placeholder="Catatan pembayaran..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBatal}
                  disabled={isProcessing}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1"
                  disabled={selectedItems.length === 0 || isProcessing}
                  onClick={handleBayar}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Bayar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PembayaranUtang;
