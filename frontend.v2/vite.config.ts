import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ERP System',
        short_name: 'ERP',
        description: 'Aplikasi ERP System',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          },
          {
            src: 'icon.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy libraries into separate chunks
          'recharts': ['recharts'],
          'jspdf': ['jspdf', 'html2canvas'],
          'tanstack-query': ['@tanstack/react-query'],
          'zustand': ['zustand'],
          'radix-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-slot'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
