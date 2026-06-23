# Arké Tarot

> Draw cards. Listen to what arises.

Arké Tarot is a free, privacy-first tool for tarot readings. Draw cards from a 78-card deck across multiple spread types, take notes, and export your reading as an image or a prompt for any AI assistant — no account required.

## Features

- 78-card deck with upright and reversed meanings
- Multiple spreads: Celtic Cross, Three-Card, Five-Card, Horseshoe, and free-form Constellation
- Export your spread as an image (PNG)
- Generate an AI prompt for any assistant (Claude, ChatGPT, DeepSeek, Gemini, and more)
- Reading log stored locally in your browser
- Multiple color themes
- English and Spanish interface

## Privacy

All your data — readings, notes, and settings — is stored locally in your browser (localStorage). Nothing is sent to any server. Your information stays on your device unless you actively copy a prompt and paste it into an AI assistant yourself.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) — state management with localStorage persistence
- [next-intl](https://next-intl-docs.vercel.app/) — i18n (EN / ES)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
npm run build    # production build
npm run start    # serve production build
npm run type-check  # TypeScript check
```

## Deployment

The app is deployed as a static site to GitHub Pages via GitHub Actions.

**Automatic:** Every push to `master` triggers the [deploy workflow](.github/workflows/deploy.yml), which builds the app and publishes it.

**Manual:** Go to **Actions → Deploy to GitHub Pages → Run workflow** in the GitHub repo.

**First-time setup:** In the repo settings, go to **Settings → Pages → Source** and select **GitHub Actions**.

## About the Developer

I'm Pedro, scientist, programmer, and matrix player.

I believe in the freedom of knowledge, and this is a great tool for that. You can use it with your preferred AI agent, in paid or free versions. No subscriptions or registrations needed — your information is yours and stays saved in your browser unless you decide to share it with an AI agent.

I created this app for my own enjoyment and share it with care, asking nothing in return. But if you'd like to buy me a coffee as thanks, I'd gladly accept:

☕ [buymeacoffee.com/proyectomatrioska](https://buymeacoffee.com/proyectomatrioska)

## Licenses & Attribution

**Source code** — GNU General Public License v3.0 (GPL-3.0-or-later).  
See [LICENSE](./LICENSE) or <https://www.gnu.org/licenses/gpl-3.0.html>.

**Tarot card images** — Sourced from [Wikimedia Commons](https://commons.wikimedia.org).

**Other content** — Creative Commons Attribution-ShareAlike 4.0 International ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)).
