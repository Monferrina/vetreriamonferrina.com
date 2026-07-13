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
});
