import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DashboardShimmer = () => {
  return (
    <div className="space-y-6">
      {/* Stat Cards Shimmer */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-border bg-card p-4 animate-shimmer relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)/0.5) 25%, hsl(var(--muted)/0.3) 50%, hsl(var(--muted)/0.5) 75%)',
              backgroundSize: '200% 100%',
              animation: `shimmer 1.5s infinite linear ${i * 0.2}s`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted/50 rounded" />
                  <div className="h-3 w-16 bg-muted/50 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Owner-only extra stats shimmer */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-border bg-card p-4 animate-shimmer relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)/0.5) 25%, hsl(var(--muted)/0.3) 50%, hsl(var(--muted)/0.5) 75%)',
              backgroundSize: '200% 100%',
              animation: `shimmer 1.5s infinite linear ${i * 0.2}s`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted/50 rounded" />
                  <div className="h-3 w-16 bg-muted/50 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary shimmer */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg border border-border bg-card p-6 animate-shimmer relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--muted)/0.5) 25%, hsl(var(--muted)/0.3) 50%, hsl(var(--muted)/0.5) 75%)',
                backgroundSize: '200% 100%',
                animation: `shimmer 2s infinite linear ${i * 0.2}s`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-muted/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted/50 rounded" />
                    <div className="h-3 w-24 bg-muted/50 rounded" />
                    <div className="h-3 w-20 bg-muted/50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 rounded-lg border border-border bg-card p-6 animate-shimmer relative overflow-hidden">
          <div
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)/0.5) 25%, hsl(var(--muted)/0.3) 50%, hsl(var(--muted)/0.5) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite linear',
            }}
          />
        </div>
      </div>

      {/* Recent Transactions shimmer */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <div className="h-14 border-b p-4 animate-shimmer relative overflow-hidden">
            <div
              style={{
                background: 'linear-gradient(90deg, hsl(var(--muted)/0.5) 25%, hsl(var(--muted)/0.3) 50%, hsl(var(--muted)/0.5) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear',
              }}
            />
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-8 w-24 bg-muted/50 rounded animate-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-muted/50 rounded" />
                    <div className="h-3 w-20 bg-muted/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock shimmer */}
        <div className="rounded-lg border border-border bg-card">
          <div className="h-14 border-b p-4 animate-shimmer relative overflow-hidden">
            <div
              style={{
                background: 'linear-gradient(90deg, hsl(var(--muted)/0.5) 25%, hsl(var(--muted)/0.3) 50%, hsl(var(--muted)/0.5) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear',
              }}
            />
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-muted/50 rounded animate-shimmer" />
                    <div className="h-3 w-16 bg-muted/50 rounded" />
                  </div>
                  <div className="h-6 w-12 bg-muted/50 rounded animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardShimmer };
