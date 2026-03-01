#!/usr/bin/env node
/**
 * Fetch all Google Place data for Vetreria Monferrina at build time.
 * Single API call → reviews, opening hours, photos.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx GOOGLE_PLACE_ID=yyy node scripts/fetch-place-data.mjs
 *
 * Outputs:
 *   - src/data/reviews.json     (recensioni >= 4 stelle)
 *   - src/data/opening-hours.json (orari da Google)
 *   - src/data/place-photos.json  (URLs foto Google)
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../src/data');

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID || 'ChIJcx_Q1ESwh0cRqv3FdLTrU1w';
const MIN_RATING = 4;

if (!API_KEY) {
  console.error('Error: GOOGLE_PLACES_API_KEY environment variable is required.');
  process.exit(1);
}

mkdirSync(DATA_DIR, { recursive: true });

async function fetchPlaceData() {
  const url = `https://places.googleapis.com/v1/places/${PLACE_ID}`;
  const fields = [
    'displayName',
    'rating',
    'userRatingCount',
    'reviews',
    'regularOpeningHours',
    'currentOpeningHours',
    'photos',
  ].join(',');

  console.log('Fetching place data from Places API (New)...');

  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': fields,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Google API returned ${res.status}: ${err.error?.message || res.statusText}`);
  }

  const place = await res.json();

  // --- Reviews ---
  const allReviews = place.reviews || [];
  const positiveReviews = allReviews
    .filter((r) => r.rating >= MIN_RATING && r.originalText?.text?.trim())
    .map((r) => ({
      author: abbreviateName(r.authorAttribution?.displayName || 'Anonimo'),
      rating: r.rating,
      date: r.publishTime?.split('T')[0] || '',
      text: r.originalText.text.trim(),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const reviewsOutput = {
    rating: place.rating,
    totalReviews: place.userRatingCount,
    placeId: PLACE_ID,
    lastUpdated: new Date().toISOString().split('T')[0],
    reviews: positiveReviews,
  };

  writeFileSync(resolve(DATA_DIR, 'reviews.json'), JSON.stringify(reviewsOutput, null, 2) + '\n');
  console.log(`  Reviews: ${positiveReviews.length} positive (of ${allReviews.length} total)`);

  // --- Opening Hours ---
  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const periods = place.regularOpeningHours?.periods || [];

  // Group periods by day
  const dayMap = new Map();
  for (const p of periods) {
    const day = p.open.day;
    const openStr = `${String(p.open.hour).padStart(2, '0')}:${String(p.open.minute).padStart(2, '0')}`;
    const closeStr = `${String(p.close.hour).padStart(2, '0')}:${String(p.close.minute).padStart(2, '0')}`;
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day).push(`${openStr} - ${closeStr}`);
  }

  // Build schedule: group consecutive days with same hours
  const schedule = [];
  let i = 1; // Start from Monday (1)
  while (i <= 7) {
    const dayIndex = i % 7; // 0=Sun for dayNames
    const hours = dayMap.get(dayIndex);
    const hoursStr = hours ? hours.join(' / ') : 'Chiuso';

    // Find consecutive days with same hours
    let j = i + 1;
    while (j <= 7) {
      const nextDayIndex = j % 7;
      const nextHours = dayMap.get(nextDayIndex);
      const nextHoursStr = nextHours ? nextHours.join(' / ') : 'Chiuso';
      if (nextHoursStr !== hoursStr) break;
      j++;
    }

    const startDay = dayNames[dayIndex];
    const endDay = dayNames[(j - 1) % 7];
    const days = i === j - 1 ? startDay : `${startDay} - ${endDay}`;

    schedule.push({ days, hours: hoursStr });
    i = j;
  }

  const hoursOutput = {
    lastUpdated: new Date().toISOString().split('T')[0],
    schedule,
    periods: periods.map((p) => ({
      day: p.open.day,
      open: `${String(p.open.hour).padStart(2, '0')}:${String(p.open.minute).padStart(2, '0')}`,
      close: `${String(p.close.hour).padStart(2, '0')}:${String(p.close.minute).padStart(2, '0')}`,
    })),
  };

  writeFileSync(resolve(DATA_DIR, 'opening-hours.json'), JSON.stringify(hoursOutput, null, 2) + '\n');
  console.log(`  Hours: ${schedule.length} time slots`);

  // --- Photos (download locally — no API key in output files) ---
  const PHOTOS_DIR = resolve(__dirname, '../public/images/google-photos');
  mkdirSync(PHOTOS_DIR, { recursive: true });

  const rawPhotos = place.photos || [];
  const photos = [];

  for (let idx = 0; idx < rawPhotos.length; idx++) {
    const p = rawPhotos[idx];
    const filename = `place-photo-${idx + 1}.jpg`;
    const localPath = resolve(PHOTOS_DIR, filename);
    const photoUrl = `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=800&key=${API_KEY}`;

    try {
      const photoRes = await fetch(photoUrl, { redirect: 'follow' });
      if (photoRes.ok && photoRes.body) {
        await pipeline(photoRes.body, createWriteStream(localPath));
        photos.push({
          src: `/images/google-photos/${filename}`,
          width: p.widthPx,
          height: p.heightPx,
          author: p.authorAttributions?.[0]?.displayName || '',
        });
      }
    } catch {
      console.warn(`  Warning: failed to download photo ${idx + 1}`);
    }
  }

  const photosOutput = {
    lastUpdated: new Date().toISOString().split('T')[0],
    placeId: PLACE_ID,
    photos,
  };

  writeFileSync(resolve(DATA_DIR, 'place-photos.json'), JSON.stringify(photosOutput, null, 2) + '\n');
  console.log(`  Photos: ${photos.length} downloaded to public/images/google-photos/`);

  console.log(`\nDone! Rating: ${place.rating}/5 (${place.userRatingCount} reviews)`);
}

function abbreviateName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

fetchPlaceData().catch((err) => {
  console.error('Failed to fetch place data:', err.message);
  process.exit(1);
});
