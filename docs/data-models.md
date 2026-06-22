# Data Models

All interfaces are in `src/types/index.ts`.

## Card

Represents a single tarot card. The `id` field is the canonical identifier used everywhere.

```typescript
interface Card {
  id: string;          // 'ar00'–'ar21', 'cups01'–'cups14', 'pents01'–'pents14', 'swords01'–'swords14', 'wands01'–'wands14'
  suit: Suit;          // 'major' | 'cups' | 'pentacles' | 'swords' | 'wands'
  number: number;      // 0–21 for major arcana, 1–14 for minor arcana
  nameKey: string;     // i18n key e.g. 'cards.ar00.name'
  uprightKey: string;  // i18n key e.g. 'cards.ar00.upright'
  reversedKey: string; // i18n key e.g. 'cards.ar00.reversed'
  descriptionKey: string;
  imagePath: string;   // '/cards/ar00.jpg'
  keywords: string[];  // English-only keywords for search
  element?: 'fire' | 'water' | 'air' | 'earth' | 'spirit';
}
```

## SpreadPosition

One position slot in a spread layout. Coordinates are normalized (0–1) within a 4:3 bounding box.

```typescript
interface SpreadPosition {
  id: string;           // e.g. 'past', 'present', 'future', 'house-1'
  labelKey: string;     // i18n key for the position name
  descriptionKey: string; // i18n key explaining what this position means
  x: number;            // 0 = left edge, 1 = right edge
  y: number;            // 0 = top edge, 1 = bottom edge
  rotation?: number;    // degrees; 90 for the crossing card in Celtic Cross
}
```

## SpreadDefinition

Describes a complete spread. Adding a new spread is adding one of these to `data/spreads.ts`.

```typescript
interface SpreadDefinition {
  id: string;             // URL-safe slug: 'celtic-cross', 'one-card', 'constellation'
  nameKey: string;
  descriptionKey: string;
  cardCount: number;      // 0 for constellation (variable)
  positions: SpreadPosition[];
  isConstellation: boolean;
  previewLayout: 'linear' | 'grid' | 'cross' | 'circle' | 'free';
  minCards?: number;      // constellation only
  maxCards?: number;
}
```

## DrawnCard

A card that has been drawn into a specific spread position.

```typescript
interface DrawnCard {
  position: SpreadPosition;
  card: Card;
  isReversed: boolean;
  canvasX?: number;    // pixel coords (constellation mode only)
  canvasY?: number;
  userLabel?: string;  // custom label (constellation mode only)
}
```

## Reading

A completed (or in-progress) reading session, saved to the log.

```typescript
interface Reading {
  id: string;          // UUID v4
  spreadId: string;
  drawnCards: DrawnCard[];
  notes: string;
  createdAt: string;   // ISO 8601
  aiInterpretation?: AIResponse;
}
```

## UserSettings

Persisted to localStorage via Zustand's `persist` middleware.

```typescript
interface UserSettings {
  locale: 'en' | 'es';
  themeMode: 'light' | 'dark' | 'system';
  colorPalette: 'midnight' | 'forest' | 'crimson' | 'celestial' | 'custom';
  customPaletteHex?: { primary: string; surface: string; accent: string };
  reversalEnabled: boolean;
  reversalChance: number;  // 0–1, probability a drawn card is reversed (default 0.33)
  aiProvider: 'claude' | 'openai' | 'deepseek' | 'none';
  aiApiKey?: string;
  aiModel?: string;
}
```

## AI types

```typescript
interface AIRequest {
  spread: SpreadDefinition;
  drawnCards: DrawnCard[];
  notes: string;
  locale: 'en' | 'es';
}

interface AIResponse {
  text: string;
  provider: AIProviderName;
  model: string;
  generatedAt: string;
}

interface AIProvider {
  name: AIProviderName;
  interpret(req: AIRequest, apiKey: string, model: string): AsyncGenerator<string>;
}
```
