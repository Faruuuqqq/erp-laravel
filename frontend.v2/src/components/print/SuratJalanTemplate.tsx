import { usePrintExport } from '@/hooks/usePrintExport';
import type { DocumentTemplateProps } from '@/types/print';

/**
 * Surat Jalan (Delivery Note) Formal Template
 */
export const SuratJalanTemplate = ({
  data,
  showDraftBadge = false,
}: DocumentTemplateProps) => {
  const { formatDate, formatCurrency } = usePrintExport();
  const today = formatDate(data.date || new Date());

  return (
    <div className="surat-jalan-template">
      {/* HEADER */}
      <div className="document-header">
        <h1>SURAT JALAN</h1>
        <p className="company-name">TokoSync ERP - Sistem Manajemen Toko</p>
      </div>

      {/* DOCUMENT META INFO */}
      <div className="document-meta mb-4">
        <div className="meta-item">
          <span className="meta-label">No. Surat Jalan:</span>
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

      {/* MAIN INFO SECTION */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm avoid-break">
        {/* LEFT COLUMN */}
        <div>
          <p className="font-bold mb-2 text-xs uppercase">Pengirim/Sales</p>
          <p className="text-xs mb-1">
            <span className="font-semibold">Sales Rep:</span> {data.salesRep?.name || '-'}
          </p>
          <p className="text-xs">
            <span className="font-semibold">Driver:</span> {data.driver || '-'}
          </p>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <p className="font-bold mb-2 text-xs uppercase">Penerima</p>
          <p className="text-xs mb-1">
            <span className="font-semibold">Nama:</span> {data.customer?.name || '-'}
          </p>
          <p className="text-xs mb-1">
            <span className="font-semibold">Alamat:</span> {data.destination || data.customer?.address || '-'}
          </p>
          {data.customer?.phone && (
            <p className="text-xs">
              <span className="font-semibold">Telepon:</span> {data.customer.phone}
            </p>
          )}
        </div>
      </div>

      <hr className="mb-4" />

      {/* ITEMS TABLE */}
      <table className="items-table mb-4">
        <thead>
          <tr>
            <th style={{ width: '5%' }}>No</th>
            <th style={{ width: '45%' }}>Nama Barang</th>
            <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
            <th style={{ width: '15%' }}>Satuan</th>
            <th style={{ width: '20%' }}>Keterangan</th>
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
                <td>{item.satuan}</td>
                <td>{item.keterangan || '-'}</td>
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
        <tfoot>
          <tr className="total-row">
            <td colSpan={2} style={{ textAlign: 'right' }} className="font-bold">
              TOTAL:
            </td>
            <td style={{ textAlign: 'center' }} className="numeric font-bold">
              {data.totalQty}
            </td>
            <td colSpan={2}>{data.totalItems} jenis barang</td>
          </tr>
        </tfoot>
      </table>

      {/* NOTES SECTION */}
      {data.notes && (
        <div className="notes-section mb-4">
          <span className="notes-label">Catatan:</span>
          <div className="notes-content">{data.notes}</div>
        </div>
      )}

      {/* FOOTER - SIGNATURES */}
      <div className="document-footer">
        <div className="signature-section">
          <div className="signature-block">
            <p className="text-xs font-semibold mb-1">Pengirim/Driver</p>
            <div className="signature-line"></div>
            <div className="signature-name">{data.driver || '(_____)'}</div>
            <div className="signature-title">Nama Jelas</div>
          </div>

          <div className="signature-block">
            <p className="text-xs font-semibold mb-1">Penerima</p>
            <div className="signature-line"></div>
            <div className="signature-name">{data.customer?.name || '(_____)'}</div>
            <div className="signature-title">Nama Jelas</div>
          </div>

          <div className="signature-block">
            <p className="text-xs font-semibold mb-1">Diketahui Oleh</p>
            <div className="signature-line"></div>
            <div className="signature-name">Admin / Owner</div>
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

export default SuratJalanTemplate;
