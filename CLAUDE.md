Flusso di lavoro, controlli prima della PR e merge stanno in `CONTRIBUTING.md`.

## Rami

Il ramo nasce da `main` di `Monferrina/vetreriamonferrina.com` e si pusha lì, anche quando il clone ha come `origin` un fork. Sulle PR aperte da un fork CodeQL non gira, e il ruleset `protect-main` lo richiede; anche l'anteprima Vercel fallisce ("Authorization required to deploy"). Misurato l'1/10/2026 sulle PR #338 (da fork) e #339 (dalla repo).

## Dati personali

Ai servizi esterni (modelli, agenti, scanner, issue, commenti nelle PR) va solo il codice pubblico della repo. I dati del form preventivi (elenco in `docs/mappa-dati.md`), i log che contengono IP e i segreti restano fuori.

## CSP

Il CSP non ha `'unsafe-inline'`: `script-src` e `style-src` li genera Astro (`security.csp`) con gli hash degli script e degli stili inline di ogni pagina; le altre direttive stanno in `src/lib/csp.ts`, lette anche dal middleware. Uno script o uno stile scritto a mano (`is:inline`, `define:vars`, `style=""`), o una chiamata a un dominio nuovo (`connect-src`, `img-src`, `frame-src`…), **non rompe la build**: il browser lo blocca e l'errore sta solo nella console. Ogni modifica che aggiunge script, stili o servizi esterni dichiara il dominio in `src/lib/csp.ts` (o passa da `Astro.csp.insertScriptHash`) e si verifica sulla preview con `tests/e2e/csp.spec.ts`, che gira su tutte le pagine della sitemap. Cloudflare non inietta script nelle pagine perché l'HTML esce con `Cache-Control: no-transform` (`vercel.json`): toglierlo riporta lo script inline del Bot Fight Mode, che il CSP blocca.

## HawkScan

HawkScan gira solo quando la modifica tocca server, API o header (`src/middleware.ts`, `src/pages/api/`, `vercel.json`). Quando la scansione punta alla produzione, `POST /api/send-quote` resta escluso: ogni richiesta manda una email vera tramite Resend.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, refresh the graph with the `/graphify . --update` skill. The bare `graphify update .` CLI re-extracts code with the AST only and drops the doc→code links and the curated community labels (measured 2026-09-10: 683 → 645 links).
