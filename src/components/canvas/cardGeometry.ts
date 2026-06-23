import type { SpreadPosition } from '@/types';

// Rider-Waite aspect ratio (portrait)
export const CARD_ASPECT = 0.565;

export interface CardRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
}

/**
 * Maps a normalized SpreadPosition (0–1 in a 4:3 box) to canvas pixel coordinates.
 */
export function spreadPositionToRect(
  pos: SpreadPosition,
  canvasWidth: number,
  canvasHeight: number,
  cardHeight: number
): CardRect {
  const cardWidth = cardHeight * CARD_ASPECT;
  return {
    x: pos.x * canvasWidth,
    y: pos.y * canvasHeight,
    width: cardWidth,
    height: cardHeight,
    rotation: pos.rotation ?? 0,
  };
}

/**
 * Calculate a reasonable card height given canvas dimensions.
 * Cards occupy roughly 1/5 of the canvas height in a standard spread.
 */
export function calcCardHeight(canvasWidth: number, canvasHeight: number): number {
  const baseHeight = Math.min(canvasHeight * 0.22, canvasWidth * 0.12);
  return Math.max(baseHeight, 60);
}

/**
 * Hit-test: check if (px, py) falls within a (possibly rotated) card rect.
 * Applies inverse rotation to transform the point into the card's local space.
 */
export function cardContainsPoint(rect: CardRect, px: number, py: number): boolean {
  const dx = px - rect.x;
  const dy = py - rect.y;
  const rad = -(rect.rotation * Math.PI) / 180;
  const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
  const localY = dx * Math.sin(rad) + dy * Math.cos(rad);
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  return Math.abs(localX) <= halfW && Math.abs(localY) <= halfH;
}
