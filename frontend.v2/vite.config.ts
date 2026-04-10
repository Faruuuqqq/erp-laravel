import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries - always loaded
          if (id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('node_modules/@radix-ui')) return 'vendor-ui';
          if (id.includes('node_modules/clsx') || 
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/lucide-react')) return 'vendor-utils';
          
          // Charts - lazy load only on dashboard
          if (id.includes('node_modules/recharts')) return 'vendor-charts';
          
          // Route-specific chunks
          if (id.includes('/pages/Dashboard')) return 'chunk-dashboard';
          if (id.includes('/pages/transaksi/')) return 'chunk-transaksi';
          if (id.includes('/pages/Pengaturan') || id.includes('/pages/pengaturan/')) return 'chunk-settings';
          if (id.includes('/pages/laporan/')) return 'chunk-reports';
          if (id.includes('/pages/master/')) return 'chunk-master';
          if (id.includes('/pages/informasi/')) return 'chunk-informasi';
          
          // Core app code
          if (id.includes('/components/') || id.includes('/hooks/') || id.includes('/contexts/')) {
            return 'main-core';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1024,
    target: 'esnext',
  },
}));