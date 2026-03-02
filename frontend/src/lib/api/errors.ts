/**
 * TokoSync ERP – API Error Utilities
 *
 * Memetakan error Laravel (422 Unprocessable Entity) ke react-hook-form
 * sehingga pesan error muncul tepat di bawah field yang salah.
 */
import { AxiosError } from 'axios';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { toast } from 'sonner';

// ─── Laravel Response Types ───────────────────────────────────────────────────
export interface LaravelValidationError {
    message: string;
    errors: Record<string, string[]>;
}

export interface LaravelApiError {
    message: string;
}

// ─── ApiError Class ───────────────────────────────────────────────────────────
export class ApiError extends Error {
    public readonly status: number;
    public readonly errors: Record<string, string[]>;

    constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

// ─── Helper: Parse Axios Error ────────────────────────────────────────────────
export function parseAxiosError(error: unknown): ApiError {
    if (error instanceof AxiosError && error.response) {
        const { status, data } = error.response;

        if (status === 422) {
            const validationData = data as LaravelValidationError;
            return new ApiError(
                validationData.message || 'Data yang dimasukkan tidak valid.',
                status,
                validationData.errors || {},
            );
        }

        const apiData = data as LaravelApiError;
        return new ApiError(
            apiData.message || getDefaultMessage(status),
            status,
        );
    }

    if (error instanceof Error) {
        if (error.message === 'Network Error') {
            return new ApiError('Tidak dapat terhubung ke server. Periksa koneksi jaringan.', 0);
        }
        return new ApiError(error.message, 0);
    }

    return new ApiError('Terjadi kesalahan yang tidak diketahui.', 0);
}

// ─── Helper: Map 422 Errors → react-hook-form setError ───────────────────────
/**
 * Gunakan di onError mutation:
 *   mapLaravelErrors(err, setError)
 *
 * Laravel mengirim { errors: { "field": ["pesan error"] } }
 * Fungsi ini memanggil setError("field", { message: "pesan error" }) untuk setiap field.
 */
export function mapLaravelErrors<T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
    prefix?: string,
): boolean {
    const apiError = parseAxiosError(error);

    if (apiError.status === 422 && Object.keys(apiError.errors).length > 0) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
            // Handle nested: "items.0.productId" → Laravel dot notation
            const fieldName = prefix ? `${prefix}.${field}` : field;
            setError(fieldName as Path<T>, {
                type: 'server',
                message: messages[0], // Tampilkan pesan pertama saja
            });
        });
        return true; // informs caller that 422 errors were mapped
    }

    return false;
}

// ─── Helper: Toast-Based Error Handler ───────────────────────────────────────
/**
 * Gunakan di onError mutation ketika tidak ada form (contoh: delete action).
 */
export function handleApiError(error: unknown): void {
    const apiError = parseAxiosError(error);

    if (apiError.status === 422) {
        const firstError = Object.values(apiError.errors)[0]?.[0];
        toast.error(firstError || apiError.message);
    } else if (apiError.status === 403) {
        toast.error('Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.');
    } else if (apiError.status === 404) {
        toast.error('Data tidak ditemukan.');
    } else if (apiError.status === 0) {
        toast.error(apiError.message); // Network error
    } else {
        toast.error(`Gagal: ${apiError.message}`);
    }
}

// ─── Private: Default Messages ────────────────────────────────────────────────
function getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
        400: 'Permintaan tidak valid.',
        401: 'Sesi telah berakhir. Silakan login kembali.',
        403: 'Akses ditolak.',
        404: 'Data tidak ditemukan.',
        409: 'Data sudah ada atau terjadi konflik.',
        500: 'Terjadi kesalahan pada server.',
        503: 'Server sedang tidak tersedia. Coba lagi nanti.',
    };
    return messages[status] || `Terjadi kesalahan (${status}).`;
}
