# AGENTS.md - ERP Laravel Project Guidelines

## Project Overview

This is an Indonesian retail ERP system with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Laravel (PHP)
- **Testing**: Vitest
- **State**: TanStack Query + Zustand

---

## Build/Lint/Test Commands

### Frontend (D:\projectan\erp_laravel\frontend.v2)

```bash
# Development
npm run dev                    # Start dev server on http://localhost:8083
npm run build                  # Production build

# Linting
npm run lint                   # Run ESLint
npm run lint -- --fix          # Auto-fix lint issues

# Testing
npm run test                   # Run all tests once
npm run test -- --watch        # Run tests in watch mode
npm run test -- src/pages/.../PageName.test.tsx  # Run single test file
```

### Backend (D:\projectan\erp_laravel\backend)

```bash
# PHP/Laravel
php artisan serve             # Start Laravel server
php artisan tinker           # Interactive PHP shell
php artisan migrate           # Run migrations
php artisan migrate:fresh     # Fresh migrations with seed
php artisan optimize:clear    # Clear all caches
php artisan route:list        # List all routes

# Composer
composer install              # Install dependencies
composer dump-autoload        # Regenerate autoload
```

---

## Code Style Guidelines

### TypeScript Conventions

1. **Types First**: Import types at the top of files
   ```typescript
   import type { TransactionPrintData, DocumentType } from '@/types/print';
   import { useState } from 'react';  // Regular imports after
   ```

2. **Explicit Return Types**: For complex functions, add return type annotations
   ```typescript
   const getPrintData = (): TransactionPrintData => ({ ... })
   ```

3. **Interface vs Type**: Use `interface` for object shapes, `type` for unions
   ```typescript
   interface Customer { id: string; name: string; }
   type DocumentType = 'sj' | 'penjualan' | 'pembelian';
   ```

4. **Null Handling**: Use optional chaining and nullish coalescing
   ```typescript
   const name = customer?.name ?? 'Unknown';
   ```

### Naming Conventions

1. **Components**: PascalCase
   ```typescript
   const PrintPreviewDialog = () => ...
   const MainLayout = () => ...
   ```

2. **Hooks**: camelCase with `use` prefix
   ```typescript
   const usePrintExport = () => ...
   const useDebouncedValue = (value, delay) => ...
   ```

3. **Files**: kebab-case for components, camelCase for utilities
   ```
   PrintPreviewDialog.tsx    # React components
   usePrintExport.ts        # hooks
   print.ts                 # types
   PrintStyles.css          # styles
   ```

4. **Constants**: UPPER_SNAKE_CASE for config values
   ```typescript
   const API_ENDPOINTS: Record<DocumentType, (id: number) => string> = { ... }
   ```

### React Patterns

1. **Component Structure**:
   ```typescript
   // 1. Imports (external, internal, types)
   // 2. Interfaces/Types
   // 3. Constants
   // 4. Component definition
   // 5. Export default
   ```

2. **State Management**:
   - Use `useState` for local component state
   - Use TanStack Query for server state
   - Use Zustand for global client state

3. **Event Handlers**:
   ```typescript
   const handleSave = useCallback(async () => {
     try {
       await saveMutation.mutateAsync(payload);
       toast({ title: 'Success' });
     } catch (err) {
       const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
       toast({ title: 'Error', description: msg, variant: 'destructive' });
     }
   }, [dependencies]);
   ```

4. **Avoid Inline Functions in Props** (performance):
   ```typescript
   // Bad
   <Button onClick={() => setOpen(true)} />
   
   // Good
   const handleOpen = useCallback(() => setOpen(true), []);
   <Button onClick={handleOpen} />
   ```

### CSS/Tailwind

1. **Use Tailwind Classes**: Prefer utility classes over custom CSS
   ```typescript
   // Good
   className="flex items-center justify-between gap-4"
   
   // Avoid
   style={{ display: 'flex', alignItems: 'center' }}
   ```

2. **Responsive Design**: Mobile-first with `sm:`, `md:`, `lg:` prefixes
   ```typescript
   className="flex flex-col sm:flex-row gap-2"
   ```

3. **Custom CSS**: Only when necessary, use CSS modules or global CSS

### Error Handling

1. **API Errors**:
   ```typescript
   try {
     const response = await apiClient.get('/endpoint');
   } catch (error: unknown) {
     const axiosError = error as { response?: { data?: { message?: string } } };
     const message = axiosError?.response?.data?.message ?? 'Unknown error';
     toast({ title: 'Error', description: message, variant: 'destructive' });
   }
   ```

2. **Async Operations**: Always use try/catch with user feedback

3. **Type Guards**: For complex error types
   ```typescript
   const isApiError = (err: unknown): err is { response: { data: { message: string } } } => {
     return typeof err === 'object' && err !== null && 'response' in err;
   };
   ```

### Import Organization

Order imports strictly:
1. React/Next.js imports
2. External libraries (Radix, TanStack, etc.)
3. Internal components/hooks
4. Types
5. Styles

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. External
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';

// 3. Internal
import { MainLayout } from '@/components/layout/MainLayout';
import { useCustomers } from '@/hooks/api/useCustomers';

// 4. Types
import type { Customer } from '@/types';

// 5. Styles
import '@/styles/PrintStyles.css';
```

---

## Project Structure

```
frontend.v2/
├── src/
│   ├── components/
│   │   ├── dialogs/      # Modal components
│   │   ├── print/        # Print templates
│   │   ├── ui/           # shadcn/ui components
│   │   └── layout/       # Layout components
│   ├── hooks/
│   │   ├── api/          # API hooks (TanStack Query)
│   │   └── usePrintExport.ts
│   ├── pages/
│   │   ├── master/       # Master data pages
│   │   └── transaksi/    # Transaction pages
│   ├── types/            # TypeScript types
│   └── styles/           # Global CSS
├── index.html
├── package.json
└── vite.config.ts

backend/
├── app/Http/Controllers/Api/
│   └── ...Controllers
├── routes/
│   └── api.php
└── resources/views/pdf/
    └── ...blade.php
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Run frontend | `cd frontend.v2 && npm run dev` |
| Run backend | `cd backend && php artisan serve` |
| Build production | `cd frontend.v2 && npm run build` |
| Lint check | `cd frontend.v2 && npm run lint` |
| Run tests | `cd frontend.v2 && npm run test` |

---

## Common Patterns

### Creating New Print Template
1. Add types to `src/types/print.ts`
2. Create template in `src/components/print/TemplateName.tsx`
3. Add to `PrintPreviewDialog.tsx` imports and switch
4. Add API endpoint in backend

### Adding New API Hook
1. Create in `src/hooks/api/useResource.ts`
2. Use TanStack Query for data fetching
3. Use React Query mutations for mutations

### Adding New Page
1. Create component in `src/pages/`
2. Add route to `App.tsx`
3. Add menu item to `AppSidebar.tsx`