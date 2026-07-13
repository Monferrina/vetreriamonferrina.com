// @vitest-environment node
import { expect, test, describe } from 'vitest';
import { siteImage } from '../../src/lib/site-images';

describe('siteImage — risoluzione path storici → asset ottimizzati', () => {
  test('risolve un path galleria in ImageMetadata con dimensioni reali', () => {
    const img = siteImage('/images/gallery/installazioni-box-doccia-colline.webp');
    expect(img).toBeDefined();
    expect(img!.width).toBeGreaterThan(0);
    expect(img!.height).toBeGreaterThan(0);
    expect(img!.format).toBe('webp');
  });

  test('risolve un path servizi', () => {
    const img = siteImage('/images/services/box-doccia.webp');
    expect(img).toBeDefined();
    expect(img!.width).toBe(800);
    expect(img!.height).toBe(600);
  });

  test('ogni immagine referenziata da services.ts risolve', async () => {
    const { services } = await import('../../src/data/services');
    for (const s of services) {
      if (s.image) {
        expect(siteImage(s.image), `${s.slug}: ${s.image} non risolve`).toBeDefined();
      }
    }
  });

  test('lascia passare (undefined) ciò che non è un asset locale', () => {
    expect(siteImage('https://cdn.sanity.io/images/x/y/foo.webp')).toBeUndefined();
    expect(siteImage('/images/blog/qualcosa.webp')).toBeUndefined();
    expect(siteImage('/images/gallery/inesistente.webp')).toBeUndefined();
    // niente traversal: il path deve essere un singolo filename .webp
    expect(siteImage('/images/gallery/../services/box-doccia.webp')).toBeUndefined();
  });
});
