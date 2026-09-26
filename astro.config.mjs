import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [],
  server: {
    port: 4321,
    host: '0.0.0.0',
  },
  site: 'http://localhost:4321',
  build: {
    assets: './public',
  },
});