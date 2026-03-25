import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Use process.env for runtime access in Vercel Edge Middleware
  // (import.meta.env is inlined at build time and won't reflect runtime changes)
  const isMaintenanceMode =
    (process.env.MAINTENANCE_MODE ?? import.meta.env.MAINTENANCE_MODE) === 'true';

  if (!isMaintenanceMode) {
    return next();
  }

  // Don't rewrite the maintenance page itself (avoid loop)
  if (context.url.pathname === '/maintenance') {
    return next();
  }

  // Let static assets through
  const path = context.url.pathname;
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
    return next();
  }

  // Rewrite to maintenance page with 503 status
  const response = await context.rewrite('/maintenance');
  return new Response(response.body, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: response.headers,
  });
});
