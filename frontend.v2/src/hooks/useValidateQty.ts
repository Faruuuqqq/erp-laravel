import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useValidateQty = () => {
  const { toast } = useToast();

  const showValidationError = (message: string) => {
    toast({
      title: 'Validasi Gagal',
      description: message,
      variant: 'destructive'
    });
  };

  const validateAddToCart = (qty: string, diskon: string, product: any) => {
    // Validate quantity
    const qtyNum = parseInt(qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return { isValid: false, error: 'Quantity harus lebih dari 0' };
    }

    // Validate discount
    const diskonNum = parseFloat(diskon);
    if (isNaN(diskonNum) || diskonNum < 0 || diskonNum > 100) {
      return { isValid: false, error: 'Diskon harus antara 0 dan 100' };
    }

    // Check stock availability
    if (product.stock < qtyNum) {
      return { isValid: false, error: `Stok tidak mencukupi. Stok tersedia: ${product.stock}` };
    }

    return { isValid: true };
  };

  const validateTotalDiscount = (diskonTotal: string, subtotal: number) => {
    const diskonNum = parseFloat(diskonTotal);
    if (isNaN(diskonNum) || diskonNum < 0) {
      return { isValid: false, error: 'Diskon total tidak valid' };
    }

    if (subtotal > 0 && diskonNum > subtotal) {
      return { isValid: false, error: 'Diskon total tidak boleh melebihi subtotal' };
    }

    return { isValid: true };
  };

  const validateCartNotEmpty = (cart: any[]) => {
    if (cart.length === 0) {
      return { isValid: false, error: 'Keranjang belanja masih kosong' };
    }
    return { isValid: true };
  };

  return {
    validateAddToCart,
    validateTotalDiscount,
    validateCartNotEmpty,
    showValidationError
  };
};