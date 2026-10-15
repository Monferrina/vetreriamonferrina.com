# Analisi funzionale del sito

Cosa fa il sito e per chi. Un requisito funzionale, per [SWEBOK v4](https://www.computer.org/education/bodies-of-knowledge/software-engineering), descrive un comportamento osservabile del software: "policies to be enforced and processes to be carried out". Qui i processi sono i casi d'uso (sezione 4), le politiche sono le regole (sezione 5). Come il sito è costruito sta in [`architettura.md`](architettura.md); le parole usate sono definite in [`GLOSSARY.md`](../GLOSSARY.md).

Questo documento è la versione corta della specifica dei requisiti 1.0 del 15/10/2026, che resta fuori dal repo perché contiene dati delle persone coinvolte. La specifica segue il programma IREB CPRE Foundation Level e SWEBOK (sezione 9).

## 1. Scopo e perimetro

Il sito serve al cliente per capire se la vetreria fa il lavoro che cerca, vedere i lavori fatti, e contattarla o raggiungerla. Sopralluogo, preventivo e lavoro avvengono fuori dal sito.

Obiettivi della vetreria per il sito: consolidare sul web il posizionamento locale; farsi trovare da chi cerca una vetreria in zona, con le sue credenziali (oltre 40 anni di esperienza); mettere a disposizione il sapere della direzione. Il primo si osserva dall'andamento delle recensioni della scheda Google (35, media 4,4, al 02/10/2026), senza un valore obiettivo; il terzo non si misura.

## 2. Attori

| Attore               | Cosa vuole dal sito                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Cliente locale       | Sapere se la vetreria fa un lavoro, con quali tempi e come contattarla. Arriva da Google, cercando la vetreria per nome o un servizio. |
| Cliente di passaggio | Da telefono, non della zona, con un bisogno urgente: indirizzo, orari e telefono subito, e arrivare con la vetreria aperta.            |
| Direzione            | Che il sito dica il vero su servizi, orari e impegni. Chiede le modifiche al manutentore.                                              |
| Manutentore          | Fare le modifiche chieste dalla direzione e pubblicarle, con la minor manutenzione possibile.                                          |

I sistemi con cui il sito parla (Google, Sentry, Checkly, monferrinoAI) sono nel diagramma di contesto di [`architettura.md`](architettura.md).

## 3. Il sito nel processo della vetreria

Il processo va dalla richiesta del cliente al lavoro concluso: raccolta della richiesta, sopralluogo se il vetro è grande o pesante o il lavoro lo richiede, preventivo, acconto, eventuale ordine al fornitore, taglio e lavorazione, posa o ritiro in sede, saldo e fattura. Il sito interviene solo all'inizio: il cliente vi trova i numeri e le informazioni prima di contattare la vetreria o di andarci. La mappa completa, in BPMN, sta nella specifica.

## 4. Casi d'uso

| Caso                                        | Attore                 | Passi                                                                                                                                         | Esito                                                                                                                                                       |
| ------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UC1. Verificare se la vetreria fa un lavoro | Cliente                | Arriva sulla home o sulla pagina di un servizio o del blog. Consulta il catalogo `/servizi` o chiede all'assistente Glassy.                   | Sa se la vetreria fa quel lavoro. Se il lavoro non è nel catalogo, vale R1.                                                                                 |
| UC2. Sapere prezzo e tempi                  | Cliente                | Legge le domande frequenti (`/faq`) e quelle della pagina del servizio.                                                                       | Sa che il prezzo arriva con il preventivo e conosce i tempi indicativi (R2-R4). Il sito non pubblica prezzi.                                                |
| UC3. Contattare la vetreria                 | Cliente                | Tocca "Contatti" nella barra in basso o nel menu, poi il telefono, WhatsApp o l'email; oppure chiede a Glassy ("Contattaci", "Chiamaci ora"). | Parla con la vetreria, fuori dal sito.                                                                                                                      |
| UC4. Modificare i contenuti                 | Direzione, manutentore | La direzione chiede la modifica al manutentore, che la fa con una pull request e la pubblica quando i controlli passano.                      | La modifica è online entro 24 ore (R6). Recensioni e orario settimanale arrivano dalla scheda Google con una pull request mensile, rivista dal manutentore. |
| UC5. Raggiungere la sede                    | Cliente di passaggio   | Trova il sito da Google, tocca "Contatti", legge indirizzo, telefono e orari, apre le indicazioni su Google Maps.                             | Ha tutto per arrivare, e sa se la vetreria è in chiusura straordinaria.                                                                                     |
| UC6. Guardare i lavori fatti                | Cliente                | Apre `/galleria`, sceglie una categoria, guarda le foto ingrandite.                                                                           | Ha visto lavori della vetreria del tipo che gli interessa.                                                                                                  |

## 5. Regole

| Regola | Cosa vale                                                                                                                                                                                | Fonte                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| R1     | Il catalogo dei servizi è completo: un lavoro che non c'è, la vetreria non lo fa. Il cliente può comunque scrivere o telefonare.                                                         | Direzione; il catalogo ha "Lavori personalizzati" dalla PR #436 |
| R2     | Il sopralluogo è gratuito e senza impegno in Piemonte e Lombardia; Liguria, Valle d'Aosta ed estero si valutano caso per caso.                                                           | `/faq`, confermata dalla direzione                              |
| R3     | Il preventivo è immediato se il cliente è in sede; per email arriva entro 24-48 ore per i lavori standard, e per i progetti complessi entro pochi giorni lavorativi dopo il sopralluogo. | `/faq`, corretta e confermata dalla direzione                   |
| R4     | I lavori semplici, come la sostituzione di un vetro, richiedono pochi giorni; box doccia su misura, parapetti e pensiline alcune settimane. I tempi precisi sono nel preventivo.         | `/faq`, direzione, due recensioni                               |
| R5     | La posa la fanno solo i vetrai della vetreria, mai terzi.                                                                                                                                | `/faq`, confermata dalla direzione                              |
| R6     | Una modifica chiesta dalla direzione va online entro 24 ore dalla richiesta.                                                                                                             | Manutentore                                                     |

La `/faq` oggi non dice che in sede il preventivo è immediato (R3).

## 6. Chiusure straordinarie

Il sito deve poter mostrare una chiusura straordinaria, con le date di inizio e di fine: prima mostrava solo l'orario settimanale preso dalla scheda Google, e una chiusura straordinaria per ferie non era mai stata segnalata. Il manutentore la scrive in `src/data/chiusure.json`. L'avviso compare in ogni pagina 14 giorni prima dell'inizio e sparisce da solo dopo l'ultimo giorno; con più chiusure straordinarie nella finestra, compare un avviso per ognuna. L'avviso deve essere nell'HTML anche senza JavaScript; lo script lo nasconde fuori dalla finestra. Senza JavaScript, quindi, resta visibile fino al deploy successivo alla fine: è un limite accettato, per non aggiungere un build programmato.

Stato: in revisione nella PR #437. Serve anche un passo nel processo che ricordi alla direzione di comunicare le chiusure straordinarie: la sola funzione non basta.

## 7. Qualità e vincoli

- Contatti a portata di mano: su un telefono da 320×568, un tocco su "Contatti" e indirizzo, telefono e orari iniziano entro due altezze di schermo (misurato il 15/10/2026: 617, 717, 1049 px).
- Caricamento: misurate con Lighthouse in laboratorio, profilo mobile, le pagine devono avere LCP non oltre 2,5 s, CLS non oltre 0,1 e TBT sotto 200 ms (soglie di web.dev). Il 15/10/2026 `/contatti` le rispetta; la home ha LCP 2,9 s, scostamento accettato.
- Dati: il sito non ha campi in cui il cliente inserisce dati; cosa arriva alle piattaforme sta nella [mappa dei dati](mappa-dati.md). La mappa di Google si carica solo dopo un tocco.
- Altri obiettivi di qualità (sicurezza, disponibilità, spesa, gestione da parte di una persona sola): [`architettura.md`](architettura.md), sezione 1.
- Vincoli: niente prezzi pubblicati, niente moduli, piani gratuiti, manutenzione minima (in futuro i contenuti li aggiornerà monferrinoAI). Decisioni che limitano il perimetro: [registro degli ADR](adr/README.md).

## 8. Fuori perimetro

- Lavorazioni religiose: alcuni concorrenti le offrono, la vetreria no.
- Richiesta di preventivo dal sito e meteo: tolti con l'[ADR-0003](adr/0003-via-modulo-e-meteo-resta-su-vercel.md).
- Acquisto online e prezzi pubblicati.

## 9. Riferimenti

- SWEBOK Guide V4.0, capitolo 1 "Software Requirements", IEEE Computer Society, 2024: definizione di requisito funzionale (§1.4), regole come requisiti in linguaggio naturale (§4.1), casi d'uso in forma di tabella (§4.2, figura 1.6), attributi di un requisito tra cui la fonte (§4.5).
- IREB, CPRE Foundation Level, programma 3.3.0 in italiano (2026), e glossario IREB 2.2.1: configurazione del processo, prodotti di lavoro, criteri di qualità, validazione, tracciabilità.
- OMG BPMN 2.0.2 (processo della vetreria), OMG UML 2.5.1 (casi d'uso, modello del dominio, stati della chiusura straordinaria), EARS (forma dei requisiti), ISTQB CTFL 4.0.1 (criteri di accettazione e valori limite), web.dev (soglie di caricamento).
- La norma sui requisiti ISO/IEC/IEEE 29148 e la ISO/IEC 25010 sono a pagamento e non sono state consultate.
