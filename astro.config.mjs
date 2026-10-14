import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://corpedagogicadiversidad.org',
  server: {
    port: 4321,
    host: '0.0.0.0',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
