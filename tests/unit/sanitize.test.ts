import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeEmail, sanitizeFormData } from '../../src/lib/sanitize';

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

  it('rimuove tag HTML', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('rimuove angolari da input misti', () => {
    expect(sanitizeString('hello <b>world</b>')).toBe('hello bworld/b');
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
    expect(sanitizeString("citta', perche', piu'")).toBe("citta', perche', piu'");
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

  it('combinazione di attacchi multipli', () => {
    const malicious = '<script>javascript:alert(1)</script>\r\nBcc: spam@evil.com';
    const result = sanitizeString(malicious);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('\r');
    expect(result).not.toContain('\n');
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
});
