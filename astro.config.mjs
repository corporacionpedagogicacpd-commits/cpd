import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://cpd.mork.click',
  server: {
    port: 4321,
    host: '0.0.0.0',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
