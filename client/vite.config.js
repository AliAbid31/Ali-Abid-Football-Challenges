import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ali-abid-backend', // L'URL de votre serveur backend
        changeOrigin: true, // Nécessaire pour les hôtes virtuels
      }
    }
  }
})
