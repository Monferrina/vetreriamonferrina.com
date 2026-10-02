#!/usr/bin/env bash
# SessionEnd: ferma i server lasciati accesi da questo progetto (astro dev,
# astro preview, webServer di Playwright). Per PID e solo con la cartella di
# lavoro nel progetto: un pkill -f sul nome fermava anche i server di altre repo.
# La cartella viene da CLAUDE_PROJECT_DIR: la cwd di un hook non è documentata
# (https://code.claude.com/docs/en/hooks).
# Senza una cartella valida esce: con dir vuota o "/" il confronto qui sotto
# diventerebbe /* e il kill colpirebbe ogni processo in ascolto (systemd, sshd).
dir=$(realpath -e "${CLAUDE_PROJECT_DIR:-}" 2>/dev/null) || exit 0
[ -n "$dir" ] && [ "$dir" != / ] || exit 0

# lsof -t stampa solo PID: da `ss -p` un processo chiamato "pid=123" infilava
# il PID 123 nell'elenco.
for pid in $(lsof -t -iTCP -sTCP:LISTEN | sort -u); do
  case "$(readlink "/proc/$pid/cwd")/" in
    "$dir"/*) kill "$pid" ;;
  esac
done 2>/dev/null

# Il server in background di Astro 7 tiene un lock file (`astro dev --help`,
# --ignore-lock): lo chiude `astro dev stop`, ~0,6 s (~0,9 con npx; misurato
# 2/10/2026, Astro 7.3.5). Il timeout di 10 s in settings.json lo porta fuori
# dal budget di 1,5 s che SessionEnd dà a un hook senza timeout.
cd "$dir" && node_modules/.bin/astro dev stop >/dev/null 2>&1
true
