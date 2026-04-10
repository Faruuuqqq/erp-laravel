import React from 'react';
import { PrintLayout } from './PrintLayout';
import type { Transaction, TransactionDetail } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ReturPembelianPrintProps {
  transaction: Transaction;
}

export const ReturPembelianPrint = ({ transaction }: ReturPembelianPrintProps) => {
  return (
    <PrintLayout title="Surat Retur Pembelian" noRef={transaction.invoiceNumber} date={transaction.date}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-md font-bold underline mb-2">Kepada Yth,</h3>
          <p className="font-semibold">{transaction.supplier || 'Supplier'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">No. Referensi Pembelian: {transaction.invoiceNumber}</p>
          <p className="text-sm font-bold">SURAT RETUR BARANG KE DISTRIBUTOR</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th className="w-10">No</th>
            <th>Nama Barang</th>
            <th className="text-center w-24">Qty Retur</th>
            <th className="text-right w-32">Harga Sat.</th>
            <th className="text-right w-36">Subtotal</th>
            <th>Alasan</th>
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
              <td className="text-sm text-gray-500">-</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="text-right font-bold py-2">Total Retur</td>
            <td className="text-right font-bold text-lg">{formatCurrency(Number(transaction.total))}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6 text-xs">
        <p className="font-bold underline">Alasan Retur:</p>
        <p className="mt-1">{transaction.notes || 'Barang tidak sesuai / rusak / kelebihan order.'}</p>
      </div>

      <div className="mt-8 text-xs">
        <p className="font-bold underline">Permintaan:</p>
        <p className="mt-1">Mohon agar saldo utang kami dikurangi sesuai nilai retur di atas, atau penggantian barang baru.</p>
      </div>
    </PrintLayout>
  );
};

export default ReturPembelianPrint;
