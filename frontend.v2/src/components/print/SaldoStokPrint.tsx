import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface SaldoStokItem {
  kode: string;
  nama: string;
  kategori: string;
  gudang: string;
  saldo: number;
  satuan: string;
  hargaBeli: number;
  nilaiPersediaan: number;
}

interface SaldoStokPrintProps {
  items: SaldoStokItem[];
  filterKategori?: string;
  filterGudang?: string;
  printedBy?: string;
}

export const SaldoStokPrint = ({ items, filterKategori, filterGudang, printedBy }: SaldoStokPrintProps) => {
  const totalNilai = items.reduce((s, i) => s + i.nilaiPersediaan, 0);
  const now = format(new Date(), 'dd MMMM yyyy HH:mm', { locale: localeId });

  return (
    <div className="print-document p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">LAPORAN SALDO STOK</h1>
        <p className="text-sm text-gray-600">Per: {now}</p>
        {filterKategori && <p className="text-sm">Kategori: {filterKategori}</p>}
        {filterGudang && <p className="text-sm">Gudang: {filterGudang}</p>}
        {printedBy && <p className="text-sm text-gray-500">Dicetak oleh: {printedBy}</p>}
      </div>

      <table>
        <thead>
          <tr>
            <th className="w-10">No</th>
            <th>Kode</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th>Gudang</th>
            <th className="text-center">Saldo Stok</th>
            <th className="text-center">Satuan</th>
            <th className="text-right">Harga Beli</th>
            <th className="text-right">Nilai Persediaan</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={9} className="text-center py-4 text-gray-500">Tidak ada data stok</td></tr>
          ) : items.map((item, idx) => (
            <tr key={idx}>
              <td className="text-center">{idx + 1}</td>
              <td className="font-mono text-xs">{item.kode}</td>
              <td>{item.nama}</td>
              <td className="text-sm">{item.kategori}</td>
              <td className="text-sm">{item.gudang}</td>
              <td className="text-center font-bold">{item.saldo.toLocaleString('id-ID')}</td>
              <td className="text-center text-sm">{item.satuan}</td>
              <td className="text-right text-sm">{formatCurrency(item.hargaBeli)}</td>
              <td className="text-right font-semibold">{formatCurrency(item.nilaiPersediaan)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={8} className="text-right font-bold text-base py-2">TOTAL NILAI PERSEDIAAN</td>
            <td className="text-right font-bold text-base text-blue-700">{formatCurrency(totalNilai)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6 text-xs text-gray-500 text-center">
        --- Laporan saldo stok dicetak otomatis oleh sistem ERP ---
      </div>
    </div>
  );
};

export default SaldoStokPrint;
