import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: Vite serves the client on 5173 and proxies /api to the Fastify server.
// Prod: `npm run build` emits dist/client, which the Fastify server serves itself.
// The client only ever calls relative `/api/*` — no host/port is baked into client code.
const API_TARGET = process.env.VITE_PROXY_TARGET || 'http://localhost:8787';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
});
