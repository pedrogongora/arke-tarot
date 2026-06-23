'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Reading } from '@/types';
import { cn } from '@/lib/utils/cn';

interface ReadingCardProps {
  reading: Reading;
  onDelete?: () => void;
}

export function ReadingCard({ reading, onDelete }: ReadingCardProps) {
  const t = useTranslations();
  const tLog = useTranslations('log');
  const locale = useLocale();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const date = new Date(reading.createdAt).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const count = reading.drawnCards.length;
  const firstCards = reading.drawnCards.slice(0, 3).map((dc) => t(dc.card.nameKey as Parameters<typeof t>[0]));

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => { if (!confirming) router.push(`/${locale}/log?id=${reading.id}`); }}
      onKeyDown={(e) => { if (e.key === 'Enter' && !confirming) router.push(`/${locale}/log?id=${reading.id}`); }}
      className={cn(
        'flex flex-col gap-2 p-4 rounded-xl border border-border bg-surface cursor-pointer',
        'hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          {t(reading.spreadNameKey as Parameters<typeof t>[0])}
        </span>
        <div className="flex items-center gap-2">
          {confirming ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="text-xs px-2 py-0.5 bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
              >
                {tLog('delete')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
                className="text-xs px-2 py-0.5 bg-surface border border-border text-foreground rounded hover:border-primary transition-colors"
              >
                {tLog('cancel')}
              </button>
            </div>
          ) : (
            <>
              <span className="text-xs text-muted">{date}</span>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
                  title={tLog('deleteReading')}
                  aria-label={tLog('deleteReading')}
                  className="text-muted hover:text-red-500 transition-colors p-0.5 rounded"
                >
                  <TrashIcon />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {firstCards.map((name, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-background rounded-full text-foreground border border-border">
            {name}
          </span>
        ))}
        {count > 3 && (
          <span className="text-xs px-2 py-0.5 text-muted">
            +{count - 3} {count - 3 === 1 ? tLog('card') : tLog('cards')}
          </span>
        )}
      </div>

      {reading.notes && (
        <p className="text-xs text-muted line-clamp-2 italic">{reading.notes}</p>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
