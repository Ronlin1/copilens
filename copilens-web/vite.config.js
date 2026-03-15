import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  optimizeDeps: {
    include: ['groq-sdk'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  preview: {
    host: true,
    port: process.env.PORT || 5173,
    allowedHosts: true
  }
})
