# Vetreria Monferrina, sito web

[![CI](https://github.com/Monferrina/vetreriamonferrina.com/actions/workflows/ci.yml/badge.svg)](https://github.com/Monferrina/vetreriamonferrina.com/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://vetreriamonferrina.com)
[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)](/LICENSE)

[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)

[![Cloudflare](https://img.shields.io/badge/Cloudflare-DNS%20%7C%20WAF-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com)
[![Checkly](https://img.shields.io/badge/Checkly-monitoring-3A52EE)](https://www.checklyhq.com)
[![Vitest](https://img.shields.io/badge/Vitest-unit-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![CodeQL](https://img.shields.io/badge/CodeQL-security-2088FF?logo=github&logoColor=white)](https://codeql.github.com)

---

Sito ufficiale della Vetreria Monferrina di Fioravanti Giuseppe, Casale Monferrato (AL).

Sito vetrina con galleria lavori, blog, 17 pagine servizio, FAQ e recensioni da Google Places.

**[vetreriamonferrina.com](https://vetreriamonferrina.com)**

## Stack

| Categoria      | Tecnologia                                              |
| -------------- | ------------------------------------------------------- |
| Framework      | Astro 7 (prerender con SSR ibrido)                      |
| Stile          | Tailwind CSS 4                                          |
| Hosting        | Vercel (serverless)                                     |
| CDN, DNS, WAF  | Cloudflare con proxy attivo e Worker `maintenance-mode` |
| Monitoring     | Checkly, monitoring-as-code su uptime e worker          |
| Mappa          | Google Maps Embed API                                   |
| Recensioni     | Google Places API (New), dati scaricati a build-time    |
| Test           | Vitest per gli unit, Playwright per gli end-to-end      |
| CI             | GitHub Actions                                          |
| Qualità codice | ESLint, Prettier, Husky, lint-staged                    |

## Requisiti

Node.js 22 (vedi `.nvmrc`) e npm, che arriva con Node.

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

In locale si parte da `.env.example` copiato in `.env.local`. Su Vercel le scrive la sync di Doppler: si cambiano in Doppler, non nelle impostazioni di Vercel.

| Variabile               | Descrizione                                                                                                       | Dove ottenerla                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `GOOGLE_PLACES_API_KEY` | Chiave Places API, solo per lo script delle recensioni; mai nel browser né in Doppler `prd`                       | Google Cloud Console          |
| `GOOGLE_MAPS_EMBED_KEY` | Chiave della mappa di `/contatti`, pubblica: solo Maps Embed API, limitata al referrer del sito; in Doppler `prd` | Google Cloud Console          |
| `GOOGLE_PLACE_ID`       | Place ID della vetreria, solo per lo script                                                                       | Place ID Finder o Google Maps |

Le due variabili Google servono solo per rigenerare recensioni e orari, non a runtime:

```bash
GOOGLE_PLACES_API_KEY=xxx GOOGLE_PLACE_ID=yyy node scripts/fetch-place-data.mjs
```

I dati vengono scaricati e committati come JSON statico.

## Comandi principali

```bash
npm run dev          # Dev server (http://localhost:4321)
npm run build        # Build di produzione
npm test             # Unit test (Vitest)
npm run test:e2e     # Test end-to-end (Playwright)
npm run lint         # ESLint
npm run format:check # Prettier check
npm run check        # Type check (astro check)
```

## CI/CD

In `.github/workflows/` ci sono otto workflow. I passi comuni (Node 22 con cache npm e `npm ci`) stanno nella action composita `.github/actions/setup`.

| Workflow                    | Quando gira                                     | Blocca il merge |
| --------------------------- | ----------------------------------------------- | --------------- |
| `ci.yml`                    | push su `main`, PR verso `main`                 | sì              |
| `e2e.yml`                   | preview Vercel pronta (`deployment_status`)     | sì              |
| `worker-ci.yml`             | PR che toccano `cloudflare/maintenance-worker/` | no              |
| `checkly.yml`               | produzione pronta (`deployment_status`)         | no              |
| `update-reviews.yml`        | cron mensile e avvio manuale                    | no              |
| `dependabot-auto-merge.yml` | PR aperte da Dependabot                         | no              |
| `agenti.yml`                | PR aperta, o commento `@gemini-cli`             | no              |
| `zizmor.yml`                | push su `main`, PR verso `main`                 | sì (ruleset)    |

Il workflow `ci.yml` ha due job. Il job `quality` esegue in sequenza la verifica delle firme dei pacchetti (`npm audit signatures`), ESLint, Prettier in modalità check, `astro check`, Vitest con coverage, la build di produzione e il controllo dei link interni (`npm run check:links`). Il job `dependency-review`, solo sulle PR, blocca le dipendenze vulnerabili che la PR introduce, transitive comprese. Il workflow `e2e.yml` parte quando Vercel ha pronta la preview della PR ed esegue i test Playwright su quella preview, nel container ufficiale di Playwright che ha già Chromium e WebKit.

Il workflow `agenti.yml` fa rivedere la PR a due agenti Gemini (`gemini-3.5-flash-lite`, a pagamento con credito prepagato e tetto mensile): `revisione` (correttezza e qualità) e `sicurezza` (solo problemi di sicurezza). Ognuno pubblica un riassunto e commenti sulle righe cambiate, mai approvazioni né commit. Partono all'apertura di una PR del repo (non da fork, non da Dependabot, non in bozza) o quando un collaboratore scrive un commento che inizia con `@gemini-cli`. Gemini CLI è installata da npm a versione e impronta fisse, senza `--yolo`: il modello legge la PR solo via GitHub, ha tre strumenti autorizzati per nome, non ha la shell e non vede i segreti; i vincoli li fissa `tests/unit/agenti-workflow.test.ts`.

La sicurezza la controllano gli strumenti, dalle loro app GitHub: CodeQL (impostazione automatica di GitHub) e Semgrep (`semgrep-cloud-platform/scan`). I segreti li controllano secret scanning e push protection di GitHub; le dipendenze già presenti le corregge Dependabot.

La supply chain ha quattro controlli. zizmor (`zizmor.yml`) legge workflow, action composita e `dependabot.yml` e cerca action non fissate, permessi larghi, iniezioni, action con vulnerabilità note e commit impostori; i risultati vanno in code scanning e il merge lo blocca la regola di code scanning del ruleset, da medio in su. `npm audit signatures` gira nel job `quality`. Dependency Review mostra il punteggio OpenSSF Scorecard delle dipendenze nuove, con un avviso sotto 3 (default dell'action). In CI `npm audit signatures` gira dopo `npm ci`: lo script d'installazione di un pacchetto falsificato girerebbe prima del controllo, nel job senza segreti e con permessi di sola lettura, e il merge resta bloccato. `allowScripts` in `package.json` elenca i soli pacchetti a cui npm permette script d'installazione (oggi `esbuild`); vale con npm 11 o successivo, cioè nel build su Vercel, non in CI e in locale con Node 22 (npm 10).

Il workflow `dependabot-auto-merge.yml` attiva l'auto-merge (squash) sulle PR Dependabot minor e patch: GitHub le mergia quando tutti i check obbligatori sono verdi. Le major restano a mano. Dependabot propone una versione nuova solo dopo sette giorni dalla pubblicazione (`cooldown`); gli aggiornamenti di sicurezza non aspettano.

I pre-commit hook (Husky con lint-staged) eseguono lint e format a ogni commit.

Vercel deploya in automatico: ogni push su `main` va in produzione, ogni altro branch o PR ottiene un preview URL.

### Dal branch alla produzione

```
1. Crea un branch        →  git checkout -b fix/qualcosa
2. Fai le modifiche      →  edit, commit
3. Pusha                 →  git push -u origin fix/qualcosa
4. Vercel fa preview     →  URL temporaneo per verificare le modifiche
5. Apri PR su main       →  check obbligatori (lint, test, build, E2E, CodeQL, Semgrep, dipendenze)
6. Mergia la PR          →  Vercel deploya su vetreriamonferrina.com
```

`main` è la produzione live ed è protetto: non ci si pusha direttamente.

## Struttura progetto

```
├── __checks__/              # Monitor Checkly (URL, Worker)
├── .github/workflows/       # CI pipeline
├── cloudflare/              # Worker (maintenance mode), deploy via Git
├── docs/                    # Documentazione tecnica (mappa dati, guide)
├── scripts/                 # Script Node (Google Places, check link interni)
├── src/
│   ├── components/          # 17 componenti Astro
│   ├── data/                # Dati statici (chatbot, recensioni, orari, servizi, blog)
│   ├── layouts/             # Layout base (dark mode, CSP con hash, SEO)
│   ├── lib/                 # Logica condivisa (immagini, CSP, Sentry, chatbot)
│   ├── pages/               # Pagine
│   │   ├── blog/            # Blog (7 articoli)
│   │   └── servizi/         # Pagine servizio generate da [slug].astro
│   ├── styles/              # Design system CSS (token, dark mode, transizioni)
│   └── middleware.ts        # CSP sulle risposte on demand
├── public/
│   ├── fonts/               # Font self-hosted (Inter, DM Serif Display)
│   └── images/              # Immagini ottimizzate WebP
├── tests/
│   ├── unit/                # Unit test (Vitest)
│   └── e2e/                 # Test end-to-end (Playwright)
├── astro.config.mjs
├── checkly.config.ts
├── vercel.json              # Redirect, cache, security header (il CSP lo genera Astro)
└── package.json
```

## Pagine

| Route                    | Descrizione                                            | Rendering |
| ------------------------ | ------------------------------------------------------ | --------- |
| `/`                      | Homepage con hero, servizi, stats, recensioni, partner | SSG       |
| `/servizi`               | Catalogo servizi con filtri per categoria              | SSG       |
| `/servizi/[slug]`        | 17 pagine servizio                                     | SSG       |
| `/galleria`              | Galleria masonry con lightbox                          | SSG       |
| `/chi-siamo`             | Storia, team, timeline, sezione memoriale              | SSG       |
| `/contatti`              | Mappa Google, orari, contatti                          | SSG       |
| `/faq`                   | FAQ su 7 categorie, con Schema.org FAQPage             | SSG       |
| `/blog`                  | Blog, 7 articoli sempreverdi con indice                | SSG       |
| `/blog/[slug]`           | Articoli blog                                          | SSG       |
| `/trasporto-e-montaggio` | Servizio trasporto e montaggio                         | SSG       |
| `/privacy`               | Informativa privacy                                    | SSG       |
| `/cookie`                | Policy cookie                                          | SSG       |
| `/404`                   | Pagina errore 404                                      | On demand |
| `/500`                   | Pagina errore 500                                      | SSG       |
| `/maintenance`           | Pagina manutenzione 503                                | SSG       |

## SEO e dati strutturati

Il sito punta alla ricerca locale prima che a quella generica.

Ogni pagina espone dati strutturati JSON-LD `LocalBusiness`, e le pagine servizio con FAQ aggiungono `FAQPage`, che è ciò che le rende idonee ai rich snippet di Google. Ogni servizio ha intro, caratteristiche, materiali, una sezione "Quando scegliere" e le domande frequenti, con località e keyword scritte dentro il testo invece che appiccicate.

La sezione "Servizi correlati" usa abbinamenti scelti a mano e non il semplice raggruppamento per categoria, così i link interni danno contesto invece di rumore. Le meta description sono scritte pagina per pagina e includono "Casale Monferrato".

La sitemap è generata da `@astrojs/sitemap` e la pagina `/maintenance` ne è esclusa, oltre a essere in `noindex`. Il `robots.txt` è versionato nel repo, in `public/robots.txt`, e ha sostituito quello gestito da Cloudflare, disabilitato il 14/7/2026. Blocca per user-agent otto crawler di solo training o dataset (Bytespider, TikTokSpider, CCBot, Amazonbot, PetalBot, Timpibot, meta-externalagent, FacebookBot) e consente tutti gli altri, compresi GPTBot e Google-Extended. Per questi ultimi il no al training è solo la richiesta del Content-Signal (`search=yes, ai-input=yes, ai-train=no`), non un blocco.

## Infrastruttura

### Vercel

Il sito gira con l'adapter `@astrojs/vercel`. Le pagine sono pre-renderizzate, tranne la 404, renderizzata a richiesta perché abbia il CSP con gli hash. Il piano è Hobby, con il rischio sui termini d'uso accettato nell'ADR-0003. `/preventivo` risponde 301 verso `/contatti` (`vercel.json`). Le variabili d'ambiente arrivano da Doppler (sezione "Variabili d'ambiente").

### Cloudflare

Il dominio è su Cloudflare, piano Free, con proxy attivo.

| Configurazione | Dettaglio                                                                           |
| -------------- | ----------------------------------------------------------------------------------- |
| DNS            | A verso `76.76.21.21` e CNAME www verso `cname.vercel-dns.com`, entrambi proxied    |
| SSL/TLS        | Full (Strict)                                                                       |
| HSTS           | 1 anno (max-age 31536000), includeSubDomains, senza preload (dalla zona Cloudflare) |
| WAF            | Bot Fight Mode e AI Bot Blocking                                                    |
| Cache          | Asset statici 1 anno (`/_astro/`, `.webp`, `.woff2`)                                |
| Analytics      | Web Analytics (RUM, zero cookie)                                                    |
| Rocket Loader  | Disattivato, interferisce con Astro                                                 |
| Worker         | `maintenance-mode` con toggle da dashboard, deploy via Workers Builds               |

Il Worker in `cloudflare/maintenance-worker/` è collegato a GitHub: ogni push su `main` che tocca quella cartella fa build e deploy da solo. `keep_vars = true` nel `wrangler.toml` preserva le variabili impostate da dashboard, come `MAINTENANCE_ENABLED`, e i secret non vengono mai toccati.

### Vercel Authentication

Il progetto Vercel ha la Deployment Protection su **All Deployments** (gratuita su ogni piano dal 9/9/2026): ogni URL, alias `*.vercel.app` e dominio pubblico compresi, risponde con il login Vercel a chi arriva senza l'header `x-vercel-protection-bypass`. Lo manda il Worker su ogni richiesta verso l'origin. Gli E2E in CI non lo usano: entrano con un token OIDC di GitHub accettato da Trusted Sources, solo sulle Preview. Il valore è il "Protection Bypass for Automation" del progetto, nel Worker e in Doppler `playwright_preview`, una config che contiene solo lui e serve solo agli E2E in locale contro una preview (`doppler run --config playwright_preview -- npm run test:e2e`), e fino alla pulizia di ST7 anche in una variabile di Checkly: rigenerarlo su Vercel invalida le deployment già pubblicate, quindi si aggiorna il Worker e si ridistribuisce, altrimenti il sito pubblico risponde con il login. Senza questo strato chi conosce l'IP di Vercel serve il sito con `Host: vetreriamonferrina.com` saltando Cloudflare (misurato il 06/10/2026).

### Resend

Mandava le email del modulo preventivi, tolto il 12/10/2026 (ADR-0003). Account (`giuseppefioravanti@proton.me`) e record DNS restano finché non si chiudono:

| Record | Nome                | Valore                                                            |
| ------ | ------------------- | ----------------------------------------------------------------- |
| TXT    | `resend._domainkey` | Chiave DKIM Resend                                                |
| MX     | `send`              | `feedback-smtp.eu-west-1.amazonses.com` (priorità 10)             |
| TXT    | `send`              | `v=spf1 include:amazonses.com ~all`                               |
| TXT    | `_dmarc`            | `v=DMARC1; p=quarantine; rua=mailto:giuseppefioravanti@proton.me` |

### Checkly

Monitoring-as-code su una sola location (`eu-central-1`) per rientrare nel free tier:

Tutti nel gruppo **Sito vetreriamonferrina.com**, col nome che dice cosa controllano:

- **Sito: la home risponde**, URL monitor ogni 10 minuti, attende 200
- **Worker: inoltra al sito, manutenzione spenta**, header `x-worker` e `x-maintenance` ogni 6 ore
- **Worker: toglie gli header x-vercel-\* dei visitatori**, ogni 6 ore attende `x-worker-filtered: 1`

Tolti l'11/10/2026 perché doppioni: le sei pagine chiave e la sitemap (pagine statiche dello stesso deploy della home; una pagina rotta la fermano gli E2E sulla preview, la sitemap la controlla anche monferrinoAI) e il browser check della home (lo copre il primo check).

La configurazione sta in `checkly.config.ts` e `__checks__/`. In CI (`checkly.yml`) i check si deployano quando il deploy di produzione è pronto, non al merge, perché Checkly esegue subito un check nuovo; presuppongono la produzione e non girano sulle PR. Gli alert vanno sulla casella Proton, con integrazioni attive verso Vercel e GitHub.

## Aggiornare i dati Google

Recensioni e orari arrivano da Google Places API (New) e vengono salvati come JSON statico.

```bash
GOOGLE_PLACES_API_KEY=xxx GOOGLE_PLACE_ID=yyy node scripts/fetch-place-data.mjs
```

Lo script genera due soli file, `src/data/reviews.json` e `src/data/opening-hours.json`, e tiene solo le recensioni da 4 stelle in su. Il workflow `update-reviews.yml` lo esegue il primo del mese e apre una PR se i dati sono cambiati. La guida completa è in `docs/plans/google-reviews-setup.md`.

La chiave non va mai committata e va limitata a "Places API" e "Places API (New)" nella Google Cloud Console.

## Manutenzione

Per attivare la modalità manutenzione si va su [Cloudflare Dashboard](https://dash.cloudflare.com), Workers & Pages, `maintenance-mode`, poi Settings, Variables and Secrets, e si porta `MAINTENANCE_ENABLED` a `true`. L'effetto è immediato e non serve alcun deploy. Per disattivarla si rimette a `false`, stessa pagina.

Sotto c'è un [Cloudflare Worker](https://developers.cloudflare.com/workers/) che intercetta le richieste prima che arrivino a Vercel. Con la manutenzione attiva recupera la pagina `/maintenance` da Vercel e la serve con status 503; altrimenti fa da semplice passthrough. Il codice sta in `cloudflare/maintenance-worker/`.

## Documentazione tecnica

- `docs/mappa-dati.md`, dove passano e dove si fermano i dati del visitatore
- `docs/plans/google-reviews-setup.md`, guida a Google Places API
- `cloudflare/maintenance-worker/README.md`, modalità manutenzione

## Licenza

Progetto proprietario, Vetreria Monferrina di Fioravanti Giuseppe. Tutti i diritti riservati.

Sviluppato da [Marco Bellingeri](https://github.com/MK023).
