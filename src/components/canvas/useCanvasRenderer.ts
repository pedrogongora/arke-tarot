'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { spreadPositionToRect, calcCardHeight, CARD_ASPECT } from './cardGeometry';
import { CARD_IMAGE_MAP } from '@/data/cardImages';

const DEAL_DURATION_MS = 700;
const DEAL_STAGGER_MS = 150;
const ORBIT_STRENGTH = 0.35;

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

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function quadBezierAt(t: number, p0: number, p1: number, p2: number): number {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

export interface DragState {
  cardId: string;
  x: number; // canvas pixels
  y: number;
}

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

interface UseCanvasRendererOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  spread: SpreadDefinition | null;
  drawnCards: DrawnCard[];
  selectedCardId?: string | null;
  dragRef?: RefObject<DragState | null>;
  viewportRef?: RefObject<Viewport>;
  positionLabels?: Record<string, string>;
}

/** Renders the full spread to an offscreen canvas at the given pixel dimensions.
 *  No viewport transform — all positions are visible regardless of current pan/zoom.
 *  No animation — all cards render at full opacity. */
export async function renderSpreadSnapshot(
  spread: SpreadDefinition,
  drawnCards: DrawnCard[],
  positionLabels: Record<string, string> | undefined,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const W = width;
  const H = height;
  const cardH = calcCardHeight(W, H);
  const cardW = cardH * CARD_ASPECT;

  if (!spread.isConstellation) {
    const filledPositionIds = new Set(drawnCards.map((dc) => dc.position.id));
    spread.positions.forEach((pos) => {
      const r = spreadPositionToRect(pos, W, H, cardH);
      const isEmpty = !filledPositionIds.has(pos.id);

      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate((r.rotation * Math.PI) / 180);
      ctx.strokeStyle = isEmpty ? 'rgba(155, 143, 232, 0.4)' : 'rgba(155, 143, 232, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
      ctx.stroke();
      ctx.setLineDash([]);

      if (isEmpty) {
        const label = positionLabels?.[pos.id];
        if (label) {
          ctx.font = `bold ${Math.round(cardH * 0.09)}px system-ui, sans-serif`;
          ctx.fillStyle = 'rgba(155, 143, 232, 0.75)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, 0, 0, cardW * 0.85);
        }
      }
      ctx.restore();
    });
  }

  for (const drawnCard of drawnCards) {
    let cx: number, cy: number, rotation: number;
    if (spread.isConstellation && drawnCard.canvasX != null && drawnCard.canvasY != null) {
      cx = drawnCard.canvasX * W;
      cy = drawnCard.canvasY * H;
      rotation = 0;
    } else {
      const r = spreadPositionToRect(drawnCard.position, W, H, cardH);
      cx = r.x;
      cy = r.y;
      rotation = r.rotation;
    }

    const imgPath = CARD_IMAGE_MAP[drawnCard.card.id];
    if (!imgPath) continue;
    const imgSrc = (process.env.NEXT_PUBLIC_BASE_PATH ?? '') + imgPath;

    try {
      const img = await loadImage(imgSrc);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      if (drawnCard.isReversed) ctx.rotate(Math.PI);
      ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
      ctx.restore();
    } catch {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#1a1730';
      ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
      ctx.restore();
    }

    const cardLabel = spread.isConstellation
      ? drawnCard.userLabel
      : positionLabels?.[drawnCard.position.id];
    if (cardLabel) {
      const isLandscape = !spread.isConstellation && Math.abs(rotation % 180) > 45;
      const halfExtent = isLandscape ? cardW / 2 : cardH / 2;
      const fontSize = Math.round(cardH * 0.075);
      ctx.save();
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(155, 143, 232, 0.85)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(cardLabel, cx, cy + halfExtent + 5, (isLandscape ? cardH : cardW) * 1.2);
      ctx.restore();
    }
  }

  return canvas;
}

export function useCanvasRenderer({ canvasRef, spread, drawnCards, selectedCardId, dragRef, viewportRef, positionLabels }: UseCanvasRendererOptions) {
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
        animStartTimesRef.current.set(dc.card.id, now + i * DEAL_STAGGER_MS);
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

      // Apply viewport transform (zoom + pan) in CSS-pixel world space
      const viewport = viewportRef?.current ?? { zoom: 1, panX: 0, panY: 0 };
      ctx.save();
      ctx.translate(viewport.panX, viewport.panY);
      ctx.scale(viewport.zoom, viewport.zoom);

      // Draw position placeholders (non-constellation spreads only)
      if (!spread.isConstellation) {
        const filledPositionIds = new Set(drawnCards.map((dc) => dc.position.id));
        spread.positions.forEach((pos) => {
          const r = spreadPositionToRect(pos, W, H, cardH);
          const isEmpty = !filledPositionIds.has(pos.id);

          ctx.save();
          ctx.translate(r.x, r.y);
          ctx.rotate((r.rotation * Math.PI) / 180);
          ctx.strokeStyle = isEmpty ? 'rgba(155, 143, 232, 0.4)' : 'rgba(155, 143, 232, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw position label inside the placeholder for empty positions
          if (isEmpty) {
            const label = positionLabels?.[pos.id];
            if (label) {
              const maxW = cardW * 0.85;
              ctx.font = `bold ${Math.round(cardH * 0.09)}px system-ui, sans-serif`;
              ctx.fillStyle = 'rgba(155, 143, 232, 0.75)';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, 0, 0, maxW);
            }
          }
          ctx.restore();
        });
      }

      // Draw placed cards
      for (const drawnCard of drawnCards) {
        const startTime = animStartTimesRef.current.get(drawnCard.card.id) ?? t;
        const elapsed = t - startTime;
        const rawProgress = clamp(elapsed / DEAL_DURATION_MS, 0, 1);

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

        const imgPath = CARD_IMAGE_MAP[drawnCard.card.id];
        if (!imgPath) continue;
        const imgSrc = (process.env.NEXT_PUBLIC_BASE_PATH ?? '') + imgPath;

        // Orbit arc: card travels from canvas center to target along a curved path
        const srcX = W / 2;
        const srcY = 0;
        const dx = cx - srcX;
        const dy = cy - srcY;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        // Clockwise perpendicular: rotate direction 90° CCW → (-dy, dx)
        const cpX = (srcX + cx) / 2 + (-dy / dist) * dist * ORBIT_STRENGTH;
        const cpY = (srcY + cy) / 2 + (dx / dist) * dist * ORBIT_STRENGTH;

        const TRAVEL_END = 0.7;
        const travelT = easeOutCubic(clamp(rawProgress / TRAVEL_END, 0, 1));
        const animCx = quadBezierAt(travelT, srcX, cpX, cx);
        const animCy = quadBezierAt(travelT, srcY, cpY, cy);

        // Fade in during first half of travel, fully opaque by TRAVEL_END
        const opacity = clamp(rawProgress / (TRAVEL_END * 0.5), 0, 1);

        // Subtle scale-up during settle phase
        const settleT = clamp((rawProgress - TRAVEL_END) / (1 - TRAVEL_END), 0, 1);
        const scale = 0.92 + 0.08 * settleT;

        try {
          const img = await loadImage(imgSrc);
          if (cancelled) return;

          ctx.save();
          ctx.translate(animCx, animCy);
          ctx.rotate((rotation * Math.PI) / 180);
          if (drawnCard.isReversed) ctx.rotate(Math.PI);
          ctx.globalAlpha = opacity;
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
          ctx.translate(animCx, animCy);
          ctx.globalAlpha = opacity;
          ctx.fillStyle = '#1a1730';
          ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        // Draw position label below card (outside card transform, always horizontal)
        if (rawProgress > 0.7) {
          const cardLabel = spread.isConstellation
            ? drawnCard.userLabel
            : positionLabels?.[drawnCard.position.id];
          if (cardLabel) {
            const isLandscape = !spread.isConstellation && Math.abs(rotation % 180) > 45;
            const halfExtent = isLandscape ? cardW / 2 : cardH / 2;
            const fontSize = Math.round(cardH * 0.075);
            ctx.save();
            ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
            ctx.fillStyle = `rgba(155, 143, 232, ${0.85 * rawProgress})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(cardLabel, cx, cy + halfExtent + 5, (isLandscape ? cardH : cardW) * 1.2);
            ctx.restore();
          }
        }
      }

      // Restore viewport transform
      ctx.restore();

      // Always keep looping — allows zoom/pan to take effect immediately
      if (!cancelled) {
        animFrameRef.current = requestAnimationFrame(renderFrame);
      }
    }

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [canvasRef, spread, drawnCards, selectedCardId, positionLabels]);
}
