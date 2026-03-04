import { useMutation, useQuery } from '@tanstack/react-query';
import { api, extractErrorMessage } from '@/lib/api';
import type { LoginRequest, LoginResponse, User } from '@/types';

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      api.post<LoginResponse>('/login', credentials),
    onSuccess: (response) => {
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => api.post('/logout'),
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },
  });
};

export const useMe = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/me'),
    enabled,
    retry: false,
  });
};
