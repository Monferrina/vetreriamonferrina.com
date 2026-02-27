import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: 'https://vetreriamonferrina.com',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});