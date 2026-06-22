'use client';

import { useEffect, type RefObject } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { spreadPositionToRect, calcCardHeight, cardContainsPoint, CARD_ASPECT } from './cardGeometry';
import type { DragState, Viewport } from './useCanvasRenderer';

interface UseCanvasInteractionOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  spread: SpreadDefinition | null;
  drawnCards: DrawnCard[];
  onCardSelect?: (cardId: string | null) => void;
  onCardDrop?: (cardId: string, normalizedX: number, normalizedY: number) => void;
  dragRef?: RefObject<DragState | null>;
  viewportRef?: RefObject<Viewport>;
}

function getEventPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

// Convert screen (CSS-pixel) coords to world (canvas draw) coords
function toWorld(screenX: number, screenY: number, vp: Viewport) {
  return {
    x: (screenX - vp.panX) / vp.zoom,
    y: (screenY - vp.panY) / vp.zoom,
  };
}

function getTouchDistance(t1: Touch, t2: Touch) {
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchMidpoint(t1: Touch, t2: Touch, canvas: HTMLCanvasElement) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (t1.clientX + t2.clientX) / 2 - r.left,
    y: (t1.clientY + t2.clientY) / 2 - r.top,
  };
}

function clampZoom(z: number) { return z < 0.5 ? 0.5 : z > 3 ? 3 : z; }

export function useCanvasInteraction({
  canvasRef,
  spread,
  drawnCards,
  onCardSelect,
  onCardDrop,
  dragRef,
  viewportRef,
}: UseCanvasInteractionOptions) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spread) return;

    const getVP = (): Viewport => viewportRef?.current ?? { zoom: 1, panX: 0, panY: 0 };

    function findCardAt(screenX: number, screenY: number): string | null {
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const cardH = calcCardHeight(W, H);
      const cardW = cardH * CARD_ASPECT;
      const { x: wx, y: wy } = toWorld(screenX, screenY, getVP());

      for (let i = drawnCards.length - 1; i >= 0; i--) {
        const dc = drawnCards[i];
        if (spread?.isConstellation && dc.canvasX != null && dc.canvasY != null) {
          const cx = dc.canvasX * W;
          const cy = dc.canvasY * H;
          if (Math.abs(wx - cx) <= cardW / 2 && Math.abs(wy - cy) <= cardH / 2) return dc.card.id;
        } else {
          const r = spreadPositionToRect(dc.position, W, H, cardH);
          if (cardContainsPoint(r, wx, wy)) return dc.card.id;
        }
      }
      return null;
    }

    // ── Mouse: unified down/move/up for pan, card-select, and constellation drag ──

    type MouseMode =
      | { kind: 'idle' }
      | { kind: 'select'; cardId: string; startX: number; startY: number }
      | { kind: 'constellation-drag'; cardId: string; startX: number; startY: number; moved: boolean }
      | { kind: 'pan'; startX: number; startY: number; originPanX: number; originPanY: number };

    let mouse: MouseMode = { kind: 'idle' };

    function handleMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      const pos = getEventPos(e, canvas!);
      const cardId = findCardAt(pos.x, pos.y);

      if (spread?.isConstellation && cardId) {
        mouse = { kind: 'constellation-drag', cardId, startX: pos.x, startY: pos.y, moved: false };
        const { x: wx, y: wy } = toWorld(pos.x, pos.y, getVP());
        if (dragRef) dragRef.current = { cardId, x: wx, y: wy };
      } else if (cardId) {
        mouse = { kind: 'select', cardId, startX: pos.x, startY: pos.y };
      } else {
        const vp = getVP();
        mouse = { kind: 'pan', startX: pos.x, startY: pos.y, originPanX: vp.panX, originPanY: vp.panY };
      }
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const pos = getEventPos(e, canvas);

      if (mouse.kind === 'pan') {
        if (viewportRef) {
          viewportRef.current.panX = mouse.originPanX + (pos.x - mouse.startX);
          viewportRef.current.panY = mouse.originPanY + (pos.y - mouse.startY);
        }
      } else if (mouse.kind === 'constellation-drag') {
        const dx = pos.x - mouse.startX;
        const dy = pos.y - mouse.startY;
        if (!mouse.moved && Math.sqrt(dx * dx + dy * dy) > 6) mouse.moved = true;
        if (mouse.moved && dragRef) {
          const { x: wx, y: wy } = toWorld(pos.x, pos.y, getVP());
          // dragRef stores world-space CSS pixel coords; renderer draws at these in world space
          dragRef.current = { cardId: mouse.cardId, x: wx, y: wy };
        }
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (!canvas) return;
      const pos = getEventPos(e, canvas);

      if (mouse.kind === 'select') {
        const dx = pos.x - mouse.startX;
        const dy = pos.y - mouse.startY;
        if (Math.sqrt(dx * dx + dy * dy) < 6) onCardSelect?.(mouse.cardId);
      } else if (mouse.kind === 'constellation-drag') {
        if (dragRef) dragRef.current = null;
        if (mouse.moved) {
          const rect = canvas.getBoundingClientRect();
          const { x: wx, y: wy } = toWorld(pos.x, pos.y, getVP());
          onCardDrop?.(mouse.cardId, wx / rect.width, wy / rect.height);
        } else {
          onCardSelect?.(mouse.cardId);
        }
      } else if (mouse.kind === 'pan') {
        const dx = pos.x - mouse.startX;
        const dy = pos.y - mouse.startY;
        if (Math.sqrt(dx * dx + dy * dy) < 6) onCardSelect?.(null);
      }

      mouse = { kind: 'idle' };
    }

    // ── Touch: single-touch tap/drag, two-touch pinch-zoom/pan ───────────────

    type PinchState = {
      initDist: number;
      initZoom: number;
      initMidX: number;
      initMidY: number;
      initPanX: number;
      initPanY: number;
    };

    type SingleTouchState = {
      cardId: string | null;
      startX: number;
      startY: number;
      moved: boolean;
    };

    let pinch: PinchState | null = null;
    let singleTouch: SingleTouchState | null = null;

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        singleTouch = null;
        if (dragRef) dragRef.current = null;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const vp = getVP();
        const mid = getTouchMidpoint(t1, t2, canvas!);
        pinch = {
          initDist: getTouchDistance(t1, t2),
          initZoom: vp.zoom,
          initMidX: mid.x,
          initMidY: mid.y,
          initPanX: vp.panX,
          initPanY: vp.panY,
        };
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const pos = getEventPos(touch, canvas!);
        const cardId = findCardAt(pos.x, pos.y);
        singleTouch = { cardId, startX: pos.x, startY: pos.y, moved: false };

        if (spread?.isConstellation && cardId) {
          const { x: wx, y: wy } = toWorld(pos.x, pos.y, getVP());
          if (dragRef) dragRef.current = { cardId, x: wx, y: wy };
        }
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinch) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = getTouchDistance(t1, t2);
        const mid = getTouchMidpoint(t1, t2, canvas!);
        const newZoom = clampZoom(pinch.initZoom * (dist / pinch.initDist));
        const ratio = newZoom / pinch.initZoom;

        if (viewportRef) {
          viewportRef.current.zoom = newZoom;
          // Keep the initial midpoint fixed in world space
          viewportRef.current.panX = mid.x - (pinch.initMidX - pinch.initPanX) * ratio;
          viewportRef.current.panY = mid.y - (pinch.initMidY - pinch.initPanY) * ratio;
        }
        return;
      }

      if (e.touches.length === 1 && singleTouch && !pinch) {
        const touch = e.touches[0];
        const pos = getEventPos(touch, canvas!);
        const dx = pos.x - singleTouch.startX;
        const dy = pos.y - singleTouch.startY;

        if (!singleTouch.moved && Math.sqrt(dx * dx + dy * dy) > 6) singleTouch.moved = true;

        if (singleTouch.moved) {
          if (spread?.isConstellation && singleTouch.cardId) {
            e.preventDefault();
            const { x: wx, y: wy } = toWorld(pos.x, pos.y, getVP());
            if (dragRef) dragRef.current = { cardId: singleTouch.cardId, x: wx, y: wy };
          } else if (!singleTouch.cardId) {
            // Pan on empty area
            e.preventDefault();
            if (viewportRef) {
              viewportRef.current.panX += pos.x - singleTouch.startX;
              viewportRef.current.panY += pos.y - singleTouch.startY;
            }
            singleTouch.startX = pos.x;
            singleTouch.startY = pos.y;
          }
        }
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) pinch = null;

      if (!singleTouch || !canvas) return;
      const touch = e.changedTouches[0];
      if (!touch) { singleTouch = null; return; }
      const pos = getEventPos(touch, canvas);

      if (!singleTouch.moved) {
        onCardSelect?.(singleTouch.cardId ?? null);
      } else if (spread?.isConstellation && singleTouch.cardId) {
        if (dragRef) dragRef.current = null;
        const rect = canvas.getBoundingClientRect();
        const { x: wx, y: wy } = toWorld(pos.x, pos.y, getVP());
        onCardDrop?.(singleTouch.cardId, wx / rect.width, wy / rect.height);
      }

      singleTouch = null;
    }

    // ── Wheel zoom ────────────────────────────────────────────────────────────

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const pos = getEventPos(e, canvas!);
      const vp = getVP();
      const oldZoom = vp.zoom;
      const newZoom = clampZoom(oldZoom * (1 - e.deltaY * 0.001));
      const ratio = newZoom / oldZoom;

      if (viewportRef) {
        viewportRef.current.zoom = newZoom;
        viewportRef.current.panX = pos.x - (pos.x - vp.panX) * ratio;
        viewportRef.current.panY = pos.y - (pos.y - vp.panY) * ratio;
      }
    }

    // ── Double-click to reset viewport ────────────────────────────────────────

    function handleDblClick() {
      if (viewportRef) {
        viewportRef.current.zoom = 1;
        viewportRef.current.panX = 0;
        viewportRef.current.panY = 0;
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('dblclick', handleDblClick);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('dblclick', handleDblClick);
    };
  }, [canvasRef, spread, drawnCards, onCardSelect, onCardDrop]);
}
