# Security Policy

Il progetto non pubblica release versionate: esiste una sola linea supportata, il branch `main`, che corrisponde a quanto è in produzione su [vetreriamonferrina.com](https://vetreriamonferrina.com).

Questo documento esiste in italiano e in inglese. Le due versioni sono equivalenti e vanno aggiornate insieme.

## Perimetro

| Ambito                                                | In scope |
| ----------------------------------------------------- | -------- |
| Il sito `vetreriamonferrina.com`                      | Sì       |
| L'endpoint SSR `/api/send-quote`                      | Sì       |
| Il Worker in `cloudflare/maintenance-worker/`         | Sì       |
| Il codice di questo repository, Studio Sanity incluso | Sì       |
| Vercel, Cloudflare, Sanity, Resend, Upstash, GitHub   | No       |

Le piattaforme di terze parti hanno programmi di segnalazione propri: una vulnerabilità nel loro prodotto va segnalata a loro, non qui. Restano in scope le configurazioni sbagliate lato nostro su quelle piattaforme, quando sono osservabili dall'esterno.

Non sono considerati segnalazioni utili gli output grezzi di scanner automatici senza un impatto dimostrato, e i report che richiedono accesso fisico o privilegi già ottenuti.

## Segnalare una vulnerabilità

Non aprire una issue pubblica.

Il canale preferito è il [private vulnerability reporting di GitHub](https://github.com/Monferrina/vetreriamonferrina.com/security/advisories/new), attivo su questo repository: la segnalazione resta privata, la conversazione è tracciata e la fix può essere coordinata con un advisory.

In alternativa si può scrivere alla casella `vetreriamonferrinacasale@gmail.com`.

In entrambi i casi servono la descrizione della vulnerabilità, i passaggi per riprodurla e l'impatto potenziale.

La risposta arriva entro 72 ore. La correzione viene coordinata con chi segnala prima di qualsiasi divulgazione pubblica.

Il repository ha secret scanning e push protection attivi. Se noti un segreto committato per errore, segnalalo con la stessa procedura invece di aprire una issue.

## Reporting a Vulnerability

The project ships no versioned releases: the only supported line is the `main` branch, which matches what is live on [vetreriamonferrina.com](https://vetreriamonferrina.com).

### Scope

| Area                                                | In scope |
| --------------------------------------------------- | -------- |
| The `vetreriamonferrina.com` website                | Yes      |
| The `/api/send-quote` SSR endpoint                  | Yes      |
| The Worker in `cloudflare/maintenance-worker/`      | Yes      |
| The code in this repository, Sanity Studio included | Yes      |
| Vercel, Cloudflare, Sanity, Resend, Upstash, GitHub | No       |

Third party platforms run their own disclosure programs: a flaw in their product goes to them, not here. Misconfigurations on our side of those platforms are in scope when they are observable from the outside.

Raw automated scanner output with no demonstrated impact, and reports requiring physical access or already granted privileges, are not useful reports.

### How to report

Do not open a public issue.

The preferred channel is [GitHub private vulnerability reporting](https://github.com/Monferrina/vetreriamonferrina.com/security/advisories/new), enabled on this repository: the report stays private, the thread is tracked, and the fix can be coordinated through an advisory.

As an alternative, write to `vetreriamonferrinacasale@gmail.com`.

Either way, include a description of the vulnerability, steps to reproduce it, and the potential impact.

We respond within 72 hours and coordinate the fix with the reporter before any public disclosure.

Secret scanning and push protection are enabled on this repository. If you spot a secret committed by mistake, report it through the same process rather than opening an issue.
