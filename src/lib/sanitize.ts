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

  return escapeHtml(sanitized);
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
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
