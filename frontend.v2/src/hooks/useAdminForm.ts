import { useState, useCallback } from 'react';

export interface FormErrors {
  [key: string]: string | undefined;
}

interface AdminFormData {
  name: string;
  email: string;
  password: string;
}

const validateEmail = (email: string): string | undefined => {
  if (!email) return 'Email wajib diisi';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Format email tidak valid';
  return undefined;
};

const validateName = (name: string): string | undefined => {
  if (!name) return 'Nama wajib diisi';
  if (name.length < 2) return 'Nama minimal 2 karakter';
  if (name.length > 100) return 'Nama maksimal 100 karakter';
  return undefined;
};

const validatePassword = (password: string, isRequired = true): string | undefined => {
  if (isRequired && !password) return 'Password wajib diisi';
  if (password && password.length < 8) return 'Password minimal 8 karakter';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  
  if (password && !(hasUpperCase && hasLowerCase && hasDigit)) {
    return 'Password harus mengandung huruf besar, huruf kecil, dan angka';
  }
  
  return undefined;
};

export const useAdminForm = () => {
  const [form, setForm] = useState<AdminFormData>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback((data: AdminFormData, isUpdate = false): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateName(data.name);
    newErrors.email = validateEmail(data.email);
    newErrors.password = validatePassword(data.password, !isUpdate);

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }, []);

  const validatePasswordOnly = useCallback((password: string): string | undefined => {
    return validatePassword(password, false);
  }, []);

  const resetForm = useCallback(() => {
    setForm({ name: '', email: '', password: '' });
    setErrors({});
  }, []);

  return {
    form,
    setForm,
    errors,
    setErrors,
    validateForm,
    validatePasswordOnly,
    resetForm,
  };
};
