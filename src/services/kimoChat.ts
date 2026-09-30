import { parseKimoResponse, KimoAction } from '../utils/kimoMarkdown';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  displayText?: string;
  actions?: KimoAction[];
  timestamp: string;
}

export interface KimoContext {
  theme?: string;
  activeWindowId?: string | null;
  openWindows?: string[];
  fearAndGreed?: number;
  totalMarketCapUsd?: number;
  recentLogs?: Array<{ endpoint: string; status: number; latency: number }>;
}

class KimoChatService {
  private history: ChatMessage[] = [];

  constructor() {
    this.history = [
      {
        id: 'kimo-welcome',
        role: 'assistant',
        content: `Greetings! I am **KIMO**, your institutional AI copilot powered by DeepSeek Flash.

I have direct programmatic control over this terminal. You can ask me to:
* **Control Workspace**: "Open Cascade Radar", "Tile all windows", "Switch to dark mode"
* **Stress-test RWA Solvency**: "Simulate a $1M exit on USDY" or "Audit Ondo Finance"
* **Scan Liquidations**: "What is the highest risk perpetual derivative right now?"
* **Explain Spreads**: "Check weekend basis divergence on tokenized NVDA"

How can I assist your analysis today?`,
        displayText: `Greetings! I am **KIMO**, your institutional AI copilot powered by DeepSeek Flash.

I have direct programmatic control over this terminal. You can ask me to:
* **Control Workspace**: "Open Cascade Radar", "Tile all windows", "Switch to dark mode"
* **Stress-test RWA Solvency**: "Simulate a $1M exit on USDY" or "Audit Ondo Finance"
* **Scan Liquidations**: "What is the highest risk perpetual derivative right now?"
* **Explain Spreads**: "Check weekend basis divergence on tokenized NVDA"

How can I assist your analysis today?`,
        actions: [],
        timestamp: new Date().toISOString()
      }
    ];
  }

  public getHistory(): ChatMessage[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [this.history[0]];
  }

  public async sendMessage(
    userText: string,
    context?: KimoContext
  ): Promise<{ message: ChatMessage; actions: KimoAction[] }> {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      displayText: userText,
      timestamp: new Date().toISOString()
    };
    this.history.push(userMsg);

    // Format messages for OpenRouter /api/chat
    const apiMessages = this.history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content
      }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const rawContent: string = data.choices?.[0]?.message?.content || '';

      const { displayText, actions } = parseKimoResponse(rawContent);

      const assistantMsg: ChatMessage = {
        id: `kimo-${Date.now()}`,
        role: 'assistant',
        content: rawContent,
        displayText,
        actions,
        timestamp: new Date().toISOString()
      };

      this.history.push(assistantMsg);
      return { message: assistantMsg, actions };
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `kimo-err-${Date.now()}`,
        role: 'assistant',
        content: `Error communicating with KIMO AI: ${err.message}. Please check your OpenRouter configuration.`,
        displayText: `Error communicating with KIMO AI: ${err.message}. Please check your OpenRouter configuration.`,
        actions: [],
        timestamp: new Date().toISOString()
      };
      this.history.push(errorMsg);
      return { message: errorMsg, actions: [] };
    }
  }
}

export const kimoChat = new KimoChatService();
