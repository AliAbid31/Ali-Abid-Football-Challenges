import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Les chaînes commençant par '/api' seront redirigées
      '/api': {
        target: 'https://ali-abid-backend', // L'URL de votre serveur backend
        changeOrigin: true, // Nécessaire pour les hôtes virtuels
        // secure: false, // Si votre backend n'utilise pas HTTPS en dev
        // rewrite: (path) => path.replace(/^\/api/, '') // Si votre backend n'a pas le préfixe /api
      }
    }
  }
})
