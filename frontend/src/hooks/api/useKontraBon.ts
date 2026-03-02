/**
 * TokoSync ERP – Kontra Bon API Hooks
 */
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useApiQuery, TRANSACTION_STALE_TIME } from '@/hooks/api/base';
import { apiClient } from '@/lib/api/client';

interface KontraBonData {
  data: unknown[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface AgingData {
  customer: unknown;
  transactions: unknown[];
  aging: {
    current: number;
    days_1_30: number;
    days_31_60: number;
    days_60_plus: number;
    total: number;
  };
}

const QUERY_KEY = 'kontra-bon';

export const useKontraBon = (customerId?: string, from?: string, to?: string) => {
  return useApiQuery<KontraBonData>(
    [QUERY_KEY, customerId, from, to],
    async () => {
      const params: Record<string, string> = {};
      if (customerId) params.customer_id = customerId;
      if (from) params.from = from;
      if (to) params.to = to;
      
      const response = await apiClient.get('/kontra-bon', { params });
      return response.data;
    },
    {
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};

export const usePrintKontraBon = () => {
  return useApiMutation<{ url: string; filename: string; billing_number: string }, {
    customer_id: string;
    transaction_ids: string[];
    interest_rate?: number;
  }>(
    async (data) => {
      const response = await apiClient.post('/kontra-bon/print', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        window.open(data.url, '_blank');
      },
    },
  );
};

export const useCalculateAging = (customerId: string) => {
  return useApiQuery<AgingData>(
    [QUERY_KEY, 'aging', customerId],
    async () => {
      const response = await apiClient.get('/kontra-bon/aging', {
        params: { customer_id: customerId },
      });
      return response.data.data;
    },
    {
      enabled: !!customerId,
      staleTime: TRANSACTION_STALE_TIME,
    },
  );
};
