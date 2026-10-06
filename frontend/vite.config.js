import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
// Para publicar no GitHub Pages: VITE_BASE=/localizaae/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port: 5173,
    // Em desenvolvimento, /api vai para o back-end (npm run dev em /backend)
    proxy: { '/api': { target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001', changeOrigin: true } },
  },
})
