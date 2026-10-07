Flusso di lavoro, controlli prima della PR e merge stanno in `CONTRIBUTING.md`.

## Rami

Il ramo nasce da `main` di `Monferrina/vetreriamonferrina.com` e si pusha lì, anche quando il clone ha come `origin` un fork. Sulle PR aperte da un fork CodeQL non gira, e il ruleset `protect-main` lo richiede; anche l'anteprima Vercel fallisce ("Authorization required to deploy"). Misurato l'1/10/2026 sulle PR #338 (da fork) e #339 (dalla repo).

## Dati personali

Ai servizi esterni (modelli, agenti, scanner, issue, commenti nelle PR) va solo il codice pubblico della repo. I dati del form preventivi (elenco in `docs/mappa-dati.md`), i log che contengono IP e i segreti restano fuori.

## CSP

Il CSP non ha `'unsafe-inline'`: `script-src` e `style-src` li genera Astro (`security.csp`) con gli hash degli script e degli stili inline di ogni pagina; le altre direttive stanno in `src/lib/csp.ts`, lette anche dal middleware. Uno script o uno stile scritto a mano (`is:inline`, `define:vars`, `style=""`), o una chiamata a un dominio nuovo (`connect-src`, `img-src`, `frame-src`…), **non rompe la build**: il browser lo blocca e l'errore sta solo nella console. Ogni modifica che aggiunge script, stili o servizi esterni dichiara il dominio in `src/lib/csp.ts` (o passa da `Astro.csp.insertScriptHash`) e si verifica sulla preview con `tests/e2e/csp.spec.ts`, che gira su tutte le pagine della sitemap. Cloudflare non inietta script nelle pagine perché l'HTML esce con `Cache-Control: no-transform` (`vercel.json`): toglierlo riporta lo script inline del Bot Fight Mode, che il CSP blocca.

## HawkScan

HawkScan gira solo quando la modifica tocca server, API o header (`src/middleware.ts`, `src/pages/api/`, `vercel.json`). Quando la scansione punta alla produzione, `POST /api/send-quote` resta escluso: ogni richiesta manda una email vera tramite Resend.

## Segreti

Le variabili di Vercel arrivano da Doppler con la sync ufficiale: config `prd` → Production, `stg` → Preview (`stg` contiene solo riferimenti `${prd.NOME}`). Su Vercel sono di tipo Secret, illeggibili: il valore in uso esiste solo in Doppler, ed è lì che si cambia. Una modifica fatta a mano su Vercel resta finché lo stesso nome non cambia in Doppler, e nessuno la segnala.

Un cambio in `prd` va in onda al deploy di produzione successivo, qualunque lo inneschi (anche un merge di Dependabot giorni dopo). Dopo ogni cambio: redeploy di produzione subito, poi un preventivo vero dal sito, con l'email arrivata a `VETRERIA_EMAIL`. Il check Checkly del form usa `dryRun` e non passa da Resend.

`ORIGIN_VERIFY_SECRET` vive anche nel Worker Cloudflare e in Checkly, dove la sync non arriva: si cambia nei tre posti nello stesso momento (tabella in `cloudflare/maintenance-worker/README.md`). Cambiato solo in Doppler, dopo il redeploy il sito rifiuta ogni richiesta che il Worker inoltra.

Una sync si stacca lasciando le variabili su Vercel. L'opzione "Delete all secrets in Vercel" cancella anche `ORIGIN_VERIFY_SECRET`, e il middleware in produzione rifiuta ogni richiesta al form. (Comportamenti misurati su un progetto di prova il 07/10/2026: la doc Doppler non li descrive.)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, refresh the graph with the `/graphify . --update` skill. The bare `graphify update .` CLI re-extracts code with the AST only and drops the doc→code links and the curated community labels (measured 2026-09-10: 683 → 645 links).
