/**
 * Verifica il sito buildato: (1) ogni link interno risolve a una pagina o asset
 * realmente generato; (2) ogni blocco JSON-LD fa parse ed espone un @type;
 * (3) nessuna parola risulta attaccata a un tag inline nel testo visibile.
 * Va eseguito dopo `astro build`, sull'output statico (default: `dist/client`).
 * Esce con codice 1 se trova un problema, cosi fa da gate in CI.
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

// Parole attaccate a un tag inline: e' il danno che fa `compressHTML: true`, che
// elimina il ritorno a capo fra un testo e il tag della riga dopo invece di
// ridurlo a uno spazio ("...40 anni." + "<strong>Sopralluoghi" → "anni.Sopralluoghi").
// Il markup resta HTML valido, quindi non lo prende nessun altro gate: lint, type
// check, unit, e2e e Lighthouse passano tutti. Lo vede solo chi legge la pagina.
const INLINE = 'strong|em|b|i|a|span|code|small|abbr';
const gluedOpenRe = new RegExp(`[\\p{L}\\p{N}.,;:!?]<(?:${INLINE})[\\s>]`, 'gu');
const gluedCloseRe = new RegExp(`</(?:${INLINE})>[\\p{L}\\p{N}]`, 'gu');

/** Conta i punti in cui una parola tocca l'apertura o la chiusura di un tag inline. */
function findGlued(html) {
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ');
  return [...body.matchAll(gluedOpenRe), ...body.matchAll(gluedCloseRe)].map((m) =>
    body.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20).replace(/\s+/g, ' ')
  );
}

// Auto-validazione: la regex deve distinguere il testo incollato da quello sano,
// altrimenti darebbe zero su tutto e sembrerebbe che vada bene.
if (
  findGlued('<p>anni.<strong>Sopralluoghi</strong></p>').length !== 1 ||
  findGlued('<p>anni. <strong>Sopralluoghi</strong> in Piemonte.</p>').length !== 0
) {
  console.error('✗ Auto-test degli spazi fallito: la regex non distingue i casi.');
  process.exit(1);
}

const htmlFiles = collectHtml(ROOT);
const broken = new Map(); // href -> Set(pagine che lo contengono)
const badLd = []; // { page, error } per ogni blocco JSON-LD non valido
const glued = []; // { page, sample } per ogni parola attaccata a un tag inline
let checked = 0;
let ldChecked = 0;
const attrRe = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

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
  // Valida ogni blocco JSON-LD: deve fare parse e dichiarare un @type.
  let ld;
  while ((ld = ldRe.exec(html)) !== null) {
    ldChecked++;
    try {
      const parsed = JSON.parse(ld[1]);
      if (!parsed || !parsed['@type']) {
        badLd.push({ page: page || '/', error: 'manca @type' });
      }
    } catch (e) {
      badLd.push({ page: page || '/', error: e.message });
    }
  }
  for (const sample of findGlued(html)) {
    glued.push({ page: page || '/', sample });
  }
}

// Auto-validazione: il sito genera JSON-LD su ogni pagina (LocalBusiness nel
// BaseLayout). Zero blocchi trovati = regex rotta → falso "tutto valido".
if (ldChecked === 0) {
  console.error('✗ Nessun blocco JSON-LD trovato: la regex di estrazione e rotta.');
  process.exit(1);
}

console.log(
  `Pagine: ${htmlFiles.length} | link interni: ${checked} | blocchi JSON-LD: ${ldChecked}`
);

if (broken.size === 0 && badLd.length === 0 && glued.length === 0) {
  console.log('✓ Nessun link interno rotto, JSON-LD valido, nessuna parola attaccata.');
  process.exit(0);
}

if (broken.size > 0) {
  console.error(`✗ ${broken.size} link interni rotti:`);
  for (const [href, pages] of broken) {
    const list = [...pages];
    console.error(
      `  ${href}  ←  ${list.slice(0, 5).join(', ')}${list.length > 5 ? ` (+${list.length - 5})` : ''}`
    );
  }
}

if (badLd.length > 0) {
  console.error(`✗ ${badLd.length} blocchi JSON-LD non validi:`);
  for (const { page, error } of badLd) {
    console.error(`  ${page}  →  ${error}`);
  }
}

if (glued.length > 0) {
  const pagine = new Set(glued.map((g) => g.page)).size;
  console.error(`✗ ${glued.length} parole attaccate a un tag inline, su ${pagine} pagine:`);
  for (const { page, sample } of glued.slice(0, 10)) {
    console.error(`  ${page}  →  ${sample}`);
  }
  if (glued.length > 10) console.error(`  (+${glued.length - 10} altri)`);
  console.error('  Causa tipica: "compressHTML" riattivato in astro.config.mjs.');
}

process.exit(1);
