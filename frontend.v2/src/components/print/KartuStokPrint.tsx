import React from 'react';
import { PrintLayout } from './PrintLayout';
import { formatCurrency } from '@/lib/utils';

interface PrintEntry {
  tanggal: string;
  keterangan: string;
  referensi: string;
  masuk: number;
  keluar: number;
  saldo: number;
}

interface KartuStokPrintProps {
  productName: string;
  productCode: string;
  satuan?: string;
  periodFrom?: string;
  periodTo?: string;
  entries: PrintEntry[];
  hargaBeli?: number;
}

/**
 * Print template for Kartu Stok (Stock Card)
 * Displays product info, period filters, and detailed stock mutations with running balance
 */
export const KartuStokPrint = ({
  productName,
  productCode,
  satuan,
  periodFrom,
  periodTo,
  entries,
  hargaBeli,
}: KartuStokPrintProps) => {
  // Format date for display
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID');
    } catch {
      return dateStr;
    }
  };

  // Calculate totals from entries
  const totalMasuk = entries.reduce((sum, e) => sum + e.masuk, 0);
  const totalKeluar = entries.reduce((sum, e) => sum + e.keluar, 0);
  const finalBalance = entries.length > 0 ? entries[entries.length - 1].saldo : 0;

  return (
    <PrintLayout title="Kartu Stok" date={new Date().toISOString()}>
      {/* Product Header */}
      <div className="mb-6 pb-4 border-b">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Nama Produk</p>
            <p className="text-lg font-bold">{productName}</p>
            <p className="text-sm text-gray-600 mt-1">Kode: {productCode}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Satuan</p>
            <p className="text-lg font-bold">{satuan || '-'}</p>
            {hargaBeli !== undefined && (
              <p className="text-sm text-gray-600 mt-1">Harga Beli: {formatCurrency(hargaBeli)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Period Info */}
      {(periodFrom || periodTo) && (
        <div className="mb-4 text-xs text-gray-600">
          <p>
            Periode: {formatDate(periodFrom)} s/d {formatDate(periodTo)}
          </p>
        </div>
      )}

      {/* Stock Mutations Table */}
      <table className="print-table">
        <thead>
          <tr>
            <th className="w-12 text-center">No</th>
            <th className="w-20">Tanggal</th>
            <th>Keterangan</th>
            <th className="w-20 text-center">No. Referensi</th>
            <th className="w-16 text-right">Masuk</th>
            <th className="w-16 text-right">Keluar</th>
            <th className="w-16 text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={`${entry.tanggal}-${idx}`} className={idx === 0 ? 'italic bg-gray-50' : ''}>
              <td className="text-center text-xs">{idx === 0 ? '-' : idx}</td>
              <td className="text-sm">{formatDate(entry.tanggal)}</td>
              <td className="text-sm">{entry.keterangan}</td>
              <td className="text-center text-xs font-mono">{entry.referensi || '-'}</td>
              <td className="text-right text-sm">
                {entry.masuk > 0 ? entry.masuk : '-'}
              </td>
              <td className="text-right text-sm">
                {entry.keluar > 0 ? entry.keluar : '-'}
              </td>
              <td className="text-right font-semibold text-sm tabular-nums">{entry.saldo}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-bold border-t-2">
            <td colSpan={4} className="text-right text-sm py-2">
              TOTAL PERIODE
            </td>
            <td className="text-right text-sm py-2">+{totalMasuk}</td>
            <td className="text-right text-sm py-2">-{totalKeluar}</td>
            <td className="text-right text-sm py-2 tabular-nums">{finalBalance}</td>
          </tr>
        </tfoot>
      </table>

      {/* Notes */}
      <div className="mt-6 text-xs text-gray-600">
        <p>
          <span className="font-bold">Keterangan:</span> Saldo Awal menunjukkan stok pada awal periode. Setiap baris menampilkan
          pergerakan stok dengan saldo running balance untuk referensi audit.
        </p>
      </div>
    </PrintLayout>
  );
};

export default KartuStokPrint;
