'use client';

import { useTranslations } from 'next-intl';
import type { Reading } from '@/types';
import { CardDetail } from '@/components/card/CardDetail';
import { SpreadCanvas } from '@/components/canvas/SpreadCanvas';
import { getSpread } from '@/data/spreads';

interface ReadingDetailProps {
  reading: Reading;
}

export function ReadingDetail({ reading }: ReadingDetailProps) {
  const t = useTranslations();
  const tLog = useTranslations('log');

  const date = new Date(reading.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const spread = getSpread(reading.spreadId);

  const handleCardSelect = (cardId: string | null) => {
    if (!cardId) return;
    document.getElementById(`log-card-${cardId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t(reading.spreadNameKey as Parameters<typeof t>[0])}
        </h1>
        <p className="text-sm text-muted mt-1">{date}</p>
        {spread && (
          <p className="text-sm text-muted italic mt-2 leading-relaxed">
            {t(spread.descriptionKey as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Spread canvas */}
      {spread && (
        <div className="h-64 sm:h-80">
          <SpreadCanvas
            spread={spread}
            drawnCards={reading.drawnCards}
            onCardSelect={handleCardSelect}
            className="rounded-xl border border-border bg-surface/30"
          />
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col rounded-xl border border-border overflow-hidden">
        {reading.drawnCards.map((dc) => (
          <div key={dc.card.id} id={`log-card-${dc.card.id}`} className="border-b border-border last:border-0">
            <CardDetail drawnCard={dc} />
          </div>
        ))}
      </div>

      {/* Notes */}
      {reading.notes && (
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
            {t('reading.notes.label' as Parameters<typeof t>[0])}
          </h2>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-surface p-4 rounded-xl border border-border">
            {reading.notes}
          </p>
        </div>
      )}

      {/* AI interpretation */}
      {reading.aiInterpretation && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">{tLog('aiInterpretation')}</h2>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-surface p-4 rounded-xl border border-border">
            {reading.aiInterpretation.text}
          </div>
        </div>
      )}
    </div>
  );
}
