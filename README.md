# Vetreria Monferrina

Sito web della Vetreria Monferrina di Fioravanti Giuseppe — Casale Monferrato (AL).

## Tech Stack

- **Astro 5** (SSG + SSR ibrido) + **Tailwind CSS 4**
- **Sanity v3** (CMS headless)
- **Resend** (email transazionali)
- **Vercel** (hosting + serverless)
- **Google Places API (New)** (recensioni, orari, foto a build-time)
- **Open-Meteo** (widget meteo gratis, no API key)
- **Leaflet.js** (mappa interattiva contatti)
- **ESLint** + **Prettier** (code quality)
- **Husky** + **lint-staged** (pre-commit hooks)
- **Vitest** + **Playwright** (unit test + E2E)
- **GitHub Actions** (CI pipeline)

## Funzionalità

- Homepage con hero, servizi in evidenza, stats, recensioni Google, CTA
- Pagine servizi e galleria con **filtri a pill buttons** coerenti (categorie: Installazioni, Vetri, Lavorazioni)
- Galleria con **lightbox** e navigazione tastiera
- **Mappa interattiva Leaflet** con marker SVG rosso a spillo e popup indirizzo
- **Widget meteo** con consigli intelligenti sul vetro (Open-Meteo, gratis)
- **Orari di apertura da Google** con fallback chain (Sanity → Google → statico)
- **Chatbot contestuale** a flusso — saluto diverso per pagina, JSON statico, zero API, sessione persistente
- Form preventivo con validazione client + server + honeypot
- **Dark mode automatica** (orario notturno + preferenza di sistema) con design token CSS
- **Client Router** per navigazione fluida (Astro transitions)
- Cookie banner informativo (solo cookie tecnici, GDPR)
- SEO: JSON-LD, Open Graph, sitemap, canonical URLs
- **Security headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Chi siamo** — storia familiare, timeline, sezione in ricordo di Manuela

## Screenshot

Vedi `docs/screenshots/` per gli screenshot di tutte le pagine (dark mode e light mode).

## Sviluppo

```bash
npm install
npm run dev
```

### Docker

```bash
# Dev server
docker compose up

# Test
npm run test:docker:unit
npm run test:docker:e2e
```

## Test & Quality

```bash
# Unit test
npm test

# E2E test
npm run test:e2e

# Lint
npm run lint

# Format
npm run format:check

# Type check (Astro + TypeScript)
npm run check
```

## CI/CD

Il progetto include una pipeline GitHub Actions (`.github/workflows/ci.yml`) che esegue automaticamente su push e PR:

1. **Lint** — ESLint
2. **Format check** — Prettier
3. **Type check** — `astro check`
4. **Unit test** — Vitest (94 test)
5. **Build** — build di produzione

I pre-commit hooks (Husky + lint-staged) eseguono lint e format automaticamente ad ogni commit.

## Struttura progetto

```
MonferrinaProject/
├── .github/workflows/       # CI pipeline (GitHub Actions)
├── .husky/                  # Pre-commit hooks
├── docs/
│   ├── plans/               # Design doc, architettura, guide
│   └── screenshots/         # Screenshot pagine (dark/light mode)
├── scripts/                 # Script build-time (logo, Google Places data)
├── src/
│   ├── components/          # Componenti Astro (mappa Leaflet, chatbot, lightbox, filtri)
│   ├── data/                # Dati statici (chatbot-flow, reviews, orari, servizi)
│   ├── layouts/             # Layout base con dark mode + Client Router
│   ├── lib/                 # Logica condivisa (sanity, chatbot-engine, validazione)
│   ├── pages/               # Pagine + API routes
│   │   └── api/             # Edge functions (form preventivo)
│   └── styles/              # Design system (token colori, font, dark mode)
├── public/                  # Asset statici (font, immagini, favicon)
├── tests/
│   ├── unit/                # 9 file, 94 test (Vitest)
│   └── e2e/                 # 10 file (Playwright)
├── astro.config.mjs
├── eslint.config.js         # ESLint flat config (TS + Astro)
├── .prettierrc              # Prettier config
├── vercel.json              # Security headers + CSP
└── package.json
```

## Aggiornare dati Google (recensioni, orari, foto)

```bash
GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-place-data.mjs
```

Genera: `reviews.json`, `opening-hours.json`, `place-photos.json` + scarica foto in `public/images/google-photos/`.

Vedi `docs/plans/google-reviews-setup.md` per la guida completa.

### Sicurezza API

- API key **mai committata** — solo variabili d'ambiente o GitHub Secrets
- Chiavi limitate a Places API e Places API (New) nella Google Cloud Console
- `place-photos.json` in `.gitignore` (contiene solo path locali, ma per cautela)
- Impostare quote GCP: 50 req/giorno + budget alert $5/mese

## Documentazione

- **Design document**: `docs/plans/2026-02-27-vetreria-monferrina-design.md`
- **Piano implementazione**: `docs/plans/2026-02-27-implementation-plan.md`
- **Guida recensioni Google**: `docs/plans/google-reviews-setup.md`
- **Architettura (draw.io)**: `docs/plans/architecture.drawio`
- **Stato lavori**: `docs/TODO-prossima-sessione.md`
