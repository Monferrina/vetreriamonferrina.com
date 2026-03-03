/**
 * Image processing script for Vetreria Monferrina
 * Converts WhatsApp photos to optimized WebP for the website.
 *
 * Usage: node scripts/process-images.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

import { dirname as _dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = _dirname(fileURLToPath(import.meta.url));
const DOWNLOADS = join(__dirname, '..', 'source-photos');
const OUTPUT = join(__dirname, '..', 'public/images');

/** @param {string} name WhatsApp filename timestamp portion */
const src = (name) => join(DOWNLOADS, `WhatsApp Image ${name}.jpeg`);

// All images to process: { input, output, maxWidth }
const images = [
  // === SERVICES (for ServiceHighlight cards) — 800px ===
  { in: src('2026-03-02 at 09.54.53'), out: 'services/parapetti.webp', w: 800 },
  { in: src('2026-03-02 at 10.36.32'), out: 'services/vetri-camera.webp', w: 800 },
  { in: src('2026-03-01 at 21.07.19'), out: 'services/su-misura.webp', w: 800 },

  // === GALLERY — INSTALLAZIONI (1200px) ===
  { in: src('2026-03-02 at 10.33.41'), out: 'gallery/installazioni-arco-villa.webp', w: 1200 },
  { in: src('2026-03-01 at 21.09.41'), out: 'gallery/installazioni-arco-mattoni.webp', w: 1200 },
  { in: src('2026-03-01 at 21.06.01'), out: 'gallery/installazioni-facciata.webp', w: 1200 },
  { in: src('2026-03-02 at 10.13.40'), out: 'gallery/installazioni-casa-legno.webp', w: 1200 },
  { in: src('2026-03-02 at 10.30.38'), out: 'gallery/installazioni-pensilina.webp', w: 1200 },
  { in: src('2026-03-02 at 10.16.07'), out: 'gallery/installazioni-casa-legno-2.webp', w: 1200 },
  { in: src('2026-03-02 at 10.11.52'), out: 'gallery/installazioni-interno.webp', w: 1200 },
  { in: src('2026-03-02 at 10.26.40'), out: 'gallery/installazioni-consegna.webp', w: 1200 },

  // === GALLERY — VETRI (parapetti + vetrate + porte) (1200px) ===
  { in: src('2026-03-02 at 09.54.53'), out: 'gallery/vetri-parapetto-moderno.webp', w: 1200 },
  { in: src('2026-03-02 at 09.55.25'), out: 'gallery/vetri-scala-interna.webp', w: 1200 },
  { in: src('2026-03-02 at 09.57.54'), out: 'gallery/vetri-parapetto-terrazza.webp', w: 1200 },
  { in: src('2026-03-02 at 10.06.26'), out: 'gallery/vetri-balcone-residenziale.webp', w: 1200 },
  { in: src('2026-03-02 at 10.36.32'), out: 'gallery/vetri-grande-vetrata.webp', w: 1200 },
  { in: src('2026-03-01 at 21.03.28'), out: 'gallery/vetri-arco-bianco.webp', w: 1200 },
  { in: src('2026-03-02 at 10.02.33'), out: 'gallery/vetri-facciata-commerciale.webp', w: 1200 },
  { in: src('2026-03-02 at 09.55.38'), out: 'gallery/vetri-porta-ingresso.webp', w: 1200 },
  { in: src('2026-03-01 at 21.06.53'), out: 'gallery/vetri-chiusura-granito.webp', w: 1200 },

  // === GALLERY — LAVORAZIONI (su misura) (1200px) ===
  { in: src('2026-03-01 at 21.07.19'), out: 'gallery/lavorazioni-porta-fiori.webp', w: 1200 },
  { in: src('2026-03-01 at 21.09.11'), out: 'gallery/lavorazioni-arco-sabbiato.webp', w: 1200 },
  { in: src('2026-03-02 at 10.06.13'), out: 'gallery/lavorazioni-porta-airone.webp', w: 1200 },
  { in: src('2026-03-02 at 10.22.23'), out: 'gallery/lavorazioni-pannello-rose.webp', w: 1200 },
  { in: src('2026-03-02 at 10.39.16'), out: 'gallery/lavorazioni-vetro-barca.webp', w: 1200 },

  // === LAB (chi-siamo carousel) — 800px ===
  { in: src('2026-03-02 at 10.38.19'), out: 'lab/mastro-vetraio.webp', w: 800 },
  { in: src('2026-03-01 at 21.00.13'), out: 'lab/tavolo-taglio.webp', w: 800 },
  { in: src('2026-03-01 at 21.04.40'), out: 'lab/operaio-lastra.webp', w: 800 },
  { in: src('2026-03-02 at 09.43.58'), out: 'lab/rack-stoccaggio.webp', w: 800 },
  { in: src('2026-03-02 at 10.40.05'), out: 'lab/macchina-taglio.webp', w: 800 },

  // === MEZZI (fleet) — 800px ===
  { in: src('2026-03-01 at 21.08.29'), out: 'mezzi/camion-rack.webp', w: 800 },
  { in: src('2026-03-01 at 21.04.17'), out: 'mezzi/camion-gru.webp', w: 800 },
  { in: src('2026-03-02 at 10.19.00'), out: 'mezzi/due-furgoni.webp', w: 800 },
];

let ok = 0;
let fail = 0;

for (const img of images) {
  const outPath = join(OUTPUT, img.out);
  mkdirSync(dirname(outPath), { recursive: true });

  if (!existsSync(img.in)) {
    console.error(`✗ NOT FOUND: ${img.in}`);
    fail++;
    continue;
  }

  try {
    const info = await sharp(img.in)
      .resize({ width: img.w, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(outPath);
    console.log(`✓ ${img.out}  (${info.width}x${info.height}, ${Math.round(info.size / 1024)}KB)`);
    ok++;
  } catch (err) {
    console.error(`✗ ${img.out}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} processed, ${fail} failed`);
