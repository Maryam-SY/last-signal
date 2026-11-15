import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // In dev, /api/* is forwarded to the Express backend (backend/).
    proxy: {
      '/api': API_TARGET,
    },
  },
  test: {
    environment: 'jsdom',
    // Page tests render code-split pages with real user events: give them room under load.
    testTimeout: 15_000,
    setupFiles: './src/test/setup.ts',
  },
})
