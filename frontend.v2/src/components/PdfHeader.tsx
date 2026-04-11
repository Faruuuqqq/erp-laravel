interface PdfHeaderProps {
  title: string;
  subtitle?: string;
  companyName?: string;
}

export const PdfHeader = ({
  title,
  subtitle,
  companyName = 'Toko ABC',
}: PdfHeaderProps) => {
  const currentDate = new Date().toLocaleDateString('id-ID');

  return (
    <div className="bg-white p-6 border-b-2 border-gray-300 print:break-after-avoid">
      {/* Company Header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">{companyName}</h1>
        <p className="text-sm text-gray-600">Jl. Jalan Raya No. 123, Jakarta 12345 | (021) 1234-5678</p>
      </div>

      {/* Document Title */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Tanggal: {currentDate}</p>
        <p>Waktu: {new Date().toLocaleTimeString('id-ID')}</p>
      </div>
    </div>
  );
};
