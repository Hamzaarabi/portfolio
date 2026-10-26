import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build works on GitHub Pages (/portfolio/),
// Vercel, Netlify or any static sub-folder without config changes.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
  },
});
