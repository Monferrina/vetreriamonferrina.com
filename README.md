# Vetreria Monferrina — Sito Web

Sito web ufficiale della **Vetreria Monferrina di Fioravanti Giuseppe** — Casale Monferrato (AL).

Sito vetrina con form preventivi, galleria lavori, chatbot informativo e integrazione Google Places.

## Tech Stack

| Categoria       | Tecnologia                                            |
| --------------- | ----------------------------------------------------- |
| Framework       | Astro 5 (SSG + SSR ibrido)                            |
| Stile           | Tailwind CSS 4                                        |
| CMS             | Sanity v5                                             |
| Email           | Resend                                                |
| Hosting         | Vercel (serverless)                                   |
| CDN / DNS / WAF | Cloudflare                                            |
| Mappa           | Leaflet.js                                            |
| Meteo           | Open-Meteo (gratis, no API key)                       |
| Recensioni      | Google Places API (New) — dati scaricati a build-time |
| Test            | Vitest (unit) + Playwright (E2E)                      |
| CI              | GitHub Actions                                        |
| Code quality    | ESLint + Prettier + Husky + lint-staged               |

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
| `RESEND_FROM_EMAIL` | Mittente email (dominio verificato su Resend) | Es. `noreply@vetreriamonferrina.com`               |
| `VETRERIA_EMAIL`    | Casella che riceve i preventivi               | `vetreriamonferrina@gmail.com`                     |
| `SANITY_PROJECT_ID` | ID progetto Sanity                            | [sanity.io/manage](https://sanity.io/manage)       |
| `SANITY_DATASET`    | Dataset Sanity                                | `production`                                       |
| `SITE_URL`          | URL del sito in produzione                    | `https://vetreriamonferrina.com`                   |
| `MAINTENANCE_MODE`  | Attiva la pagina di manutenzione 503          | `true` / `false`                                   |

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
npm run lighthouse   # Lighthouse CI
```

### Docker (opzionale)

```bash
docker compose up              # Dev server
npm run test:docker:unit       # Unit test in Docker
npm run test:docker:e2e        # E2E test in Docker
```

## CI/CD

La pipeline GitHub Actions (`.github/workflows/ci.yml`) esegue automaticamente su push e PR:

1. **Lint** — ESLint
2. **Format** — Prettier
3. **Type check** — `astro check`
4. **Unit test** — Vitest
5. **Build** — build di produzione
6. **Lighthouse CI** — soglie: performance >= 0.85, accessibility >= 0.9, SEO >= 0.9

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
├── .github/workflows/       # CI pipeline
├── docs/
│   └── plans/               # Design doc, architettura, guide tecniche
├── sanity/                  # Sanity CMS (schemi, config)
├── scripts/                 # Script build-time (Google Places, immagini, logo)
├── src/
│   ├── components/          # Componenti Astro (Header, Footer, Chatbot, Lightbox, etc.)
│   ├── data/                # Dati statici JSON (chatbot, recensioni, orari, servizi)
│   ├── layouts/             # Layout base (dark mode, View Transitions, SEO)
│   ├── lib/                 # Logica condivisa (Sanity client, validazione, sanitize, rate limit)
│   ├── pages/               # Pagine + API routes
│   │   └── api/             # Serverless functions (form preventivo)
│   ├── styles/              # Design system CSS (token, dark mode, transizioni)
│   └── middleware.ts        # Middleware (maintenance mode)
├── public/
│   ├── fonts/               # Font self-hosted (Inter, DM Serif Display)
│   └── images/              # Immagini ottimizzate WebP
├── tests/
│   ├── unit/                # Unit test (Vitest)
│   └── e2e/                 # E2E test (Playwright)
├── astro.config.mjs         # Configurazione Astro
├── vercel.json              # Security headers (CSP, HSTS, etc.)
└── package.json
```

## Pagine

| Route             | Descrizione                                          | Rendering |
| ----------------- | ---------------------------------------------------- | --------- |
| `/`               | Homepage (hero, servizi, stats, recensioni, partner) | SSG       |
| `/servizi`        | Catalogo servizi con filtri per categoria            | SSG       |
| `/galleria`       | Galleria masonry con lightbox                        | SSG       |
| `/chi-siamo`      | Storia, team, timeline, sezione memoriale            | SSG       |
| `/contatti`       | Mappa Leaflet, orari, meteo, contatti                | SSG       |
| `/preventivo`     | Form richiesta preventivo                            | SSG       |
| `/privacy`        | Informativa privacy                                  | SSG       |
| `/cookie`         | Policy cookie                                        | SSG       |
| `/api/send-quote` | API invio email preventivo (Resend)                  | SSR       |
| `/404`            | Pagina errore 404                                    | SSG       |
| `/500`            | Pagina errore 500                                    | SSG       |
| `/maintenance`    | Pagina manutenzione 503                              | SSG       |

## Infrastruttura

### Vercel

Il sito e deployato su Vercel con adapter `@astrojs/vercel`. Le pagine statiche (SSG) sono pre-renderizzate, l'API route `/api/send-quote` e una serverless function.

**Environment variables:** configurare su Vercel > Settings > Environment Variables (Production + Preview).

### Cloudflare

Il dominio `vetreriamonferrina.com` e gestito su Cloudflare (piano Free).

| Configurazione | Dettaglio                                                         |
| -------------- | ----------------------------------------------------------------- |
| DNS            | A → `76.76.21.21` + CNAME www → `cname.vercel-dns.com` (DNS Only) |
| SSL/TLS        | Full (Strict)                                                     |
| HSTS           | 12 mesi, preload, includeSubDomains                               |
| WAF            | Bot Fight Mode + AI Bot Blocking                                  |
| Cache          | Asset statici 1 anno (`/_astro/`, `.webp`, `.woff2`)              |
| Analytics      | Web Analytics (RUM, zero cookie)                                  |
| Rocket Loader  | **OFF** (interferisce con Astro)                                  |

### Resend

Per l'invio email dal form preventivo. Il dominio mittente (`vetreriamonferrina.com`) deve essere verificato su Resend con record DNS (MX, SPF, DKIM).

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

**Sicurezza:** la chiave Google non va mai committata. Limitarla a "Places API" e "Places API (New)" nella Google Cloud Console. Impostare quota 50 req/giorno e budget alert $5/mese.

## Manutenzione

Per mettere il sito in manutenzione, impostare la variabile `MAINTENANCE_MODE=true` su Vercel e ri-deployare. Tutte le pagine mostreranno la pagina 503 con i contatti della vetreria.

## Documentazione tecnica

- `docs/plans/2026-02-27-vetreria-monferrina-design.md` — Design document
- `docs/plans/google-reviews-setup.md` — Guida Google Places API
- `docs/plans/architecture.drawio` — Diagramma architettura (draw.io)

## Licenza

Progetto proprietario — Vetreria Monferrina di Fioravanti Giuseppe. Tutti i diritti riservati.
