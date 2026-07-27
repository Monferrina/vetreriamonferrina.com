# Vetreria Monferrina, sito web

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Monferrina_vetreriamonferrina.com&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Monferrina_vetreriamonferrina.com)

[![CI](https://github.com/Monferrina/vetreriamonferrina.com/actions/workflows/ci.yml/badge.svg)](https://github.com/Monferrina/vetreriamonferrina.com/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://vetreriamonferrina.com)
[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)](/LICENSE)

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Sanity](https://img.shields.io/badge/Sanity-v6-F03E2F?logo=sanity&logoColor=white)](https://www.sanity.io)
[![Resend](https://img.shields.io/badge/Resend-email-000000?logo=resend&logoColor=white)](https://resend.com)
[![Upstash](https://img.shields.io/badge/Upstash-rate--limit-00E9A3?logo=upstash&logoColor=white)](https://upstash.com)

[![Cloudflare](https://img.shields.io/badge/Cloudflare-DNS%20%7C%20WAF-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com)
[![Checkly](https://img.shields.io/badge/Checkly-monitoring-3A52EE)](https://www.checklyhq.com)
[![Vitest](https://img.shields.io/badge/Vitest-unit-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![CodeQL](https://img.shields.io/badge/CodeQL-security-2088FF?logo=github&logoColor=white)](https://codeql.github.com)

---

Sito ufficiale della Vetreria Monferrina di Fioravanti Giuseppe, Casale Monferrato (AL).

Sito vetrina con form preventivi, galleria lavori, blog, 18 pagine servizio, FAQ e recensioni da Google Places.

**[vetreriamonferrina.com](https://vetreriamonferrina.com)**

## Stack

| Categoria       | Tecnologia                                                  |
| --------------- | ----------------------------------------------------------- |
| Framework       | Astro 7 (prerender con SSR ibrido)                          |
| Stile           | Tailwind CSS 4                                              |
| CMS             | Sanity v6                                                   |
| Email           | Resend (account Proton, TLS enforced)                       |
| Template email  | HTML con i colori del brand (`src/lib/email-templates/`)    |
| Rate-limit      | Upstash Redis su `/api/send-quote`, con fallback in memoria |
| Hosting         | Vercel (serverless)                                         |
| CDN, DNS, WAF   | Cloudflare con proxy attivo e Worker `maintenance-mode`     |
| Origin lockdown | `x-origin-verify` dal Worker al middleware: API solo via CF |
| Monitoring      | Checkly, monitoring-as-code su uptime, API, worker e pagine |
| Mappa           | Google Maps Embed API                                       |
| Meteo           | Open-Meteo, gratuito e senza API key                        |
| Recensioni      | Google Places API (New), dati scaricati a build-time        |
| Test            | Vitest per gli unit, Playwright per gli end-to-end          |
| CI              | GitHub Actions                                              |
| Qualità codice  | ESLint, Prettier, Husky, lint-staged, SonarCloud            |

## Requisiti

Node.js 22 o superiore (vedi `.nvmrc`) e npm 10 o superiore.

## Setup locale

```bash
# 1. Clona il repository
git clone <repo-url> && cd <repo-name>

# 2. Installa le dipendenze
npm install

# 3. Copia le variabili d'ambiente
cp .env.example .env.local

# 4. Compila le variabili in .env.local (vedi "Variabili d'ambiente")

# 5. Avvia il dev server
npm run dev
# → http://localhost:4321
```

## Variabili d'ambiente

In locale si parte da `.env.example` copiato in `.env.local`. Su Vercel si configurano in Settings, Environment Variables.

| Variabile           | Descrizione                               | Dove ottenerla                                     |
| ------------------- | ----------------------------------------- | -------------------------------------------------- |
| `RESEND_API_KEY`    | API key Resend per l'invio email          | [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Mittente, su dominio verificato su Resend | Es. `preventivi@vetreriamonferrina.com`            |
| `VETRERIA_EMAIL`    | Casella che riceve i preventivi           | `vetreriamonferrina@gmail.com`                     |
| `SANITY_PROJECT_ID` | ID progetto Sanity                        | [sanity.io/manage](https://sanity.io/manage)       |
| `SANITY_DATASET`    | Dataset Sanity                            | `production`                                       |
| `SITE_URL`          | URL del sito in produzione                | `https://vetreriamonferrina.com`                   |

La chiave Google Places serve solo per rigenerare recensioni e orari, non a runtime:

```bash
GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-place-data.mjs
```

I dati vengono scaricati una tantum e committati come JSON statico.

## Comandi principali

```bash
npm run dev          # Dev server (http://localhost:4321)
npm run build        # Build di produzione
npm run preview      # Anteprima build locale
npm test             # Unit test (Vitest)
npm run test:e2e     # Test end-to-end (Playwright)
npm run lint         # ESLint
npm run format:check # Prettier check
npm run check        # Type check (astro check)
```

## CI/CD

La pipeline in `.github/workflows/ci.yml` gira su ogni push e su ogni PR:

1. Security audit con `npm audit` sulle dipendenze di produzione
2. Lint con ESLint
3. Format check con Prettier
4. Type check con `astro check`
5. Test con Vitest e coverage (179 test)
6. Build di produzione
7. SonarCloud per qualità, sicurezza e coverage
8. Lighthouse CI con soglie: accessibility 0.95, best practices 0.95, SEO 0.9

Ci sono poi CodeQL per lo scanning di sicurezza, Checkly che valida i monitor sulle PR e li deploya al merge, e la CI del Worker che gira `wrangler deploy --dry-run` sul `maintenance-worker` solo quando cambia quella cartella.

I pre-commit hook (Husky con lint-staged) eseguono lint e format a ogni commit.

Vercel deploya in automatico: ogni push su `main` va in produzione, ogni altro branch o PR ottiene un preview URL.

### Dal branch alla produzione

```
1. Crea un branch        →  git checkout -b fix/qualcosa
2. Fai le modifiche      →  edit, commit
3. Pusha                 →  git push -u origin fix/qualcosa
4. Vercel fa preview     →  URL temporaneo per verificare le modifiche
5. Apri PR su main       →  CI gira (lint, test, build, Lighthouse)
6. Mergia la PR          →  Vercel deploya su vetreriamonferrina.com
```

`main` è la produzione live ed è protetto: non ci si pusha direttamente. Le variabili d'ambiente possono differire tra Production e Preview, si impostano in Vercel sotto Settings, Environment Variables.

## Struttura progetto

```
├── __checks__/              # Monitor Checkly (API, URL, browser)
├── .github/workflows/       # CI pipeline
├── cloudflare/              # Worker (maintenance mode + origin lockdown), deploy via Git
├── docs/plans/              # Guide tecniche (Google Reviews)
├── sanity/                  # Sanity CMS (schemi, config)
├── scripts/                 # Script build-time (Google Places, immagini, logo)
├── src/
│   ├── components/          # 19 componenti Astro
│   ├── data/                # Dati statici (chatbot, recensioni, orari, servizi, blog)
│   ├── layouts/             # Layout base (dark mode, View Transitions, SEO)
│   ├── lib/                 # Logica condivisa (Sanity, validazione, sanitize, rate limit, email)
│   ├── pages/               # Pagine e API routes
│   │   ├── api/             # Serverless function del form preventivo
│   │   ├── blog/            # Blog (8 articoli)
│   │   └── servizi/         # Pagine servizio generate da [slug].astro
│   ├── styles/              # Design system CSS (token, dark mode, transizioni)
│   └── middleware.ts        # Origin lockdown: valida x-origin-verify in produzione
├── public/
│   ├── fonts/               # Font self-hosted (Inter, DM Serif Display)
│   └── images/              # Immagini ottimizzate WebP
├── tests/
│   ├── unit/                # Unit test (Vitest, 179 test)
│   └── e2e/                 # Test end-to-end (Playwright)
├── astro.config.mjs
├── checkly.config.ts
├── vercel.json              # Security header (CSP, HSTS, e altri)
└── package.json
```

## Pagine

| Route                    | Descrizione                                            | Rendering |
| ------------------------ | ------------------------------------------------------ | --------- |
| `/`                      | Homepage con hero, servizi, stats, recensioni, partner | SSG       |
| `/servizi`               | Catalogo servizi con filtri per categoria              | SSG       |
| `/servizi/[slug]`        | 18 pagine servizio                                     | SSG       |
| `/galleria`              | Galleria masonry con lightbox                          | SSG       |
| `/chi-siamo`             | Storia, team, timeline, sezione memoriale              | SSG       |
| `/contatti`              | Mappa Google, orari, meteo, contatti                   | SSG       |
| `/preventivo`            | Form richiesta preventivo                              | SSG       |
| `/faq`                   | FAQ su 7 categorie, con Schema.org FAQPage             | SSG       |
| `/blog`                  | Blog, 8 articoli sempreverdi con indice                | SSG       |
| `/blog/[slug]`           | Articoli blog                                          | SSG       |
| `/trasporto-e-montaggio` | Servizio trasporto e montaggio                         | SSG       |
| `/privacy`               | Informativa privacy                                    | SSG       |
| `/cookie`                | Policy cookie                                          | SSG       |
| `/api/send-quote`        | Invio email preventivo, richiede descrizione e misure  | SSR       |
| `/404`                   | Pagina errore 404                                      | SSG       |
| `/500`                   | Pagina errore 500                                      | SSG       |
| `/maintenance`           | Pagina manutenzione 503                                | SSG       |

## SEO e dati strutturati

Il sito punta alla ricerca locale prima che a quella generica.

Ogni pagina espone dati strutturati JSON-LD `LocalBusiness`, e le pagine servizio con FAQ aggiungono `FAQPage`, che è ciò che le rende idonee ai rich snippet di Google. Ogni servizio ha intro, caratteristiche, materiali, una sezione "Quando scegliere" e le domande frequenti, con località e keyword scritte dentro il testo invece che appiccicate.

La sezione "Servizi correlati" usa abbinamenti scelti a mano e non il semplice raggruppamento per categoria, così i link interni danno contesto invece di rumore. Le meta description sono scritte pagina per pagina e includono "Casale Monferrato".

La sitemap è generata da `@astrojs/sitemap` e la pagina `/maintenance` ne è esclusa, oltre a essere in `noindex`. Il `robots.txt` è gestito da Cloudflare con i Content Signals: la ricerca è consentita, i crawler di training AI no.

## Infrastruttura

### Vercel

Il sito gira con l'adapter `@astrojs/vercel`. Le pagine sono pre-renderizzate, mentre `/api/send-quote` è una serverless function. Le variabili d'ambiente si configurano su Vercel per Production e Preview.

### Cloudflare

Il dominio è su Cloudflare, piano Free, con proxy attivo.

| Configurazione | Dettaglio                                                                               |
| -------------- | --------------------------------------------------------------------------------------- |
| DNS            | A verso `76.76.21.21` e CNAME www verso `cname.vercel-dns.com`, entrambi proxied        |
| SSL/TLS        | Full (Strict)                                                                           |
| HSTS           | 2 anni (max-age 63072000), includeSubDomains, preload                                   |
| WAF            | Bot Fight Mode e AI Bot Blocking                                                        |
| Cache          | Asset statici 1 anno (`/_astro/`, `.webp`, `.woff2`)                                    |
| Analytics      | Web Analytics (RUM, zero cookie)                                                        |
| Rocket Loader  | Disattivato, interferisce con Astro                                                     |
| Worker         | `maintenance-mode` con toggle da dashboard e origin lockdown, deploy via Workers Builds |

Il Worker in `cloudflare/maintenance-worker/` è collegato a GitHub: ogni push su `main` che tocca quella cartella fa build e deploy da solo. `keep_vars = true` nel `wrangler.toml` preserva le variabili impostate da dashboard, come `MAINTENANCE_ENABLED`, e i secret non vengono mai toccati.

### Origin lockdown

L'URL `*.vercel.app` è pubblico e bypasserebbe WAF e rate-limit di Cloudflare. Per chiuderlo sull'API preventivi, che è il rischio concreto fra spam ed escalation, c'è un handshake a segreto condiviso: il Worker timbra l'header `x-origin-verify` (da `ORIGIN_VERIFY_SECRET`) su ogni richiesta verso l'origin, e il middleware in `src/middleware.ts` risponde `403` in produzione a chi non ce l'ha.

Con le pagine a `prerender=true` il middleware gira solo sulle rotte SSR, che oggi è solo `/api/send-quote`. Se il segreto non è configurato il comportamento è fail-open, per non spegnere il form in caso di errore di configurazione.

Il segreto vive in tre posti con lo stesso valore: secret del Worker su Cloudflare, env di Vercel in Production, env di Checkly per il monitor dell'API. Chi colpisce `*.vercel.app/api/send-quote` direttamente riceve `403`.

### Resend

Gestisce l'invio email dal form preventivo, su account `giuseppefioravanti@proton.me`. Il dominio mittente è verificato con record DNS (MX, SPF, DKIM), il TLS è enforced e il tracking di click e aperture è disattivato. Le email usano i template HTML in `src/lib/email-templates/`.

| Record | Nome                | Valore                                                            |
| ------ | ------------------- | ----------------------------------------------------------------- |
| TXT    | `resend._domainkey` | Chiave DKIM Resend                                                |
| MX     | `send`              | `feedback-smtp.eu-west-1.amazonses.com` (priorità 10)             |
| TXT    | `send`              | `v=spf1 include:amazonses.com ~all`                               |
| TXT    | `_dmarc`            | `v=DMARC1; p=quarantine; rua=mailto:giuseppefioravanti@proton.me` |

### Checkly

Monitoring-as-code su una sola location (`eu-central-1`) per rientrare nel free tier:

- Homepage uptime, URL monitor ogni 10 minuti, attende 200
- Send Quote API, POST in `dryRun` ogni 30 minuti che non invia email, e passa `x-origin-verify` per superare l'origin lockdown
- Cloudflare Worker attivo, verifica gli header `x-worker` e `x-maintenance` ogni 6 ore
- Pagine chiave e sitemap, status 200 ogni 6 ore
- Homepage browser, Playwright su titolo e rendering, una volta al giorno

La configurazione sta in `checkly.config.ts` e `__checks__/`, il deploy avviene in CI al merge su `main`. Gli alert vanno sulla casella Proton, con integrazioni attive verso Vercel e GitHub.

### Sanity

CMS headless per i contenuti che cambiano senza deploy: foto di famiglia, orari, testi della pagina Chi Siamo. Lo studio è in `sanity/` e in produzione sta su [vetreriamonferrina.sanity.studio](https://vetreriamonferrina.sanity.studio/).

```bash
# Dev locale (opzionale)
cd sanity && npm install && npm run dev
# → http://localhost:3333
```

Il deploy dello studio è manuale, quindi un merge su `main` non lo tocca.

## Aggiornare i dati Google

Recensioni, orari e foto arrivano da Google Places API e vengono salvati come JSON statico.

```bash
GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-place-data.mjs
```

Lo script genera `src/data/reviews.json`, `src/data/opening-hours.json` e le foto in `public/images/google-photos/`. La guida completa è in `docs/plans/google-reviews-setup.md`.

La chiave non va mai committata e va limitata a "Places API" e "Places API (New)" nella Google Cloud Console.

## Manutenzione

Per attivare la modalità manutenzione si va su [Cloudflare Dashboard](https://dash.cloudflare.com), Workers & Pages, `maintenance-mode`, poi Settings, Variables and Secrets, e si porta `MAINTENANCE_ENABLED` a `true`. L'effetto è immediato e non serve alcun deploy. Per disattivarla si rimette a `false`, stessa pagina.

Sotto c'è un [Cloudflare Worker](https://developers.cloudflare.com/workers/) che intercetta le richieste prima che arrivino a Vercel. Con la manutenzione attiva recupera la pagina `/maintenance` da Vercel e la serve con status 503; altrimenti fa da semplice passthrough. Il codice sta in `cloudflare/maintenance-worker/`.

## Documentazione tecnica

- `docs/plans/google-reviews-setup.md`, guida a Google Places API
- `docs/plans/architecture.drawio`, diagramma architettura per draw.io

## Licenza

Progetto proprietario, Vetreria Monferrina di Fioravanti Giuseppe. Tutti i diritti riservati.

Sviluppato da [Marco Bellingeri](https://github.com/MK023).
