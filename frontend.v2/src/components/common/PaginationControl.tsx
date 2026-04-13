import { Button } from '@/components/ui/button';

interface PaginationControlProps {
  /**
   * Halaman saat ini (1-indexed)
   */
  currentPage: number;

  /**
   * Callback ketika halaman berubah
   */
  onPageChange: (page: number) => void;

  /**
   * Total halaman
   */
  totalPages: number;

  /**
   * Total item keseluruhan
   */
  totalItems: number;

  /**
   * Items per halaman
   * @default 20
   */
  itemsPerPage?: number;

  /**
   * Tipe pagination
   * - 'simple': Previous/Next buttons saja
   * - 'full': Previous + numbered buttons + Next
   * @default 'simple'
   */
  type?: 'simple' | 'full';

  /**
   * Label untuk text info (e.g., "produk", "data", "transaksi")
   * @default 'data'
   */
  label?: string;
}

/**
 * Component untuk menampilkan pagination controls
 * Mendukung 2 mode: simple (prev/next) dan full (numbered buttons)
 */
export function PaginationControl({
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
  itemsPerPage = 20,
  type = 'simple',
  label = 'data',
}: PaginationControlProps) {
  // Jangan tampilkan jika hanya 1 halaman
  if (totalPages <= 1) return null;

  // Hitung item yang sedang ditampilkan
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        Menampilkan {startItem} - {endItem} dari {totalItems} {label}
      </p>

      {/* Pagination buttons */}
      {type === 'simple' ? (
        // Simple: Previous/Next only
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Berikutnya →
          </Button>
        </div>
      ) : (
        // Full: Previous + numbered + Next
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Sebelumnya
          </Button>

          {/* Numbered page buttons */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
}
