/**
 * TokoSync ERP – Axios Client (Sanctum Bearer Token)
 *
 * Strategi: Bearer token di localStorage.
 * Alasan: Lebih reliable di jaringan LAN multi-PC dibanding cookie-based
 *         karena menghindari masalah SameSite/CORS lintas IP.
 */
import axios, { AxiosError } from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────
export const TOKEN_KEY = 'tokosync_auth_token';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // tetap aktif untuk Sanctum CSRF cookie
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 detik – cukup untuk koneksi LAN yang lambat
});

// ─── Request Interceptor (Inject Bearer Token) ────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor (Handle 401 Auto-Logout) ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Bersihkan token lalu dispatch event agar AuthContext merespons
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  },
);

// ─── Typed helpers ────────────────────────────────────────────────────────────
export type { AxiosError };
