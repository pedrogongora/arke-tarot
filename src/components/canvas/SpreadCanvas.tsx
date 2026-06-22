'use client';

import { useRef, useState, useEffect } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { useCanvasRenderer } from './useCanvasRenderer';
import { useCanvasInteraction } from './useCanvasInteraction';
import { cn } from '@/lib/utils/cn';
import type { DragState } from './useCanvasRenderer';

interface SpreadCanvasProps {
  spread: SpreadDefinition;
  drawnCards: DrawnCard[];
  onCardSelect?: (cardId: string | null) => void;
  onCardDrop?: (cardId: string, normalizedX: number, normalizedY: number) => void;
  className?: string;
}

export function SpreadCanvas({ spread, drawnCards, onCardSelect, onCardDrop, className }: SpreadCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleSelect = (id: string | null) => {
    setSelectedCardId(id);
    onCardSelect?.(id);
  };

  // Re-render when container resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.dispatchEvent(new Event('resize-redraw'));
    });
    observer.observe(canvas.parentElement!);
    return () => observer.disconnect();
  }, []);

  useCanvasRenderer({ canvasRef, spread, drawnCards, selectedCardId, dragRef });
  useCanvasInteraction({ canvasRef, spread, drawnCards, onCardSelect: handleSelect, onCardDrop, dragRef });

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full cursor-pointer', className)}
      aria-label={`Tarot spread canvas`}
    />
  );
}
