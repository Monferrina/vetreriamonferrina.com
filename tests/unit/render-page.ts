// Render di una pagina o di un componente Astro con la container API, letto come DOM.
// Serve ai test che verificano solo l'HTML: prima giravano in Playwright, ora qui.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';

type Renderable = Parameters<AstroContainer['renderToString']>[0];

// Un container e un parser per file di test: crearli a ogni render costava più del render.
let container: Promise<AstroContainer> | undefined;
const parser = new new Window().DOMParser();

export async function renderPage(
  page: unknown,
  path: string,
  opts: { params?: Record<string, string>; props?: Record<string, unknown> } = {}
): Promise<Document> {
  container ??= AstroContainer.create({ astroConfig: { site: 'https://vetreriamonferrina.com' } });
  // Le pagine con getStaticPaths hanno firma `(_props: never) => any`: il container le
  // renderizza, ma senza il cast `astro check` si ferma (ts2345, come in ai-disclosure.test).
  const html = await (
    await container
  ).renderToString(page as Renderable, {
    request: new Request(`https://vetreriamonferrina.com${path}`),
    ...opts,
  });
  // DOMParser non esegue gli script inline della pagina.
  return parser.parseFromString(html, 'text/html') as unknown as Document;
}

// Testo di un nodo con gli spazi normalizzati (come textContent in Playwright).
export const text = (el: Element | null): string =>
  (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
