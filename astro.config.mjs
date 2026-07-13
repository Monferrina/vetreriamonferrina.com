import process from 'node:process';
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import { blogPosts } from './src/data/blog-posts';

// lastmod solo per i post del blog (date reali) — le altre pagine non hanno una
// data di modifica affidabile, meglio ometterla che dichiararne una falsa.
const blogLastmod = new Map(
  blogPosts.map((p) => [`https://vetreriamonferrina.com/blog/${p.slug}`, new Date(p.date).toISOString()])
);

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: 'https://vetreriamonferrina.com',
  trailingSlash: 'never',

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      VETRERIA_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      SITE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  // Astro 7: la dev toolbar inietta markup (h1 "Audit", overlay in basso) che gli e2e
  // Playwright intercettano. Disattivata negli e2e via ASTRO_DEV_TOOLBAR=0; attiva nel dev normale.
  devToolbar: { enabled: process.env.ASTRO_DEV_TOOLBAR !== '0' },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      // Esclude la pagina di manutenzione (503 servita dal Worker Cloudflare): non navigabile né indicizzabile.
      filter: (page) => !page.endsWith('/maintenance') && !page.endsWith('/maintenance/'),
      serialize(item) {
        const lastmod = blogLastmod.get(item.url.replace(/\/$/, ''));
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
});
