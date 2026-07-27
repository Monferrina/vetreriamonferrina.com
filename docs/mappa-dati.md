# Mappa dei dati — vetreriamonferrina.com

> **Ultimo aggiornamento:** 2026-07-26 · **Perimetro:** tutto ciò che il sito raccoglie,
> trasporta o conserva. Chiude il gap **V1** dell'audit DSPM del 24-07-2026.
>
> Non è burocrazia: è la risposta pronta se un cliente — o il Garante — chiede _«dove
> finisce la mia email?»_. La privacy policy pubblica dice la stessa cosa in linguaggio
> non tecnico; qui c'è il dettaglio con i riferimenti al codice, perché una mappa che
> non si può verificare invecchia senza che nessuno se ne accorga.

## 1. L'unico punto in cui entrano dati di persone

Il sito ha **una sola** superficie di raccolta: il modulo di richiesta preventivo
(`/preventivo`), servito da `POST /api/send-quote` — l'unica route non prerenderizzata
di tutto il sito. Tutto il resto è statico.

| Dato             | Da dove arriva                                        | Obbligatorio |
| ---------------- | ----------------------------------------------------- | ------------ |
| Nome             | digitato dall'utente                                  | sì           |
| Telefono         | digitato dall'utente                                  | sì           |
| Email            | digitato dall'utente                                  | sì           |
| Tipo di lavoro   | selezione da elenco chiuso                            | sì           |
| Descrizione      | digitato dall'utente                                  | sì           |
| Misure           | digitato dall'utente                                  | sì           |
| Consenso privacy | checkbox, mai pre-selezionata                         | sì           |
| **Indirizzo IP** | header `cf-connecting-ip`, **non** chiesto all'utente | automatico   |

## 2. Il percorso, passo per passo

```
Browser del cliente
  │
  ├─► Cloudflare ......... DNS, TLS, WAF, protezione anti-abuso. Vede l'IP reale
  │                        e lo inoltra in cf-connecting-ip.
  │
  ├─► Vercel ............. esegue /api/send-quote. Nessuna scrittura su disco.
  │     │
  │     ├─► Upstash ...... SOLO l'IP, come chiave di conteggio. TTL 60 s.
  │     │                  AWS eu-central-1 (Francoforte) — resta in UE.
  │     │                  src/lib/rate-limit.ts — slidingWindow(5, '60 s')
  │     │
  │     └─► Resend ....... corpo dell'email (tutti i campi + IP) → casella aziendale.
  │                        src/lib/email-templates/quote-request.ts
  │
  └─► Casella email della vetreria ...... è QUI che i dati si fermano davvero.
```

Il contenuto editoriale del sito arriva da **Sanity** ed è il percorso opposto: esce dal
CMS verso il visitatore, non contiene dati di clienti.

## 3. Chi tocca cosa, e per quanto

| Fornitore             | Cosa vede                 | Dove                                                    | Per quanto                                   | Perché                        |
| --------------------- | ------------------------- | ------------------------------------------------------- | -------------------------------------------- | ----------------------------- |
| **Cloudflare**        | IP, metadati di richiesta | rete globale                                            | log di piattaforma, a breve termine          | DNS, TLS, WAF                 |
| **Vercel**            | il payload, in transito   | region impostata sul progetto (dashboard, non nel repo) | nulla di persistente: la funzione non scrive | esecuzione del modulo         |
| **Upstash**           | **solo l'IP**             | Redis serverless — AWS `eu-central-1` (Francoforte)     | **60 secondi**, scadenza automatica          | contare gli invii ravvicinati |
| **Resend**            | l'email completa          | USA — SCC + Data Privacy Framework                      | secondo la sua retention di invio            | consegna dell'email           |
| **Casella aziendale** | l'email completa          | provider di posta                                       | **24 mesi** dall'ultimo contatto             | gestire il preventivo         |
| **Sanity**            | nessun dato di cliente    | CDN                                                     | n/a                                          | contenuti del sito            |

**Nessun database applicativo.** Il sito non ha un DB proprio: i dati del modulo esistono
come email e nient'altro. L'unica eccezione è l'IP in Upstash, che scade da solo.

## 4. Cosa NON facciamo

- **Nessun analytics che profila.** Vercel Speed Insights misura solo prestazioni; le
  statistiche di visita restano su Cloudflare, aggregate. Vercel Web Analytics non è
  installato, per scelta.
- **Nessun dato di cliente verso l'agente SEO.** `Monferrina/monferrinoAI` ingerisce solo
  pagine web pubbliche: le richieste di preventivo non entrano mai in quella pipeline.
- **Nessun addestramento di modelli** sui dati raccolti.
- **Nessuna cessione o vendita** a terzi.

## 5. Retention — la parte che va tenuta onesta

| Dato                                    | Quanto resta                       | Come sparisce             |
| --------------------------------------- | ---------------------------------- | ------------------------- |
| IP in Upstash                           | 60 secondi                         | TTL automatico            |
| Email nella casella aziendale           | 24 mesi dall'ultimo contatto       | **cancellazione manuale** |
| Log di piattaforma (Cloudflare, Vercel) | retention di default dei fornitori | automatica                |

**Ceiling dichiarato:** la cancellazione a 24 mesi è **manuale**, non c'è un automatismo
che la esegue. Il termine è scelto perché un preventivo su misura può essere ripreso a
distanza di mesi. Chi chiede la cancellazione prima la ottiene su richiesta (art. 17
GDPR, punto 7 della privacy policy) — quella non aspetta i 24 mesi.

Scriverlo serve a questo: «per il tempo strettamente necessario» non è una politica di
retention, è l'assenza di una politica. Un termine dichiarato si può verificare.

## 6. Come ricontrollare che questa mappa sia ancora vera

```bash
# L'unica route dinamica: se l'elenco cresce, questa mappa va rifatta
grep -rln "prerender = false" src/pages/

# Dove finisce l'IP
grep -rn "cf-connecting-ip" src/

# Finestra e prefisso del rate limit
grep -n "slidingWindow\|prefix" src/lib/rate-limit.ts

# Chi riceve i dati del modulo
grep -rn "sanitizeFormData" src/
```

## 7. Riferimenti

- Privacy policy pubblica: [`/privacy`](https://vetreriamonferrina.com/privacy) — punti 2, 5, 6
- Codice: `src/lib/send-quote.ts`, `src/lib/rate-limit.ts`, `src/lib/sanitize.ts`,
  `src/lib/email-templates/quote-request.ts`
- Agente SEO e sua mappa dati: `Monferrina/monferrinoAI` → `docs/ai-act.md` §3.2
