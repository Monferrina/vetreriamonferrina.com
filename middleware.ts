/**
 * Vercel Routing Middleware — platform-level middleware that runs BEFORE
 * static files and serverless functions on every request.
 *
 * When MAINTENANCE_MODE=true in Vercel env vars, all page requests are
 * rewritten to /maintenance. Static assets pass through normally.
 *
 * @see https://vercel.com/docs/functions/edge-middleware
 */
export default function middleware(request: Request) {
  // Check maintenance mode at runtime
  if (process.env.MAINTENANCE_MODE !== 'true') {
    return;
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // Don't rewrite the maintenance page itself (avoid loop)
  if (path === '/maintenance') {
    return;
  }

  // Let static assets through
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

  // Rewrite to maintenance page
  return new Response(null, {
    headers: {
      'x-middleware-rewrite': new URL('/maintenance', request.url).toString(),
      'Retry-After': '3600',
    },
  });
}
