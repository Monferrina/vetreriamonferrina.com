import { describe, it, expect } from 'vitest';
import { ChatbotEngine, type ChatFlow } from '../../src/lib/chatbot-engine';
import flow from '../../src/data/chatbot-flow.json';

describe('ChatbotEngine', () => {
  it('carica il nodo welcome', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    const node = engine.navigate('welcome');
    expect(node).toBeDefined();
    expect(node!.message).toContain('Ciao');
    expect(node!.options!.length).toBeGreaterThan(0);
  });

  it('naviga ai servizi e mantiene la history', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    engine.navigate('welcome');
    engine.navigate('servizi');
    const history = engine.getHistory();
    expect(history).toEqual(['welcome', 'servizi']);
  });

  it('tutti i nodi referenziati esistono', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    for (const [, node] of Object.entries(flow)) {
      if (node.options) {
        for (const opt of node.options) {
          if (opt.next) {
            expect(engine.getNode(opt.next), `Nodo "${opt.next}" mancante`).toBeDefined();
          }
        }
      }
    }
  });

  it('restoreHistory ripristina lo stato', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    engine.navigate('welcome');
    engine.navigate('servizi');
    const saved = engine.getHistory();

    const engine2 = new ChatbotEngine(flow as ChatFlow);
    engine2.restoreHistory(saved);
    expect(engine2.getHistory()).toEqual(saved);
  });

  it('navigate ignora nodi inesistenti', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    const result = engine.navigate('nodo_che_non_esiste');
    expect(result).toBeUndefined();
    expect(engine.getHistory()).toEqual([]);
  });

  it('reset azzera la history', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    engine.navigate('welcome');
    engine.navigate('servizi');
    engine.reset();
    expect(engine.getHistory()).toEqual([]);
  });

  it('getNode ritorna undefined per nodo inesistente', () => {
    const engine = new ChatbotEngine(flow as ChatFlow);
    expect(engine.getNode('nodo_che_non_esiste')).toBeUndefined();
  });

  it('ogni dettaglio ha opzione preventivo con param', () => {
    const detailNodes = Object.entries(flow).filter(([key]) =>
      key.startsWith('dettaglio_')
    );
    expect(detailNodes.length).toBe(16);
    for (const [key, node] of detailNodes) {
      const ctaOption = node.options?.find(
        (opt: { action?: string }) => opt.action === 'open_form'
      );
      expect(ctaOption, `Nodo "${key}" manca CTA preventivo`).toBeDefined();
      expect(
        (ctaOption as { param?: string }).param,
        `Nodo "${key}" manca param per preventivo`
      ).toBeTruthy();
    }
  });
});
