# Architettura del sito

Come è fatto il sito e perché. I diagrammi seguono il [modello C4](https://c4model.com/) (contesto, container, deploy), le sezioni il minimo che [arc42](https://faq.arc42.org/questions/B-4/) chiede per un sistema piccolo. I dettagli di configurazione stanno nel [README](../README.md); qui ci sono i rimandi.

## 1. Obiettivi di qualità

Ogni obiettivo è uno scenario: cosa succede e chi se ne accorge.

| Obiettivo                     | Scenario                                                                                                                                                                                                                                                                                                                                                                      | Cosa lo fa rispettare                                                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sicurezza                     | Una modifica aggiunge uno script inline senza hash: il browser lo blocca, e il test della CSP sulla preview fallisce prima del merge. Chi chiama Vercel direttamente, saltando Cloudflare, riceve il login.                                                                                                                                                                   | CSP senza `'unsafe-inline'` ([`CLAUDE.md`](../CLAUDE.md), sezione CSP), `tests/e2e/csp.spec.ts`, Vercel Authentication ([README](../README.md#vercel-authentication)) |
| Dati minimi                   | Il visitatore non inserisce dati: non ci sono moduli né API, e l'unica pagina generata a richiesta è la 404. Ai fornitori arrivano solo i dati tecnici elencati nella mappa dei dati (IP a rete e hosting, errori a Sentry senza IP); la mappa di Google si carica solo dopo un clic.                                                                                         | [`docs/mappa-dati.md`](mappa-dati.md), con i comandi per ricontrollarla (sezione 5)                                                                                   |
| Disponibilità e controllo     | Il sito o il Worker smettono di rispondere: il controllo della home, ogni 10 minuti, passa da tutti e due e avvisa il manutentore. La manutenzione resta accesa per sbaglio, o il Worker smette di togliere gli header `x-vercel-*` dei visitatori: lo trovano i controlli sugli header, ogni 6 ore. Una manutenzione si accende dalla dashboard di Cloudflare, senza deploy. | Monitor Checkly ([README](../README.md#checkly)), [README del Worker](../cloudflare/maintenance-worker/README.md)                                                     |
| Spesa minima                  | Hosting, rete e monitoraggio stanno nei piani gratuiti; l'unica spesa è il credito prepagato degli agenti Gemini che rivedono le PR, con un tetto mensile. I rischi dei piani gratuiti sono scritti e accettati.                                                                                                                                                              | Vercel Hobby, Cloudflare Free, Checkly su una sola location; rischi in [ADR-0003](adr/0003-via-modulo-e-meteo-resta-su-vercel.md)                                     |
| Gestibile da una persona sola | Una dipendenza ha una vulnerabilità: Dependabot apre la PR, e le minor e patch si fondono da sole quando i check sono verdi. Nessuno pusha su `main`: ogni modifica passa da una PR con i check obbligatori.                                                                                                                                                                  | Ruleset `protect-main`, [CONTRIBUTING](../CONTRIBUTING.md), workflow in [README](../README.md#cicd)                                                                   |

## 2. Contesto

Chi usa il sito e con quali sistemi parla. Il diagramma non nomina le tecnologie del sito. Il manutentore è chi sviluppa e gestisce il sito.

```mermaid
flowchart LR
  visitatore(["Visitatore<br/>[persona]"])
  titolare(["Titolare della vetreria<br/>[persona]"])
  manutentore(["Manutentore del sito<br/>[persona]"])
  sito["Sito vetreriamonferrina.com<br/>[sistema]<br/>Pagine su servizi, lavori, blog, recensioni e contatti"]
  google["Google<br/>[sistema esterno]<br/>Scheda della vetreria e mappa"]
  sentry["Sentry<br/>[sistema esterno]<br/>Raccolta degli errori"]
  checkly["Checkly<br/>[sistema esterno]<br/>Monitoraggio"]
  monferrinoai["monferrinoAI<br/>[altro sistema della vetreria]<br/>Agente SEO"]

  visitatore -->|"legge le pagine"| sito
  visitatore -.->|"telefona, scrive su WhatsApp o per email, fuori dal sito"| titolare
  visitatore -->|"apre la mappa, dopo un clic su /contatti"| google
  sito -->|"prende recensioni e orari della scheda, ogni mese con una PR"| google
  sito -->|"manda gli errori del browser"| sentry
  checkly -->|"controlla che il sito risponda"| sito
  checkly -->|"avvisa se un controllo fallisce"| manutentore
  monferrinoai -->|"legge le pagine pubbliche e controlla SEO e sitemap"| sito
  titolare -.->|"chiede modifiche ai contenuti"| manutentore
  manutentore -->|"cambia contenuti e codice con una PR"| sito

  classDef esterno stroke-dasharray: 5 5
  class google,sentry,checkly,monferrinoai esterno
```

Legenda: forma arrotondata = persona; rettangolo continuo = il sistema descritto; rettangolo tratteggiato = sistema esterno, o altro sistema fuori da questo; freccia continua = passa dal sito o da un sistema; freccia tratteggiata = tra persone, fuori dal sito.

Il titolare non usa il sito per lavorare: i clienti lo contattano con telefono, WhatsApp ed email, che il sito mostra ([`src/data/contatti.ts`](../src/data/contatti.ts)). monferrinoAI è un sistema separato, con una sua repo nell'organizzazione GitHub `Monferrina`.

## 3. Container

Le parti del sito che girano.

```mermaid
flowchart LR
  visitatore(["Visitatore<br/>[persona]"])
  manutentore(["Manutentore del sito<br/>[persona]"])

  subgraph sito["Sito vetreriamonferrina.com"]
    worker["Worker maintenance-mode<br/>[Cloudflare Worker, TypeScript]<br/>Inoltra le richieste o serve la pagina di manutenzione"]
    web["Sito web<br/>[Astro su Vercel]<br/>Pagine statiche, 404 generata a richiesta, script nel browser"]
    recensioni["Aggiornamento recensioni<br/>[GitHub Actions, Node]<br/>Ogni mese, script fetch-place-data.mjs"]
  end

  places["Google Places API<br/>[sistema esterno]"]
  maps["Google Maps Embed<br/>[sistema esterno]"]
  sentry["Sentry<br/>[sistema esterno]"]

  visitatore -->|"chiede le pagine, HTTPS"| worker
  worker -->|"inoltra con il bypass di Vercel, a manutenzione spenta"| web
  worker -->|"prende /maintenance e la serve con stato 503, a manutenzione accesa"| web
  web -->|"incorpora la mappa in un iframe, dopo un clic"| maps
  web -->|"manda gli errori dal browser"| sentry
  recensioni -->|"chiede recensioni e orari"| places
  recensioni -->|"apre una PR se i dati sono cambiati"| manutentore
  manutentore -->|"fonde le PR: ogni merge rifà il build con i dati nuovi"| web

  classDef esterno stroke-dasharray: 5 5
  class places,maps,sentry esterno
```

Legenda: come nel contesto; il riquadro contiene i container del sito.

Recensioni e orari sono file JSON nella repo (`src/data/reviews.json`, `src/data/opening-hours.json`) che il build legge: non c'è un database ([`docs/mappa-dati.md`](mappa-dati.md)). La 404 è una funzione di Vercel dello stesso build, renderizzata a richiesta perché abbia la CSP con gli hash. Gli script nel browser sono il tema, il chatbot (un flusso fisso in `src/data/chatbot-flow.json`, senza servizi esterni) e Sentry.

## 4. Deploy

Due ambienti. In produzione le richieste passano da Cloudflare e dal Worker, la preview no ([ADR-0003](adr/0003-via-modulo-e-meteo-resta-su-vercel.md), punto 6, che conferma l'ADR-0002 su questo).

### Produzione

```mermaid
flowchart TB
  browser(["Browser del visitatore"])

  subgraph cf["Cloudflare, piano Free"]
    dns["DNS, TLS e WAF<br/>[zona vetreriamonferrina.com]"]
    worker["Worker maintenance-mode"]
  end

  subgraph vercel["Vercel, piano Hobby"]
    prod["Deployment di produzione<br/>[pagine statiche e funzione 404]<br/>con Vercel Authentication"]
  end

  subgraph gh["GitHub"]
    main["Ramo main"]
  end

  doppler["Doppler, config prd"]
  checkly["Checkly, eu-central-1"]

  browser -->|"HTTPS sul dominio pubblico"| dns
  dns -->|"passa ogni richiesta al Worker"| worker
  worker -->|"inoltra con l'header x-vercel-protection-bypass"| prod
  main -->|"ogni push fa il build di produzione"| prod
  main -->|"Workers Builds fa il deploy se cambia cloudflare/maintenance-worker/"| worker
  doppler -->|"sincronizza le variabili d'ambiente di Production"| prod
  checkly -->|"chiede la home ogni 10 minuti e controlla il Worker ogni 6 ore"| dns
```

Legenda: un riquadro raggruppa le parti che stanno presso lo stesso fornitore; un rettangolo fuori dai riquadri è un servizio esterno usato da solo; forma arrotondata = persona o browser.

La configurazione di zona (DNS, TLS, WAF, cache) è nella tabella del [README](../README.md#cloudflare). Chi raggiunge Vercel senza passare dal Worker riceve il login di Vercel ([README](../README.md#vercel-authentication)). I segreti del Worker sono fuori dalla sincronizzazione di Doppler ([README del Worker](../cloudflare/maintenance-worker/README.md)).

### Preview

```mermaid
flowchart TB
  subgraph gh["GitHub"]
    pr["Ramo con PR"]
    actions["GitHub Actions<br/>E2E Playwright e ZAP"]
  end

  subgraph vercel["Vercel, piano Hobby"]
    preview["Deployment di preview<br/>[URL *.vercel.app]<br/>con Vercel Authentication, senza variabili d'ambiente"]
  end

  manutentore(["Manutentore del sito"])

  pr -->|"ogni push fa un build di preview"| preview
  preview -->|"a deploy pronto, avvia i workflow"| actions
  actions -->|"provano le pagine con il token OIDC di GitHub"| preview
  manutentore -->|"apre la preview dopo il login a Vercel"| preview
```

Legenda: come in produzione.

La preview non ha Cloudflare né il Worker davanti: prova il frontend, mentre il Worker si prova con i suoi test unitari (`tests/unit/maintenance-worker.test.ts`, nella CI di ogni PR) e, dopo il merge, in produzione con Checkly. E2E e ZAP entrano con il token OIDC accettato dai Trusted Sources di Vercel, solo sulle preview. Quali check bloccano il merge sta in [CONTRIBUTING](../CONTRIBUTING.md).

## 5. Decisioni e rischi

Le decisioni stanno nel [registro degli ADR](adr/README.md). I rischi accettati, come i termini d'uso del piano Hobby di Vercel, sono nell'[ADR-0003](adr/0003-via-modulo-e-meteo-resta-su-vercel.md).
