import type { Reading } from '@/types';

export interface LogSlice {
  readings: Reading[];
  addReading: (reading: Reading) => void;
  deleteReading: (id: string) => void;
  updateReading: (id: string, partial: Partial<Reading>) => void;
  getReading: (id: string) => Reading | undefined;
}

export function createLogSlice(
  set: (fn: (state: { readings: Reading[] }) => Partial<{ readings: Reading[] }>) => void,
  get: () => { readings: Reading[] }
): LogSlice {
  return {
    readings: [],

    addReading: (reading) => {
      set((s) => ({ readings: [reading, ...s.readings] }));
    },

    deleteReading: (id) => {
      set((s) => ({ readings: s.readings.filter((r) => r.id !== id) }));
    },

    updateReading: (id, partial) => {
      set((s) => ({
        readings: s.readings.map((r) => (r.id === id ? { ...r, ...partial } : r)),
      }));
    },

    getReading: (id) => {
      return get().readings.find((r) => r.id === id);
    },
  };
}
