import type { SendQuoteConfig } from '../../src/lib/send-quote';

export const config: SendQuoteConfig = {
  allowedOrigins: ['https://vetreriamonferrina.com'],
  resendApiKey: 're_test_key',
  fromEmail: 'noreply@test.example.com',
  toEmail: 'recipient@test.example.com',
  sendEmails: true,
};

export const validBody = {
  name: 'Mario Rossi',
  phone: '+39 0142 123456',
  email: 'mario@example.com',
  serviceType: 'box-doccia',
  description: 'Vorrei un box doccia su misura',
  measurements: '120x80',
  privacy: true,
  honeypot: '',
};
