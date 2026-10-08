import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateQuoteForm, VALID_SERVICE_TYPES } from '../../src/lib/validation';
import { sanitizeFormData } from '../../src/lib/sanitize';
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

  // I due percorsi sanitize → validate che rompevano in produzione.
  describe('passando prima da sanitizeFormData (come fa la route)', () => {
    const sanificato = (over: Record<string, unknown>) =>
      sanitizeFormData({ ...validData, ...over }) as unknown as typeof validData;

    it('accetta una descrizione italiana di 1900 caratteri piena di apostrofi', () => {
      // Con l'escape in ingresso ogni ' diventava &#x27; (5 caratteri): il testo
      // superava i 2000 e l'utente prendeva un 422 mentre il contatore del browser
      // ne mostrava meno di 2000, senza modo di capire cosa togliere.
      const description = "Sostituzione dell'anta e dell'infisso. ".repeat(50).slice(0, 1900);
      expect(description).toHaveLength(1900);
      expect(validateQuoteForm(sanificato({ description }))).toHaveLength(0);
    });

    it('un campo numerico produce un 422, non un TypeError', () => {
      // name: 123 arrivava intatto e validateQuoteForm chiamava .trim() su un numero →
      // eccezione non gestita → 500 HTML al posto del 422 JSON, e preventivo perso.
      const errors = validateQuoteForm(sanificato({ name: 123 }));
      expect(errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('un booleano in un campo di testo produce un 422, non un TypeError (F3)', () => {
      // sanitizeFormData lascia passare i booleani sotto qualunque chiave (privacy, honeypot):
      // name: true arrivava a .trim() → TypeError → 500 ed evento Sentry a ogni richiesta.
      const errors = validateQuoteForm(sanificato({ name: true }));
      expect(errors.some((e) => e.field === 'name')).toBe(true);
    });
  });

  // Invariante (B1p): il corpo arriva da JSON.parse, quindi ogni campo può avere qualunque tipo.
  // Per qualunque valore JSON in qualunque campo il validatore non lancia e restituisce solo
  // errori di campi noti: un'eccezione qui diventava un 500 e un evento Sentry a comando (F3).
  it('per qualunque valore JSON in qualunque campo: nessuna eccezione, solo errori di campi noti', () => {
    const campi = Object.keys(validData) as (keyof typeof validData)[];
    fc.assert(
      fc.property(fc.dictionary(fc.constantFrom(...campi), fc.jsonValue()), (over) => {
        const errors = validateQuoteForm({ ...validData, ...over });
        expect(Array.isArray(errors)).toBe(true);
        for (const e of errors) expect(campi).toContain(e.field);
      })
    );
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

  it('email di 255 caratteri con forma valida: errore (RFC 5321, massimo 254) (N1)', () => {
    // Senza tetto un indirizzo di 4 MB passava la regex e finiva in replyTo (misurato 08/10/2026).
    const email = `${'a'.repeat(255 - '@example.com'.length)}@example.com`;
    expect(email).toHaveLength(255);
    const errors = validateQuoteForm({ ...validData, email });
    expect(errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('email di 254 caratteri con forma valida: nessun errore', () => {
    const email = `${'a'.repeat(254 - '@example.com'.length)}@example.com`;
    expect(email).toHaveLength(254);
    expect(validateQuoteForm({ ...validData, email })).toHaveLength(0);
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

  it('privacy con un valore truthy diverso da true ("no", 1): errore', () => {
    // Il form manda `checked`, un booleano: qualunque altro valore non è un consenso.
    for (const privacy of ['no', 1]) {
      const errors = validateQuoteForm({ ...validData, privacy });
      expect(errors.some((e) => e.field === 'privacy')).toBe(true);
    }
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

  it('descrizione vuota: errore (campo obbligatorio)', () => {
    const errors = validateQuoteForm({ ...validData, description: '' });
    expect(errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('descrizione troppo corta: errore', () => {
    const errors = validateQuoteForm({ ...validData, description: 'ciao' });
    expect(errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('misure vuote: errore (campo obbligatorio)', () => {
    const errors = validateQuoteForm({ ...validData, measurements: '' });
    expect(errors.some((e) => e.field === 'measurements')).toBe(true);
  });

  it('misure troppo corte: errore', () => {
    const errors = validateQuoteForm({ ...validData, measurements: 'ab' });
    expect(errors.some((e) => e.field === 'measurements')).toBe(true);
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

  it('telefono con la barra (0142/563728): nessun errore', () => {
    const errors = validateQuoteForm({ ...validData, phone: '0142/563728' });
    expect(errors.some((e) => e.field === 'phone')).toBe(false);
  });

  it('telefono senza almeno 6 cifre: errore', () => {
    for (const phone of ['.......', '+++++++', '12-34-5 ()']) {
      const errors = validateQuoteForm({ ...validData, phone });
      expect(
        errors.some((e) => e.field === 'phone'),
        phone
      ).toBe(true);
    }
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
