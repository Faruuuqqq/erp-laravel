/**
 * TokoSync ERP – AuthContext
 *
 * CATATAN VITE FAST REFRESH: File ini HANYA boleh export SATU komponen (AuthProvider).
 * Hook `useAuth` dan tipenya ada di file terpisah: @/contexts/useAuth.ts
 */
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { apiClient, TOKEN_KEY } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/errors';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session dari localStorage saat app pertama dibuka ──────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<{ data: User }>('/me');
        setUser(response.data.data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Dengarkan event auth:logout dari Axios interceptor (HTTP 401) ──────────
  const handleForceLogout = useCallback(() => {
    setUser(null);
    toast.warning('Sesi Anda telah berakhir. Silakan login kembali.');
  }, []);

  useEffect(() => {
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [handleForceLogout]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // CSRF disabled for testing
      // const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:8000';
      // await apiClient.get('/sanctum/csrf-cookie', { baseURL });

      // 1. POST ke /api/login
      const response = await apiClient.post<{ token: string; user: User }>('/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      setUser(userData);
      toast.success(`Selamat datang, ${userData.name}!`);
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
    } catch {
      // Abaikan error (token mungkin sudah expired)
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
