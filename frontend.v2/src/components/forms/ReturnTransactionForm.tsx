import { Plus, Trash2, RotateCcw, AlertTriangle, Loader2, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export interface ReturItem {
  productId: string;
  nama: string;
  qty: number;
  harga: number;
  satuan: string;
  subtotal: number;
}

export interface ReturnFormConfig {
  type: 'purchase' | 'sale';
  title: string;
  subtitle: string;
  partnerLabel: string; // "Supplier" or "Customer"
  alertColor: 'destructive' | 'warning'; // destructive for purchase, warning for sale
  alertText: string;
  priceFieldName: 'buyPrice' | 'sellPrice';
  successColorClass: string; // 'text-destructive' or 'text-warning'
  successBgClass: string; // 'bg-destructive/10' or 'bg-warning/10'
  summaryColorClass: string; // 'text-destructive' or 'text-warning'
  summaryBgClass: string; // 'bg-destructive/10' or 'bg-warning/10'
}

interface ReturnTransactionFormProps {
  config: ReturnFormConfig;
  partners: any[];
  products: Product[];
  items: ReturItem[];
  selectedPartner: string;
  selectedProduct: string;
  qty: string;
  alasan: string;
  catatan: string;
  returDate: string;
  metodeKembalian: string;
  confirmOpen: boolean;
  isLoading: boolean;
  onItemsChange: (items: ReturItem[]) => void;
  onSelectedPartnerChange: (id: string) => void;
  onSelectedProductChange: (id: string) => void;
  onQtyChange: (qty: string) => void;
  onAlasanChange: (alasan: string) => void;
  onCatananChange: (catatan: string) => void;
  onReturDateChange: (date: string) => void;
  onMetodeKembalianChange: (metode: string) => void;
  onConfirmOpenChange: (open: boolean) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onReset: () => void;
  onSave: () => void;
  onConfirmSave: () => Promise<void>;
}

export const ReturnTransactionForm = ({
  config,
  partners,
  products,
  items,
  selectedPartner,
  selectedProduct,
  qty,
  alasan,
  catatan,
  returDate,
  metodeKembalian,
  confirmOpen,
  isLoading,
  onItemsChange,
  onSelectedPartnerChange,
  onSelectedProductChange,
  onQtyChange,
  onAlasanChange,
  onCatananChange,
  onReturDateChange,
  onMetodeKembalianChange,
  onConfirmOpenChange,
  onAddItem,
  onRemoveItem,
  onReset,
  onSave,
  onConfirmSave,
}: ReturnTransactionFormProps) => {
  const { toast } = useToast();
  const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return toast({ title: 'Pilih produk', variant: 'destructive' });
    const qtyNum = parseInt(qty) || 1;
    if (qtyNum <= 0) return toast({ title: 'Qty harus > 0', variant: 'destructive' });

    // Check if product already in items
    const existingIdx = items.findIndex(i => i.productId === product.id);
    const priceFieldName = config.priceFieldName as keyof Product;
    const price = (product[priceFieldName] as number) || 0;
    
    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].qty += qtyNum;
      updated[existingIdx].subtotal = updated[existingIdx].qty * updated[existingIdx].harga;
      onItemsChange(updated);
    } else {
      onItemsChange([...items, {
        productId: product.id,
        nama: product.name,
        qty: qtyNum,
        harga: price,
        satuan: product.unit,
        subtotal: price * qtyNum,
      }]);
    }

    onSelectedProductChange('');
    onQtyChange('1');
    toast({ title: `${product.name} ditambahkan` });
  };

  return (
    <>
      <Alert className={config.alertColor === 'destructive' ? 'mb-4 border-destructive/30 bg-destructive/5' : 'mb-4 border-warning/30 bg-warning/5'}>
        <AlertTriangle className={config.alertColor === 'destructive' ? 'h-4 w-4 text-destructive' : 'h-4 w-4 text-warning'} />
        <AlertDescription className={config.alertColor === 'destructive' ? 'text-sm text-destructive' : 'text-sm text-warning'}>
          {config.alertText}
        </AlertDescription>
      </Alert>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="h-4 w-4" />
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Partner Selection */}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tanggal</Label>
                  <Input
                    type="date"
                    value={returDate}
                    onChange={e => onReturDateChange(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">{config.partnerLabel} *</Label>
                  <Select value={selectedPartner} onValueChange={onSelectedPartnerChange}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder={`Pilih ${config.partnerLabel.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reason Selection */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Alasan Retur *</Label>
                  <Select value={alasan} onValueChange={onAlasanChange}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Pilih alasan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rusak">Barang Rusak</SelectItem>
                      <SelectItem value="kadaluarsa">Kadaluarsa</SelectItem>
                      <SelectItem value="tidak_sesuai">Tidak Sesuai Pesanan</SelectItem>
                      <SelectItem value="kelebihan">Kelebihan Order</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Selection */}
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Pilih Barang Retur
                </p>
                <div className="grid gap-2 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <Select value={selectedProduct} onValueChange={onSelectedProductChange}>
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    value={qty}
                    onChange={e => onQtyChange(e.target.value)}
                    placeholder="Qty"
                    className="text-xs h-8"
                    min="1"
                  />
                  <Button onClick={handleAddItem} size="sm" className="h-8 text-xs">
                    <Plus className="mr-1 h-3.5 w-3.5" />Tambah
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-3 py-2 text-left w-8">No</th>
                      <th className="px-3 py-2 text-left">Produk</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Harga</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          Belum ada barang retur
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className="border-b text-sm">
                          <td className="px-3 py-2 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">
                            {item.nama}
                            <p className="text-xs text-muted-foreground">{item.satuan}</p>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{item.qty}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-xs">{formatRupiah(item.harga)}</td>
                          <td className={`px-3 py-2 text-right font-semibold tabular-nums ${config.summaryColorClass}`}>
                            {formatRupiah(item.subtotal)}
                          </td>
                          <td className="px-3 py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => onRemoveItem(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan Retur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Item</span>
                <span>{items.length} produk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Qty</span>
                <span className="tabular-nums">{totalQty}</span>
              </div>
              <div className={`rounded-lg border ${config.summaryBgClass} p-3`}>
                <p className="text-xs text-muted-foreground">Total Nilai Retur</p>
                <p className={`text-xl font-bold ${config.summaryColorClass} tabular-nums`}>{formatRupiah(totalNilai)}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Metode Pengembalian *</Label>
                <Select value={metodeKembalian} onValueChange={onMetodeKembalianChange}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Pengembalian Tunai</SelectItem>
                    <SelectItem value="potong_piutang">Potong Piutang</SelectItem>
                    <SelectItem value="tukar_barang">Tukar Barang</SelectItem>
                    <SelectItem value="kredit_nota">Kredit Nota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Catatan</Label>
                <Input
                  value={catatan}
                  onChange={e => onCatananChange(e.target.value)}
                  placeholder="Catatan retur..."
                  className="text-xs h-8"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-sm"
                  onClick={onReset}
                >
                  Reset
                </Button>
                <Button
                  className="flex-1 h-9 text-sm"
                  onClick={onSave}
                  disabled={items.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={onConfirmOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Retur {config.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Retur senilai <strong>{formatRupiah(totalNilai)}</strong> akan diproses.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmSave}>Ya, Proses Retur</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Success Screen Component
interface ReturnSuccessScreenProps {
  title: string;
  subtitle: string;
  returNumber: string;
  totalNilai: number;
  config: ReturnFormConfig;
  onPrint: () => Promise<void>;
  onNewReturn: () => void;
}

export const ReturnSuccessScreen = ({
  title,
  subtitle,
  returNumber,
  totalNilai,
  config,
  onPrint,
  onNewReturn,
}: ReturnSuccessScreenProps) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      await onPrint();
      toast({ title: 'PDF berhasil dibuka', description: 'Dokumen dibuka di tab baru' });
    } catch (error) {
      toast({ title: 'Gagal mencetak', description: 'Terjadi kesalahan saat mencetak dokumen', variant: 'destructive' });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className={`flex h-20 w-20 items-center justify-center rounded-full ${config.successBgClass}`}>
        <CheckCircle2 className={`h-10 w-10 ${config.successColorClass}`} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1">
          No. Retur: <span className="font-mono font-semibold text-primary">{returNumber}</span>
        </p>
        <p className={`text-3xl font-bold ${config.successColorClass} mt-3`}>{formatRupiah(totalNilai)}</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onNewReturn}>Retur Baru</Button>
        <Button onClick={handlePrint} variant="outline" disabled={isPrinting}>
          <Printer className="h-4 w-4 mr-1.5" />{isPrinting ? 'Mencetak...' : 'Cetak PDF'}
        </Button>
      </div>
    </div>
  );
};

import * as React from 'react';

export default ReturnTransactionForm;
