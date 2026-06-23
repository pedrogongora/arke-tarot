import type { AIProviderName } from '@/types';
import type { AIProvider } from './types';
import { claudeProvider } from './providers/claude';
import { openaiProvider } from './providers/openai';
import { deepseekProvider } from './providers/deepseek';

const PROVIDERS: Record<Exclude<AIProviderName, 'none'>, AIProvider> = {
  claude: claudeProvider,
  openai: openaiProvider,
  deepseek: deepseekProvider,
};

export function getProvider(name: AIProviderName): AIProvider {
  if (name === 'none') {
    throw new Error('No AI provider configured. Select a provider in Settings.');
  }
  return PROVIDERS[name];
}
