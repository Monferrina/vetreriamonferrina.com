#!/bin/sh
# Diagnosi temporanea TS1: registra ogni rinnovo del token senza il token, poi lo stampa per HawkScan.
risposta=$(curl -sS -w '\n%{http_code}' -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" "$ACTIONS_ID_TOKEN_REQUEST_URL")
github=$(printf '%s\n' "$risposta" | tail -n1)
token=$(printf '%s\n' "$risposta" | sed '$d' | jq -r .value)
vercel=$(curl -s -o /dev/null -w '%{http_code}' -H "x-vercel-trusted-oidc-idp-token: $token" "$APP_HOST/")
echo "$(date -u +%T) github=$github lunghezza=${#token} vercel=$vercel" >> "$RUNNER_TEMP/ts1-diagnosi.log"
printf '%s' "$token" | jq -Rc '{headers: [{"x-vercel-trusted-oidc-idp-token": .}]}'
