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
    // Niente 'unsafe-inline' nemmeno in style-src: gli style="" sono classi,
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

  // Oggi il sito non ha Markdown (il blog sta in src/data/blog-posts.ts): Shiki non serve, e con
  // gli stili inline che genera avvisava a ogni build di non essere compatibile con il CSP.
  markdown: { syntaxHighlight: false },

  env: {
    schema: {
      // Chiave della mappa di /contatti (Maps Embed API, referrer del sito), letta al build della
      // pagina prerenderizzata e scritta nell'HTML: pubblica, da qui access 'public' (F2).
      GOOGLE_MAPS_EMBED_KEY: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
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
    // e gli errori di dev e preview non finiscono nel progetto.
    // Source map: con l'integrazione accesa il plugin Vite le genera 'hidden', le carica con
    // SENTRY_AUTH_TOKEN (letto dall'ambiente; su Vercel solo in Production) e le cancella:
    // nessuna .map in .vercel/output (misurato, E2). Senza token il build passa con un avviso.
    // Nelle preview l'integrazione è spenta e il plugin non entra.
    // telemetry: false perché il plugin altrimenti manda a Sentry i dati del build.
    // Server spento: il suo middleware scrive nell'HTML on demand un <meta name="baggage"> con la
    // chiave pubblica del DSN (misurato sulla 404).
    sentry({
      enabled: { client: process.env.VERCEL_ENV === 'production', server: false },
      clientInitPath: 'sentry.config.ts',
      org: 'monferrina',
      project: 'vetreriamonferrina-com',
      telemetry: false,
    }),
    // Il plugin Vite di Sentry gira anche nei build prerender e ssr. Il prerender scrive solo in
    // dist/server/.prerender/, che il suo glob ({.vercel,dist}/**/*, senza dot) non attraversa:
    // "Didn't find any matching sources for debug ID upload" a ogni build di produzione. Col server
    // spento servono solo le mappe del client, quindi il plugin resta nell'ambiente client
    // (applyToEnvironment di Vite, sperimentale). Misurato il 13/10/2026 con @sentry/astro 11.4.0:
    // se Sentry rinomina il plugin, l'avviso torna.
    {
      name: 'sentry-solo-client',
      hooks: {
        'astro:build:setup': ({ vite }) => {
          for (const plugin of vite.plugins?.flat(Infinity) ?? []) {
            if (plugin?.name === 'sentry-vite-plugin') {
              plugin.applyToEnvironment = (environment) => environment.name === 'client';
            }
          }
        },
      },
    },
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
