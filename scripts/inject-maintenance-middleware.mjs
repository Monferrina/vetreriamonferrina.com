/**
 * Post-build script: injects a Vercel Edge Middleware into the build output
 * that intercepts ALL requests (including static files) when MAINTENANCE_MODE
 * is enabled. This is necessary because @astrojs/vercel's routing serves
 * prerendered pages from the filesystem before any middleware runs.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = '.vercel/output';
const MIDDLEWARE_DIR = join(OUTPUT_DIR, 'functions', '_middleware.func');

// 1. Create the edge middleware function
mkdirSync(MIDDLEWARE_DIR, { recursive: true });

writeFileSync(
  join(MIDDLEWARE_DIR, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'edge',
      entrypoint: 'index.js',
    },
    null,
    2
  )
);

writeFileSync(
  join(MIDDLEWARE_DIR, 'index.js'),
  `export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Let static assets through without checking env
  if (
    path.startsWith('/_astro/') ||
    path.startsWith('/images/') ||
    path.startsWith('/fonts/') ||
    path.startsWith('/favicon') ||
    path.endsWith('.svg') ||
    path.endsWith('.png') ||
    path.endsWith('.webp') ||
    path.endsWith('.woff2') ||
    path.endsWith('.ico')
  ) {
    return;
  }

  // Check maintenance mode at runtime
  if (process.env.MAINTENANCE_MODE !== 'true') {
    return;
  }

  // Don't rewrite the maintenance page itself
  if (path === '/maintenance') {
    return;
  }

  // Rewrite to the prerendered maintenance page
  return new Response(null, {
    headers: {
      'x-middleware-rewrite': new URL('/maintenance', request.url).toString(),
      'Retry-After': '3600',
    },
  });
}

export const config = {
  matcher: ['/((?!_astro|images|fonts|favicon).*)'],
};
`
);

// 2. Update the routing config to invoke middleware before filesystem
const configPath = join(OUTPUT_DIR, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Find the "handle": "filesystem" entry and insert middleware route before it
const fsIndex = config.routes.findIndex((r) => r.handle === 'filesystem');
if (fsIndex !== -1) {
  config.routes.splice(fsIndex, 0, {
    src: '/((?!_astro|images|fonts|favicon).*)',
    middlewarePath: '_middleware',
    continue: true,
  });
}

writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('[maintenance] Edge middleware injected into Vercel build output');
