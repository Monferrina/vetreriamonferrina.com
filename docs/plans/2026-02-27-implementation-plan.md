# Vetreria Monferrina — Piano di Implementazione

> **Stato:** Piano completato fino a v0.4 (2026-03-03). Vedi `docs/TODO-prossima-sessione.md` per i prossimi step.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Obiettivo:** Sito web statico GDPR-compliant per la Vetreria Monferrina con CMS headless, form preventivo via email e chatbot a flusso.

**Architettura:** Astro 5 SSG genera HTML statico da Sanity CMS a build time. Vercel serve da CDN globale. Una Serverless Function gestisce form → validazione → Resend email. Chatbot gira client-side da JSON statico.

**Tech Stack:** Astro 5, Tailwind CSS 4, TypeScript, Sanity v3, Resend, Vercel, Vitest, Playwright, Docker

**Requisiti critici:**

- Test in Docker dal primo task
- Sicurezza ultra-perfetta (CSP, sanitization, rate limiting, email injection prevention)
- GDPR e normativa italiana al 100%
- Lighthouse 100 target
- WCAG 2.1 AA

**Design doc:** `docs/plans/2026-02-27-vetreria-monferrina-design.md`

---

## Task 1: Scaffold Progetto + Infrastruttura Docker Test

**Contesto:** Fondamento del progetto. Docker per i test e' un requisito HARD — tutti i test devono girare in Docker dal giorno zero.

**Files:**

- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `Dockerfile`
- Create: `docker-compose.test.yml`
- Create: `.gitignore`
- Create: `.env.example`
- Test: `tests/unit/smoke.test.ts`
- Test: `tests/e2e/smoke.spec.ts`

**Step 1: Inizializza progetto Astro 5**

```bash
cd /Users/marcobellingeri/Documents/GitHub/MonferrinaProject
npm create astro@latest . -- --template minimal --typescript strict --install --git false
```

**Step 2: Installa dipendenze**

```bash
npx astro add tailwind --yes
npm install @astrojs/vercel resend
npm install -D vitest happy-dom @playwright/test
```

**Step 3: Configura astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: 'https://vetreriamonferrina.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

> Nota: `output: 'server'` perche' abbiamo una API route (form). Tutte le pagine hanno `export const prerender = true`.

**Step 4: Crea src/styles/global.css**

```css
@import 'tailwindcss';

@theme {
  --color-primary: #1b4965;
  --color-primary-light: #2a6f97;
  --color-primary-dark: #0f2d40;
  --color-secondary: #c67b40;
  --color-secondary-light: #d4955e;
  --color-secondary-dark: #a8622f;
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-success: #16a34a;
  --color-error: #dc2626;
  --font-heading: 'DM Serif Display', serif;
  --font-body: 'Inter', sans-serif;
}
```

**Step 5: Crea pagina index minima**

```astro
---
// src/pages/index.astro
export const prerender = true;
---

<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vetreria Monferrina</title>
  </head>
  <body>
    <h1>Vetreria Monferrina</h1>
    <p>Sito in costruzione</p>
  </body>
</html>
```

**Step 6: Configura vitest.config.ts**

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'happy-dom',
  },
});
```

**Step 7: Scrivi smoke test unitario**

```ts
// tests/unit/smoke.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Smoke test', () => {
  it('il progetto ha le variabili di tema', () => {
    const css = readFileSync('src/styles/global.css', 'utf-8');
    expect(css).toContain('--color-primary');
    expect(css).toContain('--font-heading');
  });
});
```

**Step 8: Configura playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

**Step 9: Scrivi smoke test E2E**

```ts
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Smoke E2E', () => {
  test('la home page carica', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vetreria Monferrina/);
    await expect(page.locator('h1')).toContainText('Vetreria Monferrina');
  });

  test("il tag lang e' italiano", async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('it');
  });
});
```

**Step 10: Crea Dockerfile multi-stage**

```dockerfile
FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS test-unit
COPY . .
CMD ["npx", "vitest", "run"]

FROM deps AS test-e2e
RUN npx playwright install --with-deps chromium
COPY . .
RUN npm run build
CMD ["sh", "-c", "npm run preview & npx playwright test --project=chromium"]

FROM deps AS build
COPY . .
RUN npm run build
```

**Step 11: Crea docker-compose.test.yml**

```yaml
services:
  unit:
    container_name: MonferrinaProject-unit
    build:
      context: .
      dockerfile: Dockerfile
      target: test-unit
  e2e:
    container_name: MonferrinaProject-e2e
    build:
      context: .
      dockerfile: Dockerfile
      target: test-e2e
```

**Step 12: Crea .gitignore**

```
node_modules/
dist/
.vercel/
.astro/
.env
.env.local
playwright-report/
test-results/
*.tsbuildinfo
```

**Step 13: Crea .env.example**

```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@vetreriamonferrina.com
VETRERIA_EMAIL=info@example.com
SANITY_PROJECT_ID=xxxxxxxxxx
SANITY_DATASET=production
SITE_URL=https://vetreriamonferrina.com
```

**Step 14: Aggiungi script a package.json**

Aggiungi nella sezione `"scripts"`:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:docker": "docker compose -f docker-compose.test.yml up --build --abort-on-container-exit",
  "test:docker:unit": "docker compose -f docker-compose.test.yml run --build unit",
  "test:docker:e2e": "docker compose -f docker-compose.test.yml run --build e2e"
}
```

**Step 15: Esegui test in Docker**

```bash
docker compose -f docker-compose.test.yml run --build unit
```

Expected: 1 test passato

**Step 16: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro 5 + Docker test infrastructure"
```

---

## Task 2: Design System + BaseLayout + Security Headers

**Contesto:** Layout base con SEO meta, font self-hosted, e security headers ultra-stretti via vercel.json.

**Files:**

- Create: `src/layouts/BaseLayout.astro`
- Create: `public/fonts/` (DM Serif Display + Inter, woff2)
- Create: `vercel.json`
- Modify: `src/pages/index.astro` (usa BaseLayout)
- Modify: `src/styles/global.css` (aggiungi @font-face)
- Test: `tests/unit/layout.test.ts`

**Step 1: Scarica font e mettili in public/fonts/**

Scarica da Google Fonts (file woff2):

- `dm-serif-display-latin.woff2`
- `inter-latin-variable.woff2`

**Step 2: Aggiungi @font-face a global.css**

```css
@font-face {
  font-family: 'DM Serif Display';
  src: url('/fonts/dm-serif-display-latin.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-latin-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

**Step 3: Crea BaseLayout.astro**

```astro
---
// src/layouts/BaseLayout.astro
export interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const {
  title,
  description = 'Vetreria storica a Casale Monferrato. Box doccia, parapetti, pensiline, vetri camera, specchi e lavorazioni su misura.',
  ogImage,
} = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Vetreria Monferrina</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="it_IT" />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link
      rel="preload"
      href="/fonts/inter-latin-variable.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link
      rel="preload"
      href="/fonts/dm-serif-display-latin.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
  </head>
  <body class="font-body text-neutral-800 bg-neutral-50 antialiased">
    <slot name="header" />
    <main>
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

**Step 4: Crea vercel.json con security headers**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.sanity.io; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        }
      ]
    }
  ]
}
```

> Nota: `style-src 'unsafe-inline'` potrebbe servire per Astro View Transitions. Da stringere in Task 11 se possibile.

**Step 5: Scrivi test layout**

```ts
// tests/unit/layout.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

test('BaseLayout contiene meta tag essenziali', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: 'Test' },
    slots: { default: '<p>Contenuto</p>' },
  });

  expect(html).toContain('lang="it"');
  expect(html).toContain('<title>Test | Vetreria Monferrina</title>');
  expect(html).toContain('name="description"');
  expect(html).toContain('font-display: swap');
});
```

**Step 6: Aggiorna index.astro per usare BaseLayout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
export const prerender = true;
---

<BaseLayout title="Home">
  <h1 class="text-4xl font-heading text-primary">Vetreria Monferrina</h1>
  <p class="text-lg font-body text-neutral-700">Sito in costruzione</p>
</BaseLayout>
```

**Step 7: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml run --build unit
git add -A && git commit -m "feat: design system, BaseLayout, security headers"
```

---

## Task 3: Header + Footer + Navigazione

**Contesto:** Chrome del sito: header con nav responsive (hamburger mobile), footer con dati legali obbligatori per legge italiana.

**Files:**

- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/MobileMenu.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/unit/header.test.ts`
- Test: `tests/e2e/navigation.spec.ts`

**Step 1: Crea Header.astro**

Nav links: Home, Chi siamo, Servizi, Galleria, Contatti, CTA "Preventivo".
Menu hamburger su mobile (JS vanilla, no framework).
Nessun inline script — usa file JS separato o `<script>` tag Astro (che viene bundled).

**Step 2: Crea Footer.astro**

Obbligatorio per legge italiana:

- Ragione sociale: "Vetreria Monferrina di Fioravanti Giuseppe"
- Sede legale (indirizzo completo)
- Partita IVA
- Link a Privacy Policy e Cookie Policy

**Step 3: Crea MobileMenu.astro**

Pannello slide-in con animazione CSS. Toggle via JS vanilla.
Rispetta `prefers-reduced-motion`.

**Step 4: Integra in BaseLayout**

```astro
<BaseLayout title="...">
  <Header slot="header" />
  <slot />
  <Footer slot="footer" />
</BaseLayout>
```

**Step 5: Test unitario Header**

```ts
// tests/unit/header.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header from '../../src/components/Header.astro';

test('Header contiene tutti i link di navigazione', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Header);
  expect(html).toContain('href="/servizi"');
  expect(html).toContain('href="/preventivo"');
  expect(html).toContain('href="/contatti"');
  expect(html).toContain('aria-label');
});
```

**Step 6: Test E2E navigazione**

```ts
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('navigazione desktop funziona', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: /servizi/i })).toBeVisible();
});

test('menu mobile si apre e chiude', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const burger = page.getByRole('button', { name: /menu/i });
  await burger.click();
  await expect(page.locator('[data-mobile-menu]')).toBeVisible();
});
```

**Step 7: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: header, footer, navigazione responsive"
```

---

## Task 4: Home Page

**Contesto:** Prima pagina reale. Hero con CTA, servizi in evidenza (card), teaser chi siamo, numeri/statistiche, CTA finale. Contenuti placeholder (verranno da Sanity in Task 10).

**Files:**

- Create: `src/components/HeroSection.astro`
- Create: `src/components/ServiceHighlight.astro`
- Create: `src/components/StatsSection.astro`
- Create: `src/components/CtaSection.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/home.spec.ts`

**Step 1: Crea HeroSection**

Immagine full-width (placeholder per ora), headline, sottotitolo, CTA button "Richiedi preventivo" → link a `/preventivo`.

**Step 2: Crea ServiceHighlight**

3-4 card con: icona SVG, titolo, descrizione breve, link a `/servizi`. Servizi in evidenza: Box doccia, Parapetti, Vetri camera, Lavorazioni su misura.

**Step 3: Crea StatsSection**

Numeri: "Oltre 40 anni di esperienza", "A Casale Monferrato", "Vetro su misura". Contatori con animazione (IntersectionObserver + CSS).

**Step 4: Crea CtaSection**

"Hai un progetto? Parliamone." → bottone `/preventivo` + link secondario `/contatti`.

**Step 5: Componi index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroSection from '../components/HeroSection.astro';
import ServiceHighlight from '../components/ServiceHighlight.astro';
import StatsSection from '../components/StatsSection.astro';
import CtaSection from '../components/CtaSection.astro';
export const prerender = true;
---

<BaseLayout title="Home">
  <HeroSection />
  <ServiceHighlight />
  <StatsSection />
  <CtaSection />
</BaseLayout>
```

**Step 6: Test E2E home**

```ts
// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test('home page ha tutte le sezioni', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-section="hero"]')).toBeVisible();
  await expect(page.locator('[data-section="services"]')).toBeVisible();
  await expect(page.getByRole('link', { name: /preventivo/i })).toBeVisible();
});

test('CTA preventivo porta alla pagina corretta', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('link', { name: /richiedi preventivo/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/preventivo/);
});
```

**Step 7: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: home page con hero, servizi, stats, CTA"
```

---

## Task 5: Pagina Servizi + ServiceCard

**Contesto:** Pagina con tutte le categorie di servizi della vetreria, organizzate in sezioni. Ogni servizio ha CTA che pre-compila il form preventivo.

**Files:**

- Create: `src/components/ServiceCard.astro`
- Create: `src/components/ServiceCategory.astro`
- Create: `src/pages/servizi.astro`
- Create: `src/data/services.ts` (dati placeholder, verranno da Sanity)
- Test: `tests/unit/services.test.ts`
- Test: `tests/e2e/services.spec.ts`

**Step 1: Crea src/data/services.ts**

```ts
export interface Service {
  slug: string;
  name: string;
  description: string;
  category: 'installazioni' | 'vetri' | 'canaline' | 'lavorazioni' | 'componenti';
}

export const services: Service[] = [
  {
    slug: 'box-doccia',
    name: 'Box doccia',
    description: 'Box doccia su misura in vetro temperato.',
    category: 'installazioni',
  },
  {
    slug: 'parapetti',
    name: 'Parapetti',
    description: 'Parapetti in vetro per balconi e scale.',
    category: 'installazioni',
  },
  {
    slug: 'pensiline',
    name: 'Pensiline',
    description: 'Pensiline in vetro per ingressi e terrazze.',
    category: 'installazioni',
  },
  {
    slug: 'porte-interne',
    name: 'Porte interne',
    description: 'Porte interne in vetro, scorrevoli e a battente.',
    category: 'installazioni',
  },
  {
    slug: 'vetrine',
    name: 'Posa di vetrine',
    description: "Installazione vetrine per negozi e attivita' commerciali.",
    category: 'installazioni',
  },
  {
    slug: 'sostituzione-vetri',
    name: 'Sostituzione vetri finestre',
    description: 'Sostituzione vetri per finestre esistenti.',
    category: 'installazioni',
  },
  {
    slug: 'blindati',
    name: 'Vetri blindati',
    description: 'Vetri blindati antieffrazione.',
    category: 'vetri',
  },
  {
    slug: 'madras',
    name: 'Vetri Madras',
    description: 'Vetro decorativo Madras per privacy e design.',
    category: 'vetri',
  },
  {
    slug: 'stratificati',
    name: 'Vetri stratificati',
    description: 'Vetri stratificati trasparenti, satinati e colorati.',
    category: 'vetri',
  },
  {
    slug: 'monolitici',
    name: 'Vetri monolitici',
    description: 'Vetri monolitici trasparenti e satinati.',
    category: 'vetri',
  },
  {
    slug: 'vetrocamera',
    name: 'Vetri camera',
    description: 'Vetrocamera doppi per isolamento termico e acustico.',
    category: 'vetri',
  },
  {
    slug: 'vetrocamera-tripli',
    name: 'Vetri camera tripli',
    description: 'Triplo vetro per massimo isolamento.',
    category: 'vetri',
  },
  {
    slug: 'specchi',
    name: 'Specchi',
    description: 'Specchi su misura per bagni, armadi e complementi.',
    category: 'vetri',
  },
  {
    slug: 'sagomature',
    name: 'Sagomature',
    description: 'Taglio e sagomatura vetro su misura.',
    category: 'lavorazioni',
  },
  {
    slug: 'fori',
    name: 'Fori',
    description: 'Foratura vetro per maniglie, cerniere e fissaggi.',
    category: 'lavorazioni',
  },
  {
    slug: 'molature',
    name: 'Molature',
    description: 'Molatura bordi vetro a filo lucido e bisello.',
    category: 'lavorazioni',
  },
];

export const categories = {
  installazioni: 'Servizi e Installazioni',
  vetri: 'Tipi di Vetro',
  lavorazioni: 'Lavorazioni',
} as const;
```

**Step 2: Crea ServiceCard.astro**

Card con titolo, descrizione, link "Richiedi preventivo per [servizio]" che porta a `/preventivo?servizio=[slug]`.

**Step 3: Crea servizi.astro**

Pagina con sezioni per categoria. Ogni sezione ha titolo + griglia di ServiceCard.

**Step 4: Test unitario**

```ts
// tests/unit/services.test.ts
import { describe, it, expect } from 'vitest';
import { services, categories } from '../../src/data/services';

describe('Dati servizi', () => {
  it('ogni servizio ha slug, nome, descrizione e categoria valida', () => {
    for (const s of services) {
      expect(s.slug).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.category).toBeTruthy();
      expect(Object.keys(categories)).toContain(s.category);
    }
  });

  it('ci sono almeno 15 servizi', () => {
    expect(services.length).toBeGreaterThanOrEqual(15);
  });
});
```

**Step 5: Test E2E + Docker + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: pagina servizi con categorie e card"
```

---

## Task 6: Form Preventivo + Serverless Function (SICUREZZA CRITICA)

**Contesto:** Form strutturato con validazione client + server. Serverless Function con anti-spam, anti-injection, rate limiting. Invio email via Resend. Questa task e' critica per la sicurezza.

**Files:**

- Create: `src/pages/preventivo.astro`
- Create: `src/components/QuoteForm.astro`
- Create: `src/lib/validation.ts`
- Create: `src/pages/api/send-quote.ts`
- Create: `src/lib/sanitize.ts`
- Create: `src/lib/rate-limit.ts`
- Modify: `.env.example`
- Test: `tests/unit/validation.test.ts`
- Test: `tests/unit/sanitize.test.ts`
- Test: `tests/e2e/quote-form.spec.ts`

**Step 1: Crea src/lib/validation.ts**

```ts
export interface QuoteFormData {
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  description: string;
  measurements: string;
  privacy: boolean;
  honeypot: string; // deve essere vuoto
}

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_SERVICE_TYPES = [
  'box-doccia',
  'parapetti',
  'pensiline',
  'porte-interne',
  'vetrine',
  'sostituzione-vetri',
  'specchi',
  'lavorazione-vetro',
  'altro',
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[\d\s+\-().]{7,20}$/;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_MEASUREMENTS_LENGTH = 500;

export function validateQuoteForm(data: QuoteFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Honeypot: se compilato, e' un bot
  if (data.honeypot) {
    return [{ field: 'honeypot', message: 'Bot detected' }];
  }

  if (!data.name || data.name.trim().length < 2 || data.name.length > MAX_NAME_LENGTH) {
    errors.push({ field: 'name', message: 'Nome richiesto (2-100 caratteri)' });
  }

  if (!data.phone || !PHONE_REGEX.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Numero di telefono non valido' });
  }

  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: 'Email non valida' });
  }

  if (!data.serviceType || !VALID_SERVICE_TYPES.includes(data.serviceType)) {
    errors.push({ field: 'serviceType', message: 'Seleziona un tipo di lavoro' });
  }

  if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({ field: 'description', message: 'Descrizione troppo lunga (max 2000 caratteri)' });
  }

  if (data.measurements && data.measurements.length > MAX_MEASUREMENTS_LENGTH) {
    errors.push({ field: 'measurements', message: 'Misure troppo lunghe (max 500 caratteri)' });
  }

  if (!data.privacy) {
    errors.push({ field: 'privacy', message: 'Devi accettare la privacy policy' });
  }

  return errors;
}
```

**Step 2: Crea src/lib/sanitize.ts**

```ts
// Previene email header injection e XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[\r\n]/g, ' ') // rimuovi newline (email header injection)
    .replace(/[<>]/g, '') // rimuovi HTML tags
    .replace(/javascript:/gi, '') // rimuovi JS protocol
    .trim();
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replace(/[\r\n\t]/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = key === 'email' ? sanitizeEmail(value) : sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
```

**Step 3: Crea src/lib/rate-limit.ts**

```ts
// Rate limiting best-effort (in-memory, per istanza serverless)
const requests = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requests.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) return true;

  recent.push(now);
  requests.set(ip, recent);
  return false;
}
```

**Step 4: Crea src/pages/api/send-quote.ts**

```ts
import type { APIContext } from 'astro';
import { Resend } from 'resend';
import { validateQuoteForm, type QuoteFormData } from '../../lib/validation';
import { sanitizeFormData } from '../../lib/sanitize';
import { isRateLimited } from '../../lib/rate-limit';

export const prerender = false;

export async function POST({ request, clientAddress }: APIContext) {
  // 1. Verifica Origin (anti-CSRF)
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    import.meta.env.SITE_URL,
    'http://localhost:4321',
    'http://localhost:3000',
  ].filter(Boolean);

  if (!origin || !allowedOrigins.some((o) => origin.startsWith(o))) {
    return new Response(JSON.stringify({ error: 'Origine non autorizzata' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Rate limiting
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Troppe richieste. Riprova tra un minuto.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Parse e sanitizza
  let rawData: Record<string, unknown>;
  try {
    rawData = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Dati non validi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = sanitizeFormData(rawData) as unknown as QuoteFormData;

  // 4. Validazione server-side
  const errors = validateQuoteForm(data);
  if (errors.length > 0) {
    // Se honeypot: rispondi 200 (non far capire al bot)
    if (errors[0].field === 'honeypot') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ errors }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. Invio email via Resend
  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL,
      to: import.meta.env.VETRERIA_EMAIL,
      subject: `Richiesta preventivo: ${data.serviceType} — ${data.name}`,
      html: `
        <h2>Nuova richiesta di preventivo</h2>
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Telefono:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Tipo di lavoro:</strong> ${data.serviceType}</p>
        ${data.description ? `<p><strong>Descrizione:</strong> ${data.description}</p>` : ''}
        ${data.measurements ? `<p><strong>Misure:</strong> ${data.measurements}</p>` : ''}
        <hr />
        <p><small>Inviato dal sito web — IP: ${ip}</small></p>
      `,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Errore invio email. Riprova o chiamaci.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

**Step 5: Crea QuoteForm.astro**

Form con:

- Campo honeypot nascosto (`aria-hidden`, `tabindex="-1"`, `autocomplete="off"`, CSS `position: absolute; left: -9999px`)
- Validazione client-side prima del submit
- Feedback errori inline
- Stato loading durante invio
- Messaggio conferma dopo invio
- Pre-compilazione tipo lavoro da `?servizio=` query param

**Step 6: Crea preventivo.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import QuoteForm from '../components/QuoteForm.astro';
export const prerender = true;
---

<BaseLayout
  title="Richiedi Preventivo"
  description="Richiedi un preventivo gratuito alla Vetreria Monferrina."
>
  <section class="max-w-2xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-heading text-primary mb-4">Richiedi un preventivo</h1>
    <p class="text-neutral-700 mb-8">Compila il modulo e ti ricontatteremo al piu' presto.</p>
    <QuoteForm />
  </section>
</BaseLayout>
```

**Step 7: Test unitari validazione e sanitizzazione**

```ts
// tests/unit/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateQuoteForm } from '../../src/lib/validation';

describe('validateQuoteForm', () => {
  const validData = {
    name: 'Mario Rossi',
    phone: '+39 0142 123456',
    email: 'mario@example.com',
    serviceType: 'box-doccia',
    description: 'Vorrei un box doccia su misura',
    measurements: '120x80',
    privacy: true,
    honeypot: '',
  };

  it('dati validi: nessun errore', () => {
    expect(validateQuoteForm(validData)).toHaveLength(0);
  });

  it('honeypot compilato: bot detected', () => {
    const errors = validateQuoteForm({ ...validData, honeypot: 'spam' });
    expect(errors[0].field).toBe('honeypot');
  });

  it('nome vuoto: errore', () => {
    const errors = validateQuoteForm({ ...validData, name: '' });
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('email malformata: errore', () => {
    const errors = validateQuoteForm({ ...validData, email: 'not-an-email' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('tipo servizio invalido: errore', () => {
    const errors = validateQuoteForm({ ...validData, serviceType: 'hacking' });
    expect(errors.some((e) => e.field === 'serviceType')).toBe(true);
  });

  it('privacy non accettata: errore', () => {
    const errors = validateQuoteForm({ ...validData, privacy: false });
    expect(errors.some((e) => e.field === 'privacy')).toBe(true);
  });
});
```

```ts
// tests/unit/sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeEmail } from '../../src/lib/sanitize';

describe('sanitizeString', () => {
  it('rimuove newline (previene email header injection)', () => {
    expect(sanitizeString('test\r\nBcc: spam@evil.com')).toBe('test Bcc: spam@evil.com');
  });

  it('rimuove tag HTML', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('rimuove javascript: protocol', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
  });
});

describe('sanitizeEmail', () => {
  it('normalizza e pulisce email', () => {
    expect(sanitizeEmail('  Mario@Example.COM  ')).toBe('mario@example.com');
  });

  it('rimuove caratteri pericolosi', () => {
    expect(sanitizeEmail('test@evil.com\r\nBcc: spam@x.com')).toBe('test@evil.combcc: spam@x.com');
  });
});
```

**Step 8: Test E2E form**

```ts
// tests/e2e/quote-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Form preventivo', () => {
  test('mostra errori per campi vuoti', async ({ page }) => {
    await page.goto('/preventivo');
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.locator('[data-error]').first()).toBeVisible();
  });

  test('pre-compila servizio da query param', async ({ page }) => {
    await page.goto('/preventivo?servizio=box-doccia');
    const select = page.locator('select[name="serviceType"]');
    await expect(select).toHaveValue('box-doccia');
  });

  test("honeypot e' nascosto e non accessibile", async ({ page }) => {
    await page.goto('/preventivo');
    const honeypot = page.locator('[data-honeypot]');
    await expect(honeypot).toBeHidden();
  });
});
```

**Step 9: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: form preventivo con validazione, sanitizzazione, rate limiting"
```

---

## Task 7: Chatbot a Flusso

**Contesto:** Chatbot interattivo basato su albero decisionale JSON. Zero API esterne, zero costi. JS vanilla, animazioni CSS, persistenza sessione con sessionStorage.

**Files:**

- Create: `src/components/Chatbot.astro`
- Create: `src/data/chatbot-flow.json`
- Create: `src/lib/chatbot-engine.ts`
- Test: `tests/unit/chatbot-engine.test.ts`
- Test: `tests/e2e/chatbot.spec.ts`

**Step 1: Crea src/data/chatbot-flow.json**

Albero completo con tutte le categorie di servizio dalla lista della famiglia. Nodi: welcome, servizi, servizi_installazioni, servizi_vetri, servizi_lavorazioni, orari, altra, + dettagli per ogni servizio. Ogni foglia ha CTA "Richiedi preventivo" (action: open_form con parametro servizio).

**Step 2: Crea src/lib/chatbot-engine.ts**

```ts
export interface ChatNode {
  message: string;
  options?: ChatOption[];
}

export interface ChatOption {
  label: string;
  next?: string;
  action?: 'open_form' | 'open_contacts' | 'call_phone';
  param?: string;
}

export type ChatFlow = Record<string, ChatNode>;

export class ChatbotEngine {
  private flow: ChatFlow;
  private history: string[] = [];

  constructor(flow: ChatFlow) {
    this.flow = flow;
  }

  getNode(id: string): ChatNode | undefined {
    return this.flow[id];
  }

  navigate(nodeId: string): ChatNode | undefined {
    this.history.push(nodeId);
    return this.getNode(nodeId);
  }

  goBack(): ChatNode | undefined {
    this.history.pop(); // rimuovi corrente
    const prev = this.history[this.history.length - 1] ?? 'welcome';
    return this.getNode(prev);
  }

  getHistory(): string[] {
    return [...this.history];
  }

  restoreHistory(history: string[]): void {
    this.history = [...history];
  }

  reset(): void {
    this.history = [];
  }
}
```

**Step 3: Crea Chatbot.astro (island component)**

Widget floating bottom-right. Si apre in pannello overlay. Animazione typing (300ms delay). Responsive: full-screen su mobile. Persiste lo stato in sessionStorage. Usa `client:idle` per hydration lazy.

Markup:

- Bottone toggle (icona messaggio SVG)
- Pannello con header, area messaggi, area opzioni
- Animazione slide-in CSS con `prefers-reduced-motion` rispettato

**Step 4: Test unitario chatbot engine**

```ts
// tests/unit/chatbot-engine.test.ts
import { describe, it, expect } from 'vitest';
import { ChatbotEngine, type ChatFlow } from '../../src/lib/chatbot-engine';
import flow from '../../src/data/chatbot-flow.json';

describe('ChatbotEngine', () => {
  it('carica il nodo welcome', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    const node = engine.navigate('welcome');
    expect(node).toBeDefined();
    expect(node!.message).toContain('Ciao');
    expect(node!.options!.length).toBeGreaterThan(0);
  });

  it('naviga ai servizi e torna indietro', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    engine.navigate('welcome');
    engine.navigate('servizi');
    const back = engine.goBack();
    expect(back).toBeDefined();
  });

  it('tutti i nodi referenziati esistono', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    for (const [, node] of Object.entries(flow)) {
      if (node.options) {
        for (const opt of node.options) {
          if (opt.next) {
            expect(engine.getNode(opt.next), `Nodo "${opt.next}" mancante`).toBeDefined();
          }
        }
      }
    }
  });

  it('restoreHistory ripristina lo stato', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    engine.navigate('welcome');
    engine.navigate('servizi');
    const saved = engine.getHistory();

    const engine2 = new ChatbotEngine(flow as ChatFlow);
    engine2.restoreHistory(saved);
    expect(engine2.getHistory()).toEqual(saved);
  });
});
```

**Step 5: Test E2E chatbot**

```ts
// tests/e2e/chatbot.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chatbot', () => {
  test('si apre e mostra il messaggio di benvenuto', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    await expect(page.locator('[data-chatbot-panel]')).toBeVisible();
    await expect(page.locator('[data-chatbot-message]').first()).toContainText('Ciao');
  });

  test('navigazione nei servizi funziona', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    await page.getByText(/che lavori fate/i).click();
    await expect(page.locator('[data-chatbot-message]')).toContainText(/vetro/i);
  });

  test("e' responsive su mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByRole('button', { name: /chat/i }).click();
    const panel = page.locator('[data-chatbot-panel]');
    const box = await panel.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(370);
  });
});
```

**Step 6: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: chatbot a flusso con engine, UI e test"
```

---

## Task 8: Pagine Contenuto (Chi siamo, Contatti, Galleria)

**Contesto:** Le tre pagine di contenuto rimanenti. Contenuti placeholder per ora (verranno da Sanity).

**Files:**

- Create: `src/pages/chi-siamo.astro`
- Create: `src/pages/contatti.astro`
- Create: `src/pages/galleria.astro`
- Create: `src/components/ContactMap.astro`
- Create: `src/components/GalleryGrid.astro`
- Create: `src/components/Lightbox.astro`
- Test: `tests/e2e/pages.spec.ts`

**Step 1: Crea chi-siamo.astro**

- Timeline o narrativa della storia
- Valori: artigianalita', qualita', territorio
- Placeholder per foto team/laboratorio
- `export const prerender = true`

**Step 2: Crea contatti.astro**

- ContactMap: embed OpenStreetMap statico (iframe con `loading="lazy"`) — no cookie terze parti
- Indirizzo, telefono (link `tel:`), email (link `mailto:`)
- Orari apertura (placeholder, verranno da Sanity)
- CTA alternativo al form preventivo

**Step 3: Crea galleria.astro**

- GalleryGrid: masonry CSS grid responsive
- Lightbox: overlay per zoom immagini, navigazione frecce, chiusura ESC
- Filtri per categoria (stesse categorie dei servizi)
- Lazy loading con `loading="lazy"` sulle immagini
- Immagini placeholder per ora

**Step 4: Test E2E tutte le pagine**

```ts
// tests/e2e/pages.spec.ts
import { test, expect } from '@playwright/test';

const pages = [
  { path: '/chi-siamo', title: /chi siamo/i },
  { path: '/contatti', title: /contatti/i },
  { path: '/galleria', title: /galleria/i },
];

for (const { path, title } of pages) {
  test(`${path} carica correttamente`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toContainText(title);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
}

test('contatti ha link telefonico cliccabile', async ({ page }) => {
  await page.goto('/contatti');
  await expect(page.locator('a[href^="tel:"]')).toBeVisible();
});

test('galleria ha filtri categoria', async ({ page }) => {
  await page.goto('/galleria');
  await expect(page.locator('[data-filter]').first()).toBeVisible();
});
```

**Step 5: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: pagine chi siamo, contatti, galleria"
```

---

## Task 9: Pagine Legali + Cookie Banner (GDPR)

**Contesto:** GDPR e normativa italiana. Privacy policy, cookie policy, cookie banner informativo. Critico per compliance legale.

**Files:**

- Create: `src/pages/privacy.astro`
- Create: `src/pages/cookie.astro`
- Create: `src/components/CookieBanner.astro`
- Modify: `src/layouts/BaseLayout.astro` (aggiungi CookieBanner)
- Test: `tests/unit/cookie-banner.test.ts`
- Test: `tests/e2e/legal.spec.ts`

**Step 1: Crea privacy.astro**

Privacy Policy conforme art. 13 GDPR:

- Titolare: Vetreria Monferrina di Fioravanti Giuseppe
- Dati raccolti: nome, telefono, email, descrizione (solo dal form)
- Finalita': risposta a richiesta preventivo
- Base giuridica: consenso esplicito
- Conservazione: solo nella casella email, nessun database
- Diritti: accesso, rettifica, cancellazione, portabilita'
- Nessun DPO (PMI con trattamento occasionale)

**Step 2: Crea cookie.astro**

Cookie Policy:

- Nessun cookie di profilazione
- Solo cookie tecnici (sessionStorage chatbot)
- Non serve consenso per cookie tecnici (art. 122 Codice Privacy)

**Step 3: Crea CookieBanner.astro**

Banner informativo (non di consenso — usiamo solo cookie tecnici):

- Testo: "Questo sito utilizza solo cookie tecnici necessari al funzionamento."
- Link alla cookie policy
- Bottone "Ho capito" che chiude (salva in localStorage)
- Non blocca nulla (non e' consent banner)

**Step 4: Aggiungi CookieBanner a BaseLayout**

Inserisci prima della chiusura di `</body>`.

**Step 5: Test**

```ts
// tests/e2e/legal.spec.ts
import { test, expect } from '@playwright/test';

test("privacy policy e' accessibile e contiene GDPR", async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.locator('h1')).toContainText(/privacy/i);
  const text = await page.textContent('main');
  expect(text).toContain('GDPR');
  expect(text).toContain('Fioravanti');
});

test('cookie banner appare e si chiude', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('[data-cookie-banner]');
  await expect(banner).toBeVisible();
  await page.getByRole('button', { name: /capito/i }).click();
  await expect(banner).toBeHidden();
});

test('cookie banner non riappare dopo chiusura', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /capito/i }).click();
  await page.reload();
  await expect(page.locator('[data-cookie-banner]')).toBeHidden();
});

test('footer ha link privacy e cookie policy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
  await expect(page.locator('footer a[href="/cookie"]')).toBeVisible();
});
```

**Step 6: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: privacy policy, cookie policy, cookie banner GDPR"
```

---

## Task 10: Integrazione Sanity CMS

**Contesto:** Collegare Sanity v3 per i contenuti dinamici. La famiglia potra' aggiornare testi, foto, servizi e orari in autonomia. I dati placeholder vengono sostituiti con query Sanity a build time.

**Files:**

- Create: `sanity/sanity.config.ts`
- Create: `sanity/schema/service.ts`
- Create: `sanity/schema/galleryItem.ts`
- Create: `sanity/schema/aboutPage.ts`
- Create: `sanity/schema/siteSettings.ts`
- Create: `src/lib/sanity.ts`
- Modify: `src/pages/servizi.astro` (fetch da Sanity)
- Modify: `src/pages/chi-siamo.astro` (fetch da Sanity)
- Modify: `src/pages/galleria.astro` (fetch da Sanity)
- Modify: `src/pages/contatti.astro` (orari da Sanity)
- Modify: `src/components/Footer.astro` (dati legali da Sanity)
- Test: `tests/unit/sanity-client.test.ts`

**Step 1: Setup progetto Sanity**

```bash
cd sanity
npm create sanity@latest -- --project-plan free --dataset production --typescript
```

**Step 2: Crea schema service.ts**

```ts
import { defineType } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Servizio',
  type: 'document',
  fields: [
    { name: 'name', title: 'Nome', type: 'string', validation: (r) => r.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    {
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: { list: ['installazioni', 'vetri', 'lavorazioni'] },
    },
    { name: 'description', title: 'Descrizione', type: 'text' },
    { name: 'image', title: 'Immagine', type: 'image', options: { hotspot: true } },
    { name: 'order', title: 'Ordine', type: 'number' },
  ],
});
```

**Step 3: Crea schema siteSettings.ts**

Campi: ragione sociale, P.IVA, sede, telefono, email, orari apertura (array giorno/ora), link social.

**Step 4: Crea schema galleryItem.ts e aboutPage.ts**

Gallery: immagine, titolo, categoria, ordine.
About: rich text (Portable Text), immagini team.

**Step 5: Crea src/lib/sanity.ts**

```ts
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: '2026-02-27',
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);
export function urlFor(source: unknown) {
  return builder.image(source);
}
```

**Step 6: Sostituisci dati placeholder con query Sanity nelle pagine**

Ogni pagina fa `const data = await sanityClient.fetch(query)` nel frontmatter Astro a build time.

**Step 7: Test unitario client Sanity (mock)**

```ts
// tests/unit/sanity-client.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('Sanity client', () => {
  it('le query GROQ sono sintatticamente corrette', () => {
    // Verifica che le query string non contengano errori evidenti
    const queries = [
      '*[_type == "service"] | order(order asc)',
      '*[_type == "siteSettings"][0]',
      '*[_type == "galleryItem"] | order(order asc)',
      '*[_type == "aboutPage"][0]',
    ];
    for (const q of queries) {
      expect(q).toContain('_type');
      expect(q).not.toContain('undefined');
    }
  });
});
```

**Step 8: Test Docker + Commit**

```bash
docker compose -f docker-compose.test.yml run --build unit
git add -A && git commit -m "feat: integrazione Sanity CMS con schema e client"
```

---

## Task 11: SEO + Performance + Accessibilita' + Deploy

**Contesto:** Task finale di polish. Lighthouse 100 target, WCAG 2.1 AA, sitemap, robots.txt, View Transitions, deploy su Vercel.

**Files:**

- Create: `public/robots.txt`
- Create: `public/favicon.svg`
- Modify: `astro.config.mjs` (sitemap integration)
- Modify: `src/layouts/BaseLayout.astro` (View Transitions, structured data)
- Modify: `vercel.json` (stringi CSP se possibile)
- Test: `tests/e2e/seo.spec.ts`
- Test: `tests/e2e/accessibility.spec.ts`

**Step 1: Installa e configura sitemap**

```bash
npx astro add sitemap --yes
```

**Step 2: Crea robots.txt**

```
User-agent: *
Allow: /
Sitemap: https://vetreriamonferrina.com/sitemap-index.xml
```

**Step 3: Crea favicon.svg**

SVG semplice con il colore primario.

**Step 4: Aggiungi View Transitions a BaseLayout**

```astro
---
import { ViewTransitions } from 'astro:transitions';
---

<head>
  <!-- ...existing meta... -->
  <ViewTransitions />
</head>
```

**Step 5: Aggiungi structured data (JSON-LD)**

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Vetreria Monferrina",
    "description": "Vetreria storica a Casale Monferrato",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Casale Monferrato",
      "addressRegion": "AL",
      "addressCountry": "IT"
    },
    "telephone": "+39 0142 XXXXXX"
  }
</script>
```

**Step 6: Test SEO**

```ts
// tests/e2e/seo.spec.ts
import { test, expect } from '@playwright/test';

test('ogni pagina ha meta description', async ({ page }) => {
  const pages = ['/', '/servizi', '/chi-siamo', '/contatti', '/galleria', '/preventivo'];
  for (const path of pages) {
    await page.goto(path);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc, `${path} manca meta description`).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(50);
  }
});

test("robots.txt e' accessibile", async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response!.status()).toBe(200);
});

test('structured data JSON-LD presente', async ({ page }) => {
  await page.goto('/');
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('LocalBusiness');
});
```

**Step 7: Test accessibilita'**

```ts
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test('tutte le immagini hanno alt text', async ({ page }) => {
  await page.goto('/');
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt, `Immagine ${i} senza alt`).toBeTruthy();
  }
});

test('focus visibile su elementi interattivi', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});

test('form ha label associate', async ({ page }) => {
  await page.goto('/preventivo');
  const inputs = page.locator('input:not([type="hidden"]), select, textarea');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const id = await inputs.nth(i).getAttribute('id');
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label, `Input ${id} senza label`).toBeVisible();
    }
  }
});
```

**Step 8: Deploy su Vercel**

```bash
# Installa Vercel CLI
npm i -g vercel

# Login e collega progetto
vercel login
vercel link

# Deploy preview
vercel

# Se tutto OK, deploy production
vercel --prod
```

Dopo il deploy:

1. Configura dominio custom su Vercel dashboard
2. Configura webhook Sanity → Vercel rebuild
3. Verifica HTTPS attivo
4. Verifica security headers con securityheaders.com
5. Verifica Lighthouse score

**Step 9: Test Docker finale + Commit**

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
git add -A && git commit -m "feat: SEO, accessibility, performance, deploy Vercel"
```

---

## Riepilogo Task

| #   | Task                                  | Focus                                                          |
| --- | ------------------------------------- | -------------------------------------------------------------- |
| 1   | Scaffold + Docker                     | Fondamento, infrastruttura test                                |
| 2   | Design System + BaseLayout + Security | Tema, layout, headers sicurezza                                |
| 3   | Header + Footer + Nav                 | Chrome del sito, responsive                                    |
| 4   | Home Page                             | Sezioni hero, servizi, stats, CTA                              |
| 5   | Servizi                               | Categorie, card, dati reali                                    |
| 6   | Form + API                            | **SICUREZZA CRITICA**: validazione, sanitizzazione, rate limit |
| 7   | Chatbot                               | Engine JSON, UI, animazioni                                    |
| 8   | Chi siamo + Contatti + Galleria       | Pagine contenuto                                               |
| 9   | Legal + Cookie Banner                 | **GDPR**: privacy, cookie, banner                              |
| 10  | Sanity CMS                            | Schema, client, contenuti dinamici                             |
| 11  | SEO + Performance + Deploy            | Lighthouse 100, a11y, Vercel                                   |
