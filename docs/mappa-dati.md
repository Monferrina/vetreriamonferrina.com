# Mappa dei dati

Perimetro: tutto ciò che il sito raccoglie, trasporta o conserva. La privacy policy pubblica dice le stesse cose in linguaggio non tecnico, qui ci sono i riferimenti al codice che permettono di verificarle.

## 1. Nessun punto di raccolta

Dal 12/10/2026 il sito non ha moduli: il modulo preventivi e il widget meteo sono stati tolti (ADR-0003), e `/preventivo` risponde 301 verso `/contatti`. Il visitatore non inserisce dati sul sito; chi vuole un preventivo telefona, scrive su WhatsApp o manda un'email, fuori dal sito.

Le pagine sono statiche, tranne la 404, renderizzata a richiesta solo perché abbia il CSP con gli hash (`src/pages/404.astro`). Il sito non ha funzioni server che leggano o inoltrino dati del visitatore.

## 2. Chi tocca cosa, e per quanto

| Fornitore           | Cosa vede                                                                                                                                | Dove                                                                                  | Per quanto                                                                | Perché                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| Cloudflare          | IP, metadati di richiesta (anche il Worker `maintenance-mode`)                                                                           | rete globale                                                                          | log di piattaforma, a breve termine                                       | DNS, TLS, WAF, manutenzione     |
| Vercel              | IP, metadati di richiesta                                                                                                                | region impostata sul progetto (dashboard)                                             | log di piattaforma                                                        | hosting                         |
| Sentry              | rapporto tecnico d'errore e paese della connessione, senza IP                                                                            | regione UE, Francoforte; SCC e DPF per i metadati USA                                 | 30 giorni (piano Developer; data-retention-periods della doc Sentry)      | trovare i malfunzionamenti      |
| Google Maps (Embed) | IP, metadati del browser e origine del sito (`strict-origin-when-cross-origin`), solo dopo il click "Visualizza la mappa" su `/contatti` | Google, privacy policy generale                                                       | secondo Google; la doc dell'Embed API non dice se l'iframe imposta cookie | mappa interattiva               |
| Google (Gmail)      | email dei clienti nella casella `vetreriamonferrina@gmail.com` (`src/data/contatti.ts`)                                                  | Google, account personale (Google non offre il DPA art. 28 per gli account personali) | fino a fine trattativa, max 6 mesi dall'ultimo contatto                   | rispondere e fare il preventivo |
| WhatsApp            | messaggi di chi scrive con il link `wa.me`                                                                                               | WhatsApp Ireland Limited (Meta), condizioni proprie                                   | come sopra, nell'app della ditta                                          | rispondere e fare il preventivo |

Non esiste un database applicativo.

## 3. Cosa non viene fatto

Nessun analytics che profila. Le statistiche di visita sono quelle aggregate che Cloudflare calcola dal traffico del dominio, senza script nelle pagine. Vercel Web Analytics e Vercel Speed Insights non sono installati. Cloudflare Web Analytics non gira: il suo script lo inietterebbe Cloudflare, ma l'HTML esce con `Cache-Control: no-transform`, che lo impedisce (misurato il 14/10/2026: nessuno script nelle pagine).

Nessun dato di cliente verso l'agente SEO: quella pipeline ingerisce solo pagine web pubbliche.

Nessun addestramento di modelli sui dati raccolti (su Vercel l'uso per l'addestramento è spento in Team Settings > Data Preferences dal 12/10/2026), nessuna cessione o vendita a terzi.

## 4. Retention

| Dato                                           | Quanto resta                                                                                                            | Come sparisce       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Log di piattaforma (Cloudflare, Vercel)        | retention di default dei fornitori (runtime log Vercel Hobby: 1 ora)                                                    | automatica          |
| Email, messaggi e richieste del vecchio modulo | fino a fine trattativa, max 6 mesi dall'ultimo contatto; se diventa un lavoro, contratto e fatture con i tempi di legge | a mano, dalla ditta |
| Rapporti d'errore Sentry                       | 30 giorni                                                                                                               | automatica          |

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
