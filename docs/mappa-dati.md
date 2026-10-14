# Mappa dei dati

Perimetro: tutto ciò che il sito raccoglie, trasporta o conserva. La privacy policy pubblica dice le stesse cose in linguaggio non tecnico, qui ci sono i riferimenti al codice che permettono di verificarle.

## 1. Nessun punto di raccolta

Dal 12/10/2026 il sito non ha moduli: il modulo preventivi e il widget meteo sono stati tolti (ADR-0003), e `/preventivo` risponde 301 verso `/contatti`. Il visitatore non inserisce dati sul sito; chi vuole un preventivo telefona, scrive su WhatsApp o manda un'email, fuori dal sito.

Le pagine sono statiche, tranne la 404, renderizzata a richiesta solo perché abbia il CSP con gli hash (`src/pages/404.astro`). Il sito non ha funzioni server che leggano o inoltrino dati del visitatore.

## 2. Chi tocca cosa, e per quanto

| Fornitore             | Cosa vede                                                                                                                                                                       | Dove                                                  | Per quanto                                                                         | Perché                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------- |
| Cloudflare            | IP, metadati di richiesta (anche il Worker `maintenance-mode`)                                                                                                                  | rete globale                                          | log di piattaforma, a breve termine                                                | DNS, TLS, WAF, manutenzione |
| Vercel                | IP, metadati di richiesta                                                                                                                                                       | region impostata sul progetto (dashboard)             | log di piattaforma                                                                 | hosting                     |
| Sentry                | rapporto tecnico d'errore e paese della connessione, senza IP                                                                                                                   | regione UE, Francoforte; SCC e DPF per i metadati USA | fino a 90 giorni (30 sul piano gratuito)                                           | trovare i malfunzionamenti  |
| Vercel Speed Insights | a ogni pagina caricata: URL, browser, sistema operativo, tipo di dispositivo, velocità di rete, paese, tempi di caricamento; senza IP, senza cookie né dati salvati nel browser | Vercel                                                | non indicato nella doc di Vercel; il cruscotto gratuito mostra gli ultimi 7 giorni | velocità delle pagine       |
| Google Maps (Embed)   | IP e metadati del browser, solo dopo il click "Visualizza la mappa" su `/contatti`                                                                                              | Google, privacy policy generale                       | secondo Google; la doc dell'Embed API non dice se l'iframe imposta cookie          | mappa interattiva           |

Non esiste un database applicativo.

## 3. Cosa non viene fatto

Nessun analytics che profila. Vercel Speed Insights misura solo prestazioni; le statistiche di visita sono quelle aggregate che Cloudflare calcola dal traffico del dominio, senza script nelle pagine. Vercel Web Analytics non è installato. Cloudflare Web Analytics non gira: il suo script lo inietterebbe Cloudflare, ma l'HTML esce con `Cache-Control: no-transform`, che lo impedisce (misurato il 14/10/2026: nessuno script nelle pagine).

Nessun dato di cliente verso l'agente SEO: quella pipeline ingerisce solo pagine web pubbliche.

Nessun addestramento di modelli sui dati raccolti, nessuna cessione o vendita a terzi.

## 4. Retention

| Dato                                    | Quanto resta                       | Come sparisce |
| --------------------------------------- | ---------------------------------- | ------------- |
| Log di piattaforma (Cloudflare, Vercel) | retention di default dei fornitori | automatica    |

## 5. Come ricontrollare che questa mappa sia ancora vera

```bash
# L'unica route dinamica è la 404: se l'elenco cresce, questa mappa va rifatta
grep -rln "prerender = false" src/pages/

# Nessuna funzione server: la cartella delle API non deve esistere
ls src/pages/api 2>/dev/null || echo "nessuna API"
```

## 6. Riferimenti

- Privacy policy pubblica: [`/privacy`](https://vetreriamonferrina.com/privacy)
- Decisione: `docs/adr/0003-via-modulo-e-meteo-resta-su-vercel.md`
