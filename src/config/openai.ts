// OpenAI API Configuration
export const OPENAI_API_KEY = (import.meta as unknown as { env: { VITE_OPENAI_API_KEY?: string } }).env?.VITE_OPENAI_API_KEY || '';

export const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

// Check if API key is configured
export const isOpenAIConfigured = () => {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0;
};

// OpenAI API client
export class OpenAIClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || OPENAI_API_KEY;
    this.baseURL = OPENAI_API_BASE_URL;
  }

  async chatCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4',
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async generateText(prompt: string, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }) {
    const messages = [
      { role: 'user' as const, content: prompt }
    ];

    const response = await this.chatCompletion(messages, options);
    return response.choices[0]?.message?.content || '';
  }
}

// Default client instance
export const openaiClient = new OpenAIClient();
