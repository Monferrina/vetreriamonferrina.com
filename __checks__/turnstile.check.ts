import path from 'node:path';
import process from 'node:process';
import { ApiCheck, AssertionBuilder, BrowserCheck } from 'checkly/constructs';
import { avvisiSito, websiteGroup } from './groups.check';

// B6 (Z1): il widget Turnstile compare su /preventivo e il CSP non blocca niente. Entrypoint
// esplicito, fuori dal testMatch di checkly.config.ts: così il check sta nel gruppo e ha gli
// avvisi (homepage.spec.ts resta fuori per non cambiare il suo logicalId).
new BrowserCheck('turnstile-widget', {
  name: 'Turnstile: widget su /preventivo senza violazioni CSP',
  group: websiteGroup,
  alertChannels: avvisiSito,
  activated: true,
  code: { entrypoint: path.join(__dirname, 'scripts/turnstile-widget.ts') },
});

// B8 (Z1): caso negativo della verifica Turnstile. Corpo valido con un token fittizio e SENZA
// dryRun (che risponde prima di Turnstile, quindi il check in dryRun di api.check.ts non vede
// un Turnstile rotto): il server deve rispondere 403 "Verifica anti-spam non riuscita". Con
// il segreto assente o sbagliato, o con siteverify giù, risponde 503: check rosso, e l'evento
// Sentry lo manda il server. Con una regressione che non blocca più risponde 200: check rosso.
//
// NON è email-safe in quel secondo caso: la validazione precede Turnstile, quindi il corpo
// deve essere valido, e una regressione a fail-open manderebbe questa email alla vetreria a ogni
// run finché non si corregge. Per questo il corpo si dichiara da solo come monitor. Quando è sano:
// 403 prima dell'invio, nessuna email, nessun evento Sentry, una richiesta del rate limit.
// Misurato 07/10/2026: il segreto di produzione risponde al token fittizio con
// invalid-input-response. `shouldFail: true`, stessa forma di send-quote-lockdown.check.ts.
//
// Non gira in `checkly test` sulle PR (checkly.yml): lì il check colpisce la produzione, che può
// non avere ancora il server che il check presuppone, e il POST senza dryRun manda un'email vera
// alla vetreria (successo l'08/10/2026 sulla PR che lo introduceva, due run). Entra con il
// deploy al merge e in `checkly test` fuori dalle PR.
const inPullRequest = process.env.GITHUB_EVENT_NAME === 'pull_request';
if (!inPullRequest)
  new ApiCheck('send-quote-turnstile', {
    name: 'Send Quote API: token Turnstile fittizio → 403',
    group: websiteGroup,
    alertChannels: avvisiSito,
    activated: true,
    shouldFail: true,
    degradedResponseTime: 5000,
    maxResponseTime: 15000,
    request: {
      url: 'https://vetreriamonferrina.vercel.app/api/send-quote',
      method: 'POST',
      followRedirects: false,
      skipSSL: false,
      headers: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Origin', value: 'https://vetreriamonferrina.com' },
        { key: 'x-origin-verify', value: '{{ORIGIN_VERIFY_SECRET}}' },
        { key: 'x-vercel-protection-bypass', value: '{{VERCEL_AUTOMATION_BYPASS_SECRET}}' },
      ],
      body: JSON.stringify({
        name: 'Monitor Checkly',
        email: 'monitor@vetreriamonferrina.com',
        phone: '0000000000',
        serviceType: 'altro',
        description:
          'Controllo automatico Checkly della verifica anti-spam. Se questa email arriva, Turnstile non blocca più gli invii: avvisare chi gestisce il sito.',
        measurements: 'nessuna, controllo automatico',
        privacy: true,
        honeypot: '',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      }),
      assertions: [
        AssertionBuilder.statusCode().equals(403),
        AssertionBuilder.jsonBody('$.error').equals(
          'Verifica anti-spam non riuscita. Riprova o chiamaci.'
        ),
      ],
    },
    runParallel: false,
  });
