import process from 'node:process';
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';
import { blogPosts } from './src/data/blog-posts';
import { cspDirectives } from './src/lib/csp';

// lastmod solo per i post del blog (date reali) — le altre pagine non hanno una
// data di modifica affidabile, meglio ometterla che dichiararne una falsa.
const blogLastmod = new Map(
  blogPosts.map((p) => [
    `https://vetreriamonferrina.com/blog/${p.slug}`,
    new Date(p.date).toISOString(),
  ])
);

export default defineConfig({
  output: 'server',
  // staticHeaders: il CSP delle pagine statiche va nell'header della config di Vercel, non in
  // un <meta> (adapter docs). Senza, le pagine avrebbero il <meta> di Astro più l'header.
  adapter: vercel({ staticHeaders: true }),
  security: {
    // script-src e style-src li genera Astro con gli hash degli inline; le altre direttive sono
    // le stesse per tutte le risposte (src/lib/csp.ts, usate anche dal middleware per le on demand).
    // Niente 'unsafe-inline' nemmeno in style-src (HawkScan 10055-4): gli style="" sono classi,
    // e il JS cambia gli stili per proprietà (el.style.x = …, permesso), mai con setAttribute/cssText.
    csp: { directives: cspDirectives },
  },
  site: 'https://vetreriamonferrina.com',
  trailingSlash: 'never',

  // Il compressore di Astro (default true) elimina anche lo spazio significativo
  // quando un testo finisce a fine riga e la riga dopo apre un tag inline:
  // "...da oltre 40 anni.\n<strong>Sopralluoghi" diventava "anni.<strong>Sopralluoghi",
  // cioe' due parole attaccate nel testo visibile. Succedeva su ogni pagina.
  compressHTML: false,

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
    // Flag di tree-shaking documentati da Sentry: solo error monitoring, quindi via il codice
    // di tracing e i log di debug dal bundle client.
    define: { __SENTRY_TRACING__: false, __SENTRY_DEBUG__: false },
  },

  integrations: [
    // Solo in produzione: da disabilitata l'integrazione non aggiunge codice al bundle,
    // e gli errori di dev e preview non finiscono nel progetto. Source map in una PR a parte.
    // Server spento: Astro inietta l'init server solo nelle pagine .astro, tutte prerenderizzate,
    // quindi nella funzione Vercel (send-quote) arrivava il middleware senza init (misurato
    // sulla build). Il server va fatto a parte, insieme alla cattura degli errori di send-quote.
    sentry({
      enabled: { client: process.env.VERCEL_ENV === 'production', server: false },
      clientInitPath: 'sentry.config.ts',
      sourcemaps: { disable: true },
    }),
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
