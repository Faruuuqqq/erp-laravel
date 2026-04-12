/**
 * Stock direction constants and utilities
 * Normalizes various incoming/outgoing type strings to standardized 'IN' | 'OUT' format
 */

export type StockDirection = 'IN' | 'OUT';

/**
 * Type strings that represent stock coming IN
 * Handles: 'in', 'purchase', 'retur_penjualan', 'return_sale', 'IN', 'PURCHASE', etc.
 */
const IN_TYPES = ['in', 'purchase', 'retur_penjualan', 'return_sale', 'pembelian'];

/**
 * Normalize direction type string from backend
 * Handles various formats and returns standardized 'IN' | 'OUT'
 *
 * @example
 * resolveDirection('purchase') // → 'IN'
 * resolveDirection('sale') // → 'OUT'
 * resolveDirection('RETUR_PENJUALAN') // → 'IN'
 */
export const resolveDirection = (type: string): StockDirection => {
  return IN_TYPES.includes(type.toLowerCase()) ? 'IN' : 'OUT';
};

/**
 * Get direction label for display
 */
export const getDirectionLabel = (direction: StockDirection): string => {
  return direction === 'IN' ? 'Masuk' : 'Keluar';
};
