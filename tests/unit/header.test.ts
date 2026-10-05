// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import Header from '../../src/components/Header.astro';

describe('Header', () => {
  test('contiene tutti i link di navigazione', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/chi-siamo"');
    expect(html).toContain('href="/servizi"');
    expect(html).toContain('href="/galleria"');
    expect(html).toContain('href="/contatti"');
    expect(html).toContain('href="/preventivo"');
  });

  test('ha aria-label sulla navigazione', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('aria-label="Navigazione principale"');
  });

  test('usa un elemento header semantico', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('<header');
    expect(html).toContain('<nav');
  });

  test('ha il pulsante CTA Preventivo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toMatch(/<a[^>]*href="\/preventivo"[^>]*>\s*Preventivo\s*<\/a>/);
  });

  test('evidenzia il link della pagina corrente', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toMatch(/<a[^>]*href="\/"[^>]*aria-current="page"/);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  });
});
