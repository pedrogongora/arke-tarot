'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DrawnCard } from '@/types';
import { CardDetail } from '@/components/card/CardDetail';
import { cn } from '@/lib/utils/cn';

interface ReadingPanelProps {
  drawnCards: DrawnCard[];
  selectedCardId?: string | null;
  onCardSelect?: (id: string | null) => void;
  className?: string;
}

export function ReadingPanel({ drawnCards, selectedCardId, onCardSelect, className }: ReadingPanelProps) {
  const t = useTranslations('reading');

  if (drawnCards.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 text-center text-muted', className)}>
        <span className="text-3xl mb-3 text-accent">✦</span>
        <p className="text-sm">{t('draw')}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col divide-y divide-border', className)}>
      {drawnCards.map((dc) => (
        <button
          key={dc.card.id}
          onClick={() => onCardSelect?.(selectedCardId === dc.card.id ? null : dc.card.id)}
          className={cn(
            'text-left w-full transition-colors',
            selectedCardId === dc.card.id ? 'bg-primary/10' : 'hover:bg-surface/50'
          )}
        >
          <CardDetail drawnCard={dc} compact={selectedCardId !== dc.card.id} />
        </button>
      ))}
    </div>
  );
}
