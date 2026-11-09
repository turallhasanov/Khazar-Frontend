import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fixed port: Khazar.WebAPI's storefront BaseUrl and CORS expect 5173, and NexusERP (ERP-Frontend) is pinned to
  // 5174. Without this, whichever starts first takes 5173 and the browser's per-origin favicon cache shows the other
  // project's icon.
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
