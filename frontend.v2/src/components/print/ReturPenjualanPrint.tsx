import React from 'react';
import { PrintLayout } from './PrintLayout';
import type { Transaction, TransactionDetail } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ReturPenjualanPrintProps {
  transaction: Transaction;
}

export const ReturPenjualanPrint = ({ transaction }: ReturPenjualanPrintProps) => {
  return (
    <PrintLayout title="Surat Terima Retur Penjualan" noRef={transaction.invoiceNumber} date={transaction.date}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-md font-bold underline mb-2">Diterima Dari,</h3>
          <p className="font-semibold">{transaction.customer || 'Customer'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">SURAT TERIMA RETUR DARI CUSTOMER</p>
          <p className="text-sm">Ref. Penjualan: {transaction.invoiceNumber}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th className="w-10">No</th>
            <th>Nama Barang</th>
            <th className="text-center w-24">Qty Retur</th>
            <th className="text-right w-32">Harga Sat.</th>
            <th className="text-right w-36">Nilai Retur</th>
            <th>Kondisi</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items?.map((item: TransactionDetail, idx: number) => (
            <tr key={item.id}>
              <td className="text-center">{idx + 1}</td>
              <td>{item.productName}</td>
              <td className="text-center font-bold">{item.quantity}</td>
              <td className="text-right">{formatCurrency(Number(item.price))}</td>
              <td className="text-right font-semibold">{formatCurrency(Number(item.subtotal))}</td>
              <td className="text-sm text-gray-500">Baik</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="text-right font-bold py-2">Total Nilai Retur</td>
            <td className="text-right font-bold text-lg">{formatCurrency(Number(transaction.total))}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6 text-xs">
        <p className="font-bold underline">Keterangan:</p>
        <p className="mt-1">{transaction.notes || 'Barang retur telah diterima dan stok telah disesuaikan.'}</p>
      </div>

      <div className="mt-6 text-xs">
        <p className="font-bold underline">Tindak Lanjut:</p>
        <p className="mt-1">Nilai retur akan dikurangi dari saldo piutang customer yang bersangkutan.</p>
      </div>
    </PrintLayout>
  );
};

export default ReturPenjualanPrint;
