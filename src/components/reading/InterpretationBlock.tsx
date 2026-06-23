'use client';

import { useTranslations } from 'next-intl';
import { useReadingStore } from '@/store';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';

export function InterpretationBlock({ className }: { className?: string }) {
  const t = useTranslations('reading.ai');
  const aiStatus = useReadingStore((s) => s.aiStatus);
  const aiStreamBuffer = useReadingStore((s) => s.aiStreamBuffer);
  const aiError = useReadingStore((s) => s.aiError);

  if (aiStatus === 'idle') return null;

  return (
    <div className={cn('px-4 py-3 border-t border-border', className)}>
      {(aiStatus === 'loading' || aiStatus === 'streaming') && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner size="sm" />
          <span>{t('loading')}</span>
        </div>
      )}

      {aiStatus === 'error' && (
        <p className="text-sm text-red-400">{aiError ?? t('error')}</p>
      )}

      {(aiStatus === 'streaming' || aiStatus === 'done') && aiStreamBuffer && (
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mt-2">
          {aiStreamBuffer}
          {aiStatus === 'streaming' && <span className="animate-pulse ml-0.5">▊</span>}
        </div>
      )}
    </div>
  );
}
