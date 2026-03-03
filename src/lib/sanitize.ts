export function sanitizeString(input: string): string {
  return input
    .replace(/[\r\n]/g, ' ') // remove newlines (email header injection prevention)
    .replace(/[<>]/g, '') // remove HTML angle brackets
    .replace(/javascript:/gi, '') // remove JS protocol
    .trim();
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replace(/[\r\n\t]/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = key === 'email' ? sanitizeEmail(value) : sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
