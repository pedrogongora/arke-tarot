import type { Reading, DrawnCard, SpreadDefinition, AIStatus, ReadingPhase, AIProviderName } from '@/types';

export interface ReadingSlice {
  activeReading: Reading | null;
  activeSpread: SpreadDefinition | null;
  phase: ReadingPhase;
  aiStatus: AIStatus;
  aiStreamBuffer: string;
  aiError: string | null;

  initReading: (spread: SpreadDefinition) => void;
  addDrawnCard: (drawnCard: DrawnCard) => void;
  updateCardPosition: (cardId: string, normalizedX: number, normalizedY: number) => void;
  removeDrawnCard: (cardId: string) => void;
  setNotes: (notes: string) => void;
  setPhase: (phase: ReadingPhase) => void;
  setAIStatus: (status: AIStatus) => void;
  appendAIStream: (chunk: string) => void;
  setAIError: (err: string | null) => void;
  finalizeAIInterpretation: (provider: AIProviderName, model: string) => void;
  clearReading: () => void;
}

export function createReadingSlice(
  set: (fn: (state: ReadingSlice) => Partial<ReadingSlice>) => void,
): ReadingSlice {
  return {
    activeReading: null,
    activeSpread: null,
    phase: 'idle',
    aiStatus: 'idle',
    aiStreamBuffer: '',
    aiError: null,

    initReading: (spread) => {
      const { v4: uuid } = require('uuid') as typeof import('uuid');
      set(() => ({
        activeSpread: spread,
        activeReading: {
          id: uuid(),
          spreadId: spread.id,
          spreadNameKey: spread.nameKey,
          drawnCards: [],
          notes: '',
          createdAt: new Date().toISOString(),
        },
        phase: 'drawing',
        aiStatus: 'idle',
        aiStreamBuffer: '',
        aiError: null,
      }));
    },

    addDrawnCard: (drawnCard) => {
      set((s) => {
        if (!s.activeReading) return {};
        return {
          activeReading: {
            ...s.activeReading,
            drawnCards: [...s.activeReading.drawnCards, drawnCard],
          },
        };
      });
    },

    updateCardPosition: (cardId, normalizedX, normalizedY) => {
      set((s) => {
        if (!s.activeReading) return {};
        return {
          activeReading: {
            ...s.activeReading,
            drawnCards: s.activeReading.drawnCards.map((dc) =>
              dc.card.id === cardId
                ? { ...dc, canvasX: normalizedX, canvasY: normalizedY }
                : dc
            ),
          },
        };
      });
    },

    removeDrawnCard: (cardId) => {
      set((s) => {
        if (!s.activeReading) return {};
        return {
          activeReading: {
            ...s.activeReading,
            drawnCards: s.activeReading.drawnCards.filter((dc) => dc.card.id !== cardId),
          },
        };
      });
    },

    setNotes: (notes) => {
      set((s) => {
        if (!s.activeReading) return {};
        return { activeReading: { ...s.activeReading, notes } };
      });
    },

    setPhase: (phase) => set(() => ({ phase })),

    setAIStatus: (status) => set(() => ({
      aiStatus: status,
      ...(status === 'loading' ? { aiStreamBuffer: '', aiError: null } : {}),
    })),

    appendAIStream: (chunk) => {
      set((s) => ({ aiStreamBuffer: s.aiStreamBuffer + chunk }));
    },

    setAIError: (err) => set(() => ({ aiError: err })),

    finalizeAIInterpretation: (provider, model) => {
      set((s) => {
        if (!s.activeReading) return {};
        return {
          activeReading: {
            ...s.activeReading,
            aiInterpretation: {
              text: s.aiStreamBuffer,
              provider,
              model,
              generatedAt: new Date().toISOString(),
            },
          },
          aiStatus: 'done',
        };
      });
    },

    clearReading: () => {
      set(() => ({
        activeReading: null,
        activeSpread: null,
        phase: 'idle',
        aiStatus: 'idle',
        aiStreamBuffer: '',
        aiError: null,
      }));
    },
  };
}
