'use client';

import { useRef, useState, useEffect } from 'react';
import type { SpreadDefinition, DrawnCard } from '@/types';
import { useCanvasRenderer } from './useCanvasRenderer';
import { useCanvasInteraction } from './useCanvasInteraction';
import { cn } from '@/lib/utils/cn';

interface SpreadCanvasProps {
  spread: SpreadDefinition;
  drawnCards: DrawnCard[];
  onCardSelect?: (cardId: string | null) => void;
  className?: string;
}

export function SpreadCanvas({ spread, drawnCards, onCardSelect, className }: SpreadCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  useCanvasRenderer({ canvasRef, spread, drawnCards, selectedCardId });
  useCanvasInteraction({ canvasRef, spread, drawnCards, onCardSelect: handleSelect });

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full cursor-pointer', className)}
      aria-label={`Tarot spread canvas`}
    />
  );
}
