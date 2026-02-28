/**
 * vectorize-logo.mjs
 * Converts the company logo JPG into a professional SVG using potrace.
 *
 * Strategy:
 * 1. Extract red channel (VMF monogram) as high-contrast bitmap
 * 2. Extract dark channel (company text) as high-contrast bitmap
 * 3. Vectorize each with potrace
 * 4. Combine into a single SVG with correct colors
 * 5. Also create a monogram-only SVG for the header favicon
 *
 * Requires: sharp, potrace
 */

import sharp from 'sharp';
import potrace from 'potrace';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import { promisify } from 'util';

const trace = promisify(potrace.trace);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT = resolve(ROOT, 'public/images/logo-vetreria-monferrina.jpg');
const OUT_DIR = resolve(ROOT, 'public/images');

async function vectorizeLogo() {
  console.log('Vectorizing logo...\n');

  // Load source
  const source = sharp(INPUT);
  const meta = await source.metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);

  // Get raw pixel data
  const { data, info } = await source
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // === Step 1: Extract RED monogram ===
  const redMask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    redMask[i] = (r > 160 && g < 120 && b < 120) ? 0 : 255;
  }

  const redPng = await sharp(redMask, { raw: { width: w, height: h, channels: 1 } })
    .png()
    .toBuffer();

  console.log('Red mask extracted');

  // === Step 2: Extract DARK text ===
  const darkMask = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    darkMask[i] = (r < 100 && g < 100 && b < 100) ? 0 : 255;
  }

  const darkPng = await sharp(darkMask, { raw: { width: w, height: h, channels: 1 } })
    .png()
    .toBuffer();

  console.log('Dark mask extracted');

  // === Step 3: Vectorize red (monogram) ===
  const redSvgRaw = await trace(redPng, {
    turdSize: 5,
    optTolerance: 0.4,
    threshold: 128,
    color: '#D4001A',
  });
  console.log('Red layer vectorized');

  // === Step 4: Vectorize dark (text + shadow) ===
  const darkSvgRaw = await trace(darkPng, {
    turdSize: 3,
    optTolerance: 0.3,
    threshold: 128,
    color: '#1A1A1A',
  });
  console.log('Dark layer vectorized');

  // === Step 5: Extract <path> from each SVG ===
  const extractPaths = (svgStr) => {
    const paths = [];
    const regex = /<path[^>]*d="([^"]+)"[^>]*\/>/g;
    let match;
    while ((match = regex.exec(svgStr)) !== null) {
      paths.push(match[1]);
    }
    return paths;
  };

  const redPaths = extractPaths(redSvgRaw);
  const darkPaths = extractPaths(darkSvgRaw);

  console.log(`Red paths: ${redPaths.length}, Dark paths: ${darkPaths.length}`);

  // === Step 6: Compose full logo SVG ===
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none">
  <!--
    Logo vettoriale — Vetreria Monferrina di Fioravanti G.
    Generato da logo originale via potrace.
    Rosso monogramma: #D4001A | Testo scuro: #333333
  -->
  <g id="dark-layer" fill="#333333">
${darkPaths.map(d => `    <path d="${d}"/>`).join('\n')}
  </g>
  <g id="red-layer" fill="#D4001A">
${redPaths.map(d => `    <path d="${d}"/>`).join('\n')}
  </g>
</svg>`;

  writeFileSync(resolve(OUT_DIR, 'logo-vetreria-monferrina.svg'), fullSvg);
  console.log('Created: logo-vetreria-monferrina.svg');

  // === Step 7: Monogram-only SVG ===
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (redMask[y * w + x] === 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 10;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cropW = maxX - minX;
  const cropH = maxY - minY;

  const croppedRedPng = await sharp(redMask, { raw: { width: w, height: h, channels: 1 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();

  const monoSvgRaw = await trace(croppedRedPng, {
    turdSize: 5,
    optTolerance: 0.4,
    threshold: 128,
    color: '#D4001A',
  });

  const monoPaths = extractPaths(monoSvgRaw);

  const croppedDarkPng = await sharp(darkMask, { raw: { width: w, height: h, channels: 1 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();

  const monoShadowRaw = await trace(croppedDarkPng, {
    turdSize: 5,
    optTolerance: 0.4,
    threshold: 128,
    color: '#333333',
  });

  const monoShadowPaths = extractPaths(monoShadowRaw);

  const monoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" fill="none">
  <!-- Monogramma VMF. — Vetreria Monferrina -->
  <g id="shadow" fill="#333333">
${monoShadowPaths.map(d => `    <path d="${d}"/>`).join('\n')}
  </g>
  <g id="vmf" fill="#D4001A">
${monoPaths.map(d => `    <path d="${d}"/>`).join('\n')}
  </g>
</svg>`;

  writeFileSync(resolve(OUT_DIR, 'logo-monogram.svg'), monoSvg);
  console.log('Created: logo-monogram.svg');

  // === Step 8: SVG favicon ===
  writeFileSync(resolve(ROOT, 'public/favicon.svg'), monoSvg);
  console.log('Created: favicon.svg');

  console.log('\nDone!');
}

vectorizeLogo().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
