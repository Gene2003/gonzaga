import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173, // optional – use your preferred port
    strictPort: true, // optional – prevents Vite from trying to use another port if this one is taken
    allowedHosts: [
      ' import.meta.env.VITE_API_BACKEND_URL',
      '79c552f7d91c.ngrok-free.app'
    ]
  },
  preview: {
    allowedHosts: [
      'enthusiastic-inspiration-production-a98c.up.railway.app',
      '.up.railway.app'  // Covers Railway subdomains
    ]
  }
})