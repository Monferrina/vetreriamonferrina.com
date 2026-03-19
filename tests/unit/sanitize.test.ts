import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeFormData,
  escapeHtml,
} from '../../src/lib/sanitize';

describe('sanitizeString', () => {
  it('rimuove newline (previene email header injection)', () => {
    // \r\n becomes two spaces (one per char), then trim doesn't collapse inner spaces
    const result = sanitizeString('test\r\nBcc: spam@evil.com');
    expect(result).not.toContain('\r');
    expect(result).not.toContain('\n');
    expect(result).toBe('test  Bcc: spam@evil.com');
  });

  it('rimuove \\r singolo', () => {
    expect(sanitizeString('test\rinjection')).toBe('test injection');
  });

  it('rimuove \\n singolo', () => {
    expect(sanitizeString('test\ninjection')).toBe('test injection');
  });

  it('escapa tag HTML con entity encoding', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapa angolari da input misti', () => {
    expect(sanitizeString('hello <b>world</b>')).toBe('hello &lt;b&gt;world&lt;/b&gt;');
  });

  it('rimuove javascript: protocol', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
  });

  it('rimuove javascript: con maiuscole miste', () => {
    expect(sanitizeString('JavaScript:alert(1)')).toBe('alert(1)');
  });

  it('rimuove javascript: con MAIUSCOLO', () => {
    expect(sanitizeString('JAVASCRIPT:alert(1)')).toBe('alert(1)');
  });

  it('preserva testo normale', () => {
    expect(sanitizeString('Mario Rossi')).toBe('Mario Rossi');
  });

  it('preserva caratteri speciali italiani', () => {
    expect(sanitizeString('città, perché, più')).toBe('città, perché, più');
  });

  it('preserva numeri e simboli sicuri', () => {
    expect(sanitizeString('120x80 cm, 2.5m')).toBe('120x80 cm, 2.5m');
  });

  it('trimma spazi', () => {
    expect(sanitizeString('  test  ')).toBe('test');
  });

  it('stringa vuota rimane vuota', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('bypass con doppio javascript: viene neutralizzato', () => {
    expect(sanitizeString('javasjavascript:cript:alert(1)')).not.toContain('javascript:');
  });

  it('combinazione di attacchi multipli', () => {
    const malicious = '<script>javascript:alert(1)</script>\r\nBcc: spam@evil.com';
    const result = sanitizeString(malicious);
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('\r');
    expect(result).not.toContain('\n');
    // HTML entities are used instead of raw angle brackets
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });
});

describe('sanitizeEmail', () => {
  it('normalizza e pulisce email', () => {
    expect(sanitizeEmail('  Mario@Example.COM  ')).toBe('mario@example.com');
  });

  it('rimuove caratteri pericolosi', () => {
    const result = sanitizeEmail('test@evil.com\r\nBcc: spam@x.com');
    expect(result).not.toContain('\r');
    expect(result).not.toContain('\n');
  });

  it('rimuove tab', () => {
    const result = sanitizeEmail('test\t@example.com');
    expect(result).not.toContain('\t');
  });

  it('rimuove angolari da email', () => {
    const result = sanitizeEmail('<test@example.com>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toBe('test@example.com');
  });

  it('converte in minuscolo', () => {
    expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });

  it('email vuota rimane vuota', () => {
    expect(sanitizeEmail('')).toBe('');
  });
});

describe('sanitizeFormData', () => {
  it('sanitizza tutti i campi stringa', () => {
    const result = sanitizeFormData({
      name: '<script>alert(1)</script>',
      email: 'TEST@Example.COM',
      privacy: true,
    });
    expect(result.name).not.toContain('<');
    expect(result.email).toBe('test@example.com');
    expect(result.privacy).toBe(true);
  });

  it('preserva valori non-stringa', () => {
    const result = sanitizeFormData({
      name: 'Mario',
      count: 42,
      flag: false,
      nothing: null,
    });
    expect(result.name).toBe('Mario');
    expect(result.count).toBe(42);
    expect(result.flag).toBe(false);
    expect(result.nothing).toBe(null);
  });

  it('applica sanitizeEmail al campo email', () => {
    const result = sanitizeFormData({
      email: '  USER@Example.COM  ',
    });
    expect(result.email).toBe('user@example.com');
  });

  it('applica sanitizeString ai campi non-email', () => {
    const result = sanitizeFormData({
      name: '  Mario <script>  ',
      description: 'test\r\ninjection',
    });
    expect((result.name as string).includes('<')).toBe(false);
    expect((result.description as string).includes('\r')).toBe(false);
    expect((result.description as string).includes('\n')).toBe(false);
  });

  it('oggetto vuoto ritorna oggetto vuoto', () => {
    const result = sanitizeFormData({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('filtra chiavi pericolose per prototype pollution', () => {
    const result = sanitizeFormData({
      __proto__: '{"isAdmin": true}',
      constructor: 'Object',
      prototype: 'evil',
      name: 'Mario',
    });
    expect(result).not.toHaveProperty('__proto__');
    expect(result).not.toHaveProperty('constructor');
    expect(result).not.toHaveProperty('prototype');
    expect(result.name).toBe('Mario');
  });
});

describe('escapeHtml', () => {
  it('escapa tutti i caratteri HTML pericolosi', () => {
    expect(escapeHtml('<script>"test" & \'xss\'</script>')).toBe(
      '&lt;script&gt;&quot;test&quot; &amp; &#x27;xss&#x27;&lt;/script&gt;'
    );
  });

  it('non modifica testo sicuro', () => {
    expect(escapeHtml('Mario Rossi 120x80')).toBe('Mario Rossi 120x80');
  });
});
