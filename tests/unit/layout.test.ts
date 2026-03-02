import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import BaseLayout from '../../src/layouts/BaseLayout.astro';

describe('BaseLayout', () => {
  test('contiene meta tag essenziali', async () => {
    const container = await AstroContainer.create({
      astroConfig: {
        site: 'https://vetreriamonferrina.com',
      },
    });
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto</p>' },
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('lang="it"');
    expect(html).toContain('<title>Test | Vetreria Monferrina</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('og:title');
    expect(html).toContain('og:locale');
    expect(html).toContain('rel="canonical"');
  });

  test('include font preload links', async () => {
    const container = await AstroContainer.create({
      astroConfig: {
        site: 'https://vetreriamonferrina.com',
      },
    });
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto</p>' },
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('/fonts/inter-latin-variable.woff2');
    expect(html).toContain('/fonts/dm-serif-display-latin.woff2');
    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="font"');
  });

  test('include og:image fallback se non specificato', async () => {
    const container = await AstroContainer.create({
      astroConfig: {
        site: 'https://vetreriamonferrina.com',
      },
    });
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto</p>' },
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('og:image');
    expect(html).toContain('/images/og-image.jpg');
  });

  test('include og:image quando specificato', async () => {
    const container = await AstroContainer.create({
      astroConfig: {
        site: 'https://vetreriamonferrina.com',
      },
    });
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Test', ogImage: 'https://example.com/image.jpg' },
      slots: { default: '<p>Contenuto</p>' },
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('og:image');
    expect(html).toContain('https://example.com/image.jpg');
  });

  test('renderizza il contenuto slot', async () => {
    const container = await AstroContainer.create({
      astroConfig: {
        site: 'https://vetreriamonferrina.com',
      },
    });
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Test' },
      slots: { default: '<p>Contenuto di test</p>' },
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('<p>Contenuto di test</p>');
    expect(html).toContain('<main');
  });
});

describe('global.css', () => {
  test('contiene @font-face con font-display: swap', () => {
    const cssPath = resolve(__dirname, '../../src/styles/global.css');
    const css = readFileSync(cssPath, 'utf-8');

    expect(css).toContain('font-display: swap');
    expect(css).toContain('DM Serif Display');
    expect(css).toContain('Inter');
    expect(css).toContain('inter-latin-variable.woff2');
    expect(css).toContain('dm-serif-display-latin.woff2');
  });
});

describe('vercel.json security headers', () => {
  test('contiene tutti gli header di sicurezza', () => {
    const vercelPath = resolve(__dirname, '../../vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    const headers = vercelConfig.headers[0].headers;
    const headerKeys = headers.map((h: { key: string }) => h.key);

    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('Referrer-Policy');
    expect(headerKeys).toContain('Permissions-Policy');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('Content-Security-Policy');
  });

  test('CSP consente solo risorse necessarie', () => {
    const vercelPath = resolve(__dirname, '../../vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    const headers = vercelConfig.headers[0].headers;
    const csp = headers.find((h: { key: string }) => h.key === 'Content-Security-Policy');

    expect(csp.value).toContain("default-src 'self'");
    expect(csp.value).toContain("script-src 'self'");
    expect(csp.value).toContain("font-src 'self'");
    expect(csp.value).toContain("img-src 'self' data: https://cdn.sanity.io");
    expect(csp.value).toContain("connect-src 'self' https://api.open-meteo.com");
    expect(csp.value).toContain("frame-ancestors 'none'");
    expect(csp.value).toContain("form-action 'self'");
  });

  test('HSTS con max-age lungo e preload', () => {
    const vercelPath = resolve(__dirname, '../../vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf-8'));
    const headers = vercelConfig.headers[0].headers;
    const hsts = headers.find((h: { key: string }) => h.key === 'Strict-Transport-Security');

    expect(hsts.value).toContain('max-age=63072000');
    expect(hsts.value).toContain('includeSubDomains');
    expect(hsts.value).toContain('preload');
  });
});
