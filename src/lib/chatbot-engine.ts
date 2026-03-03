// Chatbot engine: manages navigation through a decision-tree flow.
// No external dependencies — pure TypeScript.

export interface ChatNode {
  message: string;
  options?: ChatOption[];
}

export interface ChatOption {
  label: string;
  next?: string;
  action?: 'open_form' | 'open_contacts' | 'call_phone';
  param?: string;
}

export type ChatFlow = Record<string, ChatNode>;

export class ChatbotEngine {
  private flow: ChatFlow;
  private history: string[] = [];

  constructor(flow: ChatFlow) {
    this.flow = flow;
  }

  getNode(id: string): ChatNode | undefined {
    return this.flow[id];
  }

  navigate(nodeId: string): ChatNode | undefined {
    const node = this.getNode(nodeId);
    if (!node) return undefined;
    this.history.push(nodeId);
    // Cap history to prevent unbounded growth in sessionStorage
    if (this.history.length > 100) {
      this.history = this.history.slice(-50);
    }
    return node;
  }

  getHistory(): string[] {
    return [...this.history];
  }

  restoreHistory(history: string[]): void {
    // Only restore valid node IDs that exist in the flow
    this.history = history.filter((id) => typeof id === 'string' && id in this.flow);
  }

  reset(): void {
    this.history = [];
  }
}
