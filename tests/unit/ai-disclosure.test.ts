// @vitest-environment node
import { expect, test, describe } from 'vitest';
import { renderPage } from './render-page';
import BlogPost from '../../src/pages/blog/[slug].astro';
import { blogPosts } from '../../src/data/blog-posts';

// La disclosure IA è una scelta di prudenza, non un obbligo (AI Act art. 50(4): si applica
// ai testi di interesse pubblico, ed esenta comunque i contenuti sotto revisione umana con
// responsabilità editoriale). Vedi monferrinoAI → docs/ai-act.md §8.2.
//
// Dal 20/10/2026 (NR1, decisione di Marco) tutti gli articoli sono scritti con l'assistenza
// dell'IA e lo dichiarano, a nome di "Staff Monferrina". Il fallimento pericoloso resta il
// contrario: un articolo scritto da una persona che dichiara di essere assistito dall'IA,
// una falsa affermazione verso il lettore sulla trasparenza stessa.
describe('disclosure IA sugli articoli', () => {
  test('oggi tutti gli articoli sono assistiti da IA', () => {
    expect(blogPosts.filter((p) => !p.aiAssisted)).toEqual([]);
  });

  test.each(blogPosts.map((p) => p.slug))(
    'l\'articolo "%s" dichiara l\'assistenza IA a nome di Staff Monferrina',
    async (slug) => {
      const d = await renderPage(BlogPost, `/blog/${slug}`, { params: { slug } });

      const avviso = d.querySelector('[data-ai-disclosure]');
      expect(avviso?.textContent).toContain('intelligenza');
      expect(avviso?.textContent).toContain('Staff Monferrina');
      expect(d.documentElement.outerHTML).not.toContain('Giuseppe Fioravanti');
    }
  );

  test('un articolo senza il flag non dichiara assistenza IA', async () => {
    const slug = blogPosts[0].slug;
    const originale = blogPosts[0].aiAssisted;
    blogPosts[0].aiAssisted = false;
    try {
      const d = await renderPage(BlogPost, `/blog/${slug}`, { params: { slug } });
      expect(d.querySelector('[data-ai-disclosure]')).toBeNull();
      expect(d.documentElement.outerHTML).not.toContain('intelligenza artificiale');
    } finally {
      blogPosts[0].aiAssisted = originale;
    }
  });
});
