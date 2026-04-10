import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface KartuStokEntry {
  tanggal: string;
  keterangan: string;
  masuk: number;
  keluar: number;
  saldo: number;
  referensi?: string;
}

interface KartuStokPrintProps {
  productName: string;
  productCode: string;
  satuan?: string;
  periodFrom?: string;
  periodTo?: string;
  entries: KartuStokEntry[];
  hargaBeli?: number;
  printedBy?: string;
}

export const KartuStokPrint = ({
  productName, productCode, satuan, periodFrom, periodTo,
  entries, hargaBeli, printedBy
}: KartuStokPrintProps) => {
  const now = format(new Date(), 'dd MMMM yyyy HH:mm', { locale: localeId });
  const formatPeriod = (d?: string) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: localeId }) : '-';

  const lastEntry = entries[entries.length - 1];
  const saldoAkhir = lastEntry?.saldo ?? 0;

  return (
    <div className="print-document p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">KARTU STOK</h1>
          <p className="text-sm text-gray-500">Dicetak: {now}</p>
          {printedBy && <p className="text-sm text-gray-500">Oleh: {printedBy}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm">Periode: {formatPeriod(periodFrom)} s/d {formatPeriod(periodTo)}</p>
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-4 p-3 border rounded grid grid-cols-2 gap-2 text-sm">
        <div><span className="text-gray-500">Kode Produk</span><p className="font-bold font-mono">{productCode}</p></div>
        <div><span className="text-gray-500">Nama Produk</span><p className="font-bold">{productName}</p></div>
        <div><span className="text-gray-500">Satuan</span><p>{satuan ?? '-'}</p></div>
        {hargaBeli !== undefined && (
          <div><span className="text-gray-500">Harga Beli</span><p className="font-semibold">{formatCurrency(hargaBeli)}</p></div>
        )}
      </div>

      {/* Stock Movement Table */}
      <table>
        <thead>
          <tr>
            <th className="text-center w-24">Tanggal</th>
            <th>Keterangan</th>
            <th>Referensi</th>
            <th className="text-center w-20">Masuk</th>
            <th className="text-center w-20">Keluar</th>
            <th className="text-center w-24 font-bold">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-4 text-gray-500">Tidak ada mutasi stok dalam periode ini</td></tr>
          ) : entries.map((entry, idx) => (
            <tr key={idx}>
              <td className="text-center text-sm">
                {entry.tanggal ? format(new Date(entry.tanggal), 'dd/MM/yy') : '-'}
              </td>
              <td className="text-sm">{entry.keterangan}</td>
              <td className="font-mono text-xs text-gray-500">{entry.referensi ?? '-'}</td>
              <td className="text-center text-green-700 font-semibold">
                {entry.masuk > 0 ? entry.masuk.toLocaleString('id-ID') : '-'}
              </td>
              <td className="text-center text-red-600 font-semibold">
                {entry.keluar > 0 ? entry.keluar.toLocaleString('id-ID') : '-'}
              </td>
              <td className="text-center font-bold text-blue-700">
                {entry.saldo.toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-right font-bold py-2">SALDO AKHIR</td>
            <td className="text-center font-bold text-lg text-blue-700">{saldoAkhir.toLocaleString('id-ID')}</td>
          </tr>
          {hargaBeli !== undefined && (
            <tr>
              <td colSpan={5} className="text-right font-bold py-1">NILAI PERSEDIAAN</td>
              <td className="text-center font-bold">{formatCurrency(saldoAkhir * hargaBeli)}</td>
            </tr>
          )}
        </tfoot>
      </table>

      <div className="mt-6 text-xs text-gray-500 text-center">
        --- Kartu stok dicetak otomatis oleh sistem ERP. Perubahan stok hanya valid jika ada dokumen pendukung. ---
      </div>
    </div>
  );
};

export default KartuStokPrint;
