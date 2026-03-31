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
const PHONE_REGEX = /^[\d\s+\-().]{7,20}$/;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_MEASUREMENTS_LENGTH = 500;

export function validateQuoteForm(data: QuoteFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.honeypot) {
    return [{ field: 'honeypot', message: 'Bot detected' }];
  }

  if (!data.name || data.name.trim().length < 2 || data.name.length > MAX_NAME_LENGTH) {
    errors.push({ field: 'name', message: 'Nome richiesto (2-100 caratteri)' });
  }

  if (!data.phone || !PHONE_REGEX.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Numero di telefono non valido' });
  }

  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: 'Email non valida' });
  }

  if (!data.serviceType || !VALID_SERVICE_TYPES.includes(data.serviceType)) {
    errors.push({ field: 'serviceType', message: 'Seleziona un tipo di lavoro' });
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push({
      field: 'description',
      message: 'Descrivi il lavoro di cui hai bisogno (minimo 10 caratteri)',
    });
  } else if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: 'Descrizione troppo lunga (max 2000 caratteri)',
    });
  }

  if (!data.measurements || data.measurements.trim().length < 3) {
    errors.push({
      field: 'measurements',
      message: 'Inserisci le misure approssimative (es. 120x80 cm)',
    });
  } else if (data.measurements.length > MAX_MEASUREMENTS_LENGTH) {
    errors.push({ field: 'measurements', message: 'Misure troppo lunghe (max 500 caratteri)' });
  }

  if (!data.privacy) {
    errors.push({ field: 'privacy', message: 'Devi accettare la privacy policy' });
  }

  return errors;
}
