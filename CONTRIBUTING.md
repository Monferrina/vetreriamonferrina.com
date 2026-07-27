# Contributing

Questo repository è pubblico ma il progetto è proprietario: il sito è quello di una singola attività e non accetta contributi esterni generici. Le indicazioni che seguono valgono per chi lavora al codice, cioè il titolare e gli sviluppatori incaricati. Segnalazioni di bug e proposte restano benvenute tramite issue.

Prima di aprire una PR vale la pena leggere il [README](README.md) per lo stack e il [Codice di Condotta](CODE_OF_CONDUCT.md) per il tono delle interazioni.

## Requisiti

Node.js 22 (versione fissata in `.nvmrc`) e npm. Il setup locale è quello del README:

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Flusso di lavoro

Il branch `main` è la produzione live ed è protetto dal ruleset `protect-main`. Non si pusha direttamente: ogni modifica passa da una Pull Request. Il ruleset impone storia lineare, merge esclusivamente in modalità squash, e blocca sia il force push sia la cancellazione del branch. La policy dei check è strict, quindi il branch deve essere aggiornato con `main` al momento del merge: le PR si mergiano una alla volta.

1. Crea un branch da `main`, con nome nella forma `tipo/descrizione` (per esempio `fix/form-validation`).
2. Fai le modifiche.
3. Esegui in locale i controlli della tabella qui sotto, nell'ordine.
4. Committa. Il pre-commit hook esegue lint e format sui soli file in stage.
5. Pusha e apri la PR verso `main`, compilando il [template](.github/PULL_REQUEST_TEMPLATE.md) che GitHub precarica.
6. Attendi la CI verde e mergia in squash.

## Controlli prima della PR

La CI in `.github/workflows/ci.yml` esegue questi step nel job `Lint, Type Check & Test`, nello stesso ordine. Riprodurli in locale evita di scoprire un rosso a PR aperta.

| Comando locale                                 | Step corrispondente in `ci.yml` |
| ---------------------------------------------- | ------------------------------- |
| `npm audit --omit=dev --audit-level=high`      | Security audit                  |
| `npm --prefix sanity audit --audit-level=high` | Security audit (Sanity Studio)  |
| `npm run lint`                                 | Lint                            |
| `npm run format:check`                         | Format check                    |
| `npm run check`                                | Type check                      |
| `npm test` (in CI `npm run test:coverage`)     | Tests                           |
| `npm run build`                                | Build                           |
| `npm run check:links`                          | Check internal links            |

`npm run check:links` analizza l'output di build in `dist/client`, quindi va lanciato dopo `npm run build` o fallisce subito.

I test end-to-end girano in un job separato, `E2E (Playwright)`, sui progetti `chromium` e `mobile` (iPhone 13). In locale si eseguono con `npm run test:e2e`.

Vanno a parte anche Lighthouse CI (su ogni PR verso `main`), la validazione dei monitor Checkly (al merge, quando cambiano `__checks__/` o `checkly.config.ts`) e la CI del Worker (`wrangler deploy --dry-run`, solo sulle PR che toccano `cloudflare/maintenance-worker/`).

Verifica l'esito guardando il codice di uscita dei comandi, non filtrando l'output: un `grep` sui soli warning può nascondere un errore che poi blocca la CI.

## Check richiesti al merge

Il ruleset blocca il pulsante di merge finché non passano tre check:

| Check                      | Origine                      |
| -------------------------- | ---------------------------- |
| `Lint, Type Check & Test`  | job `quality` di `ci.yml`    |
| `SonarCloud Code Analysis` | analisi SonarCloud sulla PR  |
| `CodeQL`                   | scanning di sicurezza GitHub |

Il job E2E non è fra i check obbligatori, ma un suo fallimento va comunque risolto prima del merge.

## Convenzioni

I messaggi di commit seguono [Conventional Commits](https://www.conventionalcommits.org/) nella forma `tipo(scope): descrizione`, con la descrizione in italiano. I tipi in uso nella storia del repo sono `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `ci`, `harden`, oltre a `seo` e `content` per le modifiche ai contenuti. Non c'è un commitlint automatico: la convenzione è tenuta a mano.

I contenuti rivolti agli utenti sono in italiano. Nei commenti al codice convivono italiano e inglese; il criterio è spiegare il perché di una scelta, non ripetere cosa fa la riga sotto.

Una PR affronta una sola cosa, feature o fix. La descrizione dice cosa cambia e perché.

## Pre-commit hook

Husky esegue `lint-staged` a ogni commit. Su `*.ts` e `*.astro` passa `eslint --fix` e `prettier --write`; su `*.json`, `*.md` e `*.css` solo `prettier --write`. Lavorando sui soli file in stage non sostituisce i controlli della tabella sopra, che coprono l'intero repository.

## Segnalare bug

Apri una [issue](../../issues/new?template=bug_report.yml) usando il template dedicato. Servono descrizione del problema, passaggi per riprodurlo e comportamento atteso rispetto a quello osservato. Per le proposte c'è il template feature request.

## Sicurezza

Le vulnerabilità non vanno in una issue pubblica. Il canale corretto è descritto nella [Security Policy](SECURITY.md).
