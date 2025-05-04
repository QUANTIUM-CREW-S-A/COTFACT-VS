import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
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
        // Configuración para dividir el código en chunks más pequeños
        manualChunks: {
          // Separar las dependencias de React
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separar librerías UI
          'ui-vendor': ['@radix-ui/react-icons', '@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          // Separar utilidades comunes
          'utils-vendor': ['uuid', 'date-fns', 'lodash', 'clsx', 'tailwind-merge'],
        }
      }
    },
    // Aumentar el límite de advertencia para chunks grandes
    chunkSizeWarningLimit: 600,
    // Optimizaciones para reducir el tamaño
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  }
});
