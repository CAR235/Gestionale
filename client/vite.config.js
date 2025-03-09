import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    strictPort: true,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
          charts: ['recharts'],
          calendar: ['react-big-calendar', 'date-fns'],
          motion: ['framer-motion']
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    target: 'esnext',
    sourcemap: true,
    // Ensure static assets are included
    assetsDir: 'assets',
    // Optimize chunks
    chunkSizeWarningLimit: 1000,
    // Minify output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  define: {
    'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000')
  }
})
