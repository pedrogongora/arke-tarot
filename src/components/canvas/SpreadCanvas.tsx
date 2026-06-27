'use client';

import { useRef, useState, useEffect } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { useCanvasRenderer, renderSpreadSnapshot } from './useCanvasRenderer';
import { useCanvasInteraction } from './useCanvasInteraction';
import { cn } from '@/lib/utils/cn';
import type { DragState, Viewport } from './useCanvasRenderer';
import { calcCardHeight, spreadPositionToRect, CARD_ASPECT } from './cardGeometry';

interface SpreadCanvasProps {
  spread: SpreadDefinition;
  drawnCards: DrawnCard[];
  onCardSelect?: (cardId: string | null) => void;
  onCardDrop?: (cardId: string, normalizedX: number, normalizedY: number) => void;
  positionLabels?: Record<string, string>;
  className?: string;
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function SpreadCanvas({ spread, drawnCards, onCardSelect, onCardDrop, positionLabels, className }: SpreadCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const viewportRef = useRef<Viewport>({ zoom: 1, panX: 0, panY: 0 });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleSelect = (id: string | null) => {
    setSelectedCardId(id);
    onCardSelect?.(id);
  };

  function fitToSpread() {
    const canvas = canvasRef.current;
    if (!canvas || spread.isConstellation || spread.positions.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (W === 0 || H === 0) return;

    const cardH = calcCardHeight(W, H);
    const cardW = cardH * CARD_ASPECT;
    const labelH = Math.round(cardH * 0.18);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const pos of spread.positions) {
      const r = spreadPositionToRect(pos, W, H, cardH);
      const rad = (r.rotation * Math.PI) / 180;
      const cosA = Math.abs(Math.cos(rad));
      const sinA = Math.abs(Math.sin(rad));
      const bboxHW = (cardW / 2) * cosA + (cardH / 2) * sinA;
      const bboxHH = (cardW / 2) * sinA + (cardH / 2) * cosA;
      minX = Math.min(minX, r.x - bboxHW);
      maxX = Math.max(maxX, r.x + bboxHW);
      minY = Math.min(minY, r.y - bboxHH);
      maxY = Math.max(maxY, r.y + bboxHH + labelH);
    }
    if (!isFinite(minX)) return;

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const zoom = Math.min((W * 0.82) / contentW, (H * 0.82) / contentH, 3.0);
    const vp = viewportRef.current;
    vp.zoom = zoom;
    vp.panX = W / 2 - ((minX + maxX) / 2) * zoom;
    vp.panY = H / 2 - ((minY + maxY) / 2) * zoom;
  }

  // Keep a stable ref so the interaction hook can call fitToSpread without dep churn
  const fitToSpreadRef = useRef(fitToSpread);
  fitToSpreadRef.current = fitToSpread;

  // Auto-fit on mount and when the spread changes
  useEffect(() => {
    if (spread.isConstellation) return;
    const rafId = requestAnimationFrame(() => fitToSpreadRef.current());
    return () => cancelAnimationFrame(rafId);
  }, [spread.id, spread.isConstellation]);

  // Re-render when container resizes; also re-fit so content stays visible
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.dispatchEvent(new Event('resize-redraw'));
      if (!spread.isConstellation) fitToSpreadRef.current();
    });
    observer.observe(canvas.parentElement!);
    return () => observer.disconnect();
  }, [spread.isConstellation]);

  useCanvasRenderer({ canvasRef, spread, drawnCards, selectedCardId, dragRef, viewportRef, positionLabels });
  useCanvasInteraction({ canvasRef, spread, drawnCards, onCardSelect: handleSelect, onCardDrop, dragRef, viewportRef, fitViewportRef: fitToSpreadRef });

  function adjustZoom(factor: number) {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const oldZoom = vp.zoom;
    const newZoom = Math.min(5, Math.max(0.5, oldZoom * factor));
    const ratio = newZoom / oldZoom;
    vp.panX = cx - (cx - vp.panX) * ratio;
    vp.panY = cy - (cy - vp.panY) * ratio;
    vp.zoom = newZoom;
  }

  function resetViewport() {
    fitToSpreadRef.current();
  }

  async function copyAsPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#0d0b1a';
      const rect = canvas.getBoundingClientRect();
      const SCALE = 8;
      const MIN_W = 3200;
      const W = Math.max(Math.round(rect.width * SCALE), MIN_W);
      const H = Math.round(W * (rect.height / rect.width));
      const spreadCanvas = await renderSpreadSnapshot(spread, drawnCards, positionLabels, W, H);
      const flat = document.createElement('canvas');
      flat.width = W;
      flat.height = H;
      const fctx = flat.getContext('2d')!;
      fctx.fillStyle = bgColor;
      fctx.fillRect(0, 0, W, H);
      fctx.drawImage(spreadCanvas, 0, 0);
      const blob = await new Promise<Blob | null>((res) => flat.toBlob(res, 'image/png'));
      if (!blob) throw new Error('toBlob failed');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Tarot spread canvas"
      />

      {/* Zoom + copy controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-0.5 bg-surface/75 border border-border/60 rounded-full px-1.5 py-1.5 backdrop-blur-md shadow-sm">
        {[
          { label: '+', title: 'Zoom in', onClick: () => adjustZoom(1.25) },
          { label: '−', title: 'Zoom out', onClick: () => adjustZoom(0.8) },
          { label: '↺', title: 'Fit to spread', onClick: resetViewport },
        ].map(({ label, title, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            title={title}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium text-muted hover:text-foreground hover:bg-primary/15 transition-colors"
          >
            {label}
          </button>
        ))}
        <span className="w-px h-4 bg-border/60 mx-0.5" />
        <button
          onClick={copyAsPng}
          title={copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Failed' : 'Copy as PNG'}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors',
            copyState === 'copied' && 'text-green-400',
            copyState === 'error' && 'text-red-400',
            copyState === 'idle' && 'text-muted hover:text-foreground hover:bg-primary/15',
          )}
        >
          {copyState === 'copied' ? '✓' : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}
