# Google Places — Guida Configurazione

> Questa guida spiega come collegare i dati Google (recensioni, orari, foto)
> alla Vetreria Monferrina. Tutto viene scaricato a build-time (gratis).

## Costi

**Gratis.** Google Cloud offre **$200/mese di credito gratuito** per Maps Platform (per sempre).
I primi 90 giorni hanno anche $300 di credito aggiuntivo.

| Endpoint                                     | Costo per richiesta | Con $200/mese     |
| -------------------------------------------- | ------------------- | ----------------- |
| Place Details (Basic)                        | $0.00 (gratis)      | Illimitato        |
| Place Details (Contact)                      | $0.003              | ~66.600 richieste |
| Place Details (Atmosphere — include reviews) | $0.005              | ~40.000 richieste |
| Place Photos                                 | $0.007              | ~28.500 richieste |

Noi facciamo **1 chiamata a build-time** che recupera tutto (recensioni, orari, foto).
Con un fetch al giorno: **30 richieste/mese = ~$0.15/mese** — ampiamente coperto dal credito.

**Costo effettivo: $0/mese** (anche con fetch giornaliero automatico via CI).

## Soglie consigliate (IMPORTANTE)

| Azione                 | Dove in Google Cloud Console   | Valore                          |
| ---------------------- | ------------------------------ | ------------------------------- |
| Quota Places API (New) | IAM e amministrazione → Quote  | 50 req/giorno                   |
| Quota Places API       | IAM e amministrazione → Quote  | 50 req/giorno                   |
| Budget alert           | Fatturazione → Budget e avvisi | $5/mese (notifica a 50% e 100%) |

Queste soglie proteggono da usi accidentali o abusi. Docs: https://docs.cloud.google.com/docs/quotas/view-manage

---

## Step 1: Creare un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca **"Crea progetto"** (o "Select a project" → "New Project")
3. Nome progetto: `vetreria-monferrina` (qualsiasi nome va bene)
4. Clicca **"Crea"**

## Step 2: Abilitare le API

1. Nel progetto appena creato, vai su **API e servizi → Libreria**
2. Cerca e abilita **"Places API (New)"** — versione moderna, singola chiamata per tutto
3. Cerca e abilita **"Places API"** — versione legacy (backup)

## Step 3: Creare una API Key

1. Vai su **API e servizi → Credenziali**
2. Clicca **"+ Crea credenziali" → "Chiave API"**
3. Copia la chiave (simile a: `AIzaSyD...xxxxx`)
4. **IMPORTANTE — Limita la chiave:**
   - Clicca sulla chiave appena creata
   - In "Restrizioni API" seleziona **"Limita chiave"**
   - Seleziona **"Places API"** e **"Places API (New)"**
   - In "Restrizioni applicazione" seleziona **"Nessuna"** (uso server-side a build time)
   - Salva

## Step 4: Trovare il Place ID della Vetreria

1. Vai su [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Cerca **"Vetreria Monferrina Casale Monferrato"**
3. Copia il Place ID che appare (formato: `ChIJ...`)
4. Se non trovi nulla, prova a cercare l'indirizzo esatto: **Strada Statale 31, 98/C, Casale Monferrato**

> **Alternativa**: cerca direttamente su Google Maps, clicca sull'attivita', e nell'URL troverai il Place ID.

## Step 5: Testare il fetch dei dati

```bash
# Dal terminale, nella root del progetto:
GOOGLE_PLACES_API_KEY=AIzaSy... node scripts/fetch-place-data.mjs
```

Output atteso:

```
Fetching place data from Places API (New)...
  Reviews: 3 positive (of 5 total)
  Hours: 3 time slots
  Photos: 10 downloaded to public/images/google-photos/

Done! Rating: 4.4/5 (34 reviews)
```

File generati:

- `src/data/reviews.json` — recensioni filtrate
- `src/data/opening-hours.json` — orari di apertura
- `src/data/place-photos.json` — metadata foto (gitignored)
- `public/images/google-photos/` — 10 foto scaricate localmente

## Step 6: Verificare e buildare

```bash
# Controlla i JSON generati
cat src/data/reviews.json
cat src/data/opening-hours.json

# Build del sito (i dati verranno inclusi)
npm run build
```

## Step 7: Automatizzare (opzionale)

### Con GitHub Actions (consigliato)

Aggiungi i secrets nel repository GitHub:

- `GOOGLE_PLACES_API_KEY` → la chiave API
- `GOOGLE_PLACE_ID` → il Place ID

Poi crea un workflow che ogni giorno:

1. Esegue `scripts/fetch-reviews.mjs`
2. Committa se ci sono cambiamenti
3. Triggera il rebuild su Vercel

Esempio `.github/workflows/update-reviews.yml`:

```yaml
name: Aggiorna Recensioni Google
on:
  schedule:
    - cron: '0 6 * * *' # Ogni giorno alle 6:00 UTC
  workflow_dispatch: {} # Permette esecuzione manuale

jobs:
  update-reviews:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Fetch dati Google Places
        env:
          GOOGLE_PLACES_API_KEY: ${{ secrets.GOOGLE_PLACES_API_KEY }}
        run: node scripts/fetch-place-data.mjs

      - name: Commit e push se cambiate
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/data/reviews.json src/data/opening-hours.json public/images/google-photos/
          git diff --staged --quiet || git commit -m "chore: aggiorna dati Google Places" && git push
```

### Manualmente

Basta eseguire:

```bash
GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-place-data.mjs
git add src/data/reviews.json src/data/opening-hours.json public/images/google-photos/
git commit -m "chore: aggiorna dati Google Places"
git push
```

Vercel fara' il rebuild automatico dopo il push.

---

## Note tecniche

- **Script unificato** `fetch-place-data.mjs` — una sola chiamata API per tutto
- **Places API (New)** — endpoint moderno, headers `X-Goog-Api-Key` e `X-Goog-FieldMask`
- **Solo recensioni >= 4 stelle** vengono incluse (filtro nello script)
- **Nomi abbreviati** per privacy GDPR: "Mario Rossi" → "Mario R."
- **Google Places API** restituisce al massimo 5 recensioni per richiesta (limite dell'API)
- **Foto scaricate localmente** — nessun URL con API key nei file committati
- **Orari di apertura** — usati nella pagina contatti con fallback chain (Sanity → Google → statico)
- **Place ID**: `ChIJcx_Q1ESwh0cRqv3FdLTrU1w` (hardcoded come default nello script)
- Il rating complessivo e il numero totale di recensioni vengono sempre aggiornati

## Troubleshooting

| Problema                                   | Soluzione                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `Error: GOOGLE_PLACES_API_KEY is required` | Imposta la variabile d'ambiente                                            |
| `Error: GOOGLE_PLACE_ID is required`       | Trova il Place ID (vedi Step 4)                                            |
| `Google API error: REQUEST_DENIED`         | La chiave API non ha Places API abilitata (vedi Step 2)                    |
| `Google API error: INVALID_REQUEST`        | Place ID non valido — verificalo su Place ID Finder                        |
| `0 positive reviews`                       | Tutte le recensioni sono sotto 4 stelle, oppure il place non ha recensioni |
| Il sito non si aggiorna                    | Dopo il push, Vercel fa il rebuild. Aspetta 1-2 minuti                     |

## Sicurezza

- La API key **non va mai committata** nel repository
- Usare variabili d'ambiente o GitHub Secrets
- La chiave e' limitata a Places API + Places API (New) nella Google Cloud Console
- Lo script gira solo a build-time (server-side), la chiave non finisce mai nel browser
- `place-photos.json` e' in `.gitignore` per cautela
- I file JSON committati contengono solo dati pubblici (visibili a chiunque su Google)
- **Impostare quote GCP**: 50 req/giorno + budget alert $5/mese
- **Futuro**: quando si usa Google Maps JS lato client, aggiungere Firebase App Check
  - Docs: https://developers.google.com/maps/documentation/javascript/places-app-check
