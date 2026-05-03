# Vetreria Monferrina — Sito Web

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)

[![CI](https://github.com/Monferrina/vetreriamonferrina.com/actions/workflows/ci.yml/badge.svg)](https://github.com/Monferrina/vetreriamonferrina.com/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://vetreriamonferrina.com)
[![Astro](https://img.shields.io/badge/Astro-5-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)](/LICENSE)

---

Sito web ufficiale della **Vetreria Monferrina di Fioravanti Giuseppe** — Casale Monferrato (AL).

Sito vetrina con form preventivi, galleria lavori, blog, 16 pagine servizio, FAQ e integrazione Google Places.

**[vetreriamonferrina.com](https://vetreriamonferrina.com)**

## Tech Stack

| Categoria       | Tecnologia                                            |
| --------------- | ----------------------------------------------------- |
| Framework       | Astro 5 (SSG + SSR ibrido)                            |
| Stile           | Tailwind CSS 4                                        |
| CMS             | Sanity v5                                             |
| Email           | Resend (account Proton, TLS enforced)                 |
| Email templates | HTML brand templates (`src/lib/email-templates/`)     |
| Hosting         | Vercel (serverless)                                   |
| CDN / DNS / WAF | Cloudflare (proxy attivo)                             |
| Monitoring      | Checkly (uptime, API, browser checks)                 |
| Mappa           | Google Maps Embed API                                 |
| Meteo           | Open-Meteo (gratis, no API key)                       |
| Recensioni      | Google Places API (New) — dati scaricati a build-time |
| Test            | Vitest (unit) + Playwright (E2E)                      |
| CI              | GitHub Actions                                        |
| Code quality    | ESLint + Prettier + Husky + lint-staged + SonarCloud  |

## Requisiti

- **Node.js** >= 20 (vedi `.nvmrc`)
- **npm** >= 10

## Setup locale

```bash
# 1. Clona il repository
git clone <repo-url> && cd <repo-name>

# 2. Installa le dipendenze
npm install

# 3. Copia le variabili d'ambiente
cp .env.example .env.local

# 4. Compila le variabili in .env.local (vedi sezione "Variabili d'ambiente")

# 5. Avvia il dev server
npm run dev
# → http://localhost:4321
```

## Variabili d'ambiente

Copia `.env.example` in `.env.local` per lo sviluppo locale. Su Vercel, configura nelle Settings > Environment Variables.

| Variabile           | Descrizione                                   | Dove ottenerla                                     |
| ------------------- | --------------------------------------------- | -------------------------------------------------- |
| `RESEND_API_KEY`    | API key Resend per invio email                | [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Mittente email (dominio verificato su Resend) | Es. `preventivi@vetreriamonferrina.com`            |
| `VETRERIA_EMAIL`    | Casella che riceve i preventivi               | `vetreriamonferrina@gmail.com`                     |
| `SANITY_PROJECT_ID` | ID progetto Sanity                            | [sanity.io/manage](https://sanity.io/manage)       |
| `SANITY_DATASET`    | Dataset Sanity                                | `production`                                       |
| `SITE_URL`          | URL del sito in produzione                    | `https://vetreriamonferrina.com`                   |

**Google Places API** (opzionale, per aggiornare recensioni/orari):

```bash
GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-place-data.mjs
```

La chiave Google non serve a runtime — i dati vengono scaricati una tantum e committati come JSON statico.

## Comandi principali

```bash
npm run dev          # Dev server (http://localhost:4321)
npm run build        # Build di produzione
npm run preview      # Anteprima build locale
npm test             # Unit test (Vitest)
npm run test:e2e     # E2E test (Playwright)
npm run lint         # ESLint
npm run format:check # Prettier check
npm run check        # Type check (astro check)
```

## CI/CD

La pipeline GitHub Actions (`.github/workflows/ci.yml`) esegue automaticamente su push e PR:

1. **Security audit** — `npm audit` (produzione)
2. **Lint** — ESLint
3. **Format** — Prettier
4. **Type check** — `astro check`
5. **Tests** — Vitest con coverage (11 file, 134 test)
6. **Build** — build di produzione
7. **SonarCloud** — analisi qualita, sicurezza, coverage
8. **Lighthouse CI** — soglie: accessibility >= 0.95, best practices >= 0.95, SEO >= 0.9

I pre-commit hooks (Husky + lint-staged) eseguono lint e format ad ogni commit.

**Deploy:** Vercel deploya automaticamente ad ogni push su `main` (production) e su branch/PR (preview).

### Flusso di lavoro (dev → production)

```
1. Crea un branch        →  git checkout -b fix/qualcosa
2. Fai le modifiche      →  edit, commit
3. Pusha                 →  git push -u origin fix/qualcosa
4. Vercel fa preview     →  URL temporaneo per verificare le modifiche
5. Apri PR su main       →  CI gira (lint, test, build, Lighthouse)
6. Mergia la PR          →  Vercel deploya in produzione su vetreriamonferrina.com
```

- **`main` = produzione (live)** — branch protetto, non si pusha direttamente
- **Qualsiasi altro branch = dev** — Vercel genera un preview URL per ogni push/PR
- Le environment variables possono essere diverse tra Production e Preview (Vercel > Settings > Environment Variables)

## Struttura progetto

```
├── __checks__/              # Checkly monitoring checks (API, URL, browser)
├── .github/workflows/       # CI pipeline
├── cloudflare/              # Cloudflare Worker (maintenance mode)
├── docs/plans/              # Guide tecniche (Google Reviews)
├── sanity/                  # Sanity CMS (schemi, config)
├── scripts/                 # Script build-time (Google Places, immagini, logo)
├── src/
│   ├── components/          # 18 componenti Astro
│   ├── data/                # Dati statici JSON (chatbot, recensioni, orari, servizi)
│   ├── layouts/             # Layout base (dark mode, View Transitions, SEO)
│   ├── lib/                 # Logica condivisa (Sanity client, validazione, sanitize, rate limit, email templates)
│   ├── pages/               # Pagine + API routes
│   │   ├── api/             # Serverless functions (form preventivo)
│   │   ├── blog/            # Blog (4 articoli)
│   │   └── servizi/         # 16 pagine servizio individuali
│   ├── styles/              # Design system CSS (token, dark mode, transizioni)
│   └── middleware.ts        # Middleware (maintenance mode)
├── public/
│   ├── fonts/               # Font self-hosted (Inter, DM Serif Display)
│   └── images/              # Immagini ottimizzate WebP
├── tests/
│   ├── unit/                # Test (Vitest — 11 file, 134 test)
│   └── e2e/                 # E2E test (Playwright)
├── astro.config.mjs         # Configurazione Astro
├── checkly.config.ts        # Configurazione Checkly monitoring
├── vercel.json              # Security headers (CSP, HSTS, etc.)
└── package.json
```

## Pagine

| Route                    | Descrizione                                                                  | Rendering |
| ------------------------ | ---------------------------------------------------------------------------- | --------- |
| `/`                      | Homepage (hero, servizi, stats, recensioni, partner)                         | SSG       |
| `/servizi`               | Catalogo servizi con filtri per categoria                                    | SSG       |
| `/servizi/[slug]`        | 16 pagine servizio individuali                                               | SSG       |
| `/galleria`              | Galleria masonry con lightbox                                                | SSG       |
| `/chi-siamo`             | Storia, team, timeline, sezione memoriale                                    | SSG       |
| `/contatti`              | Mappa Google, orari, meteo, contatti                                         | SSG       |
| `/preventivo`            | Form richiesta preventivo                                                    | SSG       |
| `/faq`                   | FAQ (7 categorie, Schema.org FAQPage)                                        | SSG       |
| `/blog`                  | Blog (4 articoli sempreverdi con TOC)                                        | SSG       |
| `/blog/[slug]`           | Articoli blog individuali                                                    | SSG       |
| `/trasporto-e-montaggio` | Servizio trasporto e montaggio                                               | SSG       |
| `/privacy`               | Informativa privacy                                                          | SSG       |
| `/cookie`                | Policy cookie                                                                | SSG       |
| `/api/send-quote`        | API invio email preventivo (Resend, campi obbligatori: descrizione + misure) | SSR       |
| `/404`                   | Pagina errore 404                                                            | SSG       |
| `/500`                   | Pagina errore 500                                                            | SSG       |
| `/maintenance`           | Pagina manutenzione 503                                                      | SSG       |

## Infrastruttura

### Vercel

Il sito e deployato su Vercel con adapter `@astrojs/vercel`. Le pagine statiche (SSG) sono pre-renderizzate, l'API route `/api/send-quote` e una serverless function.

**Environment variables:** configurare su Vercel > Settings > Environment Variables (Production + Preview).

### Cloudflare

Il dominio `vetreriamonferrina.com` e gestito su Cloudflare (piano Free) con proxy attivo (nuvoletta arancione).

| Configurazione | Dettaglio                                                         |
| -------------- | ----------------------------------------------------------------- |
| DNS            | A → `76.76.21.21` + CNAME www → `cname.vercel-dns.com` (Proxied)  |
| SSL/TLS        | Full (Strict)                                                     |
| HSTS           | 12 mesi, preload, includeSubDomains                               |
| WAF            | Bot Fight Mode + AI Bot Blocking                                  |
| Cache          | Asset statici 1 anno (`/_astro/`, `.webp`, `.woff2`)              |
| Analytics      | Web Analytics (RUM, zero cookie)                                  |
| Rocket Loader  | **OFF** (interferisce con Astro)                                  |
| Worker         | `maintenance-mode` — attivare/disattivare da dashboard Cloudflare |

### Resend

Per l'invio email dal form preventivo. Account su `giuseppefioravanti@proton.me`. Il dominio mittente (`vetreriamonferrina.com`) e verificato su Resend con record DNS (MX, SPF, DKIM). TLS enforced, click/open tracking disattivati.

Le email usano template HTML professionali con colori brand (`src/lib/email-templates/`).

### DNS Email (Cloudflare)

| Record | Nome                | Valore                                                            |
| ------ | ------------------- | ----------------------------------------------------------------- |
| TXT    | `resend._domainkey` | Chiave DKIM Resend                                                |
| MX     | `send`              | `feedback-smtp.eu-west-1.amazonses.com` (priorita 10)             |
| TXT    | `send`              | `v=spf1 include:amazonses.com ~all`                               |
| TXT    | `_dmarc`            | `v=DMARC1; p=quarantine; rua=mailto:giuseppefioravanti@proton.me` |

### Checkly (Monitoring)

Monitoring sintetico con 3 check ogni 10 minuti da `eu-central-1` e `eu-west-1`:

- **Homepage Uptime** — URL monitor, verifica status 200
- **Send Quote API** — POST con honeypot (non invia email reali), verifica status 200
- **Homepage Browser** — Playwright check, verifica titolo e rendering

Configurazione in `checkly.config.ts` e `__checks__/`. Alert su email Proton. Integrazioni attive: Vercel + GitHub.

### Sanity

CMS headless per contenuti dinamici (foto famiglia, orari, testi pagina Chi Siamo). Lo studio Sanity e in `sanity/`.

**Studio in produzione:** [vetreriamonferrina.sanity.studio](https://vetreriamonferrina.sanity.studio/)

```bash
# Dev locale (opzionale)
cd sanity && npm install && npm run dev
# → http://localhost:3333
```

## Aggiornare dati Google

Recensioni, orari e foto vengono scaricati da Google Places API e salvati come JSON statico.

```bash
GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-place-data.mjs
```

Genera: `src/data/reviews.json`, `src/data/opening-hours.json` + foto in `public/images/google-photos/`.

Guida completa: `docs/plans/google-reviews-setup.md`

**Sicurezza:** la chiave Google non va mai committata. Limitarla a "Places API" e "Places API (New)" nella Google Cloud Console.

## Manutenzione

### Attivare la manutenzione

1. Andare su [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → `maintenance-mode`
2. Settings → Variables and Secrets → impostare `MAINTENANCE_ENABLED` a `true`
3. Effetto immediato, nessun deploy necessario

### Disattivare la manutenzione

1. Stessa pagina, impostare `MAINTENANCE_ENABLED` a `false`
2. Effetto immediato

### Come funziona

Un [Cloudflare Worker](https://developers.cloudflare.com/workers/) intercetta tutte le richieste **prima** che arrivino a Vercel. Quando la manutenzione e attiva, il worker recupera la pagina `/maintenance` da Vercel e la serve con status 503. Quando e disattiva, il worker fa un semplice passthrough al sito. Il codice del worker e in `cloudflare/maintenance-worker/`.

## Documentazione tecnica

- `docs/plans/google-reviews-setup.md` — Guida Google Places API
- `docs/plans/architecture.drawio` — Diagramma architettura (draw.io)

## Licenza

Progetto proprietario — Vetreria Monferrina di Fioravanti Giuseppe. Tutti i diritti riservati.
