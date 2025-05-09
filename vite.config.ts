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
        // Configuration for code splitting into smaller chunks
        manualChunks: (id) => {
          // Vendor chunks for major libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler') || id.includes('prop-types')) {
              return 'react-vendor';
            }
            
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            
            if (id.includes('uuid') || id.includes('date-fns') || 
                id.includes('lodash') || id.includes('clsx') || 
                id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            
            // Split other major dependencies
            if (id.includes('pdf') || id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            
            // Add more common libraries if needed
            if (id.includes('axios') || id.includes('query') || id.includes('swr')) {
              return 'data-vendor';
            }
            
            // Group remaining node_modules
            return 'vendor';
          }
          
          // Split application code by main directories
          if (id.includes('/src/components/')) {
            return 'components';
          }
          
          if (id.includes('/src/context/')) {
            return 'context';
          }
          
          if (id.includes('/src/services/')) {
            return 'services';
          }
        }
      }
    },
    // Increase warning limit for large chunks
    chunkSizeWarningLimit: 800,
    // Build optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable source map for production (optional, remove if not needed)
    sourcemap: false,
    // Improve CSS handling
    cssCodeSplit: true,
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom'],
    }
  }
});
