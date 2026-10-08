import process from 'node:process';

// Un solo predicato per "produzione", condiviso da rate limit, endpoint del form e pagina del
// preventivo: dove partono email vere si usano chiavi Turnstile vere, dove si usano quelle di
// test non parte niente. VERCEL_ENV distingue production da preview (NODE_ENV è 'production' su
// entrambi); senza VERCEL_ENV (variabili di sistema spente) ripiega su NODE_ENV, così in
// produzione l'email parte invece di sparire in silenzio.
export function isProduction(): boolean {
  return (process.env.VERCEL_ENV || process.env.NODE_ENV) === 'production';
}
