# Vetreria Monferrina — TODO Prossima Sessione

> Branch: `feat/initial-build`
> Ultimo commit verificato: tutti i 94 unit test e 142 E2E passano
> Modifiche non committate: fix chatbot (style is:global, scrollToBottom, tooltip, opzioni con bordi), cookie banner, Makefile, .nvmrc

## 0. Commit lavoro in sospeso
- Committare tutte le modifiche della sessione corrente (chatbot, cookie banner, Makefile, Dockerfile, docker-compose.yml, .nvmrc)
- Verificare che i test passino dopo il commit

## 1. Test visuale tutte le pagine (Playwright)
- Homepage `/` — verificare hero, servizi, stats, CTA
- Chi siamo `/chi-siamo` — timeline, valori, placeholder foto
- Servizi `/servizi` — categorie, card, link a preventivo
- Galleria `/galleria` — filtri, lightbox, navigazione frecce
- Contatti `/contatti` — mappa OpenStreetMap, orari, tel/email/CTA
- Preventivo `/preventivo` — form completo, validazione, honeypot
- Privacy `/privacy` e Cookie `/cookie` — contenuto GDPR
- **Mobile viewport** (375px, 390px, 768px) — ogni pagina deve essere ultra-light e leggibile

## 2. Foto e dati reali
- Sostituire le immagini placeholder con foto reali della vetreria
- Verificare/aggiornare dati: indirizzo, telefono, email, P.IVA, ragione sociale
- Aggiungere foto per la galleria (categorie: installazioni, vetri, lavorazioni)

## 3. Sentry
- Installare `@sentry/astro`
- Configurare DSN in variabili d'ambiente
- Error tracking client-side e server-side
- Source maps

## 4. Sanity CMS
- Verificare connessione con project ID `7bqabdpn`
- Popolare i contenuti iniziali nello studio
- Testare `fetchWithFallback` con dati reali
- Growth Plan: attivare quando si va live

## 5. CI/CD GitHub Actions (ultra strette)
- Lint (ESLint + Prettier)
- Type check (`astro check`)
- Unit test (Vitest)
- E2E test (Playwright con Chromium)
- Build di produzione
- Lighthouse CI (performance, a11y, SEO)
- Pre-commit hooks (husky + lint-staged)

## 6. Mobile testing approfondito
- Tutti gli schermi: iPhone SE, iPhone 15, Pixel 7, iPad, Samsung Galaxy Fold
- Chatbot fullscreen su mobile
- Navigazione hamburger menu
- Form preventivo usabilità touch
- Performance: Core Web Vitals sotto soglia

## 7. Cloudflare
- DNS corretto verso Vercel
- SSL/TLS mode Full (Strict)
- Cloudflare Web Analytics (zero cookie, GDPR compliant)
- Cache rules
- Proxy ON/OFF per Vercel

## 8. Vercel (ultimo)
- Deploy da branch `main`
- Environment variables (RESEND_API_KEY, SANITY_PROJECT_ID, ecc.)
- Vercel Analytics
- Security headers (già in vercel.json)
- Custom domain `vetreriamonferrina.com`
- Preview deployments per PR

## Note tecniche
- Node v24.12.0 (via nvm, v14 rimossa)
- Docker per dev (`make start`) e test (`make test`)
- Astro `<style>` scoped non si applica a elementi creati da JS — usare `is:global`
- ViewTransitions richiedono `astro:page-load` per re-inizializzare gli script
- Tailwind CSS 4: `space-y-*` non affidabile con elementi JS-injected, usare `flex` + `gap` in CSS
