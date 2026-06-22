'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useReadings, useLogActions } from '@/store';
import { ReadingCard } from '@/components/log/ReadingCard';
import { Button } from '@/components/ui/Button';

export default function LogPage() {
  const t = useTranslations('log');
  const locale = useLocale();
  const readings = useReadings();
  const { deleteReading } = useLogActions();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('title')}</h1>

      {readings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
          <span className="text-4xl mb-4 text-accent/50">✦</span>
          <p className="font-medium mb-1">{t('empty')}</p>
          <p className="text-sm mb-6">{t('emptyHint')}</p>
          <Link href={`/${locale}/reading`}>
            <Button size="sm">{t('startReading')}</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {readings.map((reading) => (
            <ReadingCard key={reading.id} reading={reading} onDelete={() => deleteReading(reading.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
