import type { SpreadDefinition, DrawnCard, AIProviderName, SupportedLocale } from '@/types';

export interface ResolvedCard {
  positionLabel: string;
  positionDesc: string;
  cardName: string;
  orientation: 'upright' | 'reversed';
  meaning: string;
}

export interface AIRequest {
  spread: SpreadDefinition;
  drawnCards: DrawnCard[];
  notes: string;
  locale: SupportedLocale;
  resolvedCards?: ResolvedCard[];
  resolvedSpreadName?: string;
}

export interface AIResponse {
  text: string;
  provider: AIProviderName;
  model: string;
  generatedAt: string;
}

export interface AIProvider {
  name: AIProviderName;
  interpret(req: AIRequest, apiKey: string, model: string): AsyncGenerator<string>;
}
