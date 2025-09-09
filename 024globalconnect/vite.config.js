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
      'localhost',
      '79c552f7d91c.ngrok-free.app'
    ]
  },
})