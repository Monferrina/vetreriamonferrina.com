# ADR-0001: Turnstile sul modulo preventivi e protezione del bordo

**Status:** Accepted (Marco, 08/10/2026)
**Date:** 2026-10-08
**Deciders:** Marco Bellingeri

Ogni affermazione è marcata: [doc] documentazione del fornitore, [misurato] prova eseguita sulla zona o sul sito, [dedotto] conclusione nostra.

## Context

Il sito ha un solo codice server, la funzione `POST /api/send-quote`, che manda un'email a Resend per ogni richiesta valida. È l'unico canale di lead e il bersaglio naturale di spam e abusi scriptati: il controllo dell'`Origin` ferma i browser, non `curl` [misurato, F1]. Il sito passa da Cloudflare (DNS, proxy, Worker di manutenzione) e poi da Vercel, piano Hobby [misurato]. Vincoli: strumenti gratuiti già in uso, niente dati del modulo a terzi oltre a chi li deve consegnare, nessuna email falsa dalle scansioni e dai monitor, nessun fornitore che possa bloccare i monitor Checkly.

Catena al bordo, misurata il 07/10/2026 via API in sola lettura:

- Cloudflare Free: Managed Ruleset attivo (blocca Log4j in URI e header [misurato]), una regola custom contro i bot AI, una regola di rate limit su `POST /api/send-quote` (5 richieste in 10 s per IP, attiva dal 03/07/2026), Bot Fight Mode acceso, `ssl: strict`, TLS minimo 1.2.
- Worker `maintenance-mode`: inoltra a Vercel con il segreto di bypass e `x-origin-verify`; da #388 filtra le istruzioni `x-vercel-*` del client e i `set-cookie` di Vercel, perché prima coniava a chiunque un cookie che conteneva il segreto di bypass [misurato].
- Vercel: Deployment Protection su tutte le deployment; il middleware rifiuta in produzione le richieste al modulo senza `x-origin-verify` (fail-closed, confronto a tempo costante) [misurato, M1].
- Funzione: `Origin`, rate limit Upstash (5 in 60 s per IP, ripiego in memoria), validazione, email.

## Decision

Aggiungere Cloudflare Turnstile al modulo e verificarlo nel server, prima dell'invio dell'email.

1. **Widget** in modalità di rendering standard (`render`, non `execute`), `appearance: interaction-only`, `action: send-quote`: la verifica parte all'apertura della pagina, invisibile se non serve un'interazione, e il token si rinnova da solo alla scadenza [doc: la pagina raccomanda di eseguire la verifica "as early upon the visitor's page entry as possible"; token valido 300 s]. Il pulsante di invio si accende solo con un token; senza, i contatti telefonici restano in vista.
2. **Verifica nel server** con `siteverify` e timeout di 10 s, dopo `Origin`, rate limit e validazione (un 422 non consuma il token monouso, e `siteverify` non diventa un amplificatore), dopo la prova a secco del corpo (i monitor Checkly non possono avere un token) e prima del blocco degli invii fuori produzione.
3. **Fail-closed**: token assente o rifiutato → 403, nessuna email; segreto assente o sbagliato, servizio giù, timeout, risposta malformata → 503, nessuna email, un evento Sentry con il solo codice.
4. **Chiavi**: in produzione le chiavi vere, con `hostname` e `action` confrontati; altrove (preview, CI, sviluppo) le chiavi di test pubbliche della doc, nel codice, scelte dalla stessa espressione che decide se partono le email. Una risposta che dichiara `result_with_testing_key` in produzione è un guasto di configurazione (503 + Sentry). Un build di produzione su Vercel senza sitekey si ferma.
5. **CSP** solo sulla pagina del preventivo: `script-src` e `frame-src` per `challenges.cloudflare.com` [doc CSP di Turnstile].
6. **Monitor**: un check browser vede il widget; un check negativo con token finto e corpo marcato pretende il 403, così segreto sbagliato o `siteverify` giù diventano un allarme prima che un cliente fallisca.

## Options Considered

### Option A: Turnstile con verifica nel server (scelta)

| Dimension        | Assessment                                                           |
| ---------------- | -------------------------------------------------------------------- |
| Complexity       | Media: un modulo nuovo, una chiamata di rete nel percorso dell'email |
| Cost             | Zero [doc: "Unlimited challenges", fino a 20 widget]                 |
| Scalability      | `siteverify` è una chiamata per invio, dietro rate limit             |
| Team familiarity | Cloudflare già in uso                                                |

**Pros:** funziona senza passare il traffico da Cloudflare [doc]; blocca anche i bot che falsificano `Origin`; non riceve i campi del modulo [doc, Privacy Addendum]; chiavi di test ufficiali per preview e CI.
**Cons:** dipendenza da un servizio esterno nel percorso del lead (mitigata dal 503 visibile e dal monitor); un browser senza JavaScript o con lo script bloccato non può inviare (resta il telefono).

### Option B: Bot Fight Mode di Cloudflare sul percorso del modulo

| Dimension        | Assessment            |
| ---------------- | --------------------- |
| Complexity       | Nulla                 |
| Cost             | Zero                  |
| Scalability      | Al bordo              |
| Team familiarity | Già acceso sulla zona |

**Pros:** nessun codice.
**Cons:** _"You cannot bypass or skip Bot Fight Mode"_ e _"may challenge API or mobile app traffic"_ [doc]: i monitor Checkly e le scansioni HawkScan finirebbero in challenge; non distingue il modulo dal resto del sito. Resta acceso come difesa generale, non come controllo del modulo.

### Option C: Vercel Bot Protection

**Cons:** _"doesn't work when a reverse proxy (e.g. Cloudflare…) is placed in front"_ [doc]. Scartata.

### Option D: Aikido Zen nel codice

**Cons:** licenza AGPL con licenza commerciale obbligatoria per attività commerciali [doc, README del progetto]. Scartata.

### Option E: regola custom Cloudflare come ponte (N1)

Una regola sul bordo che blocchi `x-vercel-*` dei visitatori, in attesa del Worker corretto. Scartata da Marco (08/10): la PR del Worker è arrivata subito.

## Trade-off Analysis

- **Rendering `render` contro `execute`**: con `execute` il browser parla con Cloudflare solo quando si preme Invia, ma l'invio aspetta la verifica; con `render` la verifica è già fatta all'invio e il token si rinnova da solo. La doc non descrive `interaction-only` con `execute` insieme [doc, pagina Widget configurations del 28/06/2026]. Scelto `render` (Marco, 08/10).
- **Chiavi di test nel codice contro Doppler**: la configurazione `stg` di Doppler contiene solo riferimenti a `prd`, e un segreto di test che passa sempre non deve poter finire in produzione. Nel codice, legato al predicato di produzione, il segreto di test coincide con "nessuna email" per costruzione.
- **Fail-closed contro fail-open**: un fail-open con `siteverify` giù manderebbe spam alla vetreria senza traccia; un fail-closed perde lead durante un guasto di Cloudflare, ma lo dice (503, Sentry, monitor) e lascia il telefono in vista.
- **Verifica dopo la prova a secco**: un monitor non può avere un token, quindi il check positivo di Checkly non vede un Turnstile rotto; per questo esiste il check negativo (decisione 6), che non è email-safe in caso di regressione del codice a fail-open (corpo marcato, un'email al giorno finché non si corregge).

## Consequences

- Diventa più facile: fermare gli invii scriptati senza toccare il bordo; provare il rifiuto sulla preview con le chiavi di test; vedere un guasto della verifica prima dei clienti.
- Diventa più difficile: un invio senza JavaScript o con `challenges.cloudflare.com` bloccato non è più possibile; ogni cambio di `TURNSTILE_SECRET_KEY` in Doppler vuole un redeploy e un preventivo vero di prova (regola già in `CLAUDE.md`).
- Da rivedere: la Vercel Authentication con il segreto di bypass potrebbe essere sostituita da una regola del Vercel Firewall che pretenda `x-origin-verify` (TS1, non verificato sulla doc); il piano Hobby per un sito aziendale (decisione di Marco: resta); l'uso non commerciale dell'API gratuita di Open-Meteo [doc, termini].

## Action Items

1. [ ] Verifica nel server e chiavi (#395)
2. [ ] Widget, CSP della pagina e watchdog (#396)
3. [ ] Monitor Checkly (#397)
4. [ ] Preventivo vero dopo il deploy e misure dietro Cloudflare (#398)
5. [x] Approvazione di questo ADR nella PR: Status → Accepted
