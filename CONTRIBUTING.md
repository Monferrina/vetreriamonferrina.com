# Contributing

Questo repository è pubblico ma il progetto è proprietario: il sito è quello di una singola attività e non accetta contributi esterni generici. Le indicazioni che seguono valgono per chi lavora al codice, cioè il titolare e gli sviluppatori incaricati. Segnalazioni di bug e proposte restano benvenute tramite issue.

Prima di aprire una PR vale la pena leggere il [README](README.md) per lo stack e il [Codice di Condotta](CODE_OF_CONDUCT.md) per il tono delle interazioni.

## Requisiti

Node.js 22 (versione fissata in `.nvmrc`) e npm. Il setup locale è quello del [README](README.md#setup-locale).

## Flusso di lavoro

Il branch `main` è la produzione live ed è protetto dal ruleset `protect-main`. Non si pusha direttamente: ogni modifica passa da una Pull Request. Il ruleset impone storia lineare, merge esclusivamente in modalità squash, e blocca sia il force push sia la cancellazione del branch. La policy dei check è strict, quindi il branch deve essere aggiornato con `main` al momento del merge: le PR si mergiano una alla volta.

1. Crea un branch da `main` del repository `Monferrina/vetreriamonferrina.com`, con un nome breve che dica cosa cambia (per esempio `worker-csp-origine`). Dalle PR aperte da un fork CodeQL non gira e la preview Vercel fallisce.
2. Fai le modifiche.
3. Esegui in locale i controlli della tabella qui sotto, nell'ordine.
4. Committa. Il pre-commit hook esegue lint e format sui soli file in stage.
5. Pusha e apri la PR verso `main`, compilando il [template](.github/PULL_REQUEST_TEMPLATE.md) che GitHub precarica.
6. Attendi la CI verde e mergia in squash.

## Controlli prima della PR

La CI in `.github/workflows/ci.yml` esegue questi step nel job `Lint, Type Check & Test`, nello stesso ordine. Riprodurli in locale evita di scoprire un rosso a PR aperta.

| Comando locale                             | Step corrispondente in `ci.yml` |
| ------------------------------------------ | ------------------------------- |
| `npm audit signatures`                     | Package signatures              |
| `npm run lint`                             | Lint                            |
| `npm run format:check`                     | Format check                    |
| `npm run check`                            | Type check                      |
| `npm test` (in CI `npm run test:coverage`) | Tests                           |
| `npm run build`                            | Build                           |
| `npm run check:links`                      | Check internal links            |

`npm run check:links` analizza l'output di build in `dist/client`, quindi va lanciato dopo `npm run build` o fallisce subito.

I test end-to-end girano nel workflow `e2e.yml`, job `E2E (Playwright)`, sulla preview Vercel della PR (build di produzione), sui progetti `chromium` e `mobile` (iPhone 13). Il job parte quando Vercel segnala la preview pronta; se il deploy fallisce il check è rosso, se non arriva resta in attesa. Il job gira nel container `mcr.microsoft.com/playwright` con la stessa versione di `@playwright/test`: quando Dependabot alza `@playwright/test` l'E2E della sua PR fallisce finché non si aggiornano tag e digest in `e2e.yml`. In locale si eseguono con `npm run test:e2e` sul dev server; con `BASE_URL` e `VERCEL_AUTOMATION_BYPASS_SECRET` su una preview.

La scansione ZAP (`zap.yml`) parte anche lei dalla preview pronta e lancia `.zap/scan.sh`. Gli header che aggiungono Cloudflare e il Worker la preview non li ha, e dalla CI il dominio pubblico risponde con la sfida del Bot Fight Mode. Per questo, prima di ogni modifica al bordo (header, regole Cloudflare, Worker) e dopo il suo merge, si scansiona il sito vero dalla propria macchina: `.zap/scan.sh https://vetreriamonferrina.com` (serve Docker; esce 0 senza rilievi, 2 con rilievi, 3 se non ha raggiunto il sito). Un rilievo accettato va in `.zap/rules.tsv` con il motivo in un commento. L'immagine di ZAP è fissata a digest in `.zap/scan.sh` e Dependabot non la aggiorna: si aggiorna a mano.

Vanno a parte i monitor Checkly (`checkly deploy` a ogni deploy di produzione pronto, non al push su `main`, perché Checkly esegue subito i check nuovi; i check presuppongono la produzione, non girano sulle PR e si verificano dopo il merge) e la CI del Worker (`wrangler deploy --dry-run`, solo sulle PR che toccano `cloudflare/maintenance-worker/`).

Verifica l'esito guardando il codice di uscita dei comandi, non filtrando l'output: un `grep` sui soli warning può nascondere un errore che poi blocca la CI.

## Check richiesti al merge

Il ruleset blocca il pulsante di merge finché non passano sei check:

| Check                         | Origine                                            |
| ----------------------------- | -------------------------------------------------- |
| `Lint, Type Check & Test`     | job `quality` di `ci.yml`                          |
| `E2E (Playwright)`            | job `e2e` di `e2e.yml`, sulla preview Vercel       |
| `CodeQL`                      | code scanning di GitHub (impostazione automatica)  |
| `semgrep-cloud-platform/scan` | app Semgrep                                        |
| `Dependency Review`           | job `dependency-review` di `ci.yml`, solo sulle PR |
| `ZAP (preview)`               | job `zap` di `zap.yml`, sulla preview Vercel       |

Ogni check è legato alla sua app nel ruleset: un job con lo stesso nome lanciato da un'altra app non lo soddisfa.

In più il ruleset ha una regola di code scanning per zizmor (`zizmor.yml`): il merge è bloccato se la PR porta rilievi di gravità media o alta (livelli SARIF `warning` ed `error`). I rilievi bassi restano visibili nella scheda Security e non bloccano.

## Convenzioni

Nel merge in squash il commit su `main` prende il titolo della PR, o quello del suo unico commit se la PR ne ha uno solo (impostazione della repo `COMMIT_OR_PR_TITLE`), con il numero della PR in fondo (`… (#429)`). Il titolo è in italiano e dice cosa cambia, non come (per esempio "Via Cross-Origin-Embedder-Policy da tutte le pagine"). Non si usa Conventional Commits: i commit di Dependabot lo seguono per conto loro (`chore(deps): …`).

I contenuti rivolti agli utenti sono in italiano. Nei commenti al codice convivono italiano e inglese; il criterio è spiegare il perché di una scelta, non ripetere cosa fa la riga sotto.

Una PR affronta una sola cosa, feature o fix. La descrizione dice cosa cambia e perché.

## Pre-commit hook

Husky esegue `lint-staged` a ogni commit. Su `*.ts` e `*.astro` passa `eslint --fix` e `prettier --write`; su `*.json`, `*.md` e `*.css` solo `prettier --write`. Lavorando sui soli file in stage non sostituisce i controlli della tabella sopra, che coprono l'intero repository.

## Segnalare bug

Apri una [issue](../../issues/new?template=bug_report.yml) usando il template dedicato. Servono descrizione del problema, passaggi per riprodurlo e comportamento atteso rispetto a quello osservato. Per le proposte c'è il template feature request.

## Sicurezza

Le vulnerabilità non vanno in una issue pubblica. Il canale corretto è descritto nella [Security Policy](SECURITY.md).
