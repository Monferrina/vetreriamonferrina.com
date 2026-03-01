# Vetreria Monferrina — Stato Lavori

> Branch: `feat/initial-build`
> Ultimo aggiornamento: 2026-03-01

## Completato

- [x] Scaffold progetto Astro 5 + Tailwind CSS 4 + Docker
- [x] Tutte le pagine: Home, Chi siamo, Servizi, Galleria, Preventivo, Contatti, Privacy, Cookie
- [x] Form preventivo con validazione client + server + honeypot + rate limiting
- [x] Chatbot a flusso (JSON statico, sessione persistente, animazioni)
- [x] SEO: JSON-LD LocalBusiness, Open Graph, sitemap, canonical URLs, meta tags
- [x] Accessibilità: aria-labels, focus management, prefers-reduced-motion
- [x] View Transitions (navigazione fluida tra pagine)
- [x] Logo aziendale SVG (potrace da raster originale) + favicon SVG/PNG
- [x] Cookie banner informativo (solo cookie tecnici, GDPR)
- [x] Footer con dati legali, social (Facebook + Instagram), navigazione
- [x] Docker per dev e test (unit + E2E)
- [x] **Dark mode automatica** — orario notturno (20-7) + `prefers-color-scheme`
- [x] **Sezione recensioni Google** — build-time, validazione schema, stelle, filtro >= 4 stelle
- [x] **Script fetch-place-data.mjs** — Google Places API (New), singola chiamata per recensioni + orari + foto
- [x] **Recensioni Google reali** — 3 recensioni >= 4 stelle, rating 4.4/5, Place ID `ChIJcx_Q1ESwh0cRqv3FdLTrU1w`
- [x] **Orari apertura da Google** — fallback chain: Sanity → Google JSON → statico
- [x] **10 foto Google scaricate localmente** — `public/images/google-photos/`, no API key nei file
- [x] **Widget meteo Open-Meteo** — gratis, no API key, consigli intelligenti sul vetro
- [x] **Sicurezza API key** — chiavi limitate a Places API, place-photos.json gitignored, zero key nel codice
- [x] Code review completa homepage (zero dead code, zero hardcoded, best practice)
- [x] **Accenti italiani corretti** — è, né, modalità, dopodiché, Portabilità (privacy, cookie, contatti)
- [x] **Hero section preventivo** — coerente con tutte le altre pagine
- [x] **Filtri servizi/galleria coerenti** — pill buttons identici, filtro in-place, pulsante "Tutti", dark mode
- [x] **Nomi categorie allineati** — Installazioni, Vetri, Lavorazioni (tra servizi e galleria)
- [x] **Lightbox galleria** — clone immagini reali con DOM sicuro (no innerHTML)
- [x] **Mappa Leaflet interattiva** — marker SVG rosso a spillo, popup indirizzo, coordinate esatte (Plus Code 5C3X+PW)
- [x] **CSS classes design-token aware** — gallery-filter-active/inactive per dark mode
- [x] **Screenshot tutte le pagine** — dark mode e light mode in `docs/screenshots/`
- [x] **Chatbot orari corretti** — aggiornati da Google (Lun-Ven 08:00-12:00/13:30-17:30, Sab 08:00-12:00)
- [x] **Chatbot rendering multilinea** — split su `\n` per paragrafi separati nel bubble
- [x] **Sanity Studio verificato** — funzionante su localhost:3334, 4 schemi, dati non ancora popolati

## Da fare — Prossimi step

### 1. Ambienti Dev/Staging e Production
- Configurare Vercel con due ambienti (preview + production)
- Variabili d'ambiente separate per dev e prod
- Branch `main` → production, branch/PR → preview automatico

### 2. Soglie Google Cloud — FATTO (parziale)
- [x] Alert SMS + email impostati per Places API e Places API (New)
- [ ] ~~Quote (soglie richieste/giorno)~~ — non disponibili per Places API nella console GCP
- **Protezioni attive**: chiavi limitate a 2 sole API, alert attivi, key solo server-side
- **Se serve blocco duro**: disabilitare le API dalla console o impostare budget cap in Fatturazione
- Dopo 90 giorni i $300 credito scadono, ma i $200/mese Maps Platform restano gratis per sempre

### 3. Firebase App Check (futuro, quando si usa Google Maps JS)
- Protezione chiamate API lato client con reCAPTCHA
- Gratis fino a 10.000 richieste/mese
- Non serve ora (API key usata solo server-side a build-time)
- Docs: https://developers.google.com/maps/documentation/javascript/places-app-check

### 4. Foto e dati reali
- Usare le 10 foto Google scaricate nella galleria (`public/images/google-photos/`)
- Aggiungere foto proprie per la galleria (laboratorio, lavori, team)
- Verificare tutti i dati aziendali (indirizzo, P.IVA, telefono)

### 5. CI/CD GitHub Actions
- Lint + type check + unit test + E2E + build
- Lighthouse CI (performance, a11y, SEO)
- Pre-commit hooks (husky + lint-staged)
- Workflow automatico aggiornamento recensioni (cron giornaliero)

### 6. Sentry
- Installare `@sentry/astro`
- Configurare DSN in variabili d'ambiente
- Error tracking client-side e server-side + source maps

### 7. Sanity CMS — Studio verificato, da popolare
- [x] Studio funzionante (`cd sanity && npx sanity dev --port 3334`)
- [x] Project ID `7bqabdpn`, dataset `production`, CORS localhost:3333 attivo
- [ ] Popolare Impostazioni Sito (dati aziendali — gia' corretti nei fallback)
- [ ] Popolare servizi con foto reali
- [ ] Popolare galleria con foto reali
- [ ] Testare `fetchWithFallback` con dati reali dal CMS
- [ ] Deploy studio su `vetreriamonferrina.sanity.studio` (quando pronto)

### 8. Mobile testing approfondito
- iPhone SE, iPhone 15, Pixel 7, iPad, Samsung Galaxy Fold
- Chatbot fullscreen su mobile
- Form preventivo usabilità touch
- Core Web Vitals sotto soglia

### 9. Cloudflare
- DNS verso Vercel
- SSL/TLS Full (Strict)
- Cloudflare Web Analytics (zero cookie, GDPR compliant)
- Cache rules

### 10. Vercel deploy (ultimo)
- Deploy da branch `main`
- Environment variables (RESEND_API_KEY, SANITY_PROJECT_ID, GOOGLE_PLACES_API_KEY)
- Custom domain `vetreriamonferrina.com`
- Preview deployments per PR

## Note tecniche

- Node v24.12.0 (via nvm)
- Dark mode: CSS custom properties in `[data-theme="dark"]`, script inline anti-FOUC
- Token `--color-surface` per superfici (sostituisce `bg-white`)
- Recensioni: validazione schema a build-time, troncamento 500 char, max 50 recensioni
- ViewTransitions: usare `astro:after-swap` per re-inizializzare script (filtri, mappa, lightbox, meteo)
- Tailwind CSS 4: `space-y-*` non affidabile con elementi JS-injected, usare `flex` + `gap`
- Mappa: Leaflet.js caricato dinamicamente, scrollWheelZoom disabilitato, marker SVG inline
- Filtri: CSS classes `.gallery-filter-active`/`.gallery-filter-inactive` leggono design token per dark mode
- Google Places API (New): singola chiamata per reviews + hours + photos, key in `GOOGLE_PLACES_API_KEY`
- Open-Meteo: API meteo gratis, no API key, coordinate Casale Monferrato (45.1334, 8.4525)
- Orari contatti: fallback chain Sanity → `opening-hours.json` (Google) → valori statici
- Foto Google: scaricate localmente in `public/images/google-photos/`, `place-photos.json` gitignored
- Sicurezza: API key MAI nel frontend, solo variabili d'ambiente, impostare quote GCP (50 req/day + budget $5/mese)
- Sanity Studio: `cd sanity && npx sanity dev --port 3334`, richiede `npm install` nella cartella sanity
- Chatbot: messaggi con `\n` vengono renderizzati come paragrafi separati (split su newline + ". ")
