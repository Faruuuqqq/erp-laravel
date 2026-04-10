import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchProducts } from '@/hooks/api/useProductsSearch';
import { Search } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebounce';

interface ProductSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ProductSearchSelect = ({ 
  value, 
  onChange, 
  placeholder = 'Cari produk...' 
}: ProductSearchSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [isOpen, setIsOpen] = useState(false);
  
  const { data, isLoading, refetch } = useSearchProducts({ 
    search: debouncedSearch, 
    enabled: isOpen 
  });

  const products = data?.data?.data ?? [];

  // Load all products when dropdown opens for first time
  useEffect(() => {
    if (isOpen && !debouncedSearch && products.length === 0) {
      refetch();
    }
  }, [isOpen, debouncedSearch, products.length, refetch]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) {
                setIsOpen(true);
              }
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-9"
          />
        </div>
        <Select value={value} onValueChange={onChange} open={isOpen} onOpenChange={setIsOpen}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih produk" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground">Memuat...</div>
            ) : products.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                {debouncedSearch ? 'Produk tidak ditemukan' : 'Ketik untuk mencari produk'}
              </div>
            ) : (
              products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.code})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};