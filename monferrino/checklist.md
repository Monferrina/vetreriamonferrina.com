# Monferrino — checklist mensile

Cosa controlla Monferrino a ogni giro. Output = **un solo digest** (in Notion) +
**al massimo una bozza** di contenuto. Tutto read-only o bozza, mai auto-pubblicare.
Il controllo continuo resta alle CI (questa è la passata strategica mensile).

## 1. Salute tecnica / SEO

- [ ] **Drift SEO**: confronto delle 6 pagine baseline (regressioni in title/meta/schema).
      Baseline DB: `~/.cache/claude-seo/drift/baselines.db`. Script claude-seo richiedono
      Python ≥3.10 (venv: `requests` + `beautifulsoup4` + `lxml`).
- [ ] **JSON-LD**: validazione structured data (LocalBusiness, Service, BlogPosting,
      BreadcrumbList, FAQ). Nessun errore di parsing.
- [ ] **Sitemap / robots / llms.txt**: presenti, coerenti, niente URL orfani o rotti.
- [ ] **Link interni**: ogni `related[]` dei blog e i related dei servizi risolvono a uno
      slug esistente. Nessun 404 interno.

## 2. Crescita contenuti

- [ ] Rivedere `content-backlog.json`: c'e un topic **forte** (volume reale + KD basso +
      domande reali)? Se si → proporre **una** bozza col workflow del `brief.md`.
      Se no → **non scrivere**. Qualita > cadenza.
- [ ] Flag **content decay**: articoli vecchi con dati/anni da aggiornare.

## 3. Concorrenza (Firecrawl)

- [ ] Scrape della **lista curata** di concorrenti (vedi sotto) → Monferrino legge snapshot
      precedente + nuovo e **riassume lui** i cambiamenti (niente macchina di diffing) →
      scrive in Notion. Solo pagine pubbliche, robots.txt/ToS rispettati.
- [ ] Usare come trova-buchi / ispirazione, **mai copiare**.

> **Cadenza decisa (24/6)**: **mensile**, lista curata **5-8 concorrenti veri**
> (i siti vetreria cambiano di rado; settimanale×tutti brucerebbe il free tier Firecrawl).
> Concorrente locale confermato: `vetrariacasalese.it`.
> `vetreria.piemonte.it` = aggregatore geo, **non** un concorrente di servizio → escluso.
> ⚙️ **DA FORNIRE da Giuseppe**: gli altri ~4-7 domini concorrenti da mettere in lista.

## 4. Sicurezza / manutenzione

- [ ] Digest **Dependabot** / alert security aperti (solo riepilogo, niente bump automatici
      rischiosi: i major accoppiati si fanno a mano — vedi migrazioni in hold).

## 5. Recensioni

- [ ] **Non duplicare** il workflow recensioni (gira in CI). Segnalare solo nel digest
      "nuove recensioni Google a cui rispondere".

## Dove vanno i log (deciso 24/6)

Due cose, due posti:

- **Log di esecuzione** (run ok/fallito, durata, stacktrace) → **GitHub Actions** (storico run,
  re-run, cancel; nativo e gratis, retention 90gg). È il cruscotto tecnico.
- **Log risultati / digest** (cambi concorrenti, esito check, idee-topic) → **database Notion**
  (una riga per run: data, esito sintetico, link a PR/Action). È la dashboard umana web+mobile.
- ❌ **Mai** log committati nel repo (pubblico → churn inutile). Git tiene solo il "cervello"
  (`brief.md` / `content-backlog.json` / `checklist.md`), non l'output dei run.

> ⚙️ **Prossimo step cablaggio** (dopo Astro 7): creare il DB Notion + mettere il **token
> integrazione Notion** nei GitHub Actions secrets (least privilege, sola scrittura sul DB).

## In pausa / non disponibile

- ❌ **Google Search Console**: gestita da Debora, nessun accesso → niente dati di ricerca
  Google (query/clic/posizioni). Sblocco solo se Debora aggiunge Giuseppe come utente
  sola-lettura. Per ora si procede senza.
