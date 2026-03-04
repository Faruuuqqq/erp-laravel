import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: string[];
}

export const PageHeader = ({ title, description, actions, breadcrumb }: PageHeaderProps) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div>
      {breadcrumb && (
        <p className="mb-1 text-xs text-muted-foreground">{breadcrumb.join(' › ')}</p>
      )}
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

interface DataTableContainerProps {
  children: ReactNode;
  className?: string;
}

export const DataTableContainer = ({ children, className }: DataTableContainerProps) => (
  <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
    {children}
  </div>
);

interface StatusBadgeProps {
  status: string;
  variant?: 'lunas' | 'kredit' | 'sebagian' | 'selesai' | 'aktif' | 'nonaktif' | 'masuk' | 'keluar';
}

const statusStyles: Record<string, string> = {
  lunas: 'bg-success/10 text-success border-success/30',
  kredit: 'bg-warning/10 text-warning border-warning/30',
  sebagian: 'bg-info/10 text-info border-info/30',
  selesai: 'bg-muted text-muted-foreground border-border',
  aktif: 'bg-success/10 text-success border-success/30',
  nonaktif: 'bg-muted text-muted-foreground border-border',
  masuk: 'bg-success/10 text-success border-success/30',
  keluar: 'bg-destructive/10 text-destructive border-destructive/30',
};

export const StatusBadge = ({ status, variant }: StatusBadgeProps) => {
  const key = variant || status.toLowerCase().replace(' ', '_');
  const style = statusStyles[key] || 'bg-muted text-muted-foreground';
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', style)}>
      {status}
    </span>
  );
};

export const CurrencyCell = ({ value, color }: { value: number; color?: 'red' | 'green' | 'default' }) => (
  <span className={cn(
    'tabular font-medium',
    color === 'red' && 'text-destructive',
    color === 'green' && 'text-success',
    color === 'default' && 'text-foreground',
  )}>
    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
  </span>
);
