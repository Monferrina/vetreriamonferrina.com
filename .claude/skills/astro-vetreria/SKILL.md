---
name: astro-vetreria
description: Astro 7 and @astrojs/vercel 11 as used in this site, checked against the official docs. Use before writing or reviewing code that touches `astro:env` (secrets, `getSecret`), `src/middleware.ts`, API endpoints in `src/pages/api/`, `prerender`/on-demand rendering, `<Image>`/`<Picture>`, `astro.config.mjs`, the Vercel adapter, or the `astro` CLI (dev, check, preview, sync).
---

# Astro on this site

Versions: `astro` 7.3.x, `@astrojs/vercel` 11.0.x, `output: 'server'` (read the exact
ones from `package.json` / `node_modules`). Every fact below cites its page on
<https://docs.astro.build/en/>, checked on 2/10/2026. For anything not covered here,
search the docs through the official Astro Docs MCP server
(`https://mcp.docs.astro.build/mcp`,
[build with AI](https://docs.astro.build/en/guides/build-with-ai/)): the `llms.txt`
files were removed in April 2026 ([withastro/docs#13538](https://github.com/withastro/docs/pull/13538)).
A fact the docs leave out gets measured, and the measurement goes next to the code
that relies on it.

## Rendering: static pages, on-demand API

`output: 'server'` only flips the default to on-demand; each page here opts back into
static with `export const prerender = true`
([on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/#server-mode)).
A new page without that line is rendered on every request.

Endpoints export one function per HTTP method, typed with `satisfies APIRoute`; an
unhandled method falls to the 404 page. Read JSON with `await request.json()` after
checking `Content-Type`, forms with `await request.formData()`, and validate every
value before use ([endpoints](https://docs.astro.build/en/guides/endpoints/),
[forms recipe](https://docs.astro.build/en/recipes/build-forms-api/)).

## Middleware

`src/middleware.ts` exports `onRequest` (named), built with `defineMiddleware`; chain
with `sequence(a, b)` (requests a→b, responses b→a). It must return a `Response`,
directly or from `next()` ([middleware](https://docs.astro.build/en/guides/middleware/)).

- It runs **at build time for prerendered pages** and per request for on-demand ones
  (default `middlewareMode: 'classic'`,
  [adapter reference](https://docs.astro.build/en/reference/adapter-reference/#middlewaremode)).
  That is why the origin check in `src/middleware.ts` gates on `/api/`.
  `context.isPrerendered` is the documented flag for this case
  ([api reference](https://docs.astro.build/en/reference/api-reference/#isprerendered)).
- `context.clientAddress` works only on on-demand routes.
- `locals` is per request: mutate it, never reassign it.
- `context.rewrite()` re-runs the middleware; `next('/path')` rewrites in place.

## Environment and secrets: `astro:env`

The schema lives in `env.schema` in `astro.config.mjs` (`envField.string|number|boolean|enum`,
`optional` defaults to `false`). Three kinds exist: client+public (`astro:env/client`),
server+public and server+secret (`astro:env/server`); secrets stay out of the bundle
([environment variables](https://docs.astro.build/en/guides/environment-variables/#variable-types)).

- Secrets are validated **at runtime** by default, and whenever _anything_ is imported
  from `astro:env/server`, so a build may need dummy values; `env.validateSecrets: true`
  moves the check to start-up, useful in CI
  ([configuration reference](https://docs.astro.build/en/reference/configuration-reference/#envvalidatesecrets)).
- `getSecret(name)` from `astro:env/server` returns the raw value (also for keys outside
  the schema). The docs recommend it over `process.env` because the adapter supplies
  it; `@astrojs/vercel` 11.0.3 declares `envGetSecret: 'stable'` (adapter source)
  ([astro:env module](https://docs.astro.build/en/reference/modules/astro-env/#getsecret)).
  `src/middleware.ts` and `src/lib/rate-limit.ts` read `process.env` instead, which the
  docs allow "with most adapters".
- `astro:env` works in middleware, routes, endpoints and components, not in
  `astro.config.mjs` (use `process.env` there).
- `import.meta.env` values are replaced statically at build; only `PUBLIC_` ones reach
  the browser ([vite env](https://docs.astro.build/en/guides/environment-variables/#vites-built-in-support)).
- Tests: the docs do not cover modules that import `astro:env`. This repo's unit tests
  mock the virtual module: `vi.mock('astro:env/server', () => ({ ... }))`
  (`tests/unit/api-send-quote*.test.ts`), with `vitest.config.ts` built on
  `getViteConfig` ([testing](https://docs.astro.build/en/guides/testing/#vitest)).
- How runtime variables reach the function on Vercel is not documented on the adapter
  page: measure it on a preview deployment before relying on it.

## Images: `astro:assets`

- `layout` (`constrained` | `full-width` | `fixed` | `none`) generates `srcset` and
  `sizes` by itself; pass `widths`/`sizes` only to override, and `widths` always needs
  `sizes` ([astro:assets](https://docs.astro.build/en/reference/modules/astro-assets/#layout)).
- `priority` marks the above-the-fold image (eager, sync decode, `fetchpriority=high`).
- Default output is `.webp` via sharp. Files in `public/` are never optimized.
- With Tailwind 4, leave `image.responsiveStyles` off: Astro's styles would beat
  Tailwind's layered rules ([images](https://docs.astro.build/en/guides/images/#responsive-images-with-tailwind-4)).
- Remote images are optimized only from `image.domains` / `image.remotePatterns`.

## Vercel adapter

Options on the [adapter page](https://docs.astro.build/en/guides/integrations-guide/vercel/):
`imageService`, `isr`, `maxDuration`, `includeFiles`/`excludeFiles`, `skewProtection`,
`staticHeaders` (writes headers such as CSP into Vercel config for prerendered pages),
`middlewareMode`.

- `edgeMiddleware` is deprecated since v10: use `middlewareMode: 'edge'`. On < 11.0.7,
  edge middleware plus `isr` never ran the middleware
  ([changelog](https://github.com/withastro/astro/blob/main/packages/integrations/vercel/CHANGELOG.md)).
- With `isr`, the middleware runs only on cache miss or regeneration, and search params
  are dropped.
- `webAnalytics` in the adapter is only for `@vercel/analytics` ≤ 1.3; newer versions use
  Vercel's own component.

## CLI

- `astro check`: type-checks `.astro` files, exits 1 on errors (CI); runs `astro sync`
  first, which generates the `astro:env` types
  ([cli reference](https://docs.astro.build/en/reference/cli-reference/#astro-check)).
- `astro dev` (and `astro preview` since 7.2) **detach into the background** on Linux
  when an AI agent is detected, writing `.astro/dev.json` / `.astro/preview.json`
  with URL, port and PID. Stop them with `astro dev stop` (status: `astro dev status`,
  logs: `astro dev logs`), or run them in the foreground with `ASTRO_DEV_BACKGROUND=0` /
  `ASTRO_PREVIEW_BACKGROUND=0`
  ([cli reference](https://docs.astro.build/en/reference/cli-reference/#--background)).
  Stop it once the work needing it is done; `.claude/hooks/ferma-server.sh` stops it
  anyway at session end.
- `astro preview` with the Vercel adapter is not documented (the adapter has no
  `previewEntrypoint`); the documented path is `astro build` then
  `vercel deploy --prebuilt`.

## Astro 7 changes that bite here

From the [v7 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v7/):
the Rust compiler is the only compiler, so unclosed tags and invalid nesting (`<div>`
inside `<p>`) are now errors; `compressHTML` defaults to `'jsx'` (this site sets
`false`, see the comment in `astro.config.mjs`); `src/fetch.ts` is a reserved file
name; Vite 8; Node ≥ 22.12, even versions only.
