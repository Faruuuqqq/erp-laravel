import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const MainLayout = ({ children, title, subtitle }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className={cn('flex-1 overflow-hidden', sidebarCollapsed ? 'ml-[60px]' : 'ml-[240px] transition-all duration-300')}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
        <main className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
