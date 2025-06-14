// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html2canvas') || id.includes('jspdf')) {
              return 'pdf-html2canvas';
            }
            if (id.includes('recharts') || id.includes('chart.js')) {
              return 'charts';
            }
            return 'vendor';
          }
        },
      },
    },
    // bump warning limit or remove if you prefer
    chunkSizeWarningLimit: 1000,
  },
});
