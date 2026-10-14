# Registro delle decisioni (ADR)

Ogni decisione di architettura sta in un file `NNNN-titolo.md` con le parti di Nygard: Status, Context, Decision, Consequences, più le opzioni considerate. I numeri non si riusano. Una decisione superata resta nel registro con lo stato "Superseded by ADR-NNNN": il testo non si riscrive, così si vede come la decisione è cambiata.

| ADR                                                | Decisione                                                                    | Stato                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| [0001](0001-turnstile-e-protezione-del-bordo.md)   | Turnstile sul modulo preventivi e protezione del bordo                       | Superseded by ADR-0003      |
| [0002](0002-preview-senza-cloudflare.md)           | La preview prova il frontend, Cloudflare e le email si provano in produzione | Superseded in parte da 0003 |
| [0003](0003-via-modulo-e-meteo-resta-su-vercel.md) | Via il modulo preventivi e il meteo, il sito resta su Vercel Hobby           | Accepted                    |
