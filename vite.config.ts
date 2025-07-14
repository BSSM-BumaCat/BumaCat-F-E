import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query']
        }
      }
    },
    terserOptions: {
      ecma: 2015,
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query']
  }
})
