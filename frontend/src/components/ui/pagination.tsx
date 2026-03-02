import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  className?: string;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  size?: 'default' | 'sm' | 'lg';
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
  itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS,
  size = 'default',
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;
  const canGoToFirst = canGoBack;
  const canGoToLast = canGoForward;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Info Tampilan */}
      <div className={cn(
        'text-sm text-muted-foreground flex items-center gap-2',
        size === 'sm' && 'text-xs'
      )}>
        <span>
          {startItem}-{endItem} dari {totalItems} item
        </span>
      </div>

      {/* Items Per Page Selector */}
      {showItemsPerPage && (
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange?.(parseInt(value))}
        >
          <SelectTrigger className={cn('h-8 w-[100px]', size === 'sm' && 'h-6 w-[80px]')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {itemsPerPageOptions.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option} / halaman
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(1)}
          disabled={!canGoToFirst}
          className="p-0 h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoBack}
          className="p-0 h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers - Max 5 page buttons shown */}
        {totalPages <= 7 ? (
          // Show all pages if <= 7
          pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size={size}
              onClick={() => handlePageChange(page)}
              className={cn(
                'p-0 h-8 w-8 font-medium',
                currentPage === page && 'ring-2 ring-primary'
              )}
            >
              {page}
            </Button>
          ))
        ) : (
          // Show limited page buttons with ellipsis
          <>
            {/* First page */}
            <Button
              variant={currentPage === 1 ? 'default' : 'outline'}
              size={size}
              onClick={() => handlePageChange(1)}
              className={cn('p-0 h-8 w-8 font-medium')}
            >
              1
            </Button>

            {/* Left ellipsis */}
            {currentPage > 3 && (
              <Button
                variant="outline"
                size={size}
                onClick={() => handlePageChange(currentPage - 2)}
                className="p-0 h-8 w-8"
              >
                ...
              </Button>
            )}

            {/* Previous page */}
            {currentPage > 2 && (
              <Button
                variant="outline"
                size={size}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-0 h-8 w-8"
              >
                {currentPage - 1}
              </Button>
            )}

            {/* Current page */}
            <Button
              variant="default"
              size={size}
              className={cn('p-0 h-8 w-8 font-medium ring-2 ring-primary')}
              disabled
            >
              {currentPage}
            </Button>

            {/* Next page */}
            {currentPage < totalPages - 1 && (
              <Button
                variant="outline"
                size={size}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-0 h-8 w-8"
              >
                {currentPage + 1}
              </Button>
            )}

            {/* Right ellipsis */}
            {currentPage < totalPages - 2 && (
              <Button
                variant="outline"
                size={size}
                onClick={() => handlePageChange(currentPage + 2)}
                className="p-0 h-8 w-8"
              >
                ...
              </Button>
            )}

            {/* Last page */}
            <Button
              variant={totalPages === currentPage ? 'default' : 'outline'}
              size={size}
              onClick={() => handlePageChange(totalPages)}
              className={cn('p-0 h-8 w-8 font-medium')}
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* Next Page */}
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoForward}
          className="p-0 h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size={size}
          onClick={() => handlePageChange(totalPages)}
          halaman terakhir
          disabled={!canGoToLast}
          className="p-0 h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
