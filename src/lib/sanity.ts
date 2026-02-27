// Sanity CMS client with graceful fallback to static data.
// When SANITY_PROJECT_ID is not set, all fetches return the provided fallback.

import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || 'production';

// Only create client if Sanity is configured
export const sanityClient: SanityClient | null = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: true,
    })
  : null;

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

/**
 * Build an image URL from a Sanity image reference.
 * Returns a chainable builder; call .url() at the end.
 * When Sanity is not configured, .url() returns an empty string.
 */
export function urlFor(source: unknown) {
  if (!builder) return { url: () => '' };
  return builder.image(source as Parameters<typeof builder.image>[0]);
}

// GROQ queries
export const queries = {
  services:
    '*[_type == "service"] | order(order asc) { name, "slug": slug.current, category, description, image }',
  siteSettings: '*[_type == "siteSettings"][0]',
  galleryItems:
    '*[_type == "galleryItem"] | order(order asc) { title, category, image }',
  aboutPage: '*[_type == "aboutPage"][0]',
};

/**
 * Fetch data from Sanity with automatic fallback.
 * Returns `fallback` when:
 *   - Sanity is not configured (no project ID)
 *   - The query returns null/undefined
 *   - The fetch throws an error (network, auth, etc.)
 */
export async function fetchWithFallback<T>(
  query: string,
  fallback: T,
): Promise<T> {
  if (!sanityClient) return fallback;
  try {
    const result = await sanityClient.fetch<T>(query);
    return result ?? fallback;
  } catch {
    console.warn('[Sanity] Fetch failed, using fallback data');
    return fallback;
  }
}
