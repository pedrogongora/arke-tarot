export type Suit = 'major' | 'cups' | 'pentacles' | 'swords' | 'wands';
export type Element = 'fire' | 'water' | 'air' | 'earth' | 'spirit';

export interface Card {
  id: string;
  suit: Suit;
  number: number;
  nameKey: string;
  uprightKey: string;
  reversedKey: string;
  descriptionKey: string;
  imagePath: string;
  keywords: string[];
  element?: Element;
}

export interface SpreadPosition {
  id: string;
  labelKey: string;
  descriptionKey: string;
  x: number;
  y: number;
  rotation?: number;
}

export type PreviewLayout = 'linear' | 'grid' | 'cross' | 'circle' | 'free';

export interface SpreadDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  cardCount: number;
  positions: SpreadPosition[];
  isConstellation: boolean;
  previewLayout: PreviewLayout;
  minCards?: number;
  maxCards?: number;
}

export interface DrawnCard {
  position: SpreadPosition;
  card: Card;
  isReversed: boolean;
  canvasX?: number;
  canvasY?: number;
  userLabel?: string;
}

export interface Reading {
  id: string;
  spreadId: string;
  spreadNameKey: string;
  drawnCards: DrawnCard[];
  notes: string;
  createdAt: string;
  aiInterpretation?: AIResponse;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorPalette = 'midnight' | 'forest' | 'crimson' | 'celestial' | 'custom';
export type AIProviderName = 'claude' | 'openai' | 'deepseek' | 'none';
export type SupportedLocale = 'en' | 'es';

export interface CustomPalette {
  primary: string;
  surface: string;
  accent: string;
}

export interface UserSettings {
  locale: SupportedLocale;
  themeMode: ThemeMode;
  colorPalette: ColorPalette;
  customPaletteHex?: CustomPalette;
  reversalEnabled: boolean;
  reversalChance: number;
  aiProvider: AIProviderName;
  aiApiKey?: string;
  aiModel?: string;
}

export interface AIRequest {
  spread: SpreadDefinition;
  drawnCards: DrawnCard[];
  notes: string;
  locale: SupportedLocale;
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

export type ReadingPhase =
  | 'idle'
  | 'selecting-spread'
  | 'shuffling'
  | 'drawing'
  | 'reviewing'
  | 'interpreting';

export type AIStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';
