'use client';

import { useRef, useState, useEffect } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { useCanvasRenderer } from './useCanvasRenderer';
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

export function SpreadCanvas({ spread, drawnCards, onCardSelect, onCardDrop, positionLabels, className }: SpreadCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const viewportRef = useRef<Viewport>({ zoom: 1, panX: 0, panY: 0 });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

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
    const newZoom = Math.min(3, Math.max(0.5, oldZoom * factor));
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

  return (
    <div className={cn('relative w-full h-full', className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Tarot spread canvas"
      />

      {/* Zoom controls */}
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
      </div>
    </div>
  );
}
