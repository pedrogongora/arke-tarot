# AI Integration

## Status

Phase 1: Architecture defined, provider stubs in place. Prompt templates are out of scope until a dedicated session.

## Interface

```typescript
// src/lib/ai/types.ts

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
  generatedAt: string;  // ISO 8601
}

interface AIProvider {
  name: AIProviderName;
  // Returns an async generator for streaming support
  interpret(req: AIRequest, apiKey: string, model: string): AsyncGenerator<string>;
}
```

## Providers

| Provider | File | SDK / Approach |
|---|---|---|
| Claude (Anthropic) | `src/lib/ai/providers/claude.ts` | `@anthropic-ai/sdk` (add in future session) |
| OpenAI | `src/lib/ai/providers/openai.ts` | `openai` npm package |
| DeepSeek | `src/lib/ai/providers/deepseek.ts` | OpenAI-compatible API with custom baseURL |

`src/lib/ai/factory.ts` exports `getProvider(name: AIProviderName): AIProvider`.

## API Route

`src/app/api/interpret/route.ts` handles POST requests:

1. Receives `{ request: AIRequest, apiKey: string, model: string, provider: AIProviderName }`
2. Calls `getProvider(provider).interpret(request, apiKey, model)`
3. Streams response chunks back via `ReadableStream`
4. **The API key is never stored server-side** — it lives only in the user's `UserSettings` in localStorage and is sent per-request

## Client Streaming

The `InterpretationBlock` component fetches from `/api/interpret` and reads the stream:

```typescript
const res = await fetch('/api/interpret', { method: 'POST', body: JSON.stringify(payload) });
const reader = res.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  appendToStreamBuffer(decoder.decode(value));
}
```

Zustand's `readingSlice.aiStreamBuffer` accumulates the streamed text.

## Prompt Design (Future Session)

Each provider's `interpret()` method builds its own prompt internally. The `AIRequest` provides all needed data:
- Spread name and description
- Each position's label and description
- Card drawn for each position (name, upright/reversed, meaning)
- User notes
- Target language

Prompts will be designed in a dedicated planning session and added to provider files without touching the interface.
