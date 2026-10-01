import * as Sentry from '@sentry/astro';
import { sentryOptions } from './src/lib/sentry-options';

Sentry.init(sentryOptions);
