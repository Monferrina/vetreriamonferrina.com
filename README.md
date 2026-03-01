# Vetreria Monferrina

Sito web della Vetreria Monferrina di Fioravanti Giuseppe — Casale Monferrato (AL).

## Tech Stack

- **Astro 5** (SSG + SSR ibrido) + **Tailwind CSS 4**
- **Sanity v3** (CMS headless)
- **Resend** (email transazionali)
- **Vercel** (hosting + serverless)
- **Google Places API** (recensioni a build-time)
- **Leaflet.js** (mappa interattiva contatti)

## Funzionalità

- Homepage con hero, servizi in evidenza, stats, recensioni Google, CTA
- Pagine servizi e galleria con **filtri a pill buttons** coerenti (categorie: Installazioni, Vetri, Lavorazioni)
- Galleria con **lightbox** e navigazione tastiera
- **Mappa interattiva Leaflet** con marker SVG rosso a spillo e popup indirizzo
- Chatbot a flusso (JSON statico, zero API)
- Form preventivo con validazione client + server + honeypot
- **Dark mode automatica** (orario notturno + preferenza di sistema) con design token CSS
- Cookie banner informativo (solo cookie tecnici, GDPR)
- SEO: JSON-LD, Open Graph, sitemap, canonical URLs
- View Transitions per navigazione fluida

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

## Test

```bash
# Unit test
npm test

# E2E test
npm run test:e2e
```

## Struttura progetto

```
MonferrinaProject/
├── docs/
│   ├── plans/                # Design doc, architettura, guide
│   └── screenshots/          # Screenshot pagine (dark/light mode)
├── scripts/                  # Script build-time (logo, recensioni)
├── src/
│   ├── components/           # Componenti Astro (mappa Leaflet, lightbox, filtri)
│   ├── data/                 # Dati statici (chatbot-flow, reviews, servizi)
│   ├── layouts/              # Layout base con dark mode
│   ├── lib/                  # Logica condivisa (sanity, chatbot, validazione)
│   ├── pages/                # Pagine + API routes
│   │   └── api/              # Edge functions (form preventivo)
│   └── styles/               # Design system (token colori, font, dark mode)
├── public/                   # Asset statici (font, immagini, favicon)
├── astro.config.mjs
└── package.json
```

## Aggiornare le recensioni Google

```bash
GOOGLE_PLACES_API_KEY=xxx GOOGLE_PLACE_ID=yyy node scripts/fetch-reviews.mjs
```

Vedi `docs/plans/google-reviews-setup.md` per la guida completa.

## Documentazione

- **Design document**: `docs/plans/2026-02-27-vetreria-monferrina-design.md`
- **Piano implementazione**: `docs/plans/2026-02-27-implementation-plan.md`
- **Guida recensioni Google**: `docs/plans/google-reviews-setup.md`
- **Architettura (draw.io)**: `docs/plans/architecture.drawio`
- **Stato lavori**: `docs/TODO-prossima-sessione.md`
