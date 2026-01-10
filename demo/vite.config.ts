import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  base: '/react-justified-gallery/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: path.resolve(__dirname, '../docs'),
    emptyOutDir: true,
  },
});
