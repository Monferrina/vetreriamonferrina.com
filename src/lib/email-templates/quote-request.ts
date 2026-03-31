import { baseLayout } from './base-layout';

interface QuoteEmailData {
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  description: string;
  measurements: string;
  ip: string;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#737373;white-space:nowrap;vertical-align:top;width:140px;">
        ${label}
      </td>
      <td style="padding:10px 12px;font-size:14px;color:#262626;">
        ${value}
      </td>
    </tr>`;
}

export function quoteRequestEmail(data: QuoteEmailData): string {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
      <tbody>
        ${row('Nome', data.name)}
        <tr><td colspan="2" style="border-bottom:1px solid #f5f5f5;"></td></tr>
        ${row('Telefono', `<a href="tel:${data.phone}" style="color:#1b4965;text-decoration:none;">${data.phone}</a>`)}
        <tr><td colspan="2" style="border-bottom:1px solid #f5f5f5;"></td></tr>
        ${row('Email', `<a href="mailto:${data.email}" style="color:#1b4965;text-decoration:none;">${data.email}</a>`)}
        <tr><td colspan="2" style="border-bottom:1px solid #f5f5f5;"></td></tr>
        ${row('Tipo di lavoro', data.serviceType)}
        <tr><td colspan="2" style="border-bottom:1px solid #f5f5f5;"></td></tr>
        ${row('Descrizione', data.description)}
        <tr><td colspan="2" style="border-bottom:1px solid #f5f5f5;"></td></tr>
        ${row('Misure', data.measurements)}
      </tbody>
    </table>

    <p style="margin:24px 0 0;font-size:11px;color:#a3a3a3;text-align:right;">
      IP: ${data.ip}
    </p>`;

  return baseLayout('Nuova richiesta di preventivo', content);
}
