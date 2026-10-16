import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.corpedagogicadiversidad.org',
  integrations: [
    sitemap({
      // La landing /expo/ es un archivo estático de public/: va a mano.
      customPages: ['https://www.corpedagogicadiversidad.org/expo/'],
    }),
  ],
  server: {
    port: 4321,
    host: '0.0.0.0',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
