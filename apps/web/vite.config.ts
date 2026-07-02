import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      selfDestroying: true,
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Morning Changes',
        short_name: 'Morning Changes',
        description: 'A daily guitar practice companion.',
        theme_color: '#090806',
        background_color: '#090806',
        display: 'standalone',
        start_url: './',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      }
    })
  ]
});
