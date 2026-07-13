// Risolve i path storici '/images/gallery/*' e '/images/services/*' (usati come
// id stabili in services.ts e GalleryGrid) nei moduli immagine di src/assets,
// così astro:assets può generare srcset responsive e URL hashate immutabili.
// Un path che non matcha (URL Sanity, altre cartelle di public/) resta stringa.
import type { ImageMetadata } from 'astro';

const galleryImages = import.meta.glob<{ default: ImageMetadata }>('../assets/gallery/*.webp', {
  eager: true,
});
const serviceImages = import.meta.glob<{ default: ImageMetadata }>('../assets/services/*.webp', {
  eager: true,
});

export function siteImage(path: string): ImageMetadata | undefined {
  const m = /^\/images\/(gallery|services)\/([^/]+\.webp)$/.exec(path);
  if (!m) return undefined;
  const glob = m[1] === 'gallery' ? galleryImages : serviceImages;
  return glob[`../assets/${m[1]}/${m[2]}`]?.default;
}
