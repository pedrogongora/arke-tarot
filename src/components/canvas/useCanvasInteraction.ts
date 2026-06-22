'use client';

import { useEffect, type RefObject } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { spreadPositionToRect, calcCardHeight, cardContainsPoint } from './cardGeometry';

interface UseCanvasInteractionOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  spread: SpreadDefinition | null;
  drawnCards: DrawnCard[];
  onCardSelect?: (cardId: string | null) => void;
  onCardDrop?: (cardId: string, x: number, y: number) => void; // constellation mode
}

function getEventPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e instanceof MouseEvent ? e.clientX : e.clientX) - rect.left,
    y: (e instanceof MouseEvent ? e.clientY : e.clientY) - rect.top,
  };
}

export function useCanvasInteraction({
  canvasRef,
  spread,
  drawnCards,
  onCardSelect,
}: UseCanvasInteractionOptions) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spread) return;

    function findCardAt(x: number, y: number): string | null {
      if (!canvas) return null;
      const W = canvas.getBoundingClientRect().width;
      const H = canvas.getBoundingClientRect().height;
      const cardH = calcCardHeight(W, H);

      // Iterate in reverse so top-most card is hit first
      for (let i = drawnCards.length - 1; i >= 0; i--) {
        const dc = drawnCards[i];
        const r = spreadPositionToRect(dc.position, W, H, cardH);
        if (cardContainsPoint(r, x, y)) return dc.card.id;
      }
      return null;
    }

    function handleClick(e: MouseEvent) {
      const pos = getEventPos(e, canvas!);
      const cardId = findCardAt(pos.x, pos.y);
      onCardSelect?.(cardId);
    }

    function handleTouchEnd(e: TouchEvent) {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const pos = getEventPos(touch, canvas!);
      const cardId = findCardAt(pos.x, pos.y);
      onCardSelect?.(cardId);
    }

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canvasRef, spread, drawnCards, onCardSelect]);
}
