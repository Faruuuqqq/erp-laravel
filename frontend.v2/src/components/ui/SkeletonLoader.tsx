import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ className, variant = 'rectangular', width, height }: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-muted rounded-sm';
  
  const variantClasses = {
    text: 'h-4 w-3/4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  );
};

// Skeleton preset untuk pattern umum
export const TableRowSkeleton = () => (
  <div className="flex gap-3 p-4 border-b animate-pulse">
    <Skeleton className="h-5 w-20 flex-shrink-0" />
    <Skeleton className="h-5 flex-1" />
    <Skeleton className="h-5 w-24 flex-shrink-0" />
    <Skeleton className="h-5 w-20 flex-shrink-0" />
    <Skeleton className="h-5 w-28 flex-shrink-0" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-1">
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} />
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="space-y-3 p-4 border rounded-xl animate-pulse">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-20 w-full" />
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="space-y-2 p-4 border rounded-lg animate-pulse">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
  </div>
);