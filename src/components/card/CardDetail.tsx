'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DrawnCard } from '@/types';
import { CardImage } from './CardImage';
import { cn } from '@/lib/utils/cn';

interface CardDetailProps {
  drawnCard: DrawnCard;
  compact?: boolean;
}

export function CardDetail({ drawnCard, compact = false }: CardDetailProps) {
  const t = useTranslations();
  const tCard = useTranslations('card');
  const { card, isReversed, position } = drawnCard;

  const [tab, setTab] = useState<'meaning' | 'description'>('meaning');

  const positionLabel = drawnCard.userLabel ?? (
    position.labelKey ? t(position.labelKey as Parameters<typeof t>[0]) : ''
  );
  const positionDesc = position.descriptionKey
    ? t(position.descriptionKey as Parameters<typeof t>[0])
    : '';

  if (compact) {
    return (
      <div className="flex gap-3 px-3 py-2.5 items-start">
        <CardImage card={card} isReversed={isReversed} size="sm" />
        <div className="flex-1 min-w-0 pt-0.5">
          {positionLabel && (
            <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-0.5">{positionLabel}</p>
          )}
          <h3 className="text-sm font-semibold text-foreground leading-snug">
            {t(card.nameKey as Parameters<typeof t>[0])}
          </h3>
          <span className={cn(
            'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1',
            isReversed ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
          )}>
            {isReversed ? tCard('reversed') : tCard('upright')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 gap-3">
      {/* Position block — prominent context for this card's role */}
      <div className="flex flex-col gap-1 px-3 py-2.5 bg-primary/5 rounded-lg border-l-[3px] border-primary">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{positionLabel}</p>
        {positionDesc && (
          <p className="text-xs text-muted leading-relaxed">{positionDesc}</p>
        )}
      </div>

      {/* Card image + details */}
      <div className="flex gap-3 items-start">
        <CardImage card={card} isReversed={isReversed} size="md" />

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">
            {t(card.nameKey as Parameters<typeof t>[0])}
          </h3>
          <span className={cn(
            'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5',
            isReversed ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
          )}>
            {isReversed ? tCard('reversed') : tCard('upright')}
          </span>

          {/* Tabs */}
          <div className="flex gap-2 mt-2 mb-2">
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

          {/* Content */}
          <p className="text-xs text-muted leading-relaxed">
            {tab === 'meaning'
              ? t((isReversed ? card.reversedKey : card.uprightKey) as Parameters<typeof t>[0])
              : t(card.descriptionKey as Parameters<typeof t>[0])}
          </p>

          {/* Keywords */}
          {card.keywords.length > 0 && (
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
    </div>
  );
}
