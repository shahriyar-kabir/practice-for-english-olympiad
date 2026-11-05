import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react(), {
    name: 'ios-entry',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.headers.accept?.includes('text/html') && !request.url?.split('?')[0].includes('.')) request.url = '/ios.html' + (request.url?.includes('?') ? '?' + request.url.split('?')[1] : '');
        next();
      });
    },
  }],
  build: { outDir: 'dist-ios', emptyOutDir: true, rollupOptions: { input: 'ios.html' } },
});
