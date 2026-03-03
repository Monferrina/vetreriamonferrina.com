# Vetreria Monferrina — Design Document

> **Stato:** v1.0 LIVE (2026-03-03) — vetreriamonferrina.com

## Contesto

La Vetreria Monferrina (di Fioravanti Giuseppe) e' una vetreria storica a Casale Monferrato (AL).
Attualmente non ha un sito web — compare solo su directory terze (PagineGialle, Archiproducts, Edilportale).
La concorrenza locale ha siti vecchi o inesistenti. Il sito deve essere un regalo alla famiglia,
tecnicamente impeccabile, facile da usare per loro, e soprattutto utile.

**Obiettivi:**

- Dare alla vetreria una presenza online professionale
- Ridurre le chiamate ripetitive alla segreteria (orari, servizi, "fate anche X?")
- Offrire un canale di richiesta preventivo via email
- Permettere alla famiglia di aggiornare contenuti in autonomia
- Zero costi di manutenzione tecnica, zero dipendenza dal developer

**Vincoli:**

- Nessun costo ricorrente per API o servizi AI (contabilita' aziendale)
- Nessun backend da mantenere
- GDPR e normativa italiana rispettati al 100%
- La famiglia non e' tecnica — il CMS deve essere intuitivo
- La mail aziendale esistente non va toccata

---

## Architettura

```
                          ┌──────────────┐
                          │   Sanity CMS  │
                          │  (contenuti)  │
                          └──────┬───────┘
                                 │ webhook on publish
                                 ▼
┌──────────┐    HTTPS    ┌──────────────┐    build     ┌────────────┐
│  Browser  │◄──────────►│   Vercel CDN  │◄────────────│   Astro    │
│  (utente) │            │  (edge, global)│             │  (SSG)     │
└──────────┘             └──────┬───────┘             └────────────┘
                                 │
                          ┌──────┴───────┐
                          │ Edge Function │
                          │ (form → email)│
                          └──────┬───────┘
                                 │
                          ┌──────┴───────┐
                          │   Resend API  │
                          │  (email SMTP) │
                          └──────────────┘
```

### Flusso dati

1. **Contenuti**: la famiglia aggiorna testi/foto su Sanity → webhook triggera rebuild su Vercel → sito aggiornato in ~30 secondi
2. **Navigazione utente**: browser richiede pagina → Vercel CDN serve HTML statico pre-generato → tempo di caricamento <1s
3. **Form preventivo**: utente compila → JS valida lato client → POST a Edge Function → validazione server-side → Resend manda email → risposta all'utente
4. **Chatbot**: albero decisionale in JSON statico → JS vanilla → zero chiamate esterne

---

## Tech Stack

| Componente | Tecnologia                                 | Motivazione                                                                                                             |
| ---------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Framework  | **Astro 5**                                | SSG nativo, zero JS al client di default, islands architecture per componenti interattivi, Lighthouse 100               |
| Styling    | **Tailwind CSS 4**                         | Utility-first, design system con token CSS, dark mode automatica (orario + sistema)                                     |
| CMS        | **Sanity v5**                              | Free tier (100K API calls/mese), editor intuitivo, schema tipizzato, preview live, immagini con CDN e resize automatico |
| Form email | **Resend**                                 | 100 email/giorno gratis, API moderna, deliverability ottima, zero config SMTP                                           |
| Serverless | **Vercel Edge Functions**                  | Una sola funzione per il form. Cold start <50ms, TypeScript, integrato nel progetto                                     |
| Hosting    | **Vercel**                                 | Free tier, CDN globale, HTTPS automatico, deploy da Git push, dominio custom                                            |
| Chatbot    | **JSON statico + JS vanilla**              | Albero decisionale, zero API, zero costi, animazioni CSS                                                                |
| Dominio    | **vetreriamonferrina.com** via Cloudflare  | ~$10/anno, unico costo                                                                                                  |
| Recensioni | **Google Places API**                      | Fetch a build-time, filtro >= 4 stelle, $200/mese credito gratuito (costo effettivo $0)                                 |
| Analytics  | **Nessuno** (oppure Plausible self-hosted) | Zero cookie di terze parti = GDPR semplificato                                                                          |

**Costo totale: ~$10/anno** (solo dominio — Google Places API e' incluso nei $200/mese di credito gratuito)

---

## Struttura pagine

### 1. Home

- **Hero**: gradient primario, headline, sottotitolo, CTA "Richiedi preventivo" + "Scopri servizi"
- **Servizi in evidenza**: 4 card (doccia, parapetti, vetri camera, su misura) con icone SVG
- **Stats**: 40+ anni, Casale Monferrato, Su misura
- **Recensioni Google**: rating medio + card recensioni >= 4 stelle (dati da build-time Google Places API)
- **CTA finale**: "Hai un progetto? Parliamone" → link a form preventivo + telefono

### 2. Chi siamo

- Storia della vetreria (timeline o narrativa)
- Valori: artigianalita', qualita', territorio
- Foto team / laboratorio
- Certificazioni e partnership (Saint-Gobain, etc.)
- Contenuto gestito interamente da Sanity

### 3. Servizi

- Griglia di servizi con immagine + descrizione, organizzati per categoria
- Ogni servizio espandibile o con pagina dedicata (dipende dal volume)
- Ogni servizio ha un CTA "Richiedi preventivo per [servizio]" che pre-compila il form
- Contenuto gestito da Sanity (la famiglia puo' aggiungere/rimuovere servizi)

#### Categorie reali (confermate dalla famiglia):

**Servizi / Installazioni:**

- Box doccia
- Parapetti
- Pensiline
- Porte interne
- Posa di vetrine
- Sostituzione vetri finestre (servizio condizionale — dipende da disponibilita')

**Prodotti — Tipi di vetro:**

- Blindati
- Madras (vetro decorativo)
- Vetri stratificati (trasparenti, satinati, ecc.)
- Vetri monolitici (trasparenti, satinati, ecc.)
- Vetri camera (doppi)
- Vetri camera tripli
- Specchi

**Canaline (distanziali per vetrocamera):**

- Alluminio naturale
- Alluminio colorato (nero, bianco, oro, bronzo)
- Bordo caldo (grigio, bianco, nero, marrone)
- Swisspacer (solo nera)

**Lavorazioni:**

- Sagomature
- Fori
- Molature

**Componenti / Accessori:**

- Ventolino
- Valvole altimetriche
- Valvole Swisspacer

### 4. Galleria

- Masonry grid responsive con lightbox
- Filtri per categoria (stesse categorie dei servizi)
- Lazy loading per performance
- Le foto vengono da Sanity (CDN con resize automatico, WebP)
- La famiglia carica foto da Sanity, appaiono sul sito

### 5. Preventivo

- Form strutturato:
  - Nome e cognome (required)
  - Telefono (required)
  - Email (required)
  - Tipo di lavoro (select: Box doccia, Parapetti, Pensiline, Porte interne, Vetrine, Sostituzione vetri, Specchi, Lavorazione vetro, Altro)
  - Descrizione / note (textarea)
  - Misure approssimative (opzionale)
  - Checkbox consenso privacy (required)
- Validazione lato client (UX) + lato server (sicurezza)
- Rate limiting sulla Edge Function (anti-spam)
- Honeypot field nascosto (anti-bot, zero friction per l'utente)
- Email formattata che arriva alla casella esistente della vetreria
- Pagina di conferma dopo l'invio

### 6. Contatti

- Mappa interattiva (embed OpenStreetMap o Google Maps statico — no cookie se statico)
- Indirizzo, telefono, email (cliccabili su mobile)
- Orari di apertura (gestiti da Sanity)
- Indicazioni stradali link
- CTA alternativo: "Preferisci scriverci? Usa il form preventivo"

---

## Chatbot a flusso

### Filosofia

Non e' un assistente AI. E' una guida interattiva che risponde alle domande piu' frequenti e
indirizza l'utente verso il form preventivo o il telefono. Tono: cordiale, diretto, italiano.

### Struttura

```
ROOT
├── "Che lavori fate?"
│   ├── "Installazioni" → box doccia, parapetti, pensiline, porte, vetrine → CTA preventivo
│   ├── "Tipi di vetro" → blindati, madras, stratificati, monolitici, camera, specchi → CTA preventivo
│   ├── "Lavorazioni" → sagomature, fori, molature → CTA preventivo
│   └── ← Torna indietro
├── "Orari e dove trovarci" → orari + mappa + indicazioni
├── "Voglio un preventivo" → apre form preventivo (o guida pre-compilazione)
└── "Altra domanda" → "Chiamaci al [tel] o scrivi a [email]"
```

### Implementazione

- Widget floating bottom-right (icona messaggio)
- Si apre in un pannello overlay (non popup separato)
- Contenuti definiti in un file JSON (`chatbot-flow.json`)
- Aggiornabile da Sanity in futuro se servisse
- Animazione "typing" per simulare risposta naturale (300-500ms delay)
- Responsive: full-screen su mobile, pannello su desktop
- Persistenza sessione: se l'utente chiude e riapre, riprende da dove era (sessionStorage)

### Dati nel JSON

```json
{
  "welcome": {
    "message": "Ciao! Come posso aiutarti?",
    "options": [
      { "label": "Che lavori fate?", "next": "servizi" },
      { "label": "Orari e dove trovarci", "next": "orari" },
      { "label": "Voglio un preventivo", "action": "open_form" },
      { "label": "Altra domanda", "next": "altra" }
    ]
  },
  "servizi": {
    "message": "Lavoriamo il vetro da oltre 40 anni! Ecco cosa facciamo:",
    "options": [
      {
        "label": "Installazioni (box doccia, parapetti, pensiline...)",
        "next": "servizi_installazioni"
      },
      { "label": "Tipi di vetro (blindati, stratificati, camera...)", "next": "servizi_vetri" },
      { "label": "Lavorazioni (sagomature, fori, molature)", "next": "servizi_lavorazioni" },
      { "label": "← Torna indietro", "next": "welcome" }
    ]
  },
  "servizi_installazioni": {
    "message": "Ecco i nostri servizi di installazione:",
    "options": [
      { "label": "Box doccia", "next": "dettaglio_doccia" },
      { "label": "Parapetti", "next": "dettaglio_parapetti" },
      { "label": "Pensiline", "next": "dettaglio_pensiline" },
      { "label": "Porte interne", "next": "dettaglio_porte" },
      { "label": "Posa vetrine", "next": "dettaglio_vetrine" },
      { "label": "Richiedi preventivo", "action": "open_form" },
      { "label": "← Torna indietro", "next": "servizi" }
    ]
  }
}
```

---

## GDPR e normativa italiana

### Obblighi legali

1. **Privacy Policy** (art. 13 GDPR)
   - Titolare del trattamento: Vetreria Monferrina di Fioravanti Giuseppe
   - Dati raccolti: nome, telefono, email, descrizione lavoro (solo dal form)
   - Finalita': rispondere alla richiesta di preventivo
   - Base giuridica: consenso esplicito (checkbox)
   - Durata conservazione: i dati restano solo nella casella email, nessun database
   - Diritti: accesso, rettifica, cancellazione, portabilita'
   - Contatto DPO: non obbligatorio per PMI sotto 250 dipendenti con trattamento occasionale

2. **Cookie Policy**
   - Nessun cookie di profilazione o analytics di terze parti
   - Solo cookie tecnici (sessionStorage per chatbot, Vercel analytics se abilitato)
   - Banner informativo semplice (non serve consenso per cookie tecnici, art. 122 Codice Privacy)
   - Se in futuro aggiungono Google Maps embed interattivo, servira' consenso per cookie Google

3. **Footer legale** (obbligatorio per legge italiana)
   - Ragione sociale completa
   - Sede legale
   - Partita IVA
   - Numero REA / registro imprese (se applicabile)
   - Recuperabili da registroimprese.it senza chiedere alla famiglia

4. **Form preventivo**
   - Checkbox consenso NON pre-spuntata
   - Link alla privacy policy nel testo del consenso
   - Nessun dato salvato in database — transita solo via email
   - Niente newsletter, niente marketing, niente profilazione

5. **HTTPS**
   - Obbligatorio (raccolta dati personali via form)
   - Automatico con Vercel

### Approccio: privacy by design

Zero tracciamento, zero cookie terze parti, zero database con dati personali.
Il form manda una email e basta. Se il Garante bussa, la risposta e':
"Non conserviamo dati personali in nessun sistema informatico, il form genera una email."

---

## Design e UX

### Principi

- **Mobile-first**: la maggior parte dei clienti di una vetreria locale naviga da telefono
- **Velocita'**: target Lighthouse 100 su tutte le metriche, LCP < 1.5s
- **Accessibilita'**: WCAG 2.1 AA come minimo
- **Semplicita'**: massimo 2 click per arrivare al form preventivo da qualsiasi pagina
- **Italiano**: tutto in italiano, nessuna sezione in inglese

### Palette colori (proposta)

Ispirazione: il vetro, la trasparenza, il Monferrato (colline, mattoni, tradizione).

- **Primario**: blu vetro (#1B4965) — professionale, richiama il vetro
- **Secondario**: ambra/terracotta (#C67B40) — calore, artigianalita', Monferrato
- **Neutro**: scala grigi (#FAFAFA → #171717), bianco per superfici (token `--color-surface`)
- **Accento**: verde per successo (#16A34A), rosso per errori (#DC2626)

**Dark mode** (palette notturna automatica):

- Primario: #5BA3CC (blu piu' chiaro per leggibilita' su sfondo scuro)
- Secondario: #D4955E (rame leggermente piu' chiaro)
- Neutri invertiti: sfondi scuri (#111318), testi chiari (#D1D5DB)
- Superfici: #1A1D24 (card, form, pannelli)

**Attivazione**: automatica senza toggle manuale.
Priorita': `prefers-color-scheme: dark` OR ore 20:00-7:00 → dark mode.
Script inline nel `<head>` previene flash (FOUC). Listener dinamico ogni 15min + su cambio sistema.

### Tipografia

- Heading: font con personalita' (es. DM Serif Display — elegante ma leggibile)
- Body: font pulito (es. Inter o DM Sans — ottima leggibilita' su schermo)
- Font self-hosted (no Google Fonts CDN = no cookie terze parti)

### Animazioni

- Scroll reveal morbido sulle sezioni (IntersectionObserver, CSS only dove possibile)
- Parallax leggero sull'hero (solo desktop, rispetta `prefers-reduced-motion`)
- Transizioni pagina smooth (View Transitions API, supportata da Astro nativamente)
- Chatbot: animazione typing, slide-in del pannello

---

## Struttura progetto

```
MonferrinaProject/
├── docs/
│   └── plans/              # Design doc, architecture
├── src/
│   ├── components/         # Componenti Astro/JSX
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ServiceCard.astro
│   │   ├── GalleryGrid.astro
│   │   ├── QuoteForm.astro
│   │   ├── Chatbot.astro   # Island: idrata solo questo componente
│   │   ├── ChatbotFlow.json
│   │   └── CookieBanner.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro         # Home
│   │   ├── chi-siamo.astro
│   │   ├── servizi.astro
│   │   ├── galleria.astro
│   │   ├── preventivo.astro
│   │   ├── contatti.astro
│   │   ├── privacy.astro
│   │   └── cookie.astro
│   ├── styles/
│   │   └── global.css          # Tailwind + custom
│   └── lib/
│       └── sanity.ts           # Client Sanity per fetch contenuti a build time
├── api/
│   └── send-quote.ts           # Vercel Edge Function per form
├── sanity/
│   ├── schema/                 # Schema tipi contenuto Sanity
│   │   ├── service.ts
│   │   ├── galleryItem.ts
│   │   ├── aboutPage.ts
│   │   └── siteSettings.ts
│   └── sanity.config.ts
├── public/
│   ├── fonts/                  # Font self-hosted
│   └── images/                 # Immagini statiche (logo, favicon)
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── tsconfig.json
├── vercel.json
└── .env.example                # RESEND_API_KEY, SANITY_PROJECT_ID, etc.
```

---

## Deploy e dominio

### Dominio

- **Dominio:** `vetreriamonferrina.com` registrato su Cloudflare (~$10/anno)
- **DNS:** Cloudflare (A record → 76.76.21.21, CNAME www → cname.vercel-dns.com, DNS Only)
- **SSL/TLS:** Full (Strict) + HSTS preload
- **CDN/WAF:** Cloudflare Free (Bot Fight, AI Bot Blocking, Page Shield)

### Deploy

- Repository Git (GitHub)
- Push su `main` → Vercel builda e deploya automaticamente
- Preview deploy su ogni branch/PR
- Sanity webhook → triggera rebuild su contenuto aggiornato

### Checklist pre-lancio

- [x] Dominio registrato e DNS configurato (vetreriamonferrina.com su Cloudflare, DNS Only)
- [x] HTTPS attivo (automatico Vercel + Cloudflare Full Strict)
- [x] Privacy policy compilata con dati reali
- [x] Cookie banner funzionante
- [x] Footer con dati legali completi (P.IVA, ragione sociale, sede)
- [ ] Form testato end-to-end (invio → email ricevuta) — Resend configurato, da testare
- [x] Chatbot testato su mobile e desktop
- [x] Lighthouse 96-100 su tutte le pagine (a11y, BP, SEO) — Performance 81-100
- [x] WCAG 2.1 AA validato (v0.3-v0.4: focus trap, aria-live, contrast, target-size, reduced-motion)
- [x] 142 test E2E verdi + 94 unit test (v0.4)
- [ ] Test su Chrome, Safari, Firefox, mobile iOS/Android
- [x] Contenuti reali — foto galleria, testi chi siamo, servizi + foto famiglia da Sanity
- [x] Immagini ottimizzate (WebP, sharp quality 80, lazy/eager, sizes responsive)
- [x] Meta tags SEO + Open Graph per condivisione social
- [x] robots.txt e sitemap.xml generati
- [x] Sanity Studio deployato (vetreriamonferrina.sanity.studio)
- [x] Google Business Profile: sito web aggiunto
- [ ] Google Search Console configurato

---

## Cosa serve dalla famiglia

Prima di iniziare lo sviluppo, servono questi input:

1. **Logo** (se esiste) — anche foto del cartello/insegna va bene
2. **Foto** — laboratorio, lavori fatti, team, vetrina. Anche da cellulare vanno bene
3. **Lista servizi** — cosa fanno e cosa NON fanno
4. **Testo "chi siamo"** — storia, da quanto esistono, chi sono. Anche a voce, poi si sistema
5. **Orari di apertura**
6. **Email per i preventivi** — la mail esistente dove far arrivare le richieste
7. **P.IVA e ragione sociale** — recuperabili online se non li danno

Punti 6 e 7 sono gli unici bloccanti. Tutto il resto si puo' riempire dopo.
