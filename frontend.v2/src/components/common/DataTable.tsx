import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
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
  isLoading: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  actions?: DataTableAction<T>[];
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
  skeleton?: number;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading,
  sortBy,
  sortDirection,
  onSort,
  actions = [],
  emptyMessage = 'Tidak ada data',
  rowClassName,
  skeleton = 5,
}: DataTableProps<T>) {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const colSpan = columns.length + (actions.length > 0 ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                style={{ width: column.width }}
                className={`text-xs ${
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                } ${column.sortable && onSort ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                onClick={() => {
                  if (column.sortable && onSort) {
                    onSort(String(column.key));
                  }
                }}
              >
                <div className={`flex items-center ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                  {column.header}
                  {column.sortable && getSortIcon(String(column.key))}
                </div>
              </TableHead>
            ))}
            {actions.length > 0 && <TableHead className="text-center w-16">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeleton }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={colSpan}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center py-10 text-muted-foreground text-sm">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow key={row.id ?? idx} className={rowClassName?.(row)}>
                {columns.map((column) => (
                  <TableCell
                    key={`${idx}-${String(column.key)}`}
                    className={`text-sm ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? '—')}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell className="text-center">
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
                            onClick={() => action.onClick(row)}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
