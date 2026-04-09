import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const Supplier = lazy(() => import("./pages/master/Supplier"));
const Customer = lazy(() => import("./pages/master/Customer"));
const Produk = lazy(() => import("./pages/master/Produk"));
const Gudang = lazy(() => import("./pages/master/Gudang"));
const Sales = lazy(() => import("./pages/master/Sales"));

const Pembelian = lazy(() => import("./pages/transaksi/Pembelian"));
const PenjualanTunai = lazy(() => import("./pages/transaksi/PenjualanTunai"));
const PenjualanKredit = lazy(() => import("./pages/transaksi/PenjualanKredit"));
const PembayaranUtang = lazy(() => import("./pages/transaksi/PembayaranUtang"));
const PembayaranPiutang = lazy(() => import("./pages/transaksi/PembayaranPiutang"));
const ReturPembelian = lazy(() => import("./pages/transaksi/ReturPembelian"));
const ReturPenjualan = lazy(() => import("./pages/transaksi/ReturPenjualan"));
const SuratJalan = lazy(() => import("./pages/transaksi/SuratJalan"));
const KontraBon = lazy(() => import("./pages/transaksi/KontraBon"));

const HistoriPembelian = lazy(() => import("./pages/informasi/HistoriPembelian"));
const HistoriPenjualan = lazy(() => import("./pages/informasi/HistoriPenjualan"));
const HistoriReturPembelian = lazy(() => import("./pages/informasi/HistoriReturPembelian"));
const HistoriReturPenjualan = lazy(() => import("./pages/informasi/HistoriReturPenjualan"));
const HistoriPembayaranUtang = lazy(() => import("./pages/informasi/HistoriPembayaranUtang"));
const HistoriPembayaranPiutang = lazy(() => import("./pages/informasi/HistoriPembayaranPiutang"));
const BiayaJasa = lazy(() => import("./pages/informasi/BiayaJasa"));

const SaldoPiutang = lazy(() => import("./pages/laporan/SaldoPiutang"));
const SaldoUtang = lazy(() => import("./pages/laporan/SaldoUtang"));
const SaldoStok = lazy(() => import("./pages/laporan/SaldoStok"));
const KartuStok = lazy(() => import("./pages/laporan/KartuStok"));
const LaporanHarian = lazy(() => import("./pages/laporan/LaporanHarian"));

const Pengaturan = lazy(() => import("./pages/Pengaturan"));
const ProfilPemilik = lazy(() => import("./pages/pengaturan/ProfilPemilik"));
const AdminManagement = lazy(() => import("./pages/pengaturan/AdminManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Memuat halaman...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, ownerOnly }: { children: React.ReactNode; ownerOnly?: boolean }) => {
  const { isAuthenticated, isOwner, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (ownerOnly && !isOwner) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/supplier" element={<ProtectedRoute><Supplier /></ProtectedRoute>} />
        <Route path="/customer" element={<ProtectedRoute><Customer /></ProtectedRoute>} />
        <Route path="/produk" element={<ProtectedRoute><Produk /></ProtectedRoute>} />
        <Route path="/gudang" element={<ProtectedRoute><Gudang /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/transaksi/pembelian" element={<ProtectedRoute><Pembelian /></ProtectedRoute>} />
        <Route path="/transaksi/penjualan-tunai" element={<ProtectedRoute><PenjualanTunai /></ProtectedRoute>} />
        <Route path="/transaksi/penjualan-kredit" element={<ProtectedRoute><PenjualanKredit /></ProtectedRoute>} />
        <Route path="/transaksi/pembayaran-utang" element={<ProtectedRoute><PembayaranUtang /></ProtectedRoute>} />
        <Route path="/transaksi/pembayaran-piutang" element={<ProtectedRoute><PembayaranPiutang /></ProtectedRoute>} />
        <Route path="/transaksi/retur-pembelian" element={<ProtectedRoute><ReturPembelian /></ProtectedRoute>} />
        <Route path="/transaksi/retur-penjualan" element={<ProtectedRoute><ReturPenjualan /></ProtectedRoute>} />
        <Route path="/transaksi/surat-jalan" element={<ProtectedRoute><SuratJalan /></ProtectedRoute>} />
        <Route path="/transaksi/kontra-bon" element={<ProtectedRoute><KontraBon /></ProtectedRoute>} />
        <Route path="/informasi/pembelian" element={<ProtectedRoute><HistoriPembelian /></ProtectedRoute>} />
        <Route path="/informasi/penjualan" element={<ProtectedRoute><HistoriPenjualan /></ProtectedRoute>} />
        <Route path="/informasi/retur-pembelian" element={<ProtectedRoute><HistoriReturPembelian /></ProtectedRoute>} />
        <Route path="/informasi/retur-penjualan" element={<ProtectedRoute><HistoriReturPenjualan /></ProtectedRoute>} />
        <Route path="/informasi/biaya-jasa" element={<ProtectedRoute><BiayaJasa /></ProtectedRoute>} />
        <Route path="/informasi/pembayaran-utang" element={<ProtectedRoute><HistoriPembayaranUtang /></ProtectedRoute>} />
        <Route path="/informasi/pembayaran-piutang" element={<ProtectedRoute><HistoriPembayaranPiutang /></ProtectedRoute>} />
        <Route path="/laporan/saldo-piutang" element={<ProtectedRoute><SaldoPiutang /></ProtectedRoute>} />
        <Route path="/laporan/saldo-utang" element={<ProtectedRoute><SaldoUtang /></ProtectedRoute>} />
        <Route path="/laporan/saldo-stok" element={<ProtectedRoute ownerOnly><SaldoStok /></ProtectedRoute>} />
        <Route path="/laporan/kartu-stok" element={<ProtectedRoute><KartuStok /></ProtectedRoute>} />
        <Route path="/laporan/laporan-harian" element={<ProtectedRoute><LaporanHarian /></ProtectedRoute>} />
        <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
        <Route path="/pengaturan/profil" element={<ProtectedRoute><ProfilPemilik /></ProtectedRoute>} />
        <Route path="/pengaturan/admin" element={<ProtectedRoute ownerOnly><AdminManagement /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;