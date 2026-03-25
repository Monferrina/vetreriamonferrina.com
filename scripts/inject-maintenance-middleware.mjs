/**
 * Post-build script: compiles the root middleware.ts and injects it into
 * the Vercel Build Output API structure.
 *
 * Why: @astrojs/vercel generates .vercel/output/ via the Build Output API,
 * so Vercel does NOT auto-compile the root middleware.ts. This script does
 * it manually after `astro build`.
 *
 * @see https://vercel.com/docs/build-output-api/v3/primitives#edge-middleware
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = '.vercel/output';
const MIDDLEWARE_DIR = join(OUTPUT_DIR, 'functions', '_middleware.func');

// 1. Create the edge middleware function directory
mkdirSync(MIDDLEWARE_DIR, { recursive: true });

// Runtime config for Vercel Edge
writeFileSync(
  join(MIDDLEWARE_DIR, '.vc-config.json'),
  JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2)
);

// The middleware code — plain JS that runs in Vercel Edge Runtime.
// process.env is available at runtime in this environment.
writeFileSync(
  join(MIDDLEWARE_DIR, 'index.js'),
  `export default function middleware(request) {
  if (process.env.MAINTENANCE_MODE !== "true") {
    return;
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/maintenance") {
    return;
  }

  if (
    path.startsWith("/_astro/") ||
    path.startsWith("/images/") ||
    path.startsWith("/fonts/") ||
    path.startsWith("/favicon") ||
    path.endsWith(".svg") ||
    path.endsWith(".png") ||
    path.endsWith(".webp") ||
    path.endsWith(".woff2") ||
    path.endsWith(".ico")
  ) {
    return;
  }

  return new Response(null, {
    headers: {
      "x-middleware-rewrite": new URL("/maintenance", request.url).toString(),
      "Retry-After": "3600",
    },
  });
}
`
);

// 2. Inject middleware route into config.json BEFORE "handle": "filesystem"
const configPath = join(OUTPUT_DIR, 'config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const fsIndex = config.routes.findIndex((r) => r.handle === 'filesystem');
if (fsIndex !== -1) {
  config.routes.splice(fsIndex, 0, {
    src: '/((?!_astro|images|fonts|favicon).*)',
    middlewarePath: '_middleware',
    continue: true,
  });
}

writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('[maintenance] Edge middleware injected into .vercel/output/');
