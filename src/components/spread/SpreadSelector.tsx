'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { SpreadDefinition } from '@/types';
import { SpreadPreview } from './SpreadPreview';
import { cn } from '@/lib/utils/cn';
import { useReadingStore } from '@/store';

interface SpreadSelectorProps {
  spreads: SpreadDefinition[];
}

export function SpreadSelector({ spreads }: SpreadSelectorProps) {
  const t = useTranslations();
  const locale = useLocale();
  const clearReading = useReadingStore((s) => s.clearReading);

  useEffect(() => {
    clearReading();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {spreads.map((spread) => (
        <Link
          key={spread.id}
          href={`/${locale}/reading/${spread.id}`}
          className={cn(
            'group flex flex-col rounded-xl border border-border bg-surface',
            'hover:border-primary hover:shadow-lg hover:shadow-primary/10',
            'transition-all duration-200 overflow-hidden'
          )}
        >
          <div className="p-3">
            <SpreadPreview spread={spread} />
          </div>
          <div className="px-4 pb-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                {t(spread.nameKey as Parameters<typeof t>[0])}
              </h3>
              {spread.cardCount > 0 && (
                <span className="text-xs text-muted font-mono">
                  {spread.cardCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted line-clamp-2">
              {t(spread.descriptionKey as Parameters<typeof t>[0])}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
