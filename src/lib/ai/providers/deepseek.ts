// Stub — prompt details TBD in a dedicated session.
// DeepSeek uses an OpenAI-compatible API; will reuse the openai package with a custom baseURL.
import type { AIProvider, AIRequest } from '../types';

export const deepseekProvider: AIProvider = {
  name: 'deepseek',

  async *interpret(_req: AIRequest, _apiKey: string, _model: string): AsyncGenerator<string> {
    throw new Error('DeepSeek provider not yet implemented. Configure prompts in a future session.');
  },
};
