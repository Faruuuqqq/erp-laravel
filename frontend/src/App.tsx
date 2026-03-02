import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "@/contexts/auth/AuthContext";
import { useAuth } from "@/contexts/auth/useAuth";
import { ProtectedRoute, OwnerOnlyRoute, AdminOnlyRoute } from "@/components/auth/ProtectedRoute";
 
// Pages
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import Supplier from "@/pages/master/Supplier";
import Customer from "@/pages/master/Customer";
import Produk from "@/pages/master/Produk";
import Gudang from "@/pages/master/Gudang";
import Sales from "@/pages/master/Sales";
import Pembelian from "@/pages/transaksi/Pembelian";
import PenjualanTunai from "@/pages/transaksi/PenjualanTunai";
import PenjualanKredit from "@/pages/transaksi/PenjualanKredit";
import PembayaranUtang from "@/pages/transaksi/PembayaranUtang";
import PembayaranPiutang from "@/pages/transaksi/PembayaranPiutang";
import ReturPembelian from "@/pages/transaksi/ReturPembelian";
import ReturPenjualan from "@/pages/transaksi/ReturPenjualan";
import SuratJalan from "@/pages/transaksi/SuratJalan";
import KontraBon from "@/pages/transaksi/KontraBon";
import HistoriPembelian from "@/pages/informasi/HistoriPembelian";
import HistoriPenjualan from "@/pages/informasi/HistoriPenjualan";
import SaldoPiutang from "@/pages/informasi/SaldoPiutang";
import SaldoUtang from "@/pages/informasi/SaldoUtang";
import SaldoStok from "@/pages/informasi/SaldoStok";
import KartuStok from "@/pages/informasi/KartuStok";
import LaporanHarian from "@/pages/informasi/LaporanHarian";
import HistoriReturPembelian from "@/pages/informasi/HistoriReturPembelian";
import HistoriReturPenjualan from "@/pages/informasi/HistoriReturPenjualan";
import BiayaJasa from "@/pages/informasi/BiayaJasa";
import HistoriPembayaranUtang from "@/pages/informasi/HistoriPembayaranUtang";
import HistoriPembayaranPiutang from "@/pages/informasi/HistoriPembayaranPiutang";
import Pengaturan from "@/pages/Pengaturan";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/auth/Unauthorized";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,   // 2 menit default – data master
      retry: 1,                    // retry 1x sebelum tampilkan error
      refetchOnWindowFocus: false, // matikan global – kasir sering ganti tab
    },
    mutations: {
      retry: 0, // jangan retry mutasi – hindari double-submit
    },
  },
});

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  // Public routes - WITHOUT SidebarProvider (Login, Unauthorized, NotFound)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

     // Authenticated routes
     return (
       <Routes>
         {/* Redirect root to dashboard */}
         <Route path="/" element={<Navigate to="/dashboard" replace />} />

         {/* Dashboard Route - Protected (Admin & Owner) */}
         <Route path="/dashboard" element={<AdminOnlyRoute><Dashboard /></AdminOnlyRoute>} />
         <Route path="/supplier" element={<AdminOnlyRoute><Supplier /></AdminOnlyRoute>} />
         <Route path="/customer" element={<AdminOnlyRoute><Customer /></AdminOnlyRoute>} />
         <Route path="/produk" element={<AdminOnlyRoute><Produk /></AdminOnlyRoute>} />
         <Route path="/gudang" element={<AdminOnlyRoute><Gudang /></AdminOnlyRoute>} />
         <Route path="/sales" element={<AdminOnlyRoute><Sales /></AdminOnlyRoute>} />

        {/* Transaction Routes - All admin/owner */}
        <Route path="/transaksi/pembelian" element={<AdminOnlyRoute><Pembelian /></AdminOnlyRoute>} />
        <Route path="/transaksi/penjualan-tunai" element={<AdminOnlyRoute><PenjualanTunai /></AdminOnlyRoute>} />
        <Route path="/transaksi/penjualan-kredit" element={<AdminOnlyRoute><PenjualanKredit /></AdminOnlyRoute>} />
        <Route path="/transaksi/pembayaran-utang" element={<AdminOnlyRoute><PembayaranUtang /></AdminOnlyRoute>} />
        <Route path="/transaksi/pembayaran-piutang" element={<AdminOnlyRoute><PembayaranPiutang /></AdminOnlyRoute>} />
        <Route path="/transaksi/retur-pembelian" element={<AdminOnlyRoute><ReturPembelian /></AdminOnlyRoute>} />
        <Route path="/transaksi/retur-penjualan" element={<AdminOnlyRoute><ReturPenjualan /></AdminOnlyRoute>} />
        <Route path="/transaksi/surat-jalan" element={<AdminOnlyRoute><SuratJalan /></AdminOnlyRoute>} />
        <Route path="/transaksi/kontra-bon" element={<AdminOnlyRoute><KontraBon /></AdminOnlyRoute>} />

        {/* Reporting Routes - Owner only */}
        <Route path="/informasi/pembelian" element={<OwnerOnlyRoute><HistoriPembelian /></OwnerOnlyRoute>} />
        <Route path="/informasi/penjualan" element={<OwnerOnlyRoute><HistoriPenjualan /></OwnerOnlyRoute>} />
        <Route path="/informasi/saldo-piutang" element={<OwnerOnlyRoute><SaldoPiutang /></OwnerOnlyRoute>} />
        <Route path="/informasi/saldo-utang" element={<OwnerOnlyRoute><SaldoUtang /></OwnerOnlyRoute>} />
        <Route path="/informasi/saldo-stok" element={<OwnerOnlyRoute><SaldoStok /></OwnerOnlyRoute>} />
        <Route path="/informasi/kartu-stok" element={<OwnerOnlyRoute><KartuStok /></OwnerOnlyRoute>} />
        <Route path="/informasi/laporan-harian" element={<OwnerOnlyRoute><LaporanHarian /></OwnerOnlyRoute>} />
        <Route path="/informasi/retur-pembelian" element={<OwnerOnlyRoute><HistoriReturPembelian /></OwnerOnlyRoute>} />
        <Route path="/informasi/retur-penjualan" element={<OwnerOnlyRoute><HistoriReturPenjualan /></OwnerOnlyRoute>} />
        <Route path="/informasi/biaya-jasa" element={<OwnerOnlyRoute><BiayaJasa /></OwnerOnlyRoute>} />
        <Route path="/informasi/pembayaran-utang" element={<OwnerOnlyRoute><HistoriPembayaranUtang /></OwnerOnlyRoute>} />
        <Route path="/informasi/pembayaran-piutang" element={<OwnerOnlyRoute><HistoriPembayaranPiutang /></OwnerOnlyRoute>} />

        {/* Settings - All authenticated users */}
        <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />

        {/* Catch-all route for authenticated users */}
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
