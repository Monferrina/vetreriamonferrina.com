// @vitest-environment node
import { expect, test, describe } from 'vitest';
import { renderHtml } from './render-page';
import Footer from '../../src/components/Footer.astro';

describe('Footer', () => {
  test('contiene la ragione sociale', async () => {
    const html = await renderHtml(Footer, '/');

    expect(html).toContain('Vetreria Monferrina di Fioravanti Giuseppe');
  });

  test('contiene sede legale e P.IVA', async () => {
    const html = await renderHtml(Footer, '/');

    expect(html).toContain('Strada Statale 31, 98/C');
    expect(html).toContain('15033 Casale Monferrato (AL)');
    expect(html).toContain('P.IVA: 01574530067');
  });

  test('contiene link privacy e cookie policy', async () => {
    const html = await renderHtml(Footer, '/');

    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cookie"');
    expect(html).toContain('Privacy Policy');
    expect(html).toContain('Cookie Policy');
  });

  test('contiene contatti telefono e email', async () => {
    const html = await renderHtml(Footer, '/');

    expect(html).toContain('href="tel:');
    expect(html).toContain('href="mailto:');
  });

  test('contiene copyright con anno corrente', async () => {
    const html = await renderHtml(Footer, '/');
    const year = new Date().getFullYear();

    expect(html).toContain(`&copy; ${year}`);
    expect(html).toContain('Vetreria Monferrina');
  });

  test('usa elemento footer semantico', async () => {
    const html = await renderHtml(Footer, '/');

    expect(html).toContain('<footer');
  });
});
