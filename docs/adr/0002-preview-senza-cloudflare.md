# ADR-0002: la preview prova il frontend, Cloudflare e le email si provano in produzione

**Status:** Accepted (Marco, 11/10/2026)
**Date:** 2026-10-11
**Deciders:** Marco Bellingeri

## Context

Nella PR #400 (Z1) `checkly test` ha colpito la produzione e ha mandato due email di prova alla vetreria. L'issue #401 proponeva un ambiente di prova completo: la Preview Vercel con la configurazione Doppler `dev`, email vere verso Marco, un secondo widget Turnstile per `vercel.app`, il controllo Origin aperto all'origine della preview, i check di produzione eseguibili anche sulle PR.

Oggi fuori produzione il modulo risponde in prova a secco e usa le chiavi Turnstile di test (ADR-0001, punto 4); sulle PR Checkly esegue solo i check con tag `preview` (`.github/workflows/checkly.yml`), gli altri partono dopo il deploy di produzione.

## Decision

La preview resta per il frontend e per le modifiche al backend che non richiedono attività su Cloudflare. Non diventa una seconda produzione (Marco, 11/10/2026): niente segreti veri in `dev` per la preview, niente secondo widget Turnstile, la sync `stg` → Preview resta com'è. #401 chiusa come `wontfix`.

Una modifica che tocca Cloudflare (Worker, regole, Turnstile), Resend o il lockdown dell'origine si verifica in produzione, dopo il merge:

1. il merge si fa quando Marco può mandare subito un preventivo vero dal sito (regola già in `CLAUDE.md`, "Segreti");
2. i check Checkly di produzione partono al deploy (`dryRun`, 403 senza Worker, 403 con token finto, widget senza errori CSP);
3. se qualcosa non va, rollback istantaneo di Vercel alla deployment precedente.

## Consequences

- Più facile: un solo ambiente con segreti veri; nessuna email da HawkScan o dai test fuori produzione; meno configurazione da tenere allineata.
- Più difficile: un errore su Cloudflare, Resend o Turnstile si vede solo in produzione, nel tempo tra il deploy e il primo check o preventivo di prova.
