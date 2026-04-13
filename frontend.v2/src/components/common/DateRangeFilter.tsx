import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DateRangeFilterProps {
  /**
   * Nilai tanggal mulai (YYYY-MM-DD format)
   */
  dateFrom: string;

  /**
   * Nilai tanggal akhir (YYYY-MM-DD format)
   */
  dateTo: string;

  /**
   * Callback saat tanggal mulai berubah
   */
  onDateFromChange: (date: string) => void;

  /**
   * Callback saat tanggal akhir berubah
   */
  onDateToChange: (date: string) => void;

  /**
   * Callback untuk tombol reset
   */
  onReset?: () => void;

  /**
   * Label untuk filter
   * @default "Tanggal"
   */
  label?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Hapus tombol reset
   */
  hideReset?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Component untuk filter date range
 * Menampilkan 2 input date (dari - ke) dengan tombol reset
 *
 * @example
 * const [dateFrom, setDateFrom] = useState('');
 * const [dateTo, setDateTo] = useState('');
 *
 * <DateRangeFilter
 *   dateFrom={dateFrom}
 *   dateTo={dateTo}
 *   onDateFromChange={setDateFrom}
 *   onDateToChange={setDateTo}
 *   onReset={() => {
 *     setDateFrom('');
 *     setDateTo('');
 *   }}
 *   label="Tanggal Transaksi"
 * />
 */
export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
  label = 'Tanggal',
  disabled = false,
  hideReset = false,
  className,
}: DateRangeFilterProps) {
  const hasValue = dateFrom || dateTo;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 ${className ?? ''}`}>
      {/* Label */}
      <span className="text-sm font-medium text-foreground whitespace-nowrap">
        {label}:
      </span>

      {/* Date From */}
      <Input
        type="date"
        value={dateFrom}
        onChange={e => onDateFromChange(e.target.value)}
        className="w-full sm:w-40"
        disabled={disabled}
        title="Tanggal mulai"
      />

      {/* Separator */}
      <span className="text-sm text-muted-foreground hidden sm:inline">
        s/d
      </span>

      {/* Date To */}
      <Input
        type="date"
        value={dateTo}
        onChange={e => onDateToChange(e.target.value)}
        className="w-full sm:w-40"
        disabled={disabled}
        title="Tanggal akhir"
      />

      {/* Reset Button */}
      {!hideReset && onReset && hasValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={disabled}
          className="ml-auto sm:ml-0 w-full sm:w-auto"
          title="Reset filter tanggal"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
