#!/usr/bin/env node
/**
 * Fetch Google Reviews for Vetreria Monferrina at build time.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-reviews.mjs
 *
 * Requirements:
 *   - Google Cloud project with Places API enabled
 *   - API key with Places API access
 *
 * The script fetches the place details, filters for positive reviews (>= 4 stars),
 * and writes the result to src/data/reviews.json.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../src/data/reviews.json');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID || '';
const MIN_RATING = 4; // Only include reviews with >= 4 stars

if (!API_KEY) {
  console.error('Error: GOOGLE_PLACES_API_KEY environment variable is required.');
  console.error('Usage: GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-reviews.mjs');
  process.exit(1);
}

if (!PLACE_ID) {
  console.error('Error: GOOGLE_PLACE_ID environment variable is required.');
  console.error('Find it at: https://developers.google.com/maps/documentation/places/web-service/place-id');
  process.exit(1);
}

async function fetchReviews() {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&language=it&key=${API_KEY}`;

  console.log(`Fetching reviews for place: ${PLACE_ID}...`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google API returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(`Google API error: ${data.status} — ${data.error_message || 'unknown'}`);
  }

  const place = data.result;
  const allReviews = place.reviews || [];

  // Filter: only positive reviews (>= MIN_RATING stars)
  const positiveReviews = allReviews
    .filter((r) => r.rating >= MIN_RATING)
    .map((r) => ({
      author: abbreviateName(r.author_name),
      rating: r.rating,
      date: new Date(r.time * 1000).toISOString().split('T')[0],
      text: r.text.trim(),
    }))
    // Sort by most recent first
    .sort((a, b) => b.date.localeCompare(a.date));

  const output = {
    rating: place.rating,
    totalReviews: place.user_ratings_total,
    placeId: PLACE_ID,
    lastUpdated: new Date().toISOString().split('T')[0],
    reviews: positiveReviews,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');
  console.log(`Saved ${positiveReviews.length} positive reviews (of ${allReviews.length} total) to ${OUTPUT_PATH}`);
  console.log(`Overall rating: ${place.rating}/5 (${place.user_ratings_total} reviews)`);
}

/** Abbreviate last name for privacy: "Mario Rossi" → "Mario R." */
function abbreviateName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

fetchReviews().catch((err) => {
  console.error('Failed to fetch reviews:', err.message);
  process.exit(1);
});
