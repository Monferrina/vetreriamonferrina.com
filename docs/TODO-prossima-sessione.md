# Vetreria Monferrina — Stato Lavori

> Branch: `feat/initial-build`
> Ultimo aggiornamento: 2026-03-03

## Completato

### v0.1 — Scaffold e pagine base

- [x] Scaffold progetto Astro 5 + Tailwind CSS 4 + Docker
- [x] Tutte le pagine: Home, Chi siamo, Servizi, Galleria, Preventivo, Contatti, Privacy, Cookie
- [x] Form preventivo con validazione client + server + honeypot + rate limiting (5/min/IP)
- [x] Chatbot a flusso (JSON statico, sessione persistente, animazioni)
- [x] SEO: JSON-LD LocalBusiness, Open Graph, sitemap, canonical URLs, meta tags
- [x] Accessibilita base: aria-labels, focus management, prefers-reduced-motion
- [x] Client Router (migrato da ViewTransitions deprecato)
- [x] Logo aziendale SVG (potrace da raster originale) + favicon SVG/PNG
- [x] Cookie banner informativo (solo cookie tecnici, GDPR)
- [x] Footer con dati legali, social (Facebook + Instagram), navigazione
- [x] Docker per dev e test (unit + E2E)
- [x] Dark mode automatica — orario notturno (20-7) + `prefers-color-scheme`
- [x] Sezione recensioni Google — build-time, validazione schema, stelle, filtro >= 4 stelle
- [x] Script `fetch-place-data.mjs` — Google Places API (New), singola chiamata
- [x] Recensioni Google reali — 3 recensioni >= 4 stelle, rating 4.4/5
- [x] Orari apertura da Google — fallback chain: Sanity -> Google JSON -> statico
- [x] 10 foto Google scaricate localmente in `public/images/google-photos/`
- [x] Widget meteo Open-Meteo — gratis, no API key, consigli intelligenti sul vetro
- [x] Sicurezza API key — chiavi limitate, place-photos.json gitignored, zero key nel codice
- [x] Mappa Leaflet interattiva — marker SVG rosso, popup indirizzo, coordinate Plus Code
- [x] Lightbox galleria — clone immagini con DOM sicuro (no innerHTML)
- [x] CSS classes design-token aware — gallery-filter-active/inactive per dark mode
- [x] Chatbot orari corretti da Google, rendering multilinea
- [x] Sanity Studio verificato — funzionante su localhost:3334, 4 schemi
- [x] Testi Chi Siamo riscritti — storia Giuseppe e Debora, tono personale
- [x] Sezione in ricordo di Manuela — sobria, a fine timeline

### v0.2 — Polish visuale e CI/CD (2026-03-02)

- [x] Galleria masonry con effetti blur-up e overlay gradient
- [x] Scroll animations (IntersectionObserver, reveal)
- [x] Glass effects e design system raffinato
- [x] Foto reali integrate con ottimizzazione WebP
- [x] Timeline chi siamo compattata — badge + testo, Manuela a fine timeline
- [x] Chatbot contestuale — saluto diverso per pagina
- [x] Chatbot sicurezza — validazione sessione, cap history 100, filtro nodi inesistenti
- [x] CSP headers aggiornati — unsafe-inline, unpkg.com, OpenStreetMap, Open-Meteo
- [x] ESLint configurato — flat config con typescript-eslint + eslint-plugin-astro
- [x] Prettier configurato — prettier-plugin-astro, tutti i file formattati
- [x] Husky + lint-staged — pre-commit hook automatico
- [x] GitHub Actions CI — lint -> format check -> type check -> unit test -> build
- [x] `astro check` a zero errori — corretti 28 errori di tipo
- [x] 94 test unitari verdi — 9 file test
- [x] Sezione partner (Saint-Gobain, AGC, Pilkington, Cilvea)
- [x] Screenshot tutte le pagine — dark mode e light mode

### v0.3 — Accessibilita, transizioni, ottimizzazione (2026-03-02)

- [x] **WCAG 2.1 AA** — focus trap lightbox e chatbot, aria-live regioni filtri e galleria
- [x] **Contrasto colori** — corretto su chi-siamo, galleria badge, cookie banner, pulsante preventivo
- [x] **Target size 44px** — cookie banner, pulsanti accessibili su touch
- [x] **Reduced-motion** — parallax hero disabilitato con `prefers-reduced-motion: reduce`
- [x] **Tabella orari semantica** — thead, th scope="col"/"row" in contatti
- [x] **Istruzioni screen reader** — lightbox (frecce + Escape), carousel pause
- [x] **Carousel fluidi** — loop senza scatto, JS misura scroll-width esatto, translate3d GPU
- [x] **Carousel pausa** — pulsante pause/play sul carousel laboratorio
- [x] **View Transitions** — slide + fade tra pagine, header/footer persistenti senza animazione
- [x] **Prefetch viewport** — precaricamento automatico pagine visibili
- [x] **Immagini galleria ottimizzate** — da 3.2 MB a 1.2 MB con sharp, quality 80
- [x] **Lazy loading intelligente** — primi 6 eager, resto lazy, fetchpriority="high" su LCP
- [x] **Sizes responsive** — attributo sizes per immagini galleria
- [x] **Email aggiornata** — vetreriamonferrina@gmail.com in contatti, footer, JSON-LD, chatbot, cookie, privacy
- [x] **Galleria 20 elementi** — cifra pari, rimossi pannello rose e vetro barca (poi espansa a 24 in v0.4)
- [x] **Hint Astro risolti** — `is:inline` su define:vars e JSON-LD (3 di 4, 1 falso positivo)
- [x] **Lighthouse CI** — configurazione LHCI per test performance/a11y/SEO
- [x] **trailingSlash: 'never'** — URL puliti senza slash finale

### v0.4 — Audit, gallery refresh, lightbox fix, E2E hardening (2026-03-03)

- [x] **Galleria 24 foto reali** — 6 installazioni, 9 vetri, 9 lavorazioni (era 20)
- [x] **Bug fix lightbox** — z-index da z-50 a z-[9990], pulsante chiudi bloccato da header backdrop-blur
- [x] **Header pointer-events** — `pointer-events: none` quando lightbox aperto, ripristinato alla chiusura
- [x] **Dark mode contrasto** — bordi neutral-200 da `#2a2d34` a `#3a3d46`, testo neutral-700 → neutral-800
- [x] **Dead code rimosso** — `ServiceCategory.astro`, import `_VALID_SERVICE_TYPES` inutilizzato
- [x] **Categorie servizi semplificate** — da 5 a 3 tipi (`installazioni | vetri | lavorazioni`)
- [x] **Immagini servizi** — aggiunte per blindati, stratificati, monolitici
- [x] **E2E test hardening** — auto-retrying assertions, timeout corretti, selettori Leaflet/cookie banner
- [x] **142 test E2E verdi** — 0 fallimenti, 2 skipped (chromium + mobile iPhone 13)
- [x] **Lighthouse CI verde** — tutte le 5 pagine sopra soglia in CI
- [x] **Consistenza visuale** — verificata su tutte le 8 pagine (dark + light mode)
- [x] **bg-white → bg-surface** — token corretto per ReviewsSection e StatsSection (dark mode)
- [x] **Gallery overlay** — badge categoria da `bg-white/90` a `bg-surface/90`

## Punteggi Lighthouse (v0.4)

| Pagina     | Perf | A11y | BP  | SEO |
| ---------- | ---- | ---- | --- | --- |
| Homepage   | 99   | 96   | 100 | 100 |
| Servizi    | 99   | 96   | 100 | 100 |
| Contatti   | 99   | 97   | 100 | 100 |
| Chi siamo  | 98   | 96   | 100 | 100 |
| Preventivo | 100  | 96   | 100 | 100 |
| Galleria   | 81   | 96   | 100 | 100 |

## Da fare — Prossimi step

### 1. Ambienti Dev/Staging e Production

- Configurare Vercel con due ambienti (preview + production)
- Variabili d'ambiente separate per dev e prod
- Branch `main` -> production, branch/PR -> preview automatico

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

### 4. Galleria performance (P:81)

- La galleria e il punto piu debole in performance (81)
- Possibili miglioramenti: ridurre ulteriormente peso immagini, above-the-fold ottimizzato, content-visibility
- Valutare se accettabile (soglia minima 90 per le altre pagine, galleria e un caso speciale con 20 immagini)

### 5. CI/CD — Completamenti futuri

- [x] ESLint + Prettier
- [x] Husky + lint-staged
- [x] GitHub Actions CI (lint, format, type check, test, build)
- [x] Lighthouse CI (configurato localmente)
- [x] Lighthouse CI nel workflow GitHub Actions (v0.4)
- [ ] Workflow automatico aggiornamento recensioni (cron giornaliero con GitHub Actions)
- [ ] E2E test nel CI (richiede Playwright browsers su GitHub Actions)

### 6. Sentry

- Installare `@sentry/astro`
- Configurare DSN in variabili d'ambiente
- Error tracking client-side e server-side + source maps

### 7. Sanity CMS — Studio verificato, da popolare

- [x] Studio funzionante (`cd sanity && npx sanity dev --port 3334`)
- [x] Project ID `7bqabdpn`, dataset `production`, CORS localhost:3333 attivo
- [ ] Popolare Impostazioni Sito (dati aziendali — gia corretti nei fallback)
- [ ] Popolare servizi con foto reali
- [ ] Popolare galleria con foto reali
- [ ] Testare `fetchWithFallback` con dati reali dal CMS
- [ ] Deploy studio su `vetreriamonferrina.sanity.studio` (quando pronto)

### 8. Mobile testing approfondito

- iPhone SE, iPhone 15, Pixel 7, iPad, Samsung Galaxy Fold
- Chatbot fullscreen su mobile
- Form preventivo usabilita touch
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
- ClientRouter (ex ViewTransitions): usare `astro:after-swap` per re-inizializzare script
- View Transitions: `::view-transition-old/new` per animazioni slide+fade, header/footer persistenti
- Prefetch: `prefetchAll: true`, `defaultStrategy: 'viewport'` per precaricamento automatico
- Tailwind CSS 4: `space-y-*` non affidabile con elementi JS-injected, usare `flex` + `gap`
- Mappa: Leaflet.js caricato dinamicamente, scrollWheelZoom disabilitato, marker SVG inline
- Filtri: CSS classes `.gallery-filter-active`/`.gallery-filter-inactive` per dark mode
- Google Places API (New): singola chiamata per reviews + hours + photos, key in env var
- Open-Meteo: API meteo gratis, no API key, coordinate Casale Monferrato (45.1334, 8.4525)
- Orari contatti: fallback chain Sanity -> `opening-hours.json` (Google) -> valori statici
- Foto Google: scaricate localmente in `public/images/google-photos/`, `place-photos.json` gitignored
- Sicurezza: API key MAI nel frontend, solo variabili d'ambiente, quote GCP consigliate
- Sanity Studio: `cd sanity && npx sanity dev --port 3334`, richiede `npm install` nella cartella sanity
- Chatbot: messaggi con `\n` renderizzati come paragrafi separati, saluto contestuale per pagina
- Chatbot sicurezza: history cap 100, filtro nodi inesistenti, validazione JSON sessione
- ESLint: flat config con `typescript-eslint` + `eslint-plugin-astro`, script Node con globals espliciti
- Prettier: `prettier-plugin-astro`, 100 char width, single quotes, trailing comma
- Husky: pre-commit esegue `lint-staged` (ESLint fix + Prettier write su file staged)
- CSP: `unsafe-inline` per Astro scripts, `unpkg.com` per Leaflet, `*.tile.openstreetmap.org`, `api.open-meteo.com`
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS (63M, preload)
- Carousel: JS misura `--scroll-width` e `--scroll-duration` per loop fluido, `translate3d` GPU-accelerated
- Immagini galleria: WebP quality 80, standard 800px, featured 1200px, sizes responsive, lazy/eager intelligente
- Email aziendale: vetreriamonferrina@gmail.com (aggiornata in contatti, footer, JSON-LD, chatbot, cookie, privacy)
- Lightbox: z-[9990] per evitare che backdrop-blur dell'header crei stacking context che blocca i click
- Header pointer-events: disabilitati quando lightbox aperto, ripristinati alla chiusura
- Dark mode neutral-200: `#3a3d46` (era `#2a2d34`) per bordi piu visibili
- Testo neutral-800 preferito a neutral-700 per miglior contrasto WCAG in dark mode
- Categorie servizi: semplificate a 3 (`installazioni | vetri | lavorazioni`) — rimossi `canaline` e `componenti`
- E2E: auto-retrying assertions Playwright (`toBeHidden`, `not.toHaveText`) per animazioni CSS/Web Animations API
- E2E cookie banner: `dispatchEvent('click')` per evitare intercettazione da Astro dev toolbar
