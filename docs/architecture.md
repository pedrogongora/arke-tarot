# Architecture

## Overview

Tarot Reader is a Next.js 15 App Router application with a React-based UI. Card spread rendering is done on HTML Canvas. State is managed with Zustand and persisted to localStorage.

## Directory Map

```
src/
├── app/
│   ├── layout.tsx              Root html/body + no-flash theme inline script
│   ├── globals.css             CSS custom property tokens for all palettes and themes
│   └── [locale]/               All user-facing pages (next-intl locale segment)
│       ├── layout.tsx          AppShell + NextIntlClientProvider
│       ├── page.tsx            Home
│       ├── reading/            Spread selector and active reading
│       ├── log/                Reading history
│       ├── card/[cardId]/      Card reference
│       └── settings/           User preferences
├── components/
│   ├── layout/                 AppShell, Navbar, ThemeToggle
│   ├── canvas/                 SpreadCanvas, renderer hook, interaction hook, geometry utils
│   ├── spread/                 SpreadSelector, SpreadPreview
│   ├── card/                   CardImage, CardDetail
│   ├── reading/                ReadingPanel, ReadingNotes, ReadingActions, InterpretationBlock
│   ├── log/                    ReadingCard, ReadingDetail
│   └── ui/                     Button, Modal, Spinner, LocaleSwitcher
├── data/
│   ├── cards.ts                All 78 card definitions
│   ├── spreads.ts              All spread definitions (predefined + constellation)
│   └── cardImages.ts           cardId → /cards/filename.jpg map
├── lib/
│   ├── ai/                     AIProvider interface + provider stubs
│   ├── storage/                localStorage CRUD helpers
│   └── utils/                  cn(), shuffle/draw utilities
├── store/                      Zustand slices (reading, settings, log)
├── types/                      All TypeScript interfaces
└── i18n/                       next-intl routing and server config
```

## Module Responsibilities

| Module | Responsibility |
|---|---|
| `app/[locale]/layout.tsx` | Wraps every page with AppShell and next-intl provider. Handles locale from URL. |
| `components/canvas/SpreadCanvas.tsx` | Owns the `<canvas>` element. Delegates drawing to `useCanvasRenderer`, events to `useCanvasInteraction`. |
| `data/cards.ts` | Single source of truth for all card metadata. i18n keys point to `messages/*.json`. |
| `data/spreads.ts` | Defines every spread as a `SpreadDefinition`. Adding a new spread requires only a new entry here. |
| `store/settingsSlice.ts` | Persists `UserSettings` to localStorage. Settings changes take effect immediately via CSS custom properties. |
| `lib/ai/` | Abstraction layer for AI providers. `factory.ts` returns the right provider; each provider's `interpret()` builds its own prompt. |

## Data Flow

```
User selects spread
  → SpreadSelector → navigate to /reading/[spreadId]
  → reading page loads SpreadDefinition from data/spreads.ts
  → SpreadCanvas renders empty positions
  → User draws cards (deck.ts: shuffle + draw)
  → DrawnCard[] stored in readingSlice
  → SpreadCanvas re-renders with card images
  → User saves → logSlice.addReading (persisted to localStorage)
  → User requests AI → POST /api/interpret → AIProvider.interpret() → streamed response
```
