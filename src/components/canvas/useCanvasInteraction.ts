'use client';

import { useEffect, type RefObject } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { spreadPositionToRect, calcCardHeight, cardContainsPoint, CARD_ASPECT } from './cardGeometry';
import type { DragState } from './useCanvasRenderer';

interface UseCanvasInteractionOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  spread: SpreadDefinition | null;
  drawnCards: DrawnCard[];
  onCardSelect?: (cardId: string | null) => void;
  onCardDrop?: (cardId: string, normalizedX: number, normalizedY: number) => void;
  dragRef?: RefObject<DragState | null>;
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
  onCardDrop,
  dragRef,
}: UseCanvasInteractionOptions) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spread) return;

    function findCardAt(x: number, y: number): string | null {
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const cardH = calcCardHeight(W, H);
      const cardW = cardH * CARD_ASPECT;

      // Iterate in reverse so top-most card is hit first
      for (let i = drawnCards.length - 1; i >= 0; i--) {
        const dc = drawnCards[i];
        let cx: number, cy: number;
        if (spread?.isConstellation && dc.canvasX != null && dc.canvasY != null) {
          cx = dc.canvasX * W;
          cy = dc.canvasY * H;
          // Simple AABB hit-test for constellation (no rotation)
          if (Math.abs(x - cx) <= cardW / 2 && Math.abs(y - cy) <= cardH / 2) {
            return dc.card.id;
          }
        } else {
          const r = spreadPositionToRect(dc.position, W, H, cardH);
          if (cardContainsPoint(r, x, y)) return dc.card.id;
        }
      }
      return null;
    }

    // ── Non-constellation: simple click/touch ────────────────────────────────

    function handleClick(e: MouseEvent) {
      if (spread?.isConstellation) return;
      const pos = getEventPos(e, canvas!);
      const cardId = findCardAt(pos.x, pos.y);
      onCardSelect?.(cardId);
    }

    function handleTouchEnd(e: TouchEvent) {
      if (spread?.isConstellation) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const pos = getEventPos(touch, canvas!);
      const cardId = findCardAt(pos.x, pos.y);
      onCardSelect?.(cardId);
    }

    // ── Constellation: drag-to-reposition ────────────────────────────────────

    let dragState: { cardId: string; startX: number; startY: number; moved: boolean } | null = null;

    function handleMouseDown(e: MouseEvent) {
      if (!spread?.isConstellation) return;
      const pos = getEventPos(e, canvas!);
      const cardId = findCardAt(pos.x, pos.y);
      if (!cardId) return;
      dragState = { cardId, startX: pos.x, startY: pos.y, moved: false };
      if (dragRef) dragRef.current = { cardId, x: pos.x, y: pos.y };
    }

    function handleMouseMove(e: MouseEvent) {
      if (!dragState || !canvas) return;
      const pos = getEventPos(e, canvas);
      const dx = pos.x - dragState.startX;
      const dy = pos.y - dragState.startY;
      if (!dragState.moved && Math.sqrt(dx * dx + dy * dy) > 6) {
        dragState.moved = true;
      }
      if (dragState.moved && dragRef) {
        dragRef.current = { cardId: dragState.cardId, x: pos.x, y: pos.y };
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (!dragState || !canvas) return;
      const pos = getEventPos(e, canvas);
      const rect = canvas.getBoundingClientRect();
      if (dragState.moved) {
        if (dragRef) dragRef.current = null;
        onCardDrop?.(dragState.cardId, pos.x / rect.width, pos.y / rect.height);
      } else {
        onCardSelect?.(dragState.cardId);
      }
      dragState = null;
    }

    function handleTouchStart(e: TouchEvent) {
      if (!spread?.isConstellation) return;
      const touch = e.touches[0];
      if (!touch) return;
      const pos = getEventPos(touch, canvas!);
      const cardId = findCardAt(pos.x, pos.y);
      if (!cardId) return;
      dragState = { cardId, startX: pos.x, startY: pos.y, moved: false };
      if (dragRef) dragRef.current = { cardId, x: pos.x, y: pos.y };
    }

    function handleTouchMove(e: TouchEvent) {
      if (!dragState || !canvas) return;
      const touch = e.touches[0];
      if (!touch) return;
      const pos = getEventPos(touch, canvas);
      const dx = pos.x - dragState.startX;
      const dy = pos.y - dragState.startY;
      if (!dragState.moved && Math.sqrt(dx * dx + dy * dy) > 6) {
        dragState.moved = true;
      }
      if (dragState.moved) {
        e.preventDefault();
        if (dragRef) dragRef.current = { cardId: dragState.cardId, x: pos.x, y: pos.y };
      }
    }

    function handleTouchEndConstellation(e: TouchEvent) {
      if (!dragState || !canvas) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const pos = getEventPos(touch, canvas);
      const rect = canvas.getBoundingClientRect();
      if (dragState.moved) {
        if (dragRef) dragRef.current = null;
        onCardDrop?.(dragState.cardId, pos.x / rect.width, pos.y / rect.height);
      } else {
        onCardSelect?.(dragState.cardId);
      }
      dragState = null;
    }

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEndConstellation, { passive: true });

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEndConstellation);
    };
  }, [canvasRef, spread, drawnCards, onCardSelect, onCardDrop]);
}
