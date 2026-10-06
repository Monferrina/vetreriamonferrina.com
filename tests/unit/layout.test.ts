// @vitest-environment node
import { expect, test, describe } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import BaseLayout from '../../src/layouts/BaseLayout.astro';
import { renderHtml, renderPage } from './render-page';
import { cspDirectives, cspHeader } from '../../src/lib/csp';
import { sentryOptions } from '../../src/lib/sentry-options';

describe('BaseLayout', () => {
  test('contiene meta tag essenziali', async () => {
    const html = await renderHtml(BaseLayout, '/', {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto</p>' },
    });

    expect(html).toContain('lang="it"');
    expect(html).toContain('<title>Test | Vetreria Monferrina</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('og:title');
    expect(html).toContain('og:locale');
    expect(html).toContain('rel="canonical"');
  });

  test('collega la favicon SVG', async () => {
    const d = await renderPage(BaseLayout, '/', { props: { title: 'Test' } });
    const favicon = d.querySelector('link[rel="icon"][type="image/svg+xml"]');
    expect(favicon?.getAttribute('href')).toBe('/favicon.svg');
  });

  test('include font preload links', async () => {
    const html = await renderHtml(BaseLayout, '/', {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto</p>' },
    });

    expect(html).toContain('/fonts/inter-latin-variable.woff2');
    expect(html).toContain('/fonts/dm-serif-display-latin.woff2');
    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="font"');
  });

  test('include og:image fallback se non specificato', async () => {
    const html = await renderHtml(BaseLayout, '/', {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto</p>' },
    });

    expect(html).toContain('og:image');
    expect(html).toContain('/images/og-image.jpg');
  });

  test('include og:image quando specificato', async () => {
    const html = await renderHtml(BaseLayout, '/', {
      props: { title: 'Test', ogImage: 'https://example.com/image.jpg' },
      slots: { default: '<p>Contenuto</p>' },
    });

    expect(html).toContain('og:image');
    expect(html).toContain('https://example.com/image.jpg');
  });

  test('renderizza il contenuto slot', async () => {
    const html = await renderHtml(BaseLayout, '/', {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto di test</p>' },
    });

    expect(html).toContain('<p>Contenuto di test</p>');
    expect(html).toContain('<main');
  });
});

describe('vercel.json security headers', () => {
  test('contiene tutti gli header di sicurezza', () => {
    const vercelPath = resolve(__dirname, '../../vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    const headers = vercelConfig.headers.find(
      (h: { source: string }) => h.source === '/(.*)'
    ).headers;
    const headerKeys = headers.map((h: { key: string }) => h.key);

    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('Referrer-Policy');
    expect(headerKeys).toContain('Permissions-Policy');
    expect(headerKeys).toContain('Strict-Transport-Security');
  });

  // Il CSP non sta più in vercel.json: due policy si sommano (MDN, "Multiple content security
  // policies") e una con `default-src 'self'` senza hash bloccherebbe gli script inline che
  // Astro hasha. Lo genera Astro (security.csp) per le pagine statiche e il middleware per le
  // risposte on demand, dalle stesse direttive.
  test('vercel.json non porta più un CSP (HawkScan 10055-5: unsafe-inline)', () => {
    const vercelPath = resolve(__dirname, '../../vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    const keys = vercelConfig.headers.flatMap((h: { headers: { key: string }[] }) =>
      h.headers.map((x) => x.key)
    );
    expect(keys).not.toContain('Content-Security-Policy');
  });

  test('la policy condivisa consente solo le risorse necessarie, senza unsafe-inline', () => {
    const csp = cspHeader;

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("connect-src 'self' https://api.open-meteo.com");
    expect(csp).toContain('frame-src https://www.google.com');
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toContain("'unsafe-inline'");
  });

  // Senza l'host di ingest nel CSP il browser blocca gli invii a Sentry e gli errori del
  // browser si perdono senza alcun segnale. Host esatto dell'org, non *.ingest: il wildcard
  // aprirebbe un canale d'uscita verso qualunque org Sentry. L'host atteso viene dal DSN,
  // così un cambio di DSN senza il CSP aggiornato fa fallire il test.
  test('il CSP consente gli invii degli errori a Sentry, solo verso l’org', () => {
    const connectSrc = cspDirectives.find((d) => d.startsWith('connect-src'));

    expect(connectSrc?.split(' ')).toContain(new URL(sentryOptions.dsn).origin);
    expect(connectSrc).not.toContain('*');
  });

  test('HSTS con max-age lungo e preload', () => {
    const vercelPath = resolve(__dirname, '../../vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    const headers = vercelConfig.headers.find(
      (h: { source: string }) => h.source === '/(.*)'
    ).headers;
    const hsts = headers.find((h: { key: string }) => h.key === 'Strict-Transport-Security');

    expect(hsts.value).toContain('max-age=63072000');
    expect(hsts.value).toContain('includeSubDomains');
    expect(hsts.value).toContain('preload');
  });
});
