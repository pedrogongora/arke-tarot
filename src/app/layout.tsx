import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arké Tarot',
  description: 'Draw cards. Listen to what arises.',
};

// Inline script runs before React hydration to prevent theme flash.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('tarot-settings');
    if (stored) {
      var parsed = JSON.parse(stored);
      var settings = (parsed.state && parsed.state.settings) ? parsed.state.settings : {};
      var mode = settings.themeMode || 'dark';
      var palette = settings.colorPalette || 'midnight';
      if (mode === 'system') {
        mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.setAttribute('data-palette', palette);
      if (palette === 'custom' && settings.customPaletteHex) {
        var c = settings.customPaletteHex;
        if (c.primary) document.documentElement.style.setProperty('--primary', c.primary);
        if (c.surface) document.documentElement.style.setProperty('--surface', c.surface);
        if (c.accent) document.documentElement.style.setProperty('--accent', c.accent);
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('data-palette', 'midnight');
    }
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-palette', 'midnight');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-palette="midnight" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
