import { CARDS } from '@/data/cards';
import type { Card, DrawnCard, SpreadPosition } from '@/types';

/** Fisher-Yates shuffle — returns a new shuffled array. */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Draw `count` unique cards from the deck. */
export function drawCards(count: number): Card[] {
  const shuffled = shuffle(CARDS);
  return shuffled.slice(0, count);
}

/** Determine if a drawn card should be reversed based on chance. */
export function isReversed(chance: number): boolean {
  return Math.random() < chance;
}

/**
 * Draw cards for a spread, pairing each card with its position.
 * If reversalEnabled is false, all cards are drawn upright.
 */
export function drawForSpread(
  positions: SpreadPosition[],
  reversalEnabled: boolean,
  reversalChance: number
): DrawnCard[] {
  const cards = drawCards(positions.length);
  return positions.map((position, i) => ({
    position,
    card: cards[i],
    isReversed: reversalEnabled ? isReversed(reversalChance) : false,
  }));
}
