import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'mobile',
  publicDir: '../public',
  plugins: [react()],
  base: './',
  build: { outDir: '../dist-mobile', emptyOutDir: true },
});
