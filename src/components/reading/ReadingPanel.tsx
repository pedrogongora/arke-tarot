'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { DrawnCard, SpreadDefinition } from '@/types';
import { CardDetail } from '@/components/card/CardDetail';
import { cn } from '@/lib/utils/cn';

interface ReadingPanelProps {
  spread?: SpreadDefinition;
  drawnCards: DrawnCard[];
  selectedCardId?: string | null;
  onCardSelect?: (id: string | null) => void;
  className?: string;
}

export function ReadingPanel({ spread, drawnCards, selectedCardId, onCardSelect, className }: ReadingPanelProps) {
  const t = useTranslations('reading');
  const tAll = useTranslations();

  // Scroll selected card into view within the panel
  useEffect(() => {
    if (!selectedCardId) return;
    document
      .getElementById(`panel-card-${selectedCardId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedCardId]);

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
      {/* Spread description */}
      {spread && (
        <div className="px-4 py-3 bg-surface/40">
          <p className="text-xs text-muted leading-relaxed">
            {tAll(spread.descriptionKey as Parameters<typeof tAll>[0])}
          </p>
        </div>
      )}

      {drawnCards.map((dc) => {
        const isSelected = selectedCardId === dc.card.id;
        return (
          <div
            key={dc.card.id}
            id={`panel-card-${dc.card.id}`}
            role="button"
            tabIndex={0}
            onClick={() => onCardSelect?.(isSelected ? null : dc.card.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardSelect?.(isSelected ? null : dc.card.id); }}
            className={cn(
              'text-left w-full transition-colors cursor-pointer',
              isSelected ? 'bg-primary/10 ring-1 ring-inset ring-primary/30' : 'hover:bg-surface/50'
            )}
          >
            <CardDetail drawnCard={dc} compact={!isSelected} />
          </div>
        );
      })}
    </div>
  );
}
