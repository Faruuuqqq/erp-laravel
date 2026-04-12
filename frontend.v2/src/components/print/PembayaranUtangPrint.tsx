import type { Transaction } from '@/types';
import { PrintLayout } from './PrintLayout';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PembayaranUtangPrintProps {
  transaction: Transaction;
}

export const PembayaranUtangPrint = ({ transaction }: PembayaranUtangPrintProps) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'dd MMMM yyyy', { locale: id });

  return (
    <PrintLayout
      title="BUKTI PEMBAYARAN UTANG"
      noRef={transaction.invoiceNumber}
      date={transaction.date}
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Supplier</p>
            <p className="text-lg font-bold">{transaction.supplier || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 uppercase font-semibold">Nomor Bukti</p>
            <p className="text-lg font-mono">{transaction.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Tanggal Pembayaran</p>
            <p className="font-medium">{formatDate(transaction.date)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 uppercase font-semibold">Status</p>
            <p className={`font-bold ${transaction.paymentStatus === 'lunas' ? 'text-green-600' : 'text-orange-600'}`}>
              {transaction.paymentStatus === 'lunas' ? 'LUNAS' : 'SEBAGIAN'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300" />

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="font-bold uppercase text-sm">Detail Pembayaran</h3>
          
          <div className="bg-gray-50 p-4 rounded space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jumlah Dibayarkan:</span>
              <span className="font-bold text-lg">{formatCurrency(transaction.paid)}</span>
            </div>
            
            {transaction.remaining > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sisa Utang:</span>
                <span className="font-bold text-orange-600">{formatCurrency(transaction.remaining)}</span>
              </div>
            )}
            
            <div className="border-t pt-3 flex justify-between text-sm">
              <span className="text-gray-600">Total Utang:</span>
              <span className="font-bold">{formatCurrency(transaction.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {transaction.notes && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Catatan</p>
            <p className="text-sm bg-gray-50 p-3 rounded italic">{transaction.notes}</p>
          </div>
        )}

        {/* Transaction Items (if any) */}
        {transaction.items && transaction.items.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Rincian Pelunasan Utang</p>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">No</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Produk</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Qty</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Harga</th>
                  <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 px-2 py-1">{idx + 1}</td>
                    <td className="border border-gray-300 px-2 py-1">{item.productName}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{item.quantity}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(item.price)}</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-xs text-gray-500 italic pt-4">
          Dokumen ini merupakan bukti resmi pembayaran utang. Mohon disimpan dengan baik.
        </div>
      </div>
    </PrintLayout>
  );
};

export default PembayaranUtangPrint;
