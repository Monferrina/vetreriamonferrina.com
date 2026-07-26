// @vitest-environment node
import { expect, test, describe } from 'vitest';
import { quoteRequestEmail } from '../../src/lib/email-templates/quote-request';

// L'IP arriva da cf-connecting-ip (header, non passa da sanitizeFormData):
// deve essere escapato prima di finire nel markup dell'email (finding M-1).
describe('quoteRequestEmail — escaping', () => {
  const base = {
    name: 'Mario',
    phone: '012345',
    email: 'a@b.it',
    serviceType: 'Box doccia',
    description: 'test',
    measurements: '100x200',
  };

  test('escapa un IP malevolo invece di iniettarlo come HTML', () => {
    const html = quoteRequestEmail({ ...base, ip: '1.2.3.4<script>alert(1)</script>' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('lascia intatto un IP normale', () => {
    const html = quoteRequestEmail({ ...base, ip: '203.0.113.7' });
    expect(html).toContain('203.0.113.7');
  });

  // Da quando sanitizeFormData non escapa piu' (l'escape in ingresso gonfiava i conteggi
  // di lunghezza), questo template e' l'UNICA barriera fra il testo del cliente e il
  // markup dell'email: ogni campo interpolato dev'essere coperto, non solo l'IP.
  const CAMPI = ['name', 'phone', 'email', 'serviceType', 'description', 'measurements'] as const;

  test.each(CAMPI)('escapa il markup iniettato nel campo %s', (campo) => {
    const html = quoteRequestEmail({
      ...base,
      [campo]: '<img src=x onerror=alert(1)>',
      ip: '1.1.1.1',
    });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  test("un apostrofo nel nome resta leggibile (niente &#x27; nell'email)", () => {
    const html = quoteRequestEmail({ ...base, name: "Vetreria dell'Angolo", ip: '1.1.1.1' });
    expect(html).toContain("Vetreria dell'Angolo");
  });
});
