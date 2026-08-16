import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
  build: {
    target: 'es2022',
    cssTarget: 'chrome100',

    chunkSizeWarningLimit: 1200,
  },
});
