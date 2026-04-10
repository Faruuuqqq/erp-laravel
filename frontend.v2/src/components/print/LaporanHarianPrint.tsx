import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface LaporanHarianPrintProps {
  date: string;
  summary: {
    penjualanTunai: number;
    penjualanKredit: number;
    penerimaanPiutang: number;
    totalPembelian: number;
    pembayaranUtang: number;
    biayaJasa: number;
    saldoKas: number;
  };
  transactions: Array<{
    invoiceNumber: string;
    type: string;
    description: string;
    amount: number;
  }>;
  printedBy?: string;
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    penjualan_tunai: 'Penjualan Tunai',
    penjualan_kredit: 'Penjualan Kredit',
    pembayaran_piutang: 'Penerimaan Piutang',
    pembelian: 'Pembelian',
    pembayaran_utang: 'Pembayaran Utang',
    expense: 'Biaya / Jasa',
  };
  return map[type] ?? type;
};

export const LaporanHarianPrint = ({ date, summary, transactions, printedBy }: LaporanHarianPrintProps) => {
  const formattedDate = date ? format(new Date(date), 'dd MMMM yyyy', { locale: localeId }) : '--';

  return (
    <div className="print-document p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">LAPORAN HARIAN</h1>
        <p className="text-lg font-semibold mt-1">Tanggal: {formattedDate}</p>
        {printedBy && <p className="text-sm text-gray-500">Dicetak oleh: {printedBy}</p>}
      </div>

      {/* Summary */}
      <h2 className="font-bold text-base border-b pb-1 mb-3">Ringkasan Transaksi</h2>
      <table>
        <tbody>
          <tr><td className="py-1">Penjualan Tunai</td><td className="text-right font-semibold text-green-700">{formatCurrency(summary.penjualanTunai)}</td></tr>
          <tr><td className="py-1">Penjualan Kredit</td><td className="text-right font-semibold text-green-700">{formatCurrency(summary.penjualanKredit)}</td></tr>
          <tr><td className="py-1">Penerimaan Piutang</td><td className="text-right font-semibold text-blue-700">{formatCurrency(summary.penerimaanPiutang)}</td></tr>
          <tr><td className="py-1">Total Pembelian</td><td className="text-right font-semibold text-red-600">({formatCurrency(summary.totalPembelian)})</td></tr>
          <tr><td className="py-1">Pembayaran Utang</td><td className="text-right font-semibold text-red-600">({formatCurrency(summary.pembayaranUtang)})</td></tr>
          <tr><td className="py-1">Biaya / Jasa</td><td className="text-right font-semibold text-red-600">({formatCurrency(summary.biayaJasa)})</td></tr>
          <tr className="border-t-2 border-gray-800">
            <td className="py-2 font-bold text-base">SALDO KAS HARI INI</td>
            <td className="text-right font-bold text-base text-blue-700">{formatCurrency(summary.saldoKas)}</td>
          </tr>
        </tbody>
      </table>

      {/* Detail */}
      <h2 className="font-bold text-base border-b pb-1 mb-3 mt-8">Detail Transaksi</h2>
      <table>
        <thead>
          <tr>
            <th>No. Transaksi</th>
            <th>Jenis</th>
            <th>Keterangan</th>
            <th className="text-right">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr><td colSpan={4} className="text-center text-gray-500 py-4">Tidak ada transaksi</td></tr>
          ) : transactions.map((t, idx) => (
            <tr key={idx}>
              <td className="font-mono text-xs">{t.invoiceNumber}</td>
              <td className="text-sm">{typeLabel(t.type)}</td>
              <td className="text-sm">{t.description}</td>
              <td className="text-right font-semibold">{formatCurrency(t.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-xs text-gray-500 text-center">
        --- Laporan ini dicetak secara otomatis oleh sistem ERP ---
      </div>
    </div>
  );
};

export default LaporanHarianPrint;
