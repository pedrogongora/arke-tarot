'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Card, DrawnCard } from '@/types';
import { CardImage } from './CardImage';
import { cn } from '@/lib/utils/cn';

interface CardDetailProps {
  drawnCard: DrawnCard;
  compact?: boolean;
}

export function CardDetail({ drawnCard, compact = false }: CardDetailProps) {
  const t = useTranslations();
  const tCard = useTranslations('card');
  const { card, isReversed } = drawnCard;

  const [tab, setTab] = useState<'meaning' | 'description'>('meaning');

  return (
    <div className={cn('flex gap-4', compact ? 'py-2' : 'p-4')}>
      <CardImage card={card} isReversed={isReversed} size={compact ? 'sm' : 'md'} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>
              {t(card.nameKey as Parameters<typeof t>[0])}
            </h3>
            <span className={cn(
              'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5',
              isReversed
                ? 'bg-accent/20 text-accent'
                : 'bg-primary/20 text-primary'
            )}>
              {isReversed ? tCard('reversed') : tCard('upright')}
            </span>
          </div>
        </div>

        {/* Position label */}
        {drawnCard.userLabel && (
          <p className="text-xs text-muted mb-1 italic">{drawnCard.userLabel}</p>
        )}

        {/* Tabs */}
        {!compact && (
          <div className="flex gap-2 mb-2">
            {(['meaning', 'description'] as const).map((t2) => (
              <button
                key={t2}
                onClick={() => setTab(t2)}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors',
                  tab === t2 ? 'bg-primary/20 text-primary' : 'text-muted hover:text-foreground'
                )}
              >
                {t2 === 'meaning' ? (isReversed ? tCard('reversed') : tCard('upright')) : tCard('description')}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <p className="text-xs text-muted leading-relaxed">
          {compact || tab === 'meaning'
            ? t(isReversed ? card.reversedKey as Parameters<typeof t>[0] : card.uprightKey as Parameters<typeof t>[0])
            : t(card.descriptionKey as Parameters<typeof t>[0])}
        </p>

        {/* Keywords */}
        {!compact && card.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.keywords.slice(0, 4).map((kw) => (
              <span key={kw} className="text-xs px-1.5 py-0.5 bg-surface rounded text-muted border border-border">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
