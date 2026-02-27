import { describe, it, expect } from 'vitest';
import { validateQuoteForm, VALID_SERVICE_TYPES } from '../../src/lib/validation';
import { services } from '../../src/data/services';

describe('validateQuoteForm', () => {
  const validData = {
    name: 'Mario Rossi',
    phone: '+39 0142 123456',
    email: 'mario@example.com',
    serviceType: 'box-doccia',
    description: 'Vorrei un box doccia su misura',
    measurements: '120x80',
    privacy: true,
    honeypot: '',
  };

  it('dati validi: nessun errore', () => {
    expect(validateQuoteForm(validData)).toHaveLength(0);
  });

  it('honeypot compilato: bot detected', () => {
    const errors = validateQuoteForm({ ...validData, honeypot: 'spam' });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('honeypot');
    expect(errors[0].message).toBe('Bot detected');
  });

  it('honeypot compilato: ritorna solo errore honeypot (nessun altro errore)', () => {
    const errors = validateQuoteForm({
      ...validData,
      honeypot: 'spam',
      name: '',
      email: 'bad',
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('honeypot');
  });

  it('nome vuoto: errore', () => {
    const errors = validateQuoteForm({ ...validData, name: '' });
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('nome troppo corto: errore', () => {
    const errors = validateQuoteForm({ ...validData, name: 'A' });
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('nome troppo lungo: errore', () => {
    const errors = validateQuoteForm({ ...validData, name: 'A'.repeat(101) });
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('nome con solo spazi: errore', () => {
    const errors = validateQuoteForm({ ...validData, name: '   ' });
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('email malformata: errore', () => {
    const errors = validateQuoteForm({ ...validData, email: 'not-an-email' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('email vuota: errore', () => {
    const errors = validateQuoteForm({ ...validData, email: '' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('email senza dominio: errore', () => {
    const errors = validateQuoteForm({ ...validData, email: 'test@' });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('tipo servizio invalido: errore', () => {
    const errors = validateQuoteForm({ ...validData, serviceType: 'hacking' });
    expect(errors.some((e) => e.field === 'serviceType')).toBe(true);
  });

  it('tipo servizio vuoto: errore', () => {
    const errors = validateQuoteForm({ ...validData, serviceType: '' });
    expect(errors.some((e) => e.field === 'serviceType')).toBe(true);
  });

  it('tutti i tipi servizio validi passano', () => {
    for (const st of VALID_SERVICE_TYPES) {
      const errors = validateQuoteForm({ ...validData, serviceType: st });
      expect(errors.some((e) => e.field === 'serviceType')).toBe(false);
    }
  });

  it('VALID_SERVICE_TYPES include tutti gli slug dei servizi + altro', () => {
    for (const s of services) {
      expect(VALID_SERVICE_TYPES).toContain(s.slug);
    }
    expect(VALID_SERVICE_TYPES).toContain('altro');
  });

  it('privacy non accettata: errore', () => {
    const errors = validateQuoteForm({ ...validData, privacy: false });
    expect(errors.some((e) => e.field === 'privacy')).toBe(true);
  });

  it('descrizione troppo lunga: errore', () => {
    const errors = validateQuoteForm({ ...validData, description: 'x'.repeat(2001) });
    expect(errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('descrizione al limite: nessun errore', () => {
    const errors = validateQuoteForm({ ...validData, description: 'x'.repeat(2000) });
    expect(errors.some((e) => e.field === 'description')).toBe(false);
  });

  it('descrizione vuota: nessun errore (campo opzionale)', () => {
    const errors = validateQuoteForm({ ...validData, description: '' });
    expect(errors.some((e) => e.field === 'description')).toBe(false);
  });

  it('misure troppo lunghe: errore', () => {
    const errors = validateQuoteForm({ ...validData, measurements: 'x'.repeat(501) });
    expect(errors.some((e) => e.field === 'measurements')).toBe(true);
  });

  it('misure al limite: nessun errore', () => {
    const errors = validateQuoteForm({ ...validData, measurements: 'x'.repeat(500) });
    expect(errors.some((e) => e.field === 'measurements')).toBe(false);
  });

  it('telefono con caratteri invalidi: errore', () => {
    const errors = validateQuoteForm({ ...validData, phone: 'abc123' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('telefono troppo corto: errore', () => {
    const errors = validateQuoteForm({ ...validData, phone: '12345' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('telefono troppo lungo: errore', () => {
    const errors = validateQuoteForm({ ...validData, phone: '1'.repeat(21) });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('telefono vuoto: errore', () => {
    const errors = validateQuoteForm({ ...validData, phone: '' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('telefono con formato internazionale: nessun errore', () => {
    const errors = validateQuoteForm({ ...validData, phone: '+39 011 1234567' });
    expect(errors.some((e) => e.field === 'phone')).toBe(false);
  });

  it('telefono con parentesi: nessun errore', () => {
    const errors = validateQuoteForm({ ...validData, phone: '(011) 123-4567' });
    expect(errors.some((e) => e.field === 'phone')).toBe(false);
  });

  it('errori multipli contemporanei', () => {
    const errors = validateQuoteForm({
      ...validData,
      name: '',
      email: 'bad',
      phone: 'abc',
      serviceType: 'invalid',
      privacy: false,
    });
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});
