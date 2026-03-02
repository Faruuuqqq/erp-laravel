import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <MainLayout title="Tidak Diizinkan" subtitle="Anda tidak memiliki akses ke halaman ini">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda membutuhkan akses.
        </p>
        <Button onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </div>
    </MainLayout>
  );
};

export default Unauthorized;
