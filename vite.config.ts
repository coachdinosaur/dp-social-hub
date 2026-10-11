import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Served from https://<user>.github.io/dp-social-hub/ on GitHub Pages
export default defineConfig({
  base: '/dp-social-hub/',
  plugins: [react()],
})
