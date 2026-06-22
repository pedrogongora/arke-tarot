'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { spreadPositionToRect, calcCardHeight, CARD_ASPECT } from './cardGeometry';
import { CARD_IMAGE_MAP } from '@/data/cardImages';

const ANIM_DURATION_MS = 350;
const ANIM_STAGGER_MS = 120;

// Module-level image cache shared across canvas instances
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

export interface DragState {
  cardId: string;
  x: number; // canvas pixels
  y: number;
}

interface UseCanvasRendererOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  spread: SpreadDefinition | null;
  drawnCards: DrawnCard[];
  selectedCardId?: string | null;
  dragRef?: RefObject<DragState | null>;
}

export function useCanvasRenderer({ canvasRef, spread, drawnCards, selectedCardId, dragRef }: UseCanvasRendererOptions) {
  const animFrameRef = useRef<number>(0);
  // cardId → scheduled start timestamp (may be in the future for staggered cards)
  const animStartTimesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spread) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Register new cards with staggered start times
    const now = performance.now();
    drawnCards.forEach((dc, i) => {
      if (!animStartTimesRef.current.has(dc.card.id)) {
        animStartTimesRef.current.set(dc.card.id, now + i * ANIM_STAGGER_MS);
      }
    });

    // Remove entries for cards that are no longer present
    const cardIds = new Set(drawnCards.map((dc) => dc.card.id));
    for (const id of animStartTimesRef.current.keys()) {
      if (!cardIds.has(id)) animStartTimesRef.current.delete(id);
    }

    let cancelled = false;

    async function renderFrame() {
      if (cancelled || !canvas || !ctx || !spread) return;

      // HiDPI scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const W = rect.width;
      const H = rect.height;
      const cardH = calcCardHeight(W, H);
      const cardW = cardH * CARD_ASPECT;
      const t = performance.now();

      ctx.clearRect(0, 0, W, H);

      // Draw position placeholders (non-constellation spreads only)
      spread.positions.forEach((pos) => {
        const r = spreadPositionToRect(pos, W, H, cardH);
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate((r.rotation * Math.PI) / 180);
        ctx.strokeStyle = 'rgba(155, 143, 232, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });

      let allSettled = true;

      // Draw placed cards
      for (const drawnCard of drawnCards) {
        const startTime = animStartTimesRef.current.get(drawnCard.card.id) ?? t;
        const elapsed = t - startTime;
        const progress = clamp(elapsed / ANIM_DURATION_MS, 0, 1);
        if (progress < 1) allSettled = false;

        // Determine center position and rotation
        let cx: number, cy: number, rotation: number;
        if (spread.isConstellation && drawnCard.canvasX != null && drawnCard.canvasY != null) {
          const drag = dragRef?.current;
          if (drag && drag.cardId === drawnCard.card.id) {
            cx = drag.x;
            cy = drag.y;
          } else {
            cx = drawnCard.canvasX * W;
            cy = drawnCard.canvasY * H;
          }
          rotation = 0;
        } else {
          const r = spreadPositionToRect(drawnCard.position, W, H, cardH);
          cx = r.x;
          cy = r.y;
          rotation = r.rotation;
        }

        const imgSrc = CARD_IMAGE_MAP[drawnCard.card.id];
        if (!imgSrc) continue;

        try {
          const img = await loadImage(imgSrc);
          if (cancelled) return;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);

          if (drawnCard.isReversed) ctx.rotate(Math.PI);

          // Animate: fade-in + subtle scale-up
          ctx.globalAlpha = progress;
          const scale = 0.85 + 0.15 * progress;
          ctx.scale(scale, scale);

          if (drawnCard.card.id === selectedCardId) {
            ctx.shadowColor = 'rgba(155, 143, 232, 0.8)';
            ctx.shadowBlur = 16;
          }

          ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          ctx.restore();
        } catch {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.globalAlpha = progress;
          ctx.fillStyle = '#1a1730';
          ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      // Keep looping in constellation mode (for smooth drag) or while animating
      if ((!allSettled || spread.isConstellation) && !cancelled) {
        animFrameRef.current = requestAnimationFrame(renderFrame);
      }
    }

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [canvasRef, spread, drawnCards, selectedCardId]);
}
