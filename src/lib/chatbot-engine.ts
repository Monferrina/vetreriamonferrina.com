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
    this.history.push(nodeId);
    return this.getNode(nodeId);
  }

  goBack(): ChatNode | undefined {
    this.history.pop(); // remove current
    const prev = this.history[this.history.length - 1] ?? 'welcome';
    return this.getNode(prev);
  }

  getHistory(): string[] {
    return [...this.history];
  }

  restoreHistory(history: string[]): void {
    this.history = [...history];
  }

  reset(): void {
    this.history = [];
  }
}
