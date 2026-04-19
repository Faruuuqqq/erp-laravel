import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface SearchInputProps {
  /**
   * Value dari search input
   */
  value: string;

  /**
   * Callback saat nilai input berubah
   */
  onChange: (value: string) => void;

  /**
   * Callback saat nilai debounced berubah
   * Biasanya dipakai untuk trigger API call
   */
  onSearch?: (value: string) => void;

  /**
   * Placeholder text
   * @default "Cari..."
   */
  placeholder?: string;

  /**
   * Delay debounce dalam milliseconds
   * @default 300
   */
  debounceMs?: number;

  /**
   * CSS class tambahan
   */
  className?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Component search input dengan debounce bawaan
 * Menggabungkan immediate onChange dengan debounced onSearch
 *
 * @example
 * const [search, setSearch] = useState('');
 *
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   onSearch={(debouncedValue) => {
 *     // Trigger API call dengan debouncedValue
 *   }}
 *   debounceMs={300}
 * />
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Cari...',
  debounceMs = 300,
  className,
  disabled = false,
}: SearchInputProps) {
  // Get debounced value
  const debouncedValue = useDebouncedValue(value, debounceMs);

  // Trigger onSearch when debounced value changes
  useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className={`relative w-full ${className ?? ''}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-9"
        disabled={disabled}
      />
    </div>
  );
}
