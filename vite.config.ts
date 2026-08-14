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
    /*
     * Deliberately no manualChunks. Forcing three/@react-three into a named
     * chunk drags their shared dependencies — React itself — in with them, so
     * the entry chunk ends up importing that chunk statically and Vite emits a
     * modulepreload for it. That silently undoes the lazy boundary around
     * AvatarScene. Letting Rollup split on the dynamic import instead keeps
     * React in the entry and Three.js strictly on demand.
     */
    chunkSizeWarningLimit: 1200,
  },
});
