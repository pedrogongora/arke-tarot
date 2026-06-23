import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIRequest } from '../types';
import { buildPrompt, getSystemPrompt } from '../buildPrompt';

export const claudeProvider: AIProvider = {
  name: 'claude',

  async *interpret(req: AIRequest, apiKey: string, model: string): AsyncGenerator<string> {
    const client = new Anthropic({ apiKey });

    const stream = client.messages.stream({
      model: model || 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: getSystemPrompt(req.locale),
      messages: [{ role: 'user', content: buildPrompt(req) }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        yield chunk.delta.text;
      }
    }
  },
};
