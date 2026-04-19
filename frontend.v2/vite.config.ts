import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
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
