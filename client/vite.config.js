import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Use environment variable for API URL, default to localhost for local dev
const API_URL = process.env.VITE_API_URL || 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  base: '/',
})
