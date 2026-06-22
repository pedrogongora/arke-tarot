import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { Reading } from '@/types';
import { cn } from '@/lib/utils/cn';

interface ReadingCardProps {
  reading: Reading;
}

export function ReadingCard({ reading }: ReadingCardProps) {
  const t = useTranslations();
  const tLog = useTranslations('log');
  const locale = useLocale();

  const date = new Date(reading.createdAt).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const count = reading.drawnCards.length;
  const firstCards = reading.drawnCards.slice(0, 3).map((dc) => t(dc.card.nameKey as Parameters<typeof t>[0]));

  return (
    <Link
      href={`/${locale}/log/${reading.id}`}
      className={cn(
        'flex flex-col gap-2 p-4 rounded-xl border border-border bg-surface',
        'hover:border-primary hover:shadow-md hover:shadow-primary/10 transition-all duration-200'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          {t(reading.spreadNameKey as Parameters<typeof t>[0])}
        </span>
        <span className="text-xs text-muted">{date}</span>
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
    </Link>
  );
}
