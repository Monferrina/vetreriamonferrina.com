import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs';
import { websiteGroup } from './groups.check';

// Liveness check dell'API preventivi — SILENZIOSO (niente mail reali) e affidabile.
//
// Usa il meccanismo `dryRun` dell'API (src/lib/send-quote.ts, step 4): un body
// valido con `dryRun: true` passa la validazione e l'API risponde 200
// `{"success":true,"dryRun":true}` SALTANDO l'invio email. Verifica così l'intero
// percorso (parsing + validazione + handler) senza inviare preventivi falsi.
//
// Punta all'origine Vercel diretta: il Worker Cloudflare corrompe i body POST
// chunked di Checkly, perdendo campi del payload (era la causa sia dei falsi 400
// sia delle mail false: senza `dryRun`/honeypot nel body corrotto, l'email partiva).
// Bypassandolo, il body arriva integro e `dryRun` viene rispettato.
//
// Origin lockdown: colpendo l'origin diretto NON si passa dal Worker (che timbra
// `x-origin-verify`). Lo forniamo a mano (secret Checkly ORIGIN_VERIFY_SECRET, stesso
// valore di CF/Vercel) così il middleware in produzione accetta questa richiesta sull'API.
// Email-safe: secret errato → 403 (nessuna mail, il 403 precede l'handler).
new ApiCheck('send-quote-api', {
  name: 'Send Quote API',
  group: websiteGroup,
  activated: true,
  frequency: Frequency.EVERY_30M,
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    url: 'https://vetreriamonferrina.vercel.app/api/send-quote',
    method: 'POST',
    followRedirects: true,
    skipSSL: false,
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Origin', value: 'https://vetreriamonferrina.com' },
      { key: 'x-origin-verify', value: '{{ORIGIN_VERIFY_SECRET}}' },
    ],
    body: JSON.stringify({
      name: 'Checkly Monitor',
      email: 'monitor@checkly.com',
      phone: '0000000000',
      serviceType: 'box-doccia',
      description: 'Monitoraggio automatico Checkly - dry run, ignorare',
      measurements: '100x100 cm',
      privacy: true,
      dryRun: true,
    }),
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.dryRun').equals(true),
    ],
  },
  runParallel: false,
});
