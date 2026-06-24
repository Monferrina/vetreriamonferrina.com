/**
 * Verifica che ogni link interno del sito buildato risolva a una pagina o
 * asset realmente generato. Va eseguito dopo `astro build`, sull'output
 * statico (default: `dist/client`). Esce con codice 1 se trova link rotti,
 * cosi puo fare da gate in CI.
 *
 * Uso: node scripts/check-internal-links.mjs [dist/client]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2] ?? 'dist/client';

if (!existsSync(ROOT)) {
  console.error(`✗ Cartella di build non trovata: ${ROOT}. Esegui prima "npm run build".`);
  process.exit(1);
}

/** Raccoglie ricorsivamente tutti i file .html sotto una cartella. */
function collectHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...collectHtml(p));
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Un path interno risolve se esiste la pagina o l'asset corrispondente. */
function resolves(href) {
  let rel = decodeURIComponent(href.split(/[?#]/)[0]);
  if (rel === '/') rel = '/index.html';
  return [join(ROOT, rel), join(ROOT, rel, 'index.html'), join(ROOT, `${rel}.html`)].some(
    existsSync
  );
}

// Guardia di auto-validazione: se la logica di resolve fosse rotta darebbe
// falsi negativi (zero link rotti su tutto). Verifichiamo che distingua un
// path reale da uno inesistente prima di fidarci del risultato.
if (!resolves('/') || resolves('/__link_checker_self_test__')) {
  console.error('✗ Auto-test del link-checker fallito: la risoluzione dei path non e affidabile.');
  process.exit(1);
}

const htmlFiles = collectHtml(ROOT);
const broken = new Map(); // href -> Set(pagine che lo contengono)
let checked = 0;
const attrRe = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = `/${file.slice(ROOT.length + 1)}`.replace(/index\.html$/, '').replace(/\.html$/, '');
  let m;
  while ((m = attrRe.exec(html)) !== null) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue; // esterni / protocol-relative
    checked++;
    if (!resolves(href)) {
      if (!broken.has(href)) broken.set(href, new Set());
      broken.get(href).add(page || '/');
    }
  }
}

console.log(`Pagine: ${htmlFiles.length} | link interni controllati: ${checked}`);

if (broken.size === 0) {
  console.log('✓ Nessun link interno rotto.');
  process.exit(0);
}

console.error(`✗ ${broken.size} link interni rotti:`);
for (const [href, pages] of broken) {
  const list = [...pages];
  console.error(
    `  ${href}  ←  ${list.slice(0, 5).join(', ')}${list.length > 5 ? ` (+${list.length - 5})` : ''}`
  );
}
process.exit(1);
