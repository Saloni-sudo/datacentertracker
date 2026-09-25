import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// /api is proxied to the Express server so the browser only ever talks to one
// origin in development — no CORS config needed on the backend.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
})
