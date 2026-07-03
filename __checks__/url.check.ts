import { Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs';
import { websiteGroup } from './groups.check';

// Monitor più importante (il sito è raggiungibile?) → cadenza breve. È un uptime check
// leggero, il più economico in termini di consumo.
new UrlMonitor('homepage-uptime', {
  name: 'Homepage Uptime',
  group: websiteGroup,
  activated: true,
  frequency: Frequency.EVERY_10M,
  maxResponseTime: 10000,
  degradedResponseTime: 5000,
  request: {
    url: 'https://vetreriamonferrina.com/',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
});
