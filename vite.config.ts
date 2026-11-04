import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // wizpiko.com is the root custom domain for this GitHub Pages deployment.
  // A repository subpath would break page assets and clean URLs on that domain.
  base: '/',
  plugins: [react()],
});
