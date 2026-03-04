import apiClient from './api-client';

export const api = {
  get: <T = unknown>(url: string, params?: Record<string, unknown>) => apiClient.get(url, { params }),
  post: <T = unknown>(url: string, data: Record<string, unknown>) => apiClient.post(url, data),
  put: <T = unknown>(url: string, data: Record<string, unknown>) => apiClient.put(url, data),
  patch: <T = unknown>(url: string, data: Record<string, unknown>) => apiClient.patch(url, data),
  delete: <T = unknown>(url: string) => apiClient.delete(url),
};

export const extractErrorMessage = (error: unknown): string => {
  const err = error as { response?: { data?: { message?: string; error?: string | string[]; errors?: Record<string, string[]> } }; message?: string };
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err.response?.data?.error) {
    if (typeof err.response.data.error === 'string') {
      return err.response.data.error;
    }
    if (Array.isArray(err.response.data.error)) {
      return err.response.data.error[0]?.message || 'Terjadi kesalahan';
    }
  }
  if (err.response?.data?.errors) {
    const errors = err.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    if (firstKey && Array.isArray(errors[firstKey])) {
      return errors[firstKey][0];
    }
  }
  return err.message || 'Terjadi kesalahan tidak terduga';
};
