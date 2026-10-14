# Come si scrive la documentazione

Valgono per persone e agenti.

## Riferimenti

- Ortografia, punteggiatura, maiuscole, numeri e date: [Manuale interistituzionale di convenzioni redazionali](https://style-guide.europa.eu/it), Parte quarta, "Convenzioni specifiche per la lingua italiana" (Ufficio delle pubblicazioni dell'UE).
- Testi tecnici in italiano (voce, interfaccia, termini inglesi): [Italian Localization Style Guide](https://download.microsoft.com/download/f/f/7/ff70427c-1f7e-429f-96be-724d2e49cd47/ita-ita-StyleGuide.pdf) di Microsoft. Non vale la parte sulla terminologia dei prodotti Microsoft.
- Dove le due guide divergono, vale il manuale UE.

## Dove va cosa

Ogni fatto sta in un posto solo; gli altri documenti ci rimandano con un link.

| Documento                   | Cosa contiene                                                 |
| --------------------------- | ------------------------------------------------------------- |
| `README.md`                 | Cos'è il sito, lo stack, come si parte, l'infrastruttura      |
| `CONTRIBUTING.md`           | Flusso di lavoro, controlli in locale, check al merge, commit |
| `SECURITY.md`               | Come segnalare una vulnerabilità                              |
| `docs/adr/`                 | Decisioni di architettura, una per file, con l'indice         |
| `docs/*.md`                 | Guide e spiegazioni (architettura, mappa dei dati, Google)    |
| `cloudflare/…/README.md`    | Il Worker: cosa fa, come si accende la manutenzione, deploy   |
| `CLAUDE.md`, `docs/agents/` | Solo ciò che serve all'agente e non sta già altrove           |

Una guida operativa (come si fa) e una spiegazione (perché è così) stanno in sezioni diverse, o in documenti diversi. Un elenco di riferimento (variabili, workflow, check) non si ripete in due file.

## Come si scrive

- Istruzioni con il tu all'imperativo ("Crea un branch"); spiegazioni in forma impersonale.
- La condizione prima dell'istruzione: "Se la preview non parte, …".
- Titoli con la sola iniziale maiuscola, senza punto finale.
- Date: `14/10/2026` nel testo, `2026-10-14` nei nomi di file. È un'eccezione del progetto: il manuale UE scrive le date con i punti (`7.10.1958`), ma i documenti della repo usano già la barra.
- Comandi, nomi di file, variabili e header in `codice`.
- Link descrittivi: il testo del link dice dove porta, mai "qui".
- Niente numeri che invecchiano da soli (quanti componenti, quanti test): se serve, il comando che li conta.
- Nei documenti della repo i riferimenti sono ai numeri di PR e issue (`#424`), non a nomi interni di attività.
- "Verificato" solo con il comando o la prova e la data.
