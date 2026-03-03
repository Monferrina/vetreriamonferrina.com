# Vetreria Monferrina

Sito web della Vetreria Monferrina di Fioravanti Giuseppe — Casale Monferrato (AL).

## Tech Stack

- **Astro 5** (SSG + SSR ibrido) + **Tailwind CSS 4**
- **Sanity v3** (CMS headless)
- **Resend** (email transazionali)
- **Cloudflare** (DNS, CDN proxy, WAF, Web Analytics, cache)
- **Vercel** (hosting + serverless)
- **Google Places API (New)** (recensioni, orari, foto a build-time)
- **Open-Meteo** (widget meteo gratis, no API key)
- **Leaflet.js** (mappa interattiva contatti)
- **ESLint** + **Prettier** (code quality)
- **Husky** + **lint-staged** (pre-commit hooks)
- **Lighthouse CI** (performance, accessibilita, SEO)
- **Vitest** + **Playwright** (unit test + E2E)
- **GitHub Actions** (CI pipeline)

## Funzionalita

- Homepage con hero parallax, servizi in evidenza, stats, recensioni Google, partner, CTA
- Pagine servizi e galleria con **filtri a pill buttons** coerenti (3 categorie: Installazioni, Vetri, Lavorazioni)
- Galleria **masonry** 24 foto con **lightbox** accessibile (focus trap, navigazione tastiera, swipe touch, z-[9990])
- **Mappa interattiva Leaflet** con marker SVG rosso a spillo e popup indirizzo
- **Widget meteo** con consigli intelligenti sul vetro (Open-Meteo, gratis)
- **Orari di apertura da Google** con fallback chain (Sanity -> Google -> statico)
- **Chatbot contestuale** a flusso — saluto diverso per pagina, JSON statico, zero API, sessione persistente, focus trap
- Form preventivo con validazione client + server + honeypot + rate limiting (5/min/IP)
- **Dark mode automatica** (orario notturno + preferenza di sistema) con design token CSS
- **View Transitions** — navigazione fluida tra pagine con slide + fade, header/footer persistenti
- **Prefetch viewport** — precaricamento pagine per navigazione istantanea
- Cookie banner informativo (solo cookie tecnici, GDPR)
- SEO: JSON-LD LocalBusiness, Open Graph, sitemap, canonical URLs
- **Security headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Cloudflare** — WAF, Bot Fight Mode, AI bot blocking, hotlink protection, email obfuscation, HSTS preload
- **Chi siamo** — storia familiare, timeline compatta, sezione in ricordo di Manuela
- **Accessibilita WCAG 2.1 AA** — focus trap (lightbox, chatbot), aria-live, reduced-motion, contrasto colori, target size 44px
- **Immagini ottimizzate** — WebP, lazy loading, sizes responsive, fetchpriority LCP
- **Pagine errore** — 404 e 500 custom con design coerente
- **Maintenance mode** — middleware + env var `MAINTENANCE_MODE`, pagina 503 con contatti

## Punteggi Lighthouse (v0.4)

| Pagina     | Performance | Accessibilita | Best Practices | SEO |
| ---------- | ----------- | ------------- | -------------- | --- |
| Homepage   | 99          | 96            | 100            | 100 |
| Servizi    | 99          | 96            | 100            | 100 |
| Contatti   | 99          | 97            | 100            | 100 |
| Chi siamo  | 98          | 96            | 100            | 100 |
| Preventivo | 100         | 96            | 100            | 100 |
| Galleria   | 81          | 96            | 100            | 100 |

## Test Suite (v0.4)

- **Unit test**: 94 test, 9 file (Vitest)
- **E2E test**: 142 test, 10 file (Playwright — chromium + mobile iPhone 13)
- **Astro check**: 0 errori, 0 warning
- **Lighthouse CI**: tutte le 5 pagine sopra soglia

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

# Lighthouse CI
npm run lighthouse
```

## CI/CD

Il progetto include una pipeline GitHub Actions (`.github/workflows/ci.yml`) che esegue automaticamente su push e PR:

1. **Lint** — ESLint (TypeScript + Astro)
2. **Format check** — Prettier
3. **Type check** — `astro check`
4. **Unit test** — Vitest (94 test, 9 file)
5. **Build** — build di produzione
6. **Lighthouse CI** — performance >= 0.85, accessibility >= 0.9, SEO >= 0.9 (5 pagine)

I pre-commit hooks (Husky + lint-staged) eseguono lint e format automaticamente ad ogni commit.

## Struttura progetto

```
MonferrinaProject/
├── .github/workflows/       # CI pipeline (GitHub Actions)
├── .husky/                  # Pre-commit hooks
├── docs/
│   ├── plans/               # Design doc, architettura, guide
│   └── screenshots/         # Screenshot pagine (dark/light mode)
├── scripts/                 # Script build-time (logo, Google Places data, image optimization)
├── src/
│   ├── components/          # 18 componenti Astro (mappa, chatbot, lightbox, carousel, filtri, meteo)
│   ├── data/                # Dati statici (chatbot-flow, reviews, orari, servizi)
│   ├── layouts/             # Layout base con dark mode + Client Router + View Transitions
│   ├── lib/                 # Logica condivisa (sanity, chatbot-engine, validazione, sanitize)
│   ├── pages/               # 11 pagine + API routes (include 404, 500, maintenance)
│   │   └── api/             # Edge functions (form preventivo con rate limiting)
│   └── styles/              # Design system (token colori, font, dark mode, view transitions)
├── public/
│   ├── fonts/               # Font self-hosted (DM Serif Display, DM Sans)
│   ├── images/
│   │   ├── gallery/         # 24 immagini WebP ottimizzate
│   │   └── google-photos/   # Foto Google Places scaricate localmente
│   └── ...                  # Logo SVG, favicon, og-image
├── tests/
│   ├── unit/                # 9 file, 94 test (Vitest)
│   └── e2e/                 # 10 file, 142 test (Playwright — chromium + mobile)
├── astro.config.mjs         # SSG + SSR, prefetch viewport, trailing slash
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

## Cloudflare

Dominio `vetreriamonferrina.com` registrato e gestito su Cloudflare (piano Free).

| Configurazione                                      | Stato                        |
| --------------------------------------------------- | ---------------------------- |
| DNS CNAME → `cname.vercel-dns.com`                  | Proxied                      |
| SSL/TLS Full (Strict)                               | Attivo                       |
| HSTS 12 mesi + preload + includeSubDomains          | Attivo                       |
| TLS 1.2 minimo + TLS 1.3                            | Attivo                       |
| WAF + Bot Fight Mode + AI Bot Blocking              | Attivo                       |
| Page Shield + Leaked Credentials                    | Attivo                       |
| Email Obfuscation + Hotlink Protection              | Attivo                       |
| Cache asset statici `/_astro/`, `.webp`, `.woff2`   | 1 year                       |
| HTTP/2 + HTTP/3 + 0-RTT + Early Hints + Speed Brain | Attivo                       |
| Redirect www → root (301)                           | Attivo                       |
| AI Crawl managed robots.txt                         | Attivo                       |
| Web Analytics (RUM, zero cookie)                    | Attivo                       |
| Rocket Loader                                       | OFF (interferisce con Astro) |

## Documentazione

- **Design document**: `docs/plans/2026-02-27-vetreria-monferrina-design.md`
- **Piano implementazione**: `docs/plans/2026-02-27-implementation-plan.md`
- **Guida recensioni Google**: `docs/plans/google-reviews-setup.md`
- **Architettura (draw.io)**: `docs/plans/architecture.drawio`
- **Stato lavori**: `docs/TODO-prossima-sessione.md`
