// Render di una pagina o di un componente Astro con la container API, letto come DOM.
// Serve ai test che verificano solo l'HTML: prima giravano in Playwright, ora qui.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';

type Renderable = Parameters<AstroContainer['renderToString']>[0];

// Un container e un parser per file di test: crearli a ogni render costava più del render.
let container: Promise<AstroContainer> | undefined;
const parser = new new Window().DOMParser();

type RenderOpts = {
  params?: Record<string, string>;
  props?: Record<string, unknown>;
  slots?: Record<string, string>;
};

// L'HTML come stringa, per i test che cercano frammenti di markup.
export async function renderHtml(page: unknown, path: string, opts: RenderOpts = {}) {
  container ??= AstroContainer.create({ astroConfig: { site: 'https://vetreriamonferrina.com' } });
  // Le pagine con getStaticPaths hanno firma `(_props: never) => any`: il container le
  // renderizza, ma senza il cast `astro check` si ferma (ts2345).
  return (await container).renderToString(page as Renderable, {
    request: new Request(`https://vetreriamonferrina.com${path}`),
    ...opts,
  });
}

export async function renderPage(
  page: unknown,
  path: string,
  opts: RenderOpts = {}
): Promise<Document> {
  // DOMParser non esegue gli script inline della pagina.
  return parser.parseFromString(
    await renderHtml(page, path, opts),
    'text/html'
  ) as unknown as Document;
}

// Testo di un nodo con gli spazi normalizzati (come textContent in Playwright).
export const text = (el: Element | null): string =>
  (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
