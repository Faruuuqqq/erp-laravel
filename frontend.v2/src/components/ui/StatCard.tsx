import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/data/mockData';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  currency?: boolean;
  onClick?: () => void;
}

const colorMap = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
  },
  destructive: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/20',
  },
};

export const StatCard = ({
  title, value, subValue, icon, trend, trendValue, color = 'primary', onClick,
}: StatCardProps) => {
  const colors = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200',
        colors.border,
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colors.bg)}>
          <div className={colors.text}>{icon}</div>
        </div>

        {trend && trendValue && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
            trend === 'up' && 'bg-success/10 text-success',
            trend === 'down' && 'bg-destructive/10 text-destructive',
            trend === 'neutral' && 'bg-muted text-muted-foreground',
          )}>
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className={cn('text-2xl font-bold tabular', colors.text)}>
          {typeof value === 'number' ? formatRupiah(value) : value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        {subValue && <p className="mt-0.5 text-xs text-muted-foreground">{subValue}</p>}
      </div>
    </div>
  );
};
