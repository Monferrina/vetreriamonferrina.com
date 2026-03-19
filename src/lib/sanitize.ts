export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeString(input: string): string {
  let sanitized = input
    .replace(/[\r\n]/g, ' ') // remove newlines (email header injection prevention)
    .trim();

  // Loop until stable to prevent bypass like "javasjavascript:cript:"
  let previous = '';
  while (previous !== sanitized) {
    previous = sanitized;
    sanitized = sanitized.replace(/javascript:|data:|vbscript:/gi, '');
  }

  return escapeHtml(sanitized);
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replace(/[\r\n\t]/g, '')
    .replace(/[<>]/g, '')
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
