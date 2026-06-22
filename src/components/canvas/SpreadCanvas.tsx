'use client';

import { useRef, useState, useEffect } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { useCanvasRenderer, renderSpreadSnapshot } from './useCanvasRenderer';
import { useCanvasInteraction } from './useCanvasInteraction';
import { cn } from '@/lib/utils/cn';
import type { DragState, Viewport } from './useCanvasRenderer';

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

  // Re-render when container resizes; also reset pan so content stays visible
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.dispatchEvent(new Event('resize-redraw'));
    });
    observer.observe(canvas.parentElement!);
    return () => observer.disconnect();
  }, []);

  useCanvasRenderer({ canvasRef, spread, drawnCards, selectedCardId, dragRef, viewportRef, positionLabels });
  useCanvasInteraction({ canvasRef, spread, drawnCards, onCardSelect: handleSelect, onCardDrop, dragRef, viewportRef });

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
    viewportRef.current.zoom = 1;
    viewportRef.current.panX = 0;
    viewportRef.current.panY = 0;
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
      <div className="absolute bottom-2 right-2 flex gap-1">
        {[
          { label: '+', title: 'Zoom in', onClick: () => adjustZoom(1.25) },
          { label: '−', title: 'Zoom out', onClick: () => adjustZoom(0.8) },
          { label: '↺', title: 'Reset zoom', onClick: resetViewport },
        ].map(({ label, title, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            title={title}
            className="w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium bg-surface/80 border border-border text-muted hover:text-foreground hover:bg-surface transition-colors backdrop-blur-sm"
          >
            {label}
          </button>
        ))}
        <button
          onClick={copyAsPng}
          title={copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Failed' : 'Copy as PNG'}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-md text-sm bg-surface/80 border border-border backdrop-blur-sm transition-colors',
            copyState === 'copied' && 'text-green-400 border-green-400/40',
            copyState === 'error' && 'text-red-400 border-red-400/40',
            copyState === 'idle' && 'text-muted hover:text-foreground hover:bg-surface',
          )}
        >
          {copyState === 'copied' ? '✓' : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}
