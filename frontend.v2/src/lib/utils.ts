import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Indonesian Rupiah (IDR).
 * e.g. 1500000 → "Rp 1.500.000"
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Extract error message from API response with runtime safety
 * Handles nested error responses from Laravel API
 */
export function extractApiError(
  error: unknown,
  fallback: string = 'Terjadi kesalahan'
): string {
  try {
    const err = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
    };

    // Try to get first validation error
    if (err.response?.data?.errors) {
      const firstError = Object.values(err.response.data.errors)[0];
      if (firstError?.[0]) return firstError[0];
    }

    // Fallback to message field
    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    return fallback;
  } catch {
    return fallback;
  }
}
