import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PrintProvider } from "./contexts/PrintContext";
import { PageLoader } from "@/components/layout/PageLoader";

import Login from "./pages/Login";

// Lazy load all pages except Login and Dashboard for initial load
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
const AdminManagement = lazy(() => import("./pages/pengaturan/AdminManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 min
      gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 min after unused
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: 'stale', // Refetch only if data is stale when reconnecting
      refetchOnMount: 'stale', // Refetch only if data is stale when component mounts
      retry: 1, // Retry failed requests once
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

const ProtectedRoute = ({ children, ownerOnly }: { children: React.ReactNode; ownerOnly?: boolean }) => {
  const { isAuthenticated, isOwner, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (ownerOnly && !isOwner) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ProtectedRoute>} />
      <Route path="/supplier" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Supplier /></Suspense></ProtectedRoute>} />
      <Route path="/customer" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Customer /></Suspense></ProtectedRoute>} />
      <Route path="/produk" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Produk /></Suspense></ProtectedRoute>} />
      <Route path="/gudang" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Gudang /></Suspense></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Sales /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/pembelian" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Pembelian /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/penjualan-tunai" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><PenjualanTunai /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/penjualan-kredit" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><PenjualanKredit /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/pembayaran-utang" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><PembayaranUtang /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/pembayaran-piutang" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><PembayaranPiutang /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/retur-pembelian" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><ReturPembelian /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/retur-penjualan" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><ReturPenjualan /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/surat-jalan" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SuratJalan /></Suspense></ProtectedRoute>} />
      <Route path="/transaksi/kontra-bon" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><KontraBon /></Suspense></ProtectedRoute>} />
      <Route path="/informasi/pembelian" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><HistoriPembelian /></Suspense></ProtectedRoute>} />
      <Route path="/informasi/penjualan" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><HistoriPenjualan /></Suspense></ProtectedRoute>} />
      <Route path="/informasi/retur-pembelian" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><HistoriReturPembelian /></Suspense></ProtectedRoute>} />
      <Route path="/informasi/retur-penjualan" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><HistoriReturPenjualan /></Suspense></ProtectedRoute>} />
      <Route path="/informasi/biaya-jasa" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><BiayaJasa /></Suspense></ProtectedRoute>} />
      <Route path="/informasi/pembayaran-utang" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><HistoriPembayaranUtang /></Suspense></ProtectedRoute>} />
      <Route path="/informasi/pembayaran-piutang" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><HistoriPembayaranPiutang /></Suspense></ProtectedRoute>} />
      <Route path="/laporan/saldo-piutang" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SaldoPiutang /></Suspense></ProtectedRoute>} />
      <Route path="/laporan/saldo-utang" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SaldoUtang /></Suspense></ProtectedRoute>} />
      <Route path="/laporan/saldo-stok" element={<ProtectedRoute ownerOnly><Suspense fallback={<PageLoader />}><SaldoStok /></Suspense></ProtectedRoute>} />
      <Route path="/laporan/kartu-stok" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><KartuStok /></Suspense></ProtectedRoute>} />
      <Route path="/laporan/laporan-harian" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><LaporanHarian /></Suspense></ProtectedRoute>} />
      <Route path="/pengaturan" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Pengaturan /></Suspense></ProtectedRoute>} />
      <Route path="/pengaturan/admin" element={<ProtectedRoute ownerOnly><Suspense fallback={<PageLoader />}><AdminManagement /></Suspense></ProtectedRoute>} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PrintProvider>
            <AppRoutes />
          </PrintProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
