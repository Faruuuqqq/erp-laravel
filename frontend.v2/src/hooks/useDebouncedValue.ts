import { useState, useEffect } from 'react';

/**
 * Debounce a value by the given delay (default 300ms).
 * Use this before passing a search term to an API hook to avoid
 * triggering a new request on every keystroke.
 *
 * @example
 * const debouncedSearch = useDebouncedValue(searchTerm, 300);
 * const { data } = useCustomers({ search: debouncedSearch });
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
