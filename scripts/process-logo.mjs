/**
 * process-logo.mjs
 * Processes the company logo JPG:
 * 1. Removes white background (transparent PNG)
 * 2. Trims whitespace/padding
 * 3. Creates header logo (full logo, optimized)
 * 4. Creates favicon (VMF monogram only, 32x32 + 192x192 + SVG fallback)
 * 5. Generates WebP for modern browsers
 *
 * Requires: sharp (npm install --save-dev sharp)
 */

import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT = resolve(ROOT, 'public/images/logo-vetreria-monferrina.jpg');
const OUT_DIR = resolve(ROOT, 'public/images');
const FAVICON_DIR = resolve(ROOT, 'public');

async function processLogo() {
  console.log('Processing logo...');

  // Load source image
  const source = sharp(INPUT);
  const metadata = await source.metadata();
  console.log(`Source: ${metadata.width}x${metadata.height}, ${metadata.format}`);

  // Step 1: Remove white background → transparent PNG
  // Read raw pixel data, threshold white pixels to transparent
  const { data, info } = await source.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Replace near-white pixels (R>240, G>240, B>240) with transparent
  const WHITE_THRESHOLD = 235;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD) {
      data[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }

  // Create transparent PNG, then trim
  const transparentPng = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const transparentBuffer = await sharp(transparentPng).trim().png().toBuffer();

  const trimmedMeta = await sharp(transparentBuffer).metadata();
  console.log(`Trimmed: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // Step 2: Header logo — full logo, max height 48px for header
  const HEADER_HEIGHT = 96; // 2x for retina
  await sharp(transparentBuffer)
    .resize({ height: HEADER_HEIGHT, withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(resolve(OUT_DIR, 'logo-header.png'));
  console.log('Created: logo-header.png');

  await sharp(transparentBuffer)
    .resize({ height: HEADER_HEIGHT, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(resolve(OUT_DIR, 'logo-header.webp'));
  console.log('Created: logo-header.webp');

  // Step 3: Favicon — crop just the VMF monogram (left portion)
  // The VMF monogram is roughly the left 45% of the image
  const fullWidth = trimmedMeta.width;
  const fullHeight = trimmedMeta.height;
  const monogramWidth = Math.round(fullWidth * 0.44);
  console.log(
    `Extracting monogram: ${monogramWidth}x${fullHeight} from ${fullWidth}x${fullHeight}`
  );

  const extractedPng = await sharp(transparentBuffer)
    .extract({ left: 0, top: 0, width: monogramWidth, height: fullHeight })
    .png()
    .toBuffer();

  const monogramBuffer = await sharp(extractedPng).trim().png().toBuffer();

  // Favicon 32x32 (ICO replacement as PNG)
  await sharp(monogramBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(FAVICON_DIR, 'favicon-32x32.png'));
  console.log('Created: favicon-32x32.png');

  // Favicon 192x192 (PWA / android)
  await sharp(monogramBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(FAVICON_DIR, 'favicon-192x192.png'));
  console.log('Created: favicon-192x192.png');

  // Apple touch icon 180x180
  await sharp(monogramBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(resolve(FAVICON_DIR, 'apple-touch-icon.png'));
  console.log('Created: apple-touch-icon.png');

  // Step 4: Header monogram — VMF only, cleaner at small sizes
  const MONO_HEIGHT = 96; // 2x retina
  await sharp(monogramBuffer)
    .resize({ height: MONO_HEIGHT, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(resolve(OUT_DIR, 'logo-monogram.png'));
  console.log('Created: logo-monogram.png');

  await sharp(monogramBuffer)
    .resize({ height: MONO_HEIGHT, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(resolve(OUT_DIR, 'logo-monogram.webp'));
  console.log('Created: logo-monogram.webp');

  // OG image version — full logo on white bg, 1200x630
  await sharp(transparentBuffer)
    .resize({ width: 800, withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .extend({
      top: 150,
      bottom: 150,
      left: 200,
      right: 200,
      background: { r: 255, g: 255, b: 255 },
    })
    .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toFile(resolve(OUT_DIR, 'og-image.jpg'));
  console.log('Created: og-image.jpg');

  console.log('\nDone! All logo assets generated.');
}

processLogo().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
