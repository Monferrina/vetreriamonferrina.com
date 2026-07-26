export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
}

export function sanitizeString(input: string): string {
  let sanitized = input
    .replaceAll(/[\r\n]/g, ' ') // remove newlines (email header injection prevention)
    .trim();

  // Loop until stable to prevent bypass like "javasjavascript:cript:"
  let previous = '';
  while (previous !== sanitized) {
    previous = sanitized;
    sanitized = sanitized.replaceAll(/javascript:|data:|vbscript:/gi, '');
  }

  // Niente escapeHtml qui: l'escape appartiene al render, non al confine d'ingresso.
  // Escapando in ingresso, un apostrofo diventava 5 caratteri (&#x27;) e i limiti di
  // lunghezza misuravano il testo gonfiato: una descrizione italiana legittima sotto i
  // 2000 caratteri veniva rifiutata con 422 mentre il contatore del browser ne mostrava
  // meno di 2000. Chi renderizza escapa (v. email-templates/quote-request.ts).
  return sanitized;
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replaceAll(/[\r\n\t]/g, '')
    .replaceAll(/[<>]/g, '')
    .trim();
}

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    if (typeof value === 'string') {
      sanitized[key] = key === 'email' ? sanitizeEmail(value) : sanitizeString(value);
    } else if (typeof value === 'boolean') {
      // Solo i booleani passano intatti (privacy, honeypot). Numeri, oggetti e null
      // venivano lasciati passare cosi' com'erano e poi validateQuoteForm chiamava
      // .trim() su di loro: TypeError non gestito → 500 HTML invece del 422 JSON.
      // Scartandoli qui, il campo risulta mancante e la validazione risponde 422.
      sanitized[key] = value;
    }
  }
  return sanitized;
}
