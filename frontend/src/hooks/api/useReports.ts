/**
 * TokoSync ERP – Reports & Info API Hooks
 * Owner-only endpoints for financial reports and stock info.
 */
import { useApiQuery, TRANSACTION_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';
import type {
  ApiResponse,
  DailyReport,
  StockReport,
  BalanceReport,
  SaldoEntry,
  KartuStok,
  LaporanHarian,
  Transaction,
  ReturPembelianEntry,
  ReturPenjualanEntry,
  BiayaJasaEntry,
  PembayaranUtangEntry,
  PembayaranPiutangEntry,
} from '@/types';

// ─── Reports ──────────────────────────────────────────────────────────────────

export const useDailyReport = (date: string) => {
  return useApiQuery<DailyReport>(
    ['reports', 'daily', date],
    async () => {
      const response = await apiClient.get<ApiResponse<DailyReport>>('/reports/daily', {
        params: { date },
      });
      return response.data.data;
    },
    {
      enabled: !!date,
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useStockReport = () => {
  return useApiQuery<StockReport>(
    ['reports', 'stock'],
    async () => {
      const response = await apiClient.get<ApiResponse<StockReport>>('/reports/stock');
      return response.data.data;
    },
    { staleTime: 2 * 60 * 1000 },
  );
};

export const useBalanceReport = (params?: { from?: string; to?: string }) => {
  return useApiQuery<BalanceReport>(
    ['reports', 'balance', params],
    async () => {
      const response = await apiClient.get<ApiResponse<BalanceReport>>('/reports/balance', { params });
      return response.data.data;
    },
    { staleTime: 2 * 60 * 1000 },
  );
};

// ─── Info (Owner-only) ────────────────────────────────────────────────────────

export const useSaldoPiutang = () => {
  return useApiQuery<SaldoEntry[]>(
    ['info', 'saldo-piutang'],
    async () => {
      const response = await apiClient.get<ApiResponse<SaldoEntry[]>>('/info/saldo-piutang');
      return response.data.data;
    },
    { staleTime: TRANSACTION_STALE_TIME },
  );
};

export const useSaldoUtang = () => {
  return useApiQuery<SaldoEntry[]>(
    ['info', 'saldo-utang'],
    async () => {
      const response = await apiClient.get<ApiResponse<SaldoEntry[]>>('/info/saldo-utang');
      return response.data.data;
    },
    { staleTime: TRANSACTION_STALE_TIME },
  );
};

export const useKartuStok = (productId: string) => {
  return useApiQuery<KartuStok>(
    ['info', 'kartu-stok', productId],
    async () => {
      const response = await apiClient.get<ApiResponse<KartuStok>>('/info/kartu-stok', {
        params: { product_id: productId },
      });
      return response.data.data;
    },
    {
      enabled: !!productId,
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useLaporanHarian = (date: string) => {
  return useApiQuery<LaporanHarian>(
    ['info', 'laporan-harian', date],
    async () => {
      const response = await apiClient.get<ApiResponse<LaporanHarian>>('/info/laporan-harian', {
        params: { date },
      });
      return response.data.data;
    },
    {
      enabled: !!date,
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

// ─── History Reports ─────────────────────────────────────────────────────────

export const useHistoryPenjualan = (params?: { from?: string; to?: string }) => {
  return useApiQuery<Transaction[]>(
    ['reports', 'history-penjualan', params],
    async () => {
      const response = await apiClient.get<ApiResponse<Transaction[]>>('/reports/history/penjualan', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useHistoryPembelian = (params?: { from?: string; to?: string }) => {
  return useApiQuery<Transaction[]>(
    ['reports', 'history-pembelian', params],
    async () => {
      const response = await apiClient.get<ApiResponse<Transaction[]>>('/reports/history/pembelian', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

// ─── Informasi History Reports (Owner-only) ────────────────────────────────────────

export const useHistoryReturPembelian = (params?: { from?: string; to?: string }) => {
  return useApiQuery<ReturPembelianEntry[]>(
    ['informasi', 'retur-pembelian', params],
    async () => {
      const response = await apiClient.get<ApiResponse<ReturPembelianEntry[]>>('/informasi/retur-pembelian', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useHistoryReturPenjualan = (params?: { from?: string; to?: string }) => {
  return useApiQuery<ReturPenjualanEntry[]>(
    ['informasi', 'retur-penjualan', params],
    async () => {
      const response = await apiClient.get<ApiResponse<ReturPenjualanEntry[]>>('/informasi/retur-penjualan', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useBiayaJasa = (params?: { from?: string; to?: string }) => {
  return useApiQuery<BiayaJasaEntry[]>(
    ['informasi', 'biaya-jasa', params],
    async () => {
      const response = await apiClient.get<ApiResponse<BiayaJasaEntry[]>>('/informasi/biaya-jasa', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useHistoryPembayaranUtang = (params?: { from?: string; to?: string }) => {
  return useApiQuery<PembayaranUtangEntry[]>(
    ['informasi', 'pembayaran-utang', params],
    async () => {
      const response = await apiClient.get<ApiResponse<PembayaranUtangEntry[]>>('/informasi/pembayaran-utang', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const useHistoryPembayaranPiutang = (params?: { from?: string; to?: string }) => {
  return useApiQuery<PembayaranPiutangEntry[]>(
    ['informasi', 'pembayaran-piutang', params],
    async () => {
      const response = await apiClient.get<ApiResponse<PembayaranPiutangEntry[]>>('/informasi/pembayaran-piutang', { params });
      return response.data.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};
