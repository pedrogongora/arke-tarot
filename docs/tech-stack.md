# Tech Stack

## Framework: Next.js 15 (App Router)

Server Components serve static card data and spread definitions with zero client JS overhead. `loading.tsx` handles async AI calls gracefully. Route groups and nested layouts provide the app shell without prop-drilling. Future: Server Actions can replace the `/api/interpret` route for AI calls.

## Language: TypeScript 5

Strict mode enabled. All interfaces live in `src/types/index.ts`.

## Styling: Tailwind CSS v4 + CSS Custom Properties

Tailwind v4 uses a CSS-first configuration via `@import "tailwindcss"` and `@theme inline` blocks in `globals.css`. No `tailwind.config.js` file needed. CSS custom properties (`--color-*`) hold the actual palette values and are swapped by setting `data-theme` and `data-palette` attributes on `<html>`. Tailwind utilities reference them via `var()`. This means palette changes are zero-JS: just an attribute swap.

## State Management: Zustand 5

Three slices: `readingSlice` (active reading, not persisted), `settingsSlice` (user settings, persisted), `logSlice` (reading history, persisted). The `persist` middleware serializes to localStorage under `tarot-settings` and `tarot-log` keys. Zustand was chosen over React Context because Canvas event handlers run outside React's render tree and need direct store access without hooks.

## i18n: next-intl 3

Locale lives in the URL (`/en/...`, `/es/...`). The middleware redirects `/` to the user's preferred locale (from `UserSettings.locale`). Translation keys are typed: missing keys surface as TypeScript errors. Messages live in `messages/en.json` and `messages/es.json`.

## Canvas: Native Browser Canvas API

No canvas library. Two custom hooks (`useCanvasRenderer`, `useCanvasInteraction`) own all imperative canvas logic. `SpreadCanvas.tsx` is a thin React wrapper that passes `ref` to the hooks. Card images are loaded lazily into a module-level `Map<string, HTMLImageElement>` and reused across renders.

## AI: Custom Provider Interface

`AIProvider` interface in `src/lib/ai/types.ts` defines `interpret(): AsyncGenerator<string>`. Three stubs exist for Claude (Anthropic), OpenAI, and DeepSeek. Prompt details are out of scope for Phase 1. The API route (`app/api/interpret/route.ts`) streams provider output back to the client using `ReadableStream`. The user's API key is sent in the POST body and never stored server-side.

## Packages

| Package | Version | Purpose |
|---|---|---|
| `next` | ^15.3.3 | Framework |
| `react` | ^19.0.0 | UI |
| `next-intl` | ^3.26.3 | i18n routing + translations |
| `zustand` | ^5.0.3 | State management |
| `tailwindcss` | ^4.0.0 | Utility CSS |
| `@tailwindcss/postcss` | ^4.0.0 | Tailwind v4 PostCSS integration |
| `clsx` | ^2.1.1 | Conditional classnames |
| `tailwind-merge` | ^2.6.0 | Merge Tailwind classes safely |
| `uuid` | ^11.0.5 | Generate reading IDs |
