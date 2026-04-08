import { useToast } from '@/components/ui/use-toast';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CartItem {
  productId: string;
  nama: string;
  satuan: string;
  qty: number;
  harga: number;
  diskon: number;
  subtotal: number;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  sellPrice: number;
  unit: string;
}

export const useValidateQty = () => {
  const { toast } = useToast();

  /**
   * Validate quantity input
   * Rules: qty must be > 0
   */
  const validateQtyInput = (qty: string): ValidationResult => {
    const qtyNum = parseInt(qty) || 0;
    if (qtyNum <= 0) {
      return { isValid: false, error: 'Jumlah harus lebih dari 0' };
    }
    return { isValid: true };
  };

  /**
   * Validate discount percentage
   * Rules: 0 <= discount <= 100
   */
  const validateDiscount = (discount: string): ValidationResult => {
    const discNum = parseFloat(discount) || 0;
    if (discNum < 0 || discNum > 100) {
      return { isValid: false, error: 'Diskon harus antara 0 - 100%' };
    }
    return { isValid: true };
  };

  /**
   * Validate stock availability
   * Rules: qty <= available stock
   */
  const validateStock = (qty: number, availableStock: number): ValidationResult => {
    if (qty > availableStock) {
      return { isValid: false, error: `Stok tidak cukup. Tersedia: ${availableStock}` };
    }
    return { isValid: true };
  };

  /**
   * Validate product can be added to cart
   * Checks: qty input, discount input, stock availability
   */
  const validateAddToCart = (
    qty: string,
    discount: string,
    product: Product
  ): ValidationResult => {
    // Validate quantity input
    const qtyValidation = validateQtyInput(qty);
    if (!qtyValidation.isValid) {
      return qtyValidation;
    }

    // Validate discount input
    const discValidation = validateDiscount(discount);
    if (!discValidation.isValid) {
      return discValidation;
    }

    const qtyNum = parseInt(qty);
    // Validate stock
    const stockValidation = validateStock(qtyNum, product.stock);
    if (!stockValidation.isValid) {
      return stockValidation;
    }

    return { isValid: true };
  };

  /**
   * Validate cart total discount
   * Rules: 0 <= total discount <= subtotal amount
   */
  const validateTotalDiscount = (
    totalDiscount: string,
    subtotal: number
  ): ValidationResult => {
    const discNum = parseFloat(totalDiscount) || 0;
    if (discNum < 0) {
      return { isValid: false, error: 'Diskon tidak boleh negatif' };
    }
    if (discNum > subtotal) {
      return { isValid: false, error: `Diskon tidak boleh melebihi subtotal (${subtotal})` };
    }
    return { isValid: true };
  };

  /**
   * Validate cart is not empty
   */
  const validateCartNotEmpty = (cart: CartItem[]): ValidationResult => {
    if (cart.length === 0) {
      return { isValid: false, error: 'Keranjang kosong. Tambahkan produk terlebih dahulu' };
    }
    return { isValid: true };
  };

  /**
   * Show validation error as toast
   */
  const showValidationError = (error: string) => {
    toast({
      title: error,
      variant: 'destructive',
    });
  };

  /**
   * Show validation success as toast
   */
  const showValidationSuccess = (message: string) => {
    toast({
      title: message,
      variant: 'default',
    });
  };

  return {
    validateQtyInput,
    validateDiscount,
    validateStock,
    validateAddToCart,
    validateTotalDiscount,
    validateCartNotEmpty,
    showValidationError,
    showValidationSuccess,
  };
};
