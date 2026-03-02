import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TransactionType } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Date formatting
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: false },
  };

  return new Intl.DateTimeFormat('id-ID', options[format]).format(dateObj);
}

// Number formatting
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

// Invoice number generation
export function generateInvoiceNumber(type: TransactionType): string {
  const prefixes = {
    pembelian: 'PB',
    penjualan_tunai: 'PJ',
    penjualan_kredit: 'PK',
    retur_pembelian: 'RPB',
    retur_penjualan: 'RPJ',
    pembayaran_utang: 'PU',
    pembayaran_piutang: 'PP',
    surat_jalan: 'SJ',
    kontra_bon: 'KB',
  };

  const prefix = prefixes[type];
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

  return `${prefix}-${year}-${month}-${random}`;
}

// Discount calculation
export function calculateDiscount(price: number, discount: number): number {
  return price - (price * discount / 100);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// Calculate total from items
export function calculateTotal(items: Array<{ quantity: number; price: number; discount: number }>): number {
  return items.reduce((total, item) => {
    const subtotal = item.quantity * item.price * (1 - item.discount / 100);
    return total + subtotal;
  }, 0);
}

// Calculate change
export function calculateChange(paid: number, total: number): number {
  return Math.max(0, paid - total);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Check if stock is low
export function isLowStock(stock: number, minStock: number): boolean {
  return stock <= minStock;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Parse number from string
export function parseNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}
