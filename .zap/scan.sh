#!/bin/sh
# Scansione ZAP baseline (spider + regole passive, nessun attacco) di un URL del sito.
# In CI (zap.yml) gira sulla preview della PR con il token OIDC in ZAP_AUTH_HEADER_VALUE;
# in locale sul sito vero: .zap/scan.sh https://vetreriamonferrina.com (quando e perché: CONTRIBUTING).
set -eu
target=$1
dir=$(dirname "$0")
wrk=$(mktemp -d)
trap 'rm -rf "$wrk"' EXIT
cp "$dir/hook.py" "$dir/rules.tsv" "$wrk"/
# Il container gira come utente zap e deve leggere e scrivere; sticky bit: gli altri utenti
# della macchina non possono sostituire hook.py, che gira accanto al token.
chmod 1777 "$wrk"
docker run --rm --ulimit core=0 -v "$wrk:/zap/wrk/:rw" \
  -e ZAP_AUTH_HEADER -e ZAP_AUTH_HEADER_VALUE -e ZAP_AUTH_HEADER_SITE \
  ghcr.io/zaproxy/zaproxy@sha256:7aaa659b0d43078febd82e29bad112285c370727e86ab8340444220e17d9f0d2 \
  zap-baseline.py -t "$target" -c rules.tsv --hook=/zap/wrk/hook.py -s
