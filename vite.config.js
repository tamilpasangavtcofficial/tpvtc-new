import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/vtc': {
        target: 'https://api.truckersmp.com/v2/vtc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vtc/, ''),
        headers: {
          'User-Agent': 'TamilPasangaVTC/1.0',
          'Accept': 'application/json'
        }
      },
      '/api': {
        target: 'https://tpvtc-backend.vercel.app',
        changeOrigin: true,
      }
    }
  }
})
