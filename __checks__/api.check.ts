import { ApiCheck, AssertionBuilder } from 'checkly/constructs';

new ApiCheck('send-quote-api', {
  name: 'Send Quote API',
  activated: true,
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    url: 'https://vetreriamonferrina.com/api/send-quote',
    method: 'POST',
    followRedirects: true,
    skipSSL: false,
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Origin', value: 'https://vetreriamonferrina.com' },
    ],
    body: JSON.stringify({
      name: 'Checkly Monitor',
      email: 'monitor@checkly.com',
      phone: '0000000000',
      serviceType: 'box-doccia',
      description: 'Test automatico Checkly - ignorare',
      measurements: '100x100 cm',
      privacy: true,
      website: 'honeypot-trigger',
    }),
    assertions: [AssertionBuilder.statusCode().equals(200)],
  },
  runParallel: false,
});
