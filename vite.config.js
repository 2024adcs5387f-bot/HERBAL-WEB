import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure dependencies used by third-party libs are pre-bundled
  optimizeDeps: {
    include: ['uuid']
  },
  // Some third-party packages expect a Node-like global
  define: {
    global: 'window'
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    // Serve static files from the public directory
    fs: {
      strict: false
    }
  },
  // Configure the base URL for static assets
  base: '/',
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        seller: resolve(__dirname, 'public/Seller.html')
      }
    }
  }
})
