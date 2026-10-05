// @vitest-environment node
// Test sull'HTML delle pagine: prima erano E2E (accessibility, home, pages, seo, services),
// ma non usavano niente del browser. Qui girano con la container API (T1, passo 3).
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderPage, text } from './render-page';
import Home from '../../src/pages/index.astro';
import Servizi from '../../src/pages/servizi.astro';
import Servizio from '../../src/pages/servizi/[slug].astro';
import ChiSiamo from '../../src/pages/chi-siamo.astro';
import Contatti from '../../src/pages/contatti.astro';
import Galleria from '../../src/pages/galleria.astro';
import Preventivo from '../../src/pages/preventivo.astro';
import Privacy from '../../src/pages/privacy.astro';
import Cookie from '../../src/pages/cookie.astro';
import NonTrovata from '../../src/pages/404.astro';
import ErroreServer from '../../src/pages/500.astro';
import { categories, services } from '../../src/data/services';

const pagine: Record<string, unknown> = {
  '/': Home,
  '/servizi': Servizi,
  '/chi-siamo': ChiSiamo,
  '/contatti': Contatti,
  '/galleria': Galleria,
  '/preventivo': Preventivo,
  '/privacy': Privacy,
  '/cookie': Cookie,
};
const percorsi = Object.keys(pagine);
// Ogni pagina si renderizza una volta sola e la leggono tutti i test.
const renders = new Map<string, Promise<Document>>();
const doc = (path: string) => {
  if (!renders.has(path)) renders.set(path, renderPage(pagine[path], path));
  return renders.get(path)!;
};

describe('tutte le pagine pubbliche', () => {
  test.each(percorsi)('%s ha un solo h1 dentro main', async (path) => {
    const d = await doc(path);
    expect(d.querySelectorAll('main h1')).toHaveLength(1);
  });

  test.each(percorsi)('%s ha una meta description di almeno 50 caratteri', async (path) => {
    const d = await doc(path);
    const desc = d.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    expect(desc.length).toBeGreaterThanOrEqual(50);
  });

  test('i title sono tutti diversi', async () => {
    const titoli = await Promise.all(percorsi.map(async (p) => (await doc(p)).title));
    expect(titoli.every(Boolean)).toBe(true);
    expect(new Set(titoli).size).toBe(titoli.length);
  });

  test.each(['/', '/servizi', '/chi-siamo', '/galleria'])(
    '%s: le immagini di contenuto hanno alt',
    async (path) => {
      const d = await doc(path);
      const senzaAlt = [...d.querySelectorAll('main img:not([aria-hidden="true"])')].filter(
        (img) => !img.hasAttribute('alt')
      );
      expect(senzaAlt.map((img) => img.getAttribute('src'))).toEqual([]);
    }
  );

  test.each([
    ['/chi-siamo', /chi siamo/i],
    ['/contatti', /contatti/i],
    ['/galleria', /galleria/i],
  ] as const)('%s ha h1 con il titolo, header e footer', async (path, titolo) => {
    const d = await doc(path);
    expect(text(d.querySelector('main h1'))).toMatch(titolo);
    expect(d.querySelector('header')).not.toBeNull();
    expect(d.querySelector('footer')).not.toBeNull();
  });
});

describe('home', () => {
  test('ha le sezioni hero, servizi, numeri e CTA', async () => {
    const d = await doc('/');
    for (const s of ['hero', 'services', 'stats', 'cta']) {
      expect(d.querySelector(`[data-section="${s}"]`), s).not.toBeNull();
    }
  });

  test('il link "scopri i servizi" porta a /servizi', async () => {
    const d = await doc('/');
    const link = [...d.querySelectorAll('a')].find((a) => /scopri.*servizi/i.test(text(a)));
    expect(link?.getAttribute('href')).toBe('/servizi');
  });

  test('ogni link di header, main e footer ha un nome accessibile', async () => {
    const d = await doc('/');
    const senzaNome = [...d.querySelectorAll('header a, main a, footer a')].filter(
      (a) =>
        !text(a) &&
        !a.getAttribute('aria-label')?.trim() &&
        !a.getAttribute('title')?.trim() &&
        !a.querySelector('img')?.getAttribute('alt')?.trim()
    );
    expect(senzaNome.map((a) => a.getAttribute('href'))).toEqual([]);
  });

  test('ha i dati strutturati LocalBusiness', async () => {
    const d = await doc('/');
    const jsonLd = text(d.querySelector('script[type="application/ld+json"]'));
    expect(jsonLd).toContain('LocalBusiness');
    expect(jsonLd).toContain('Vetreria Monferrina');
    expect(jsonLd).toContain('Casale Monferrato');
  });
});

describe('contatti', () => {
  test('ha telefono, email, orari e CTA del preventivo', async () => {
    const d = await doc('/contatti');
    expect(d.querySelector('main a[href^="tel:"]')).not.toBeNull();
    expect(d.querySelector('main a[href^="mailto:"]')).not.toBeNull();
    // Come getByText: orario e "chiuso" dentro lo stesso elemento, non sparsi nella pagina.
    const foglie = [...d.querySelectorAll('main *')].filter((el) => !el.children.length).map(text);
    expect(foglie.some((t) => /8:00.*12:00/.test(t))).toBe(true);
    expect(foglie.some((t) => /chiuso/i.test(t))).toBe(true);
    const cta = [...d.querySelectorAll('main a')].find((a) => /preventivo gratuito/i.test(text(a)));
    expect(cta?.getAttribute('href')).toBe('/preventivo');
  });
});

describe('chi siamo', () => {
  // La foto arrivava da cdn.sanity.io: ora la serve il sito con astro:assets, con srcset.
  test('la foto di famiglia è servita dal sito', async () => {
    const d = await doc('/chi-siamo');
    const foto = [...d.querySelectorAll('img')].find((img) =>
      /famiglia fioravanti/i.test(img.getAttribute('alt') ?? '')
    );
    expect(foto?.getAttribute('src')).toMatch(/^\/_(astro|image)/);
    expect(foto?.getAttribute('srcset')).toMatch(/\S/);
  });
});

describe('servizi', () => {
  test('mostra tutte le categorie e tutti i servizi', async () => {
    const d = await doc('/servizi');
    expect(text(d.querySelector('h1'))).toMatch(/servizi/i);
    for (const c of Object.keys(categories)) {
      expect(d.querySelector(`[data-service-filter="${c}"]`), c).not.toBeNull();
    }
    const titoli = [...d.querySelectorAll('h2, h3')].map(text);
    expect(titoli).toEqual(expect.arrayContaining(services.map((s) => s.name)));
  });

  test('la pagina di un servizio ha la CTA verso il preventivo', async () => {
    const d = await renderPage(Servizio, '/servizi/box-doccia', {
      params: { slug: 'box-doccia' },
    });
    expect(d.querySelector('main a[href="/preventivo"]')).not.toBeNull();
  });
});

// Seam S5: chi arriva su una pagina d'errore deve capire cosa è successo e poter tornare.
describe("pagine d'errore", () => {
  test.each([
    ['/404', NonTrovata, /pagina non trovata/i],
    ['/500', ErroreServer, /errore del server/i],
  ] as const)("%s spiega l'errore e riporta alla home", async (path, page, titolo) => {
    const d = await renderPage(page, path);
    expect(text(d.querySelector('main h1'))).toMatch(titolo);
    expect(d.querySelector('main a[href="/"]')).not.toBeNull();
  });
});

describe('robots.txt', () => {
  test('dichiara la sitemap', () => {
    expect(readFileSync(resolve(__dirname, '../../public/robots.txt'), 'utf-8')).toContain(
      'Sitemap'
    );
  });
});
