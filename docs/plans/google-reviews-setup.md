# Google Reviews — Guida Configurazione

> Questa guida spiega come collegare le recensioni Google alla Vetreria Monferrina.
> Le recensioni vengono scaricate a build-time (gratis) e mostrate nel sito.

## Costi

**Gratis.** Google Cloud offre **$200/mese di credito gratuito** per Maps Platform.

| Endpoint | Costo per richiesta | Con $200/mese |
|---|---|---|
| Place Details (Basic) | $0.00 (gratis) | Illimitato |
| Place Details (Contact) | $0.003 | ~66.600 richieste |
| Place Details (Atmosphere — include reviews) | $0.005 | ~40.000 richieste |

Noi usiamo il campo `reviews` che rientra nella categoria **Atmosphere** ($0.005/richiesta).
Con un fetch al giorno: **30 richieste/mese = $0.15/mese** — ampiamente coperto dal credito gratuito.

**Costo effettivo: $0/mese** (anche con fetch giornaliero automatico via CI).

---

## Step 1: Creare un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Clicca **"Crea progetto"** (o "Select a project" → "New Project")
3. Nome progetto: `vetreria-monferrina` (qualsiasi nome va bene)
4. Clicca **"Crea"**

## Step 2: Abilitare la Places API

1. Nel progetto appena creato, vai su **API e servizi → Libreria**
2. Cerca **"Places API"** (NON "Places API (New)" — serve la versione legacy per i reviews)
3. Clicca **"Abilita"**

## Step 3: Creare una API Key

1. Vai su **API e servizi → Credenziali**
2. Clicca **"+ Crea credenziali" → "Chiave API"**
3. Copia la chiave (simile a: `AIzaSyD...xxxxx`)
4. **IMPORTANTE — Limita la chiave:**
   - Clicca sulla chiave appena creata
   - In "Restrizioni API" seleziona **"Limita chiave"**
   - Seleziona solo **"Places API"**
   - In "Restrizioni applicazione" seleziona **"Nessuna"** (uso server-side a build time)
   - Salva

## Step 4: Trovare il Place ID della Vetreria

1. Vai su [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Cerca **"Vetreria Monferrina Casale Monferrato"**
3. Copia il Place ID che appare (formato: `ChIJ...`)
4. Se non trovi nulla, prova a cercare l'indirizzo esatto: **Strada Statale 31, 98/C, Casale Monferrato**

> **Alternativa**: cerca direttamente su Google Maps, clicca sull'attivita', e nell'URL troverai il Place ID.

## Step 5: Testare il fetch delle recensioni

```bash
# Dal terminale, nella root del progetto:
GOOGLE_PLACES_API_KEY=AIzaSy... GOOGLE_PLACE_ID=ChIJ... node scripts/fetch-reviews.mjs
```

Output atteso:
```
Fetching reviews for place: ChIJ...
Saved 4 positive reviews (of 5 total) to src/data/reviews.json
Overall rating: 4.1/5 (18 reviews)
```

Il file `src/data/reviews.json` viene aggiornato con le recensioni reali.

## Step 6: Verificare e buildare

```bash
# Controlla il JSON generato
cat src/data/reviews.json

# Build del sito (le recensioni verranno incluse)
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
    - cron: '0 6 * * *'  # Ogni giorno alle 6:00 UTC
  workflow_dispatch: {}    # Permette esecuzione manuale

jobs:
  update-reviews:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Fetch recensioni
        env:
          GOOGLE_PLACES_API_KEY: ${{ secrets.GOOGLE_PLACES_API_KEY }}
          GOOGLE_PLACE_ID: ${{ secrets.GOOGLE_PLACE_ID }}
        run: node scripts/fetch-reviews.mjs

      - name: Commit e push se cambiate
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/data/reviews.json
          git diff --staged --quiet || git commit -m "chore: aggiorna recensioni Google" && git push
```

### Manualmente

Basta eseguire:
```bash
GOOGLE_PLACES_API_KEY=xxx GOOGLE_PLACE_ID=yyy node scripts/fetch-reviews.mjs
git add src/data/reviews.json
git commit -m "chore: aggiorna recensioni Google"
git push
```

Vercel fara' il rebuild automatico dopo il push.

---

## Note tecniche

- **Solo recensioni >= 4 stelle** vengono incluse (filtro nello script)
- **Nomi abbreviati** per privacy GDPR: "Mario Rossi" → "Mario R."
- **Validazione a build-time**: se il JSON e' corrotto, il build fallisce con errore chiaro
- **Testo troncato** a 500 caratteri per sicurezza
- **Massimo 50 recensioni** per evitare pagine troppo pesanti
- **Google Places API** restituisce al massimo 5 recensioni per richiesta (limite dell'API)
- Il rating complessivo e il numero totale di recensioni vengono sempre aggiornati

## Troubleshooting

| Problema | Soluzione |
|---|---|
| `Error: GOOGLE_PLACES_API_KEY is required` | Imposta la variabile d'ambiente |
| `Error: GOOGLE_PLACE_ID is required` | Trova il Place ID (vedi Step 4) |
| `Google API error: REQUEST_DENIED` | La chiave API non ha Places API abilitata (vedi Step 2) |
| `Google API error: INVALID_REQUEST` | Place ID non valido — verificalo su Place ID Finder |
| `0 positive reviews` | Tutte le recensioni sono sotto 4 stelle, oppure il place non ha recensioni |
| Il sito non si aggiorna | Dopo il push, Vercel fa il rebuild. Aspetta 1-2 minuti |

## Sicurezza

- La API key **non va mai committata** nel repository
- Usare variabili d'ambiente o GitHub Secrets
- La chiave e' limitata alla sola Places API (non puo' fare altro)
- Lo script gira solo a build-time (server-side), la chiave non finisce mai nel browser
- Il file `reviews.json` contiene solo dati pubblici (visibili a chiunque su Google)
