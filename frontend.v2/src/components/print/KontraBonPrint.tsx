import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface KontraBonItem {
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  total: number;
  paid: number;
  remaining: number;
}

interface KontraBonPrintProps {
  customerName: string;
  items: KontraBonItem[];
  printedBy?: string;
}

export const KontraBonPrint = ({ customerName, items, printedBy }: KontraBonPrintProps) => {
  const totalOutstanding = items.reduce((s, i) => s + i.remaining, 0);
  const now = format(new Date(), 'dd MMMM yyyy', { locale: localeId });

  return (
    <div className="print-document p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">KONTRA BON</h1>
          <p className="text-sm text-gray-600">Daftar Faktur Belum Lunas</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Tanggal Cetak: {now}</p>
          {printedBy && <p className="text-sm">Dicetak oleh: {printedBy}</p>}
        </div>
      </div>

      <div className="mb-4 p-3 border rounded">
        <p className="text-sm font-bold">Customer: <span className="text-base">{customerName}</span></p>
      </div>

      <table>
        <thead>
          <tr>
            <th className="w-10">No</th>
            <th>No. Faktur</th>
            <th className="text-center">Tgl. Faktur</th>
            <th className="text-center">Jatuh Tempo</th>
            <th className="text-right">Jumlah</th>
            <th className="text-right">Sudah Bayar</th>
            <th className="text-right">Sisa</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="text-center">{idx + 1}</td>
              <td className="font-mono text-sm">{item.invoiceNumber}</td>
              <td className="text-center text-sm">{item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '-'}</td>
              <td className="text-center text-sm">{item.dueDate ? format(new Date(item.dueDate), 'dd/MM/yyyy') : '-'}</td>
              <td className="text-right">{formatCurrency(item.total)}</td>
              <td className="text-right">{formatCurrency(item.paid)}</td>
              <td className="text-right font-bold text-red-600">{formatCurrency(item.remaining)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} className="text-right font-bold text-base py-2">TOTAL OUTSTANDING</td>
            <td className="text-right font-bold text-base text-red-600">{formatCurrency(totalOutstanding)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p className="font-bold underline mb-2">Catatan:</p>
          <p>Harap segera melunasi tagihan di atas sebelum jatuh tempo.</p>
        </div>
        <div className="text-center">
          <p>Hormat Kami,</p>
          <div className="mt-16 border-t border-gray-600 pt-1">Admin / Finance</div>
        </div>
      </div>
    </div>
  );
};

export default KontraBonPrint;
