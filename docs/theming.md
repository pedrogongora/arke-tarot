# Theming System

## Overview

Themes are driven entirely by CSS custom properties. Switching theme or palette requires only changing two HTML attributes (`data-theme`, `data-palette`) on `<html>`. No JavaScript recalculation, no class toggling on every element.

## CSS Custom Properties

`src/app/globals.css` defines design tokens per theme/palette combination:

```css
:root[data-theme="light"][data-palette="midnight"] {
  --background: #f8f6f0;
  --surface:    #ffffff;
  --primary:    #2a1f5e;
  --accent:     #c9a84c;
  --foreground: #1a1a2e;
  --muted:      #6b6b8a;
  --border:     #d4d0e0;
  --card-back:  #2a1f5e;
}
```

The `@theme inline` block in `globals.css` maps these to Tailwind utility classes:

```css
@theme inline {
  --color-background: var(--background);
  --color-surface:    var(--surface);
  --color-primary:    var(--primary);
  --color-accent:     var(--accent);
  --color-foreground: var(--foreground);
  --color-muted:      var(--muted);
  --color-border:     var(--border);
}
```

This lets you write: `bg-background`, `text-primary`, `border-border`, `text-muted`, etc.

## Palettes

Four built-in palettes, each with light and dark variants:

| Palette | Mood |
|---|---|
| `midnight` | Deep purple / gold — classic mystical |
| `forest` | Dark green / copper — nature-grounded |
| `crimson` | Deep red / ivory — passionate |
| `celestial` | Indigo / silver — cosmic |
| `custom` | User-defined primary, surface, accent colors |

## No-Flash on Load

A small inline `<script>` in the root `src/app/layout.tsx` runs before React hydration:

```html
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    try {
      var s = JSON.parse(localStorage.getItem('tarot-settings') || '{}');
      var state = s.state || {};
      var settings = state.settings || {};
      var mode = settings.themeMode || 'dark';
      var palette = settings.colorPalette || 'midnight';
      if (mode === 'system') {
        mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.setAttribute('data-palette', palette);
    } catch(e) {}
  })();
` }} />
```

This prevents any flash of the wrong theme on page load/reload.

## Changing Theme at Runtime

The `ThemeToggle` component and settings page both call `settingsSlice.updateSettings({ themeMode, colorPalette })`. The slice setter also updates `document.documentElement` attributes directly:

```typescript
document.documentElement.setAttribute('data-theme', resolvedMode);
document.documentElement.setAttribute('data-palette', palette);
```

## Custom Palette

When `colorPalette === 'custom'`, three CSS custom properties are set as inline styles on `document.documentElement`:

```typescript
document.documentElement.style.setProperty('--primary', customPaletteHex.primary);
document.documentElement.style.setProperty('--surface', customPaletteHex.surface);
document.documentElement.style.setProperty('--accent', customPaletteHex.accent);
```

These override the palette-specific values because inline styles have higher specificity than `[data-palette]` selectors.
