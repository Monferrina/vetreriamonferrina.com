import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import Footer from '../../src/components/Footer.astro';

describe('Footer', () => {
  test('contiene la ragione sociale', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);

    expect(html).toContain('Vetreria Monferrina di Fioravanti Giuseppe');
  });

  test('contiene sede legale e P.IVA', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);

    expect(html).toContain('Via Lanza 27, 15033 Casale Monferrato (AL)');
    expect(html).toContain('P.IVA: 01234567890');
  });

  test('contiene link privacy e cookie policy', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);

    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cookie"');
    expect(html).toContain('Privacy Policy');
    expect(html).toContain('Cookie Policy');
  });

  test('contiene contatti telefono e email', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);

    expect(html).toContain('href="tel:');
    expect(html).toContain('href="mailto:');
  });

  test('contiene copyright con anno corrente', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);
    const year = new Date().getFullYear();

    expect(html).toContain(`${year}`);
    expect(html).toContain('Vetreria Monferrina');
  });

  test('usa elemento footer semantico', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);

    expect(html).toContain('<footer');
  });
});
