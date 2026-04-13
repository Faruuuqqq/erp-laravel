import { useCallback, useState } from 'react';

/**
 * Hook untuk mengelola state sorting di tabel
 * @template T - Tipe field yang di-sort (biasanya union type dari nama kolom)
 * 
 * Usage:
 * const { sortBy, sortDirection, toggleSort, getSortIcon } = useTableSort('nama');
 * 
 * // In JSX:
 * <th onClick={() => toggleSort('nama')}>
 *   Nama {getSortIcon('nama') && <ArrowUp />}
 * </th>
 */
export function useTableSort<T extends string>(initialField: T) {
  const [sortBy, setSortBy] = useState<T>(initialField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleSort = useCallback((field: T) => {
    if (sortBy === field) {
      // Jika field sama, toggle direction
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      // Jika field berbeda, set field baru dengan direction asc
      setSortBy(field);
      setSortDirection('asc');
    }
  }, [sortBy]);

  /**
   * Helper untuk check apakah field sedang di-sort dan direction-nya
   * @returns 'asc' | 'desc' | null
   */
  const getSortIcon = useCallback((field: T): 'asc' | 'desc' | null => {
    return sortBy === field ? sortDirection : null;
  }, [sortBy, sortDirection]);

  return {
    sortBy,
    sortDirection,
    toggleSort,
    getSortIcon,
  };
}
