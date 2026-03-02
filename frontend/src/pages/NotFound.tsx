import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <MainLayout title="404 - Halaman Tidak Ditemukan" subtitle="Halaman yang Anda cari tidak tersedia">
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="mb-4 text-6xl font-bold text-destructive">404</h1>
          <p className="mb-6 text-xl text-muted-foreground">
            Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleGoBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleGoToDashboard} className="gap-2">
              <Home className="h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
