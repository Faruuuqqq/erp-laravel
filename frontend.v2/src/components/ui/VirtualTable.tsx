import { FixedSizeList as List, ListChildComponentProps } from 'react-windowed';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface ColumnDef<T = unknown> {
  key: string;
  header: string | React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
  headerClassName?: string;
}

interface VirtualTableProps<T = unknown> {
  data: T[];
  columns: ColumnDef<T>[];
  rowHeight?: number;
  height?: number;
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  stickyHeader?: boolean;
  caption?: string;
}

export function VirtualTable<T = unknown>({
  data,
  columns,
  rowHeight = 48,
  height = 400,
  children,
  className,
  isLoading = false,
  error = null,
  emptyMessage = 'Tidak ada data yang ditemukan',
  stickyHeader = true,
  caption,
}: VirtualTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="animate-pulse">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-destructive">
          <div>{error.message || 'Terjadi kesalahan saat memuat data'}</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div>{emptyMessage}</div>
        </div>
      </div>
    );
  }

  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = data[index];
    return (
      <TableRow
        style={style}
        className="border-b hover:bg-muted/50 transition-colors"
      >
        {columns.map((column) => (
          <TableCell
            key={column.key}
            className={cn(column.className)}
            style={{ width: column.width }}
          >
            {column.render(item, index)}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        {stickyHeader && (
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    'sticky top-0 bg-background z-10',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody className="block">
          <List
            className="!max-h-none"
            height={height}
            itemCount={data.length}
            itemSize={rowHeight}
            width="100%"
          >
            {Row}
          </List>
        </TableBody>
      </Table>
      {children && (
        <div className="mt-4 flex items-center justify-between">
          {children}
        </div>
      )}
    </div>
  );
}
