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
- [x] **Script fetch-reviews.mjs** — Google Places API, abbreviazione nomi GDPR
- [x] Code review completa homepage (zero dead code, zero hardcoded, best practice)
- [x] **Accenti italiani corretti** — è, né, modalità, dopodiché, Portabilità (privacy, cookie, contatti)
- [x] **Hero section preventivo** — coerente con tutte le altre pagine
- [x] **Filtri servizi/galleria coerenti** — pill buttons identici, filtro in-place, pulsante "Tutti", dark mode
- [x] **Nomi categorie allineati** — Installazioni, Vetri, Lavorazioni (tra servizi e galleria)
- [x] **Lightbox galleria** — clone immagini reali con DOM sicuro (no innerHTML)
- [x] **Mappa Leaflet interattiva** — marker SVG rosso a spillo, popup indirizzo, coordinate esatte (Plus Code 5C3X+PW)
- [x] **CSS classes design-token aware** — gallery-filter-active/inactive per dark mode
- [x] **Screenshot tutte le pagine** — dark mode e light mode in `docs/screenshots/`

## Da fare — Prossimi step

### 1. Ambienti Dev/Staging e Production
- Configurare Vercel con due ambienti (preview + production)
- Variabili d'ambiente separate per dev e prod
- Branch `main` → production, branch/PR → preview automatico

### 2. Collegare recensioni Google reali
- Creare progetto Google Cloud + abilitare Places API
- Trovare Place ID della Vetreria Monferrina
- Eseguire `scripts/fetch-reviews.mjs` con API key reale
- Vedi: `docs/plans/google-reviews-setup.md`

### 3. Foto e dati reali
- Sostituire immagini placeholder con foto reali (laboratorio, lavori, team)
- Aggiungere foto per la galleria (categorie: installazioni, vetri, lavorazioni)
- Verificare tutti i dati aziendali (indirizzo, P.IVA, telefono)

### 4. CI/CD GitHub Actions
- Lint + type check + unit test + E2E + build
- Lighthouse CI (performance, a11y, SEO)
- Pre-commit hooks (husky + lint-staged)
- Workflow automatico aggiornamento recensioni (cron giornaliero)

### 5. Sentry
- Installare `@sentry/astro`
- Configurare DSN in variabili d'ambiente
- Error tracking client-side e server-side + source maps

### 6. Sanity CMS
- Verificare connessione con project ID `7bqabdpn`
- Popolare contenuti iniziali nello studio
- Testare `fetchWithFallback` con dati reali

### 7. Mobile testing approfondito
- iPhone SE, iPhone 15, Pixel 7, iPad, Samsung Galaxy Fold
- Chatbot fullscreen su mobile
- Form preventivo usabilità touch
- Core Web Vitals sotto soglia

### 8. Cloudflare
- DNS verso Vercel
- SSL/TLS Full (Strict)
- Cloudflare Web Analytics (zero cookie, GDPR compliant)
- Cache rules

### 9. Vercel deploy (ultimo)
- Deploy da branch `main`
- Environment variables (RESEND_API_KEY, SANITY_PROJECT_ID, GOOGLE_PLACES_API_KEY)
- Custom domain `vetreriamonferrina.com`
- Preview deployments per PR

## Note tecniche

- Node v24.12.0 (via nvm)
- Dark mode: CSS custom properties in `[data-theme="dark"]`, script inline anti-FOUC
- Token `--color-surface` per superfici (sostituisce `bg-white`)
- Recensioni: validazione schema a build-time, troncamento 500 char, max 50 recensioni
- ViewTransitions: usare `astro:after-swap` per re-inizializzare script (filtri, mappa, lightbox)
- Tailwind CSS 4: `space-y-*` non affidabile con elementi JS-injected, usare `flex` + `gap`
- Mappa: Leaflet.js caricato dinamicamente, scrollWheelZoom disabilitato, marker SVG inline
- Filtri: CSS classes `.gallery-filter-active`/`.gallery-filter-inactive` leggono design token per dark mode
