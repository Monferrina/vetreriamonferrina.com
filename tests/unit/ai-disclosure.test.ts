// @vitest-environment node
import { expect, test, describe } from 'vitest';
import { renderPage } from './render-page';
import BlogPost from '../../src/pages/blog/[slug].astro';
import { blogPosts } from '../../src/data/blog-posts';

// La disclosure IA è una scelta di prudenza, non un obbligo (AI Act art. 50(4): si applica
// ai testi di interesse pubblico, ed esenta comunque i contenuti sotto revisione umana con
// responsabilità editoriale). Vedi monferrinoAI → docs/ai-act.md §8.2.
//
// Il fallimento pericoloso NON è "manca la disclosure": è il suo contrario. Se la condizione
// si invertisse, articoli scritti da persone dichiarerebbero di essere assistiti dall'IA —
// una falsa affermazione verso il lettore, sulla trasparenza stessa.
describe('disclosure IA sugli articoli', () => {
  const umani = blogPosts.filter((p) => !p.aiAssisted);

  test('oggi nessun articolo è assistito da IA', () => {
    expect(umani).toHaveLength(blogPosts.length);
  });

  test.each(umani.map((p) => p.slug))(
    'l\'articolo "%s", scritto da una persona, NON dichiara assistenza IA',
    async (slug) => {
      const d = await renderPage(BlogPost, `/blog/${slug}`, { params: { slug } });

      expect(d.querySelector('[data-ai-disclosure]')).toBeNull();
      expect(d.documentElement.outerHTML).not.toContain('intelligenza artificiale');
    }
  );
});
