# ADR-0003: via il modulo preventivi e il meteo, il sito resta su Vercel Hobby

**Status:** Accepted (Marco, 12/10/2026)
**Date:** 2026-10-12
**Deciders:** Marco Bellingeri

## Context

Il modulo preventivi ha ricevuto una sola richiesta vera in tutta la sua vita, e per proteggerlo il sito teneva in piedi Resend, Upstash, Turnstile, il lockdown dell'origine, una chiave Sentry server e quattro check Checkly (ADR-0001). Il widget meteo chiamava MET Norway da una funzione server. Erano le sole due rotte on demand del sito oltre alla 404.

L'audit legale (`normativa.md`, punti F1-F3) ha trovato tre problemi del piano Hobby di Vercel:

- **F1**, ToS §4 (https://vercel.com/legal/terms, aggiornati l'1/6/2026): "You shall only use the Services under a Hobby plan for your personal or non-commercial use." Le Fair Use Guidelines (14/9/2026) lo ribadiscono: "All commercial usage of the platform requires either a Pro or Enterprise plan".
- **F2**, il DPA (https://vercel.com/legal/dpa, in vigore dal 31/3/2026) dice di applicarsi a "Customers who are on Enterprise and Pro plans" e non nomina Hobby.
- **F3**, ToS §3: su Hobby Vercel "may use Your Content to train our artificial intelligence … models", con opt-out dalle impostazioni del team.

## Decision

1. Via il modulo preventivi e il widget meteo, con il codice, i test, i check e le dipendenze che servivano solo a loro. `/preventivo` risponde 301 verso `/contatti`, dove restano telefono, WhatsApp ed email.
2. Il sito resta su Vercel Hobby. Il rischio F1 (sospensione per uso commerciale) lo accetta Marco il 12/10/2026. Senza il modulo il sito non raccoglie più dati inseriti dal visitatore, e il peso di F2 scende: restano gli IP nei log di hosting e del Worker, dichiarati in privacy (NR1).
3. Opt-out dell'addestramento IA (F3) fatto da Marco il 12/10/2026 in Team Settings > Data Preferences. Vale da quella data in avanti.
4. Via anche HawkScan: senza funzioni server resta poco da scansionare, e la prova di StackHawk scade. Nessuno strumento al suo posto per ora.
5. Il Worker Cloudflare di manutenzione resta com'è.

## Options Considered

- **Vercel Pro** (20 $/mese più IVA): risolve F1 e F2 senza migrazione. Marco ha scelto di non pagare.
- **Migrazione a Cloudflare Workers Free** (uso commerciale ammesso, DPA per ogni piano): piano scritto e messo da parte, perché costava una migrazione per un sito che dopo questa decisione è quasi tutto statico.

## Consequences

- Più facile: niente email, segreti e servizi di terzi da tenere allineati per il modulo; meno dati personali trattati; meno superficie da proteggere.
- Più difficile: chi vuole un preventivo deve telefonare, scrivere su WhatsApp o mandare un'email.
- Rischio aperto: Vercel può sospendere il progetto Hobby, anche senza preavviso (ToS §4). Se succede, si riprende la migrazione a Cloudflare.
- I segreti del modulo restano in Doppler e su Vercel finché non si cancellano in ST7: servono a un eventuale rollback.
