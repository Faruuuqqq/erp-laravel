import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Supplier from "./pages/master/Supplier";
import Customer from "./pages/master/Customer";
import Produk from "./pages/master/Produk";
import Gudang from "./pages/master/Gudang";
import Sales from "./pages/master/Sales";
import Pembelian from "./pages/transaksi/Pembelian";
import PenjualanTunai from "./pages/transaksi/PenjualanTunai";
import PenjualanKredit from "./pages/transaksi/PenjualanKredit";
import PembayaranUtang from "./pages/transaksi/PembayaranUtang";
import PembayaranPiutang from "./pages/transaksi/PembayaranPiutang";
import ReturPembelian from "./pages/transaksi/ReturPembelian";
import ReturPenjualan from "./pages/transaksi/ReturPenjualan";
import SuratJalan from "./pages/transaksi/SuratJalan";
import KontraBon from "./pages/transaksi/KontraBon";
import HistoriPembelian from "./pages/informasi/HistoriPembelian";
import HistoriPenjualan from "./pages/informasi/HistoriPenjualan";
import BiayaJasa from "./pages/informasi/BiayaJasa";
import SaldoPiutang from "./pages/laporan/SaldoPiutang";
import SaldoUtang from "./pages/laporan/SaldoUtang";
import SaldoStok from "./pages/laporan/SaldoStok";
import KartuStok from "./pages/laporan/KartuStok";
import LaporanHarian from "./pages/laporan/LaporanHarian";
import Pengaturan from "./pages/Pengaturan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
      <Route path="/informasi/retur-pembelian" element={<ProtectedRoute><HistoriPembelian /></ProtectedRoute>} />
      <Route path="/informasi/retur-penjualan" element={<ProtectedRoute><HistoriPenjualan /></ProtectedRoute>} />
      <Route path="/informasi/biaya-jasa" element={<ProtectedRoute><BiayaJasa /></ProtectedRoute>} />
      <Route path="/informasi/pembayaran-utang" element={<ProtectedRoute><HistoriPembelian /></ProtectedRoute>} />
      <Route path="/informasi/pembayaran-piutang" element={<ProtectedRoute><HistoriPenjualan /></ProtectedRoute>} />
      <Route path="/laporan/saldo-piutang" element={<ProtectedRoute><SaldoPiutang /></ProtectedRoute>} />
      <Route path="/laporan/saldo-utang" element={<ProtectedRoute><SaldoUtang /></ProtectedRoute>} />
      <Route path="/laporan/saldo-stok" element={<ProtectedRoute ownerOnly><SaldoStok /></ProtectedRoute>} />
      <Route path="/laporan/kartu-stok" element={<ProtectedRoute><KartuStok /></ProtectedRoute>} />
      <Route path="/laporan/laporan-harian" element={<ProtectedRoute><LaporanHarian /></ProtectedRoute>} />
      <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
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
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
