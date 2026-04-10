import React from 'react';
import { PrintLayout } from './PrintLayout';
import { Transaction, TransactionDetail } from '@/types';

interface SuratJalanPrintProps {
  transaction: Transaction;
}

export const SuratJalanPrint = ({ transaction }: SuratJalanPrintProps) => {
  return (
    <PrintLayout title="Surat Jalan" noRef={transaction.invoiceNumber} date={transaction.date}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-md font-bold underline mb-2">Penerima,</h3>
          <p className="font-semibold">{transaction.customer || 'Customer Umum'}</p>
          <p className="text-sm">Alamat: {transaction.notes || '-'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Gudang Pengirim: {transaction.salesId || '-'}</p>
          <p className="text-sm font-bold">Harap diterima barang-barang tersebut di bawah ini dalam keadaan baik dan cukup.</p>
        </div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th className="w-10">No</th>
            <th>Nama Barang</th>
            <th className="text-center w-32">Qty</th>
            <th className="text-center w-32">Satuan</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items?.map((item: TransactionDetail, idx: number) => (
            <tr key={item.id}>
              <td className="text-center">{idx + 1}</td>
              <td>{item.productName}</td>
              <td className="text-center font-bold text-lg">{item.quantity}</td>
              <td className="text-center">PCS / UNIT</td>
              <td>-</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-xs">
        <p className="font-bold underline">Catatan:</p>
        <p className="mt-1">Barang telah diterima dalam kondisi baik. Segala bentuk komplain setelah surat jalan ditandatangani tidak dapat dilayani kecuali ada perjanjian tertulis sebelumnya.</p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-8 text-center">
        <div>
          <p>Diterima Oleh,</p>
          <div className="signature-box mt-16">Customer / Penerima</div>
        </div>
        <div>
          <p>Pengirim / Sopir,</p>
          <div className="signature-box mt-16">Ekspedisi / Driver</div>
        </div>
        <div>
          <p>Hormat Kami,</p>
          <div className="signature-box mt-16">Gudang / Petugas</div>
        </div>
      </div>
    </PrintLayout>
  );
};

export default SuratJalanPrint;
