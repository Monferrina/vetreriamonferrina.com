import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: vercel({ edgeMiddleware: true }),
  site: 'https://vetreriamonferrina.com',
  trailingSlash: 'never',

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});
