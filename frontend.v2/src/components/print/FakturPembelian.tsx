import React from 'react';
import { PrintLayout } from './PrintLayout';
import type { Transaction, TransactionDetail } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface FakturPembelianProps {
  transaction: Transaction;
}

export const FakturPembelian = ({ transaction }: FakturPembelianProps) => {
  return (
    <PrintLayout title="Faktur Pembelian" noRef={transaction.invoiceNumber} date={transaction.date}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-md font-bold underline mb-2">Dari Supplier,</h3>
          <p className="font-semibold">{transaction.supplier || 'Supplier'}</p>
          <p className="text-sm">Alamat: {transaction.notes || '-'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Gudang Tujuan: {transaction.notes || '-'}</p>
          <p className="text-sm uppercase font-bold text-lg">PEMBELIAN</p>
        </div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th className="w-10">No</th>
            <th>Nama Barang</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Harga Beli</th>
            <th className="text-right">Diskon</th>
            <th className="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items?.map((item: TransactionDetail, idx: number) => (
            <tr key={item.id}>
              <td className="text-center">{idx + 1}</td>
              <td>{item.productName}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{formatCurrency(Number(item.price))}</td>
              <td className="text-right">{item.discount > 0 ? formatCurrency(Number(item.discount)) : '-'}</td>
              <td className="text-right font-semibold">{formatCurrency(Number(item.subtotal))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-right font-bold py-2 border-none">Subtotal</td>
            <td className="text-right font-bold py-2 border-b-2">{formatCurrency(Number(transaction.subtotal))}</td>
          </tr>
          {Number(transaction.discount) > 0 && (
            <tr>
              <td colSpan={5} className="text-right font-bold py-2 border-none">Potongan/Diskon</td>
              <td className="text-right font-bold py-2 border-b-2">-{formatCurrency(Number(transaction.discount))}</td>
            </tr>
          )}
          {Number(transaction.tax) > 0 && (
            <tr>
              <td colSpan={5} className="text-right font-bold py-2 border-none">PPN</td>
              <td className="text-right font-bold py-2 border-b-2">{formatCurrency(Number(transaction.tax))}</td>
            </tr>
          )}
          <tr>
            <td colSpan={5} className="text-right font-bold py-2 border-none text-xl">TOTAL AKHIR</td>
            <td className="text-right font-bold py-2 border-b-2 text-xl">{formatCurrency(Number(transaction.total))}</td>
          </tr>
          <tr>
            <td colSpan={5} className="text-right font-bold py-2 border-none">Bayar</td>
            <td className="text-right font-bold py-2 border-none">{formatCurrency(Number(transaction.paid))}</td>
          </tr>
          <tr>
            <td colSpan={5} className="text-right font-bold py-2 border-none">Sisa / Utang</td>
            <td className="text-right font-bold py-2 border-none text-destructive">
              {formatCurrency(Number(transaction.total) - Number(transaction.paid))}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6">
        <p className="text-sm font-bold">Terbilang:</p>
        <p className="text-sm italic font-serif"># {terbilang(Number(transaction.total))} Rupiah #</p>
      </div>

      <div className="mt-8 text-xs">
        <p className="font-bold underline">Catatan:</p>
        <ul className="list-disc ml-4 mt-1">
          <li>Barang yang diterima harus sesuai dengan PO/faktur.</li>
          <li>Lapor segera jika ada kerusakan atau ketidaksesuaian barang.</li>
          <li>Pembayaran sesuai dengan kesepakatan tertulis.</li>
        </ul>
      </div>
    </PrintLayout>
  );
};

// Helper function to convert number to Indonesian words
function terbilang(n: number): string {
  if (n < 0) return 'Minus ' + terbilang(-n);
  if (n < 12) return ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'][n];
  if (n < 20) return terbilang(n - 10) + ' Belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
  if (n < 200) return 'Seratus ' + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
  if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta ' + terbilang(n % 1000000);
  return n.toString();
}

export default FakturPembelian;
