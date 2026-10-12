# Hook di zap-baseline.py: stampa metodo, URL e codice di ogni richiesta, mai gli header
# (in CI contengono il token OIDC), e fa fallire la scansione se non ha raggiunto il sito.
# Senza la guardia, con il token sbagliato la scansione girava solo sul login di Vercel
# (302 verso vercel.com/sso-api) e usciva 0 con 66 regole PASS (misurato il 12/10/2026).
import collections
import sys
from urllib.parse import urlsplit

sito = None
esito = 'non raggiunto: conteggio delle risposte non eseguito'


def zap_started(zap, target):
    global sito
    sito = urlsplit(target).netloc


def zap_pre_shutdown(zap):
    global esito
    codici = collections.Counter()
    for m in zap.core.messages():
        metodo, url = m['requestHeader'].split('\r\n', 1)[0].split(' ')[:2]
        stato = m['responseHeader'].split('\r\n', 1)[0].split(' ')
        codice = stato[1] if len(stato) > 1 else '-'
        if urlsplit(url).netloc == sito:
            codici[codice] += 1
        print('URL', metodo, url, codice)
    print('CODICI', sito, dict(codici))
    # Il sito non ha pagine 302, 401 o 403: li mandano solo la protezione di Vercel o un token
    # scaduto a meta' scansione.
    respinte = sum(codici[c] for c in ('302', '401', '403'))
    esito = (
        f'non raggiunto: {codici["200"]} risposte 200, {respinte} tra 302, 401 e 403'
        if not codici['200'] or respinte
        else None
    )


def pre_exit(fail_count, warn_count, pass_count):
    if esito:
        print(esito)
        sys.exit(3)
