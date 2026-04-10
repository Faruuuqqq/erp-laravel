import { usePrintExport } from '@/hooks/usePrintExport';
import type { DocumentTemplateProps } from '@/types/print';

/**
 * Pembelian (Purchase Order/Invoice) Formal Template
 */
export const PembelianTemplate = ({
  data,
  showDraftBadge = false,
}: DocumentTemplateProps) => {
  const { formatDate, formatCurrency } = usePrintExport();
  const today = formatDate(data.date || new Date());

  return (
    <div className="pembelian-template">
      {/* HEADER */}
      <div className="document-header">
        <h1>BUKTI PEMBELIAN</h1>
        <p className="company-name">TokoSync ERP - Sistem Manajemen Toko</p>
      </div>

      {/* DOCUMENT META INFO */}
      <div className="document-meta mb-4">
        <div className="meta-item">
          <span className="meta-label">No. Pembelian:</span>
          <span className="meta-value font-mono font-bold">
            {data.documentNumber || '(belum disimpan)'}
            {showDraftBadge && <span className="draft-badge">DRAFT</span>}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Tanggal:</span>
          <span className="meta-value">{today}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Status:</span>
          <span className="meta-value">
            {data.isSaved ? 'DISIMPAN' : 'DRAFT'}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Warehouse:</span>
          <span className="meta-value">{data.warehouse?.name || '-'}</span>
        </div>
      </div>

      {/* SUPPLIER INFO */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm avoid-break">
        <div className="p-2 border border-gray-200 rounded">
          <p className="font-bold mb-1 text-xs uppercase">Pemasok</p>
          <p className="text-xs font-semibold mb-1">{data.supplier?.name || '-'}</p>
          <p className="text-xs mb-1">{data.supplier?.address || '-'}</p>
          {data.supplier?.phone && (
            <p className="text-xs">Telepon: {data.supplier.phone}</p>
          )}
        </div>
        <div className="p-2 border border-gray-200 rounded">
          <p className="font-bold mb-1 text-xs uppercase">Tujuan Warehouse</p>
          <p className="text-xs font-semibold mb-1">{data.warehouse?.name || '-'}</p>
          <p className="text-xs">{data.warehouse?.address || '-'}</p>
        </div>
      </div>

      <hr className="mb-4" />

      {/* ITEMS TABLE */}
      <table className="items-table mb-4">
        <thead>
          <tr>
            <th style={{ width: '5%' }}>No</th>
            <th style={{ width: '40%' }}>Nama Barang</th>
            <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Harga Satuan</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.items.length > 0 ? (
            data.items.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td className="font-semibold">{item.nama}</td>
                <td style={{ textAlign: 'center' }} className="numeric">
                  {item.qty} {item.satuan}
                </td>
                <td style={{ textAlign: 'right' }} className="currency">
                  {item.harga ? formatCurrency(item.harga) : '-'}
                </td>
                <td style={{ textAlign: 'right' }} className="currency font-semibold">
                  {item.subtotal ? formatCurrency(item.subtotal) : '-'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }} className="text-muted">
                Belum ada barang ditambahkan
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* FINANCIAL SUMMARY */}
      <div className="summary-section mb-4 avoid-break">
        <div />
        <div>
          <div className="summary-item border-b pb-2">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-value currency">
              {data.subtotal ? formatCurrency(data.subtotal) : formatCurrency(0)}
            </span>
          </div>
          {data.discount !== undefined && data.discount > 0 && (
            <div className="summary-item border-b pb-2">
              <span className="summary-label">Diskon:</span>
              <span className="summary-value currency">-{formatCurrency(data.discount)}</span>
            </div>
          )}
          {data.tax !== undefined && data.tax > 0 && (
            <div className="summary-item border-b pb-2">
              <span className="summary-label">Pajak/PPN:</span>
              <span className="summary-value currency">+{formatCurrency(data.tax)}</span>
            </div>
          )}
          <div className="summary-item mt-2 pt-2 border-t-2 border-black">
            <span className="text-xs font-bold uppercase">Total Pembelian:</span>
            <span className="summary-value currency text-lg font-bold">
              {data.grandTotal ? formatCurrency(data.grandTotal) : formatCurrency(0)}
            </span>
          </div>
        </div>
      </div>

      {/* NOTES SECTION */}
      {data.notes && (
        <div className="notes-section mb-4">
          <span className="notes-label">Catatan / Syarat Pembayaran:</span>
          <div className="notes-content">{data.notes}</div>
        </div>
      )}

      {/* FOOTER - SIGNATURES */}
      <div className="document-footer">
        <div className="signature-section">
          <div className="signature-block">
            <p className="text-xs font-semibold mb-1">Dipesan Oleh</p>
            <div className="signature-line"></div>
            <div className="signature-name">(_____)</div>
            <div className="signature-title">Nama Jelas</div>
          </div>

          <div className="signature-block">
            <p className="text-xs font-semibold mb-1">Penerima Barang</p>
            <div className="signature-line"></div>
            <div className="signature-name">(_____)</div>
            <div className="signature-title">Nama Jelas</div>
          </div>

          <div className="signature-block">
            <p className="text-xs font-semibold mb-1">Disetujui Oleh</p>
            <div className="signature-line"></div>
            <div className="signature-name">Manager / Owner</div>
            <div className="signature-title">Nama Jelas</div>
          </div>
        </div>

        {/* FOOTER INFO */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '9px', color: '#999' }}>
          <p>Dokumen ini telah dihasilkan oleh TokoSync ERP System</p>
          <p>
            Dicetak pada: {new Date().toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PembelianTemplate;
