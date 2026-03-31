import { UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs';

new UrlMonitor('homepage-uptime', {
  name: 'Homepage Uptime',
  activated: true,
  maxResponseTime: 10000,
  degradedResponseTime: 5000,
  request: {
    url: 'https://vetreriamonferrina.com/',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
});
