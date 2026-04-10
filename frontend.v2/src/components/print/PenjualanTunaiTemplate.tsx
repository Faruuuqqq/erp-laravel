import { usePrintExport } from '@/hooks/usePrintExport';
import type { DocumentTemplateProps } from '@/types/print';

/**
 * Penjualan Tunai (Cash Sales) Formal Template
 */
export const PenjualanTunaiTemplate = ({
  data,
  showDraftBadge = false,
}: DocumentTemplateProps) => {
  const { formatDate, formatCurrency } = usePrintExport();
  const today = formatDate(data.date || new Date());

  return (
    <div className="penjualan-tunai-template">
      {/* HEADER */}
      <div className="document-header">
        <h1>STRUK PENJUALAN TUNAI</h1>
        <p className="company-name">TokoSync ERP - Sistem Manajemen Toko</p>
      </div>

      {/* DOCUMENT META INFO */}
      <div className="document-meta mb-4">
        <div className="meta-item">
          <span className="meta-label">No. Transaksi:</span>
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
          <span className="meta-label">Kasir:</span>
          <span className="meta-value">{data.createdBy || '-'}</span>
        </div>
      </div>

      {/* CUSTOMER INFO */}
      {data.customer && (
        <div className="mb-4 p-2 border border-gray-200 rounded text-sm avoid-break">
          <p className="font-bold mb-1 text-xs uppercase">Pembeli</p>
          <p className="text-xs">{data.customer.name}</p>
        </div>
      )}

      <hr className="mb-4" />

      {/* ITEMS TABLE */}
      <table className="items-table mb-4">
        <thead>
          <tr>
            <th style={{ width: '5%' }}>No</th>
            <th style={{ width: '40%' }}>Nama Barang</th>
            <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Harga</th>
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
                  {item.qty}
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
              <span className="summary-label">Pajak:</span>
              <span className="summary-value currency">+{formatCurrency(data.tax)}</span>
            </div>
          )}
          <div className="summary-item mt-2 pt-2 border-t-2 border-black">
            <span className="text-xs font-bold uppercase">Total Bayar:</span>
            <span className="summary-value currency text-lg font-bold">
              {data.grandTotal ? formatCurrency(data.grandTotal) : formatCurrency(0)}
            </span>
          </div>
        </div>
      </div>

      {/* NOTES SECTION */}
      {data.notes && (
        <div className="notes-section mb-4">
          <span className="notes-label">Catatan:</span>
          <div className="notes-content">{data.notes}</div>
        </div>
      )}

      {/* FOOTER */}
      <div className="document-footer">
        <div style={{ textAlign: 'center', borderTop: '1px solid #000', paddingTop: '12px' }}>
          <p className="text-xs font-bold">TERIMA KASIH TELAH BERBELANJA</p>
          <p className="text-xs mt-2">Mohon simpan bukti pembelian ini</p>
        </div>

        {/* FOOTER INFO */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '9px', color: '#999' }}>
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

export default PenjualanTunaiTemplate;
