import { services } from '../data/services';

export interface QuoteFormData {
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  description: string;
  measurements: string;
  privacy: boolean;
  honeypot: string; // must be empty
}

export interface ValidationError {
  field: string;
  message: string;
}

export const VALID_SERVICE_TYPES = [...services.map((s) => s.slug), 'altro'];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// La barra e' comune nei numeri italiani (0142/563728); almeno 6 cifre, perche' i soli
// separatori (".......") passavano e arrivavano alla vetreria come numero.
const PHONE_REGEX = /^(?=(?:\D*\d){6})[\d\s+\-()./]{7,20}$/;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_MEASUREMENTS_LENGTH = 500;
// RFC 5321 §4.5.3.1.3: un percorso è al massimo 256 ottetti con le parentesi angolari, 254 per
// l'indirizzo. Senza tetto, un indirizzo di 4 MB passava la regex (misurato 08/10/2026) e finiva in
// replyTo; se Resend lo rifiuta, il client provoca un 500 e un evento Sentry. La regex è solo
// ASCII, quindi length conta gli ottetti.
const MAX_EMAIL_LENGTH = 254;

// Il corpo arriva da JSON.parse: ogni campo può avere qualunque tipo, e sanitizeFormData lascia
// passare i booleani sotto qualunque chiave. Con la firma `unknown` il compilatore pretende il
// typeof prima di .trim(): un booleano in `name` arrivava a .trim() → TypeError → 500 ed evento
// Sentry a ogni richiesta (F3). Unico validatore, usato dal server e da QuoteForm.astro.
export function validateQuoteForm(data: {
  [K in keyof QuoteFormData]?: unknown;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  const { honeypot, name, phone, email, serviceType, description, measurements } = data;

  if (honeypot) {
    return [{ field: 'honeypot', message: 'Bot detected' }];
  }

  if (typeof name !== 'string' || name.trim().length < 2 || name.length > MAX_NAME_LENGTH) {
    errors.push({ field: 'name', message: 'Nome richiesto (2-100 caratteri)' });
  }

  if (typeof phone !== 'string' || !PHONE_REGEX.test(phone)) {
    errors.push({ field: 'phone', message: 'Numero di telefono non valido' });
  }

  if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email non valida' });
  }

  if (typeof serviceType !== 'string' || !VALID_SERVICE_TYPES.includes(serviceType)) {
    errors.push({ field: 'serviceType', message: 'Seleziona un tipo di lavoro' });
  }

  if (typeof description !== 'string' || description.trim().length < 10) {
    errors.push({
      field: 'description',
      message: 'Descrivi il lavoro di cui hai bisogno (minimo 10 caratteri)',
    });
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: 'Descrizione troppo lunga (max 2000 caratteri)',
    });
  }

  if (typeof measurements !== 'string' || measurements.trim().length < 3) {
    errors.push({
      field: 'measurements',
      message: 'Inserisci le misure approssimative (es. 120x80 cm)',
    });
  } else if (measurements.length > MAX_MEASUREMENTS_LENGTH) {
    errors.push({ field: 'measurements', message: 'Misure troppo lunghe (max 500 caratteri)' });
  }

  // Solo true: "no" o 1 passavano come consenso (V6). Il form manda `checked`, un booleano.
  if (data.privacy !== true) {
    errors.push({ field: 'privacy', message: 'Devi accettare la privacy policy' });
  }

  return errors;
}
