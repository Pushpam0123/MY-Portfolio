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
    rollupOptions: {
      output: {
        // Three.js is by far the heaviest dependency; splitting it keeps the
        // initial chunk small enough that the loader can finish quickly.
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
