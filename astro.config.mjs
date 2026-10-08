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
      // Turnstile (Z1). Il segreto si legge a runtime. La sitekey si legge al build di /preventivo,
      // che è prerenderizzata, e finisce nell'HTML: è pubblica per natura, da qui access 'public'.
      // Niente prefisso PUBLIC_: la sync Doppler → Vercel (tipo Secret) lo rifiuta e si stacca.
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      TURNSTILE_SITE_KEY: envField.string({ context: 'server', access: 'public', optional: true }),
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
    // Server spento qui, acceso da send-quote che importa sentry.server.config.ts: l'integrazione
    // inietta l'init solo nelle pagine .astro (injectScript 'page-ssr'), non negli endpoint, e il
    // suo middleware scrive nell'HTML on demand un <meta name="baggage"> con la chiave pubblica
    // del DSN (misurato sulla 404: la chiave server, che deve restare non pubblicata).
    sentry({
      enabled: { client: process.env.VERCEL_ENV === 'production', server: false },
      clientInitPath: 'sentry.config.ts',
      org: 'monferrina',
      project: 'vetreriamonferrina-com',
      telemetry: false,
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
