import React, { ReactNode } from 'react';
import '@/styles/PrintStyles.css';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PrintLayoutProps {
  children: ReactNode;
  title: string;
  noRef?: string;
  date?: string;
}

export const PrintLayout = ({ children, title, noRef, date }: PrintLayoutProps) => {
  const { user } = useAuth();
  // In a real app, store info would come from Settings API
  const storeInfo = {
    name: 'TOKOSYNC ERP',
    address: 'Jl. Jenderal Sudirman No. 123, Jakarta Selatan',
    phone: '021-5550123',
    email: 'hello@tokosync.id'
  };

  return (
    <div className="print-document p-8">
      {/* Header */}
      <div className="print-header flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{storeInfo.name}</h1>
          <p className="text-sm">{storeInfo.address}</p>
          <p className="text-sm">Telp: {storeInfo.phone} | Email: {storeInfo.email}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase">{title}</h2>
          {noRef && <p className="text-md font-mono mt-1">NO: {noRef}</p>}
          <p className="text-sm mt-1">
            Tanggal: {date ? format(new Date(date), 'dd MMMM yyyy', { locale: id }) : format(new Date(), 'dd MMMM yyyy', { locale: id })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="print-body mt-4">
        {children}
      </div>

      {/* Signatures */}
      <div className="print-signatures mt-12">
        <div className="text-center">
          <p>Dibuat Oleh,</p>
          <div className="signature-box mt-16">{user?.name || 'Petugas'}</div>
        </div>
        <div className="text-center">
          <p>Disetujui Oleh,</p>
          <div className="signature-box mt-16">Pimpinan</div>
        </div>
        <div className="text-center">
          <p>Penerima,</p>
          <div className="signature-box mt-16">Customer / Supplier</div>
        </div>
      </div>

      {/* Footer / Printed Date */}
      <div className="mt-8 text-[10px] text-gray-500 italic">
        Dicetak pada: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')} oleh {user?.name}
      </div>
    </div>
  );
};

export default PrintLayout;
