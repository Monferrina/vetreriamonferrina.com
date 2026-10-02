// Risolve i path '/images/gallery/*', '/images/services/*' e '/images/about/*' (usati
// come id stabili in services.ts, GalleryGrid e chi-siamo) nei moduli immagine di
// src/assets, così astro:assets può generare srcset responsive e URL hashate immutabili.
// Un path che non matcha (altre cartelle di public/) resta stringa.
import type { ImageMetadata } from 'astro';

const galleryImages = import.meta.glob<{ default: ImageMetadata }>('../assets/gallery/*.webp', {
  eager: true,
});
const serviceImages = import.meta.glob<{ default: ImageMetadata }>('../assets/services/*.webp', {
  eager: true,
});
const aboutImages = import.meta.glob<{ default: ImageMetadata }>('../assets/about/*.webp', {
  eager: true,
});
const globs = { gallery: galleryImages, services: serviceImages, about: aboutImages };

export function siteImage(path: string): ImageMetadata | undefined {
  const m = /^\/images\/(gallery|services|about)\/([^/]+\.webp)$/.exec(path);
  if (!m) return undefined;
  const folder = m[1] as keyof typeof globs;
  return globs[folder][`../assets/${folder}/${m[2]}`]?.default;
}
