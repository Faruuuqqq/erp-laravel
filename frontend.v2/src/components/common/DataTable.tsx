import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Download, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchInput } from './SearchInput';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import * as XLSX from 'xlsx';

// ============================================
// Helper Functions
// ============================================

const getAlignmentClass = (align?: 'left' | 'center' | 'right'): string => {
  switch (align) {
    case 'right':
      return 'text-right justify-end';
    case 'center':
      return 'text-center justify-center';
    default:
      return 'text-left justify-start';
  }
};

const ICON_SIZES = {
  small: 'h-3 w-3',
  normal: 'h-4 w-4',
  large: 'h-5 w-5',
} as const;

const TEXT_SIZES = {
  header: 'text-xs font-semibold',
  body: 'text-sm',
  label: 'text-xs text-muted-foreground',
} as const;

const ACTION_COLUMN_WIDTH = 'w-[108px]';
const DEFAULT_ROWS_PER_PAGE = 25;

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
}

export interface DataTableAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'ghost' | 'destructive';
  show?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  variant?: 'default' | 'master';
  isLoading?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  actions?: DataTableAction<T>[];
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
  skeleton?: number;
  // New features
  filterable?: boolean;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  exportable?: boolean;
  exportFilename?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onRowSelect?: (selected: T[]) => void;
  searchPlaceholder?: string;
  filterableColumns?: (keyof T)[];
  dense?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  variant = 'default',
  isLoading = false,
  sortBy,
  sortDirection,
  onSort,
  actions = [],
  emptyMessage = 'Tidak ada data',
  rowClassName,
  skeleton = 5,
  filterable = true,
  pagination = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  exportable = false,
  exportFilename = 'data',
  onRowClick,
  selectable = false,
  onRowSelect,
  searchPlaceholder = 'Cari...',
  filterableColumns,
  dense = false,
}: DataTableProps<T>) {
  // Sorting
  const [internalSortBy, setInternalSortBy] = useState<string | null>(sortBy ?? null);
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>(sortDirection ?? 'asc');

  // Searching
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    rowsPerPageOptions.includes(DEFAULT_ROWS_PER_PAGE)
      ? DEFAULT_ROWS_PER_PAGE
      : (rowsPerPageOptions[0] ?? DEFAULT_ROWS_PER_PAGE)
  );

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => String(col.key)))
  );

  // Row selection
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const isMasterVariant = variant === 'master';
  const currentSortField = sortBy || internalSortBy;
  const currentSortDir = sortDirection || internalSortDir;

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterable || !debouncedSearch) return data;

    const cols = filterableColumns || columns.filter(col => col.filterable).map(col => col.key);
    
    return data.filter(row => {
      const searchLower = debouncedSearch.toLowerCase();
      return cols.some(col => {
        const value = String(row[col] ?? '').toLowerCase();
        return value.includes(searchLower);
      });
    });
  }, [data, debouncedSearch, filterable, filterableColumns, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    if (currentSortField) {
      sorted.sort((a, b) => {
        const aVal = a[currentSortField as keyof T];
        const bVal = b[currentSortField as keyof T];

        if (aVal == null) return currentSortDir === 'asc' ? 1 : -1;
        if (bVal == null) return currentSortDir === 'asc' ? -1 : 1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return currentSortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return currentSortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return sorted;
  }, [filteredData, currentSortField, currentSortDir]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage, pagination]);

  const totalPages = pagination ? Math.ceil(sortedData.length / rowsPerPage) : 1;

  useEffect(() => {
    if (!pagination) return;

    const safeTotalPages = Math.max(totalPages, 1);
    setCurrentPage(prev => {
      if (prev < 1) return 1;
      if (prev > safeTotalPages) return safeTotalPages;
      return prev;
    });
  }, [pagination, totalPages]);

  // Handlers
  const handleSort = useCallback((field: string) => {
    if (onSort) {
      onSort(field);
    } else {
      if (internalSortBy === field) {
        setInternalSortDir(internalSortDir === 'asc' ? 'desc' : 'asc');
      } else {
        setInternalSortBy(field);
        setInternalSortDir('asc');
      }
    }
  }, [internalSortBy, internalSortDir, onSort]);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const newSelected = new Set(paginatedData.map(row => row.id ?? ''));
      setSelectedRows(newSelected);
      const selectedItems = paginatedData.filter(row => newSelected.has(row.id ?? ''));
      onRowSelect?.(selectedItems);
    }
  }, [paginatedData, selectedRows, onRowSelect]);

  const handleSelectRow = useCallback((rowId: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    const selectedItems = paginatedData.filter(row => newSelected.has(row.id ?? ''));
    onRowSelect?.(selectedItems);
  }, [paginatedData, selectedRows, onRowSelect]);

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    const exportData = sortedData.map(row => {
      const obj: Record<string, any> = {};
      columns.forEach(col => {
        if (visibleColumns.has(String(col.key))) {
          obj[col.header] = row[col.key];
        }
      });
      return obj;
    });

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `${exportFilename}.xlsx`);
    } else {
      const csv = exportData.map((row, idx) => {
        if (idx === 0) {
          return Object.keys(row).join(',');
        }
        return Object.values(row)
          .map(val => (typeof val === 'string' && val.includes(',') ? `"${val}"` : val))
          .join(',');
      }).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFilename}.csv`;
      a.click();
    }
  }, [sortedData, columns, visibleColumns, exportFilename]);

  const getSortIcon = (field: string) => {
    if (currentSortField !== field) return null;
    return currentSortDir === 'asc' ? (
      <ArrowUp className={cn(ICON_SIZES.normal, 'ml-1')} />
    ) : (
      <ArrowDown className={cn(ICON_SIZES.normal, 'ml-1')} />
    );
  };

  const colSpan = (selectable ? 1 : 0)
    + Array.from(visibleColumns).length
    + (actions.length > 0 ? 1 : 0);

  const rangeStart = filteredData.length === 0
    ? 0
    : ((currentPage - 1) * rowsPerPage) + 1;
  const rangeEnd = filteredData.length === 0
    ? 0
    : Math.min(currentPage * rowsPerPage, filteredData.length);

  return (
    <div className="overflow-hidden rounded-md">
      {/* Header with search and export */}
      <div
        className={cn(
          'px-4',
          isMasterVariant
            ? 'flex flex-col gap-3 border-b bg-muted/20 py-3 sm:flex-row sm:items-center sm:justify-between'
            : 'flex items-center justify-between gap-4 py-2'
        )}
      >
        <div className="flex flex-1 items-center gap-3">
          {filterable && (
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={searchPlaceholder}
              className="w-full sm:max-w-xs"
            />
          )}
          {isMasterVariant && (
            <div className="hidden text-xs text-muted-foreground sm:block">
              Menampilkan <span className="font-medium text-foreground">{filteredData.length}</span>
              {' '}dari {data.length} data
            </div>
          )}
        </div>

        <div className={cn('flex items-center gap-2', isMasterVariant ? 'self-end sm:self-auto' : 'ml-auto')}>
          {/* Column visibility toggle */}
          {columns.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Atur visibilitas kolom"
                  title="Atur kolom"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tampilkan Kolom</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map(col => (
                  <DropdownMenuCheckboxItem
                    key={String(col.key)}
                    checked={visibleColumns.has(String(col.key))}
                    onCheckedChange={(checked) => {
                      const newVisible = new Set(visibleColumns);
                      if (checked) {
                        newVisible.add(String(col.key));
                      } else {
                        newVisible.delete(String(col.key));
                      }
                      setVisibleColumns(newVisible);
                    }}
                  >
                    {col.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export button */}
          {exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Ekspor data"
                  title="Ekspor data"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ekspor Sebagai</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  Excel (XLSX)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className={cn(isMasterVariant && 'bg-muted/30')}>
            <TableRow className={cn(isMasterVariant && 'hover:bg-transparent')}>
               {selectable && (
                 <TableHead className="w-12">
                   <Checkbox
                     checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                     onCheckedChange={handleSelectAll}
                     aria-label="Pilih semua baris"
                   />
                 </TableHead>
               )}
                {columns.map((column) => {
                  if (!visibleColumns.has(String(column.key))) return null;

                  const isSorted = currentSortField === String(column.key);
                  const isSortable = !!column.sortable;

                  return (
                    <TableHead
                      key={String(column.key)}
                      style={{ width: column.width }}
                      aria-sort={
                        isSortable
                          ? isSorted
                            ? (currentSortDir === 'asc' ? 'ascending' : 'descending')
                            : 'none'
                          : undefined
                      }
                      tabIndex={isSortable ? 0 : undefined}
                      className={cn(
                        TEXT_SIZES.header,
                        isMasterVariant && 'h-11 whitespace-nowrap',
                        getAlignmentClass(column.align),
                        isSortable
                          ? 'cursor-pointer select-none hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-colors'
                          : ''
                      )}
                      onClick={() => {
                        if (isSortable) {
                          handleSort(String(column.key));
                        }
                      }}
                      onKeyDown={event => {
                        if (!isSortable) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleSort(String(column.key));
                        }
                      }}
                    >
                      <div className={cn('flex items-center gap-1', getAlignmentClass(column.align))}>
                        {column.header}
                        {isSortable && getSortIcon(String(column.key))}
                      </div>
                    </TableHead>
                  );
               })}
              {actions.length > 0 && (
                <TableHead className={cn('text-center', ACTION_COLUMN_WIDTH)}>Aksi</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: skeleton }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={colSpan}>
                    <Skeleton className={`h-8 w-full ${dense ? 'h-6' : ''}`} />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
               paginatedData.map((row, idx) => {
                 const rowId = row.id ?? '';
                 const isRowSelected = selectedRows.has(rowId);

                 return (
                  <TableRow
                    key={row.id ?? idx}
                    className={cn(
                      'transition-colors',
                      isMasterVariant ? 'odd:bg-muted/[0.02] hover:bg-muted/40' : 'hover:bg-muted/30',
                      rowClassName?.(row),
                      onRowClick && 'cursor-pointer',
                      isRowSelected && 'bg-primary/5 hover:bg-primary/10'
                   )}
                   onClick={() => onRowClick?.(row)}
                 >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isRowSelected}
                          onCheckedChange={() => handleSelectRow(rowId)}
                          onClick={e => e.stopPropagation()}
                          aria-label={`Pilih baris ${row.id}`}
                        />
                     </TableCell>
                   )}
                   {columns.map((column) => {
                     if (!visibleColumns.has(String(column.key))) return null;
                     return (
                       <TableCell
                         key={`${idx}-${String(column.key)}`}
                          className={cn(
                            TEXT_SIZES.body,
                            getAlignmentClass(column.align),
                            dense ? 'py-2' : 'py-3'
                          )}
                        >
                         {column.render
                           ? column.render(row[column.key], row)
                           : String(row[column.key] ?? '—')}
                       </TableCell>
                     );
                   })}
                   {actions.length > 0 && (
                     <TableCell className={cn('text-center', ACTION_COLUMN_WIDTH)}>
                       <div className="flex items-center justify-center gap-1">
                        {actions.map((action, actionIdx) => {
                          const show = action.show ? action.show(row) : true;
                          if (!show) return null;

                          return (
                            <Button
                              key={actionIdx}
                              variant={action.variant ?? 'ghost'}
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              aria-label={action.label}
                              title={action.label}
                            >
                              {action.icon}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </div>

       {/* Pagination footer */}
       {pagination && (
         <div
           className={cn(
             'border-t px-4',
             isMasterVariant
               ? 'flex flex-col gap-3 bg-muted/20 py-3 sm:flex-row sm:items-center sm:justify-between'
               : 'flex items-center justify-between pt-4'
           )}
         >
           <div className={TEXT_SIZES.label}>
              {filteredData.length === 0
                ? 'Tidak ada data'
                : `${rangeStart}–${rangeEnd} dari ${filteredData.length} data`}
            </div>
           <div className={cn('flex flex-wrap items-center', isMasterVariant ? 'gap-3 sm:gap-4' : 'gap-4')}>
              <div className="flex items-center gap-2">
                <span className={TEXT_SIZES.label}>Baris</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={value => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className={cn('w-24 bg-background', isMasterVariant ? 'h-8' : 'h-9')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                 {rowsPerPageOptions.map(option => (
                   <SelectItem key={option} value={String(option)}>
                     {option} baris
                   </SelectItem>
                 ))}
                </SelectContent>
              </Select>
              </div>

              <div className={cn('flex items-center gap-1 rounded-md bg-background', isMasterVariant ? 'border p-1' : 'gap-2')}>
                <Button
                  variant={isMasterVariant ? 'ghost' : 'outline'}
                  size="icon"
                  className={cn(isMasterVariant ? 'h-7 w-7' : 'h-8 w-8')}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  title="Halaman sebelumnya"
                >
                  <ChevronLeft className={ICON_SIZES.normal} />
                </Button>
                <div className="flex min-w-16 items-center justify-center gap-1 text-sm font-medium tabular-nums">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant={isMasterVariant ? 'ghost' : 'outline'}
                  size="icon"
                  className={cn(isMasterVariant ? 'h-7 w-7' : 'h-8 w-8')}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Halaman berikutnya"
                  title="Halaman berikutnya"
                >
                  <ChevronRight className={ICON_SIZES.normal} />
                </Button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
