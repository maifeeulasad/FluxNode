import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/FluxNode/',
  root: 'example',
  build: {
    outDir: '../example-dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'flux-node': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});