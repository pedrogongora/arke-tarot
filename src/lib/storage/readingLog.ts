// Direct localStorage helpers — use these when outside React (e.g. server components cannot use them).
// Inside React components, prefer the Zustand logSlice via useLogStore.
import type { Reading } from '@/types';

const KEY = 'tarot-log';

function readStore(): { state: { readings: Reading[] } } | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAllReadings(): Reading[] {
  return readStore()?.state?.readings ?? [];
}

export function getReadingById(id: string): Reading | undefined {
  return getAllReadings().find((r) => r.id === id);
}
