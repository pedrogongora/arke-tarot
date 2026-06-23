'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { createSettingsSlice, type SettingsSlice } from './settingsSlice';
import { createLogSlice, type LogSlice } from './logSlice';
import { createReadingSlice, type ReadingSlice } from './readingSlice';

// ── Settings store (persisted) ────────────────────────────────────
type SettingsState = SettingsSlice;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => createSettingsSlice(set as Parameters<typeof createSettingsSlice>[0], get),
    {
      name: 'tarot-settings',
      onRehydrateStorage: () => (state) => {
        // Re-apply theme to DOM after rehydration from localStorage
        if (state?.settings && typeof document !== 'undefined') {
          const { themeMode, colorPalette, customPaletteHex } = state.settings;
          const mode =
            themeMode === 'system'
              ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
              : themeMode;
          document.documentElement.setAttribute('data-theme', mode);
          document.documentElement.setAttribute('data-palette', colorPalette);
          if (colorPalette === 'custom' && customPaletteHex) {
            const c = customPaletteHex;
            if (c.primary) document.documentElement.style.setProperty('--primary', c.primary);
            if (c.surface) document.documentElement.style.setProperty('--surface', c.surface);
            if (c.accent) document.documentElement.style.setProperty('--accent', c.accent);
          }
        }
      },
    }
  )
);

// ── Log store (persisted) ─────────────────────────────────────────
type LogState = LogSlice;

export const useLogStore = create<LogState>()(
  persist(
    (set, get) => createLogSlice(set as Parameters<typeof createLogSlice>[0], get),
    { name: 'tarot-log' }
  )
);

// ── Reading store (not persisted — active session only) ───────────
type ReadingState = ReadingSlice;

export const useReadingStore = create<ReadingState>()(
  (set) => createReadingSlice(set as Parameters<typeof createReadingSlice>[0])
);

// Convenience selector hooks
export const useSettings = () => useSettingsStore((s) => s.settings);
export const useSettingsActions = () =>
  useSettingsStore(
    useShallow((s) => ({
      updateSettings: s.updateSettings,
      setTheme: s.setTheme,
      setLocale: s.setLocale,
      setAIProvider: s.setAIProvider,
    }))
  );

export const useReadings = () => useLogStore((s) => s.readings);
export const useLogActions = () =>
  useLogStore(
    useShallow((s) => ({
      addReading: s.addReading,
      deleteReading: s.deleteReading,
      updateReading: s.updateReading,
      getReading: s.getReading,
    }))
  );

export const useActiveReading = () => useReadingStore((s) => s.activeReading);
export const useReadingPhase = () => useReadingStore((s) => s.phase);
export const useAIStatus = () => useReadingStore((s) => s.aiStatus);
export const useReadingActions = () =>
  useReadingStore(
    useShallow((s) => ({
      initReading: s.initReading,
      addDrawnCard: s.addDrawnCard,
      setNotes: s.setNotes,
      setPhase: s.setPhase,
      setAIStatus: s.setAIStatus,
      appendAIStream: s.appendAIStream,
      setAIError: s.setAIError,
      finalizeAIInterpretation: s.finalizeAIInterpretation,
      clearReading: s.clearReading,
    }))
  );
