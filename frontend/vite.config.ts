import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0", // Akses dari 3 PC lain di jaringan LAN toko
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Forward semua request /api/* ke Laravel dev server
      // Ini menghindari CORS error saat development
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      // Sanctum CSRF cookie endpoint
      "/sanctum": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
