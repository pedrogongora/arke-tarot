// Stub — prompt details TBD in a dedicated session.
// Will use the openai npm package when implemented.
import type { AIProvider, AIRequest } from '../types';

export const openaiProvider: AIProvider = {
  name: 'openai',

  async *interpret(_req: AIRequest, _apiKey: string, _model: string): AsyncGenerator<string> {
    throw new Error('OpenAI provider not yet implemented. Configure prompts in a future session.');
  },
};
