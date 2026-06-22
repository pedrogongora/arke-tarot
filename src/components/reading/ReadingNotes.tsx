'use client';

import { useTranslations } from 'next-intl';
import { useReadingStore } from '@/store';
import { cn } from '@/lib/utils/cn';

export function ReadingNotes({ className }: { className?: string }) {
  const t = useTranslations('reading.notes');
  const notes = useReadingStore((s) => s.activeReading?.notes ?? '');
  const setNotes = useReadingStore((s) => s.setNotes);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-medium text-muted uppercase tracking-wide">{t('label')}</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('placeholder')}
        rows={4}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg resize-none',
          'bg-background border border-border text-foreground placeholder:text-muted',
          'focus:outline-none focus:border-primary transition-colors'
        )}
      />
    </div>
  );
}
