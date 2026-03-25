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
    expect(html).toContain('<ul');
    expect(html).toContain('<li');
  });

  test('ha il pulsante CTA Preventivo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('Preventivo');
    expect(html).toContain('bg-primary');
    expect(html).toContain('rounded-full');
  });

  test('header e sticky con backdrop blur', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('sticky');
    expect(html).toContain('top-0');
    expect(html).toContain('z-50');
    expect(html).toContain('backdrop-blur');
  });

  test('non contiene il menu hamburger (sostituito da BottomNav)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).not.toContain('data-menu-toggle');
    expect(html).not.toContain('data-mobile-menu');
  });

  test('evidenzia il link della pagina corrente', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header, {
      request: new Request('https://vetreriamonferrina.com/'),
    });

    expect(html).toContain('aria-current="page"');
  });
});
