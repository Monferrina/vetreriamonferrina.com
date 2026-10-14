Flusso di lavoro, controlli prima della PR e merge stanno in `CONTRIBUTING.md`.

## Rami

Il ramo nasce da `main` di `Monferrina/vetreriamonferrina.com` e si pusha lì, anche quando il clone ha come `origin` un fork. Sulle PR aperte da un fork CodeQL non gira, e il ruleset `protect-main` lo richiede; anche l'anteprima Vercel fallisce ("Authorization required to deploy"). Misurato l'1/10/2026 sulle PR #338 (da fork) e #339 (dalla repo).

## Dati personali

Ai servizi esterni (modelli, agenti, scanner, issue, commenti nelle PR) va solo il codice pubblico della repo. I log che contengono IP e i segreti restano fuori (elenco dei dati in `docs/mappa-dati.md`).

## CSP

Il CSP non ha `'unsafe-inline'`: `script-src` e `style-src` li genera Astro (`security.csp`) con gli hash degli script e degli stili inline di ogni pagina; le altre direttive stanno in `src/lib/csp.ts`, lette anche dal middleware. Uno script o uno stile scritto a mano (`is:inline`, `define:vars`, `style=""`), o una chiamata a un dominio nuovo (`connect-src`, `img-src`, `frame-src`…), **non rompe la build**: il browser lo blocca e l'errore sta solo nella console. Ogni modifica che aggiunge script, stili o servizi esterni dichiara il dominio in `src/lib/csp.ts` (o passa da `Astro.csp.insertScriptHash`) e si verifica sulla preview con `tests/e2e/csp.spec.ts`, che gira su tutte le pagine della sitemap. Un dominio che serve a una pagina sola si dichiara nel frontmatter di quella pagina con `Astro.csp.insertScriptResource` e `insertDirective`: `insertScriptResource` toglie il `'self'` di default di Astro, che va rimesso a mano (misurato l'08/10/2026 sull'header statico in `.vercel/output/config.json`). Le pagine non hanno `Cross-Origin-Embedder-Policy` (tolta il 14/10/2026, scelta di Marco; il motivo è in `.zap/rules.tsv`, regola 90004): un COEP diverso tra due pagine fa ricaricare tutto al browser nel passaggio, e una pagina con COEP blocca l'iframe di Google Maps su `/contatti`. Prima di rimetterlo su una pagina sola, misurare il cambio pagina. Cloudflare non inietta script nelle pagine perché l'HTML esce con `Cache-Control: no-transform` (`vercel.json`): toglierlo riporta lo script inline del Bot Fight Mode, che il CSP blocca.

## Segreti

Le variabili di Vercel arrivano da Doppler con la sync ufficiale: config `prd` → Production; Preview non ha variabili (dalla #414 la preview non legge segreti, e l'ambiente `stg` che la riempiva non c'è più). Su Vercel sono di tipo Secret, illeggibili: il valore in uso esiste solo in Doppler, ed è lì che si cambia. Una modifica fatta a mano su Vercel resta finché lo stesso nome non cambia in Doppler, e nessuno la segnala.

Il quarto ambiente Doppler, il massimo del piano gratuito (misurato: "Your project has reached its limit of 4 environments"), è `playwright_preview`: contiene solo il bypass di Vercel per gli E2E in locale, così gli altri `doppler run` non lo hanno nell'ambiente.

Un cambio in `prd` va in onda al deploy di produzione successivo, qualunque lo inneschi (anche un merge di Dependabot giorni dopo). Dopo ogni cambio: redeploy di produzione subito.

Il Worker Cloudflare ha i suoi segreti, fuori dalla sync (`cloudflare/maintenance-worker/README.md`).

Una sync si stacca lasciando le variabili su Vercel. L'opzione "Delete all secrets in Vercel" cancella tutte le variabili, comprese quelle che il build di produzione legge (`SENTRY_AUTH_TOKEN`, `GOOGLE_MAPS_EMBED_KEY`). Cancellare un nome in Doppler lo cancella anche dove la sync lo scrive (Vercel, secret di GitHub). (Comportamenti misurati su un progetto di prova il 07/10/2026 e su questo progetto il 12/10/2026: la doc Doppler non li descrive.)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, refresh the graph with the `/graphify . --update` skill. The bare `graphify update .` CLI re-extracts code with the AST only and drops the doc→code links and the curated community labels (measured 2026-09-10: 683 → 645 links).

## Agent skills

### Issue tracker

Le issue vivono su GitHub Issues di `Monferrina/vetreriamonferrina.com` (`gh`, default già impostato). See `docs/agents/issue-tracker.md`.

### Triage labels

Le cinque label canoniche con il loro nome (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: ADR in `docs/adr/` (indice in `docs/adr/README.md`). `GLOSSARY.md` in radice non esiste ancora: si scrive con Marco (skill `domain-modeling`). See `docs/agents/domain.md`.
