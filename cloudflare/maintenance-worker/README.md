# Maintenance Mode Worker

Cloudflare Worker che gestisce la modalità manutenzione per vetreriamonferrina.com.

## Come funziona

Il worker intercetta tutte le richieste prima che arrivino a Vercel. Quando la manutenzione è attiva, serve la pagina `/maintenance` con status 503. Quando è disattiva, fa un semplice passthrough.

## Deploy

Il Worker è **collegato a GitHub** (Cloudflare Workers Builds): ogni push su `main`
che tocca `cloudflare/maintenance-worker/` fa partire build + deploy automatici.
Niente più `wrangler deploy` a mano.

- `keep_vars = true` nel `wrangler.toml` preserva le variabili impostate da dashboard
  (es. `MAINTENANCE_ENABLED`) a ogni deploy; i secret non vengono mai toccati.
- Setup una-tantum (se serve rideployare a mano): `npx wrangler login && npx wrangler deploy`.

## Toggle manutenzione

### Attivare (effetto immediato, zero deploy)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → `maintenance-mode`
2. Settings → Variables and Secrets
3. Impostare `MAINTENANCE_ENABLED` a `true`

### Disattivare

Stesso percorso, impostare `MAINTENANCE_ENABLED` a `false`.

## Note

- Il worker usa il free tier di Cloudflare (100.000 req/giorno)
- La pagina di manutenzione viene servita da Vercel (`/maintenance`)
- Le API rispondono con JSON 503
- Il passthrough quando la manutenzione è OFF è trasparente
