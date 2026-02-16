import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  preview: {
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
    host: true,
    port: process.env.PORT || 5173,
    allowedHosts: true
  }
})
