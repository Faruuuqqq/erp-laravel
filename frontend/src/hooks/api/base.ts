/**
 * TokoSync ERP – Base API Hooks
 *
 * Generic wrappers atas TanStack Query untuk konsistensi:
 * - useApiQuery   : wrapper useQuery dengan defaults LAN-friendly
 * - useApiMutation: wrapper useMutation dengan auto-toast dan error mapping
 */
import {
    useQuery,
    useMutation,
    useQueryClient,
    type UseQueryOptions,
    type UseMutationOptions,
    type QueryKey,
    type InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError, mapLaravelErrors, parseAxiosError } from '@/lib/api/errors';
import type { UseFormSetError, FieldValues } from 'react-hook-form';

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const MASTER_DATA_STALE_TIME = 5 * 60 * 1000; // 5 menit
export const TRANSACTION_STALE_TIME = 0;              // selalu fresh

// ─── useApiQuery ──────────────────────────────────────────────────────────────
export function useApiQuery<TData>(
    queryKey: QueryKey,
    queryFn: () => Promise<TData>,
    options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>,
) {
    return useQuery<TData>({
        queryKey,
        queryFn,
        staleTime: MASTER_DATA_STALE_TIME,
        refetchOnWindowFocus: false,
        retry: 1,
        ...options,
    });
}

// ─── useApiMutation ───────────────────────────────────────────────────────────
/**
 * Wrapper useMutation dengan:
 * - successMessage: auto-toast sukses
 * - setError: auto-map 422 Laravel errors ke react-hook-form field
 * - Semua opsi UseMutationOptions lainnya (termasuk onMutate untuk optimistic updates)
 *   tetap bisa dipass langsung.
 */
type UseApiMutationOptions<TData, TVariables, TContext = unknown> = UseMutationOptions<
    TData,
    unknown,
    TVariables,
    TContext
> & {
    successMessage?: string;
    setError?: UseFormSetError<FieldValues>;
};

export function useApiMutation<TData, TVariables, TContext = unknown>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseApiMutationOptions<TData, TVariables, TContext>,
) {
    const { successMessage, setError, onSuccess, onError, ...restOptions } = options || {};

    return useMutation<TData, unknown, TVariables, TContext>({
        mutationFn,

        onSuccess: (data, variables, context, meta) => {
            if (successMessage) {
                toast.success(successMessage);
            }
            onSuccess?.(data, variables, context, meta);
        },

        onError: (error, variables, context, meta) => {
            const apiError = parseAxiosError(error);

            if (setError && apiError.status === 422) {
                // Petakan 422 validation errors langsung ke form fields
                mapLaravelErrors(error, setError);
            } else {
                handleApiError(error);
            }

            onError?.(error, variables, context, meta);
        },

        ...restOptions,
    });
}

// ─── Optimistic Delete Helper ─────────────────────────────────────────────────
/**
 * Helper untuk optimistic delete dari list query.
 * Gunakan di `onMutate` sebuah mutation.
 *
 * Contoh:
 *   onMutate: async (id) => {
 *     return await optimisticDeleteFromList<Product>(queryClient, ['products'], id);
 *   },
 *   onError: (_e, _id, context) => {
 *     if (context?.snapshot) queryClient.setQueryData(['products'], context.snapshot);
 *   },
 */
export async function optimisticDeleteFromList<T extends { id: string }>(
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: QueryKey,
    id: string,
): Promise<{ snapshot: T[] | undefined }> {
    // Batalkan refetch yang sedang berjalan agar tidak overwrite optimistic update
    await queryClient.cancelQueries({ queryKey });

    // Simpan snapshot sebelum dihapus untuk rollback
    const snapshot = queryClient.getQueryData<T[]>(queryKey);

    // Hapus item dari cache secara optimistis
    queryClient.setQueryData<T[]>(queryKey, (old) =>
        old ? old.filter((item) => item.id !== id) : [],
    );

    return { snapshot };
}

export { useQueryClient };
export type { InfiniteData };
