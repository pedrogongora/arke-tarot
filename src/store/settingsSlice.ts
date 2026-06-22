'use client';

import type { UserSettings, ThemeMode, ColorPalette, AIProviderName, SupportedLocale, CustomPalette } from '@/types';

export const DEFAULT_SETTINGS: UserSettings = {
  locale: 'en',
  themeMode: 'dark',
  colorPalette: 'midnight',
  reversalEnabled: true,
  reversalChance: 0.33,
  aiProvider: 'none',
};

export interface SettingsSlice {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setTheme: (mode: ThemeMode, palette?: ColorPalette, custom?: CustomPalette) => void;
  setLocale: (locale: SupportedLocale) => void;
  setAIProvider: (provider: AIProviderName, apiKey?: string, model?: string) => void;
}

function applyThemeToDom(mode: ThemeMode, palette: ColorPalette, custom?: CustomPalette) {
  if (typeof document === 'undefined') return;
  const resolved =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-palette', palette);
  if (palette === 'custom' && custom) {
    if (custom.primary) document.documentElement.style.setProperty('--primary', custom.primary);
    if (custom.surface) document.documentElement.style.setProperty('--surface', custom.surface);
    if (custom.accent) document.documentElement.style.setProperty('--accent', custom.accent);
  } else {
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--surface');
    document.documentElement.style.removeProperty('--accent');
  }
}

export function createSettingsSlice(
  set: (fn: (state: { settings: UserSettings }) => Partial<{ settings: UserSettings }>) => void,
  get: () => { settings: UserSettings }
): SettingsSlice {
  return {
    settings: DEFAULT_SETTINGS,

    updateSettings: (partial) => {
      const next = { ...get().settings, ...partial };
      set(() => ({ settings: next }));
      applyThemeToDom(next.themeMode, next.colorPalette, next.customPaletteHex);
    },

    setTheme: (mode, palette, custom) => {
      const current = get().settings;
      const nextPalette = palette ?? current.colorPalette;
      const nextCustom = custom ?? current.customPaletteHex;
      const next = { ...current, themeMode: mode, colorPalette: nextPalette, customPaletteHex: nextCustom };
      set(() => ({ settings: next }));
      applyThemeToDom(mode, nextPalette, nextCustom);
    },

    setLocale: (locale) => {
      set((s) => ({ settings: { ...s.settings, locale } }));
    },

    setAIProvider: (provider, apiKey, model) => {
      set((s) => ({
        settings: { ...s.settings, aiProvider: provider, aiApiKey: apiKey ?? s.settings.aiApiKey, aiModel: model ?? s.settings.aiModel },
      }));
    },
  };
}
