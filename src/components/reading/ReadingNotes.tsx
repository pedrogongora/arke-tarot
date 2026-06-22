'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useReadingStore } from '@/store';
import { cn } from '@/lib/utils/cn';

export function ReadingNotes({ className }: { className?: string }) {
  const t = useTranslations('reading.notes');
  const notes = useReadingStore((s) => s.activeReading?.notes ?? '');
  const setNotes = useReadingStore((s) => s.setNotes);
  const [expanded, setExpanded] = useState(false);

  // Auto-expand if there's existing content
  useEffect(() => {
    if (notes.length > 0) setExpanded(true);
  }, []);

  return (
    <div className={cn('flex flex-col', className)}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full text-left py-0.5 group"
      >
        <span className="text-xs font-medium text-muted uppercase tracking-wide group-hover:text-foreground transition-colors">
          {t('label')}
          {!expanded && notes.length > 0 && (
            <span className="ml-2 normal-case tracking-normal text-foreground/50 font-normal truncate max-w-[10rem] inline-block align-bottom">
              {notes.slice(0, 40)}{notes.length > 40 ? '…' : ''}
            </span>
          )}
        </span>
        <svg
          className={cn('w-3.5 h-3.5 text-muted transition-transform flex-shrink-0', expanded && 'rotate-180')}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('placeholder')}
          rows={2}
          className={cn(
            'mt-2 w-full px-3 py-2 text-sm rounded-lg resize-none',
            'bg-background border border-border text-foreground placeholder:text-muted',
            'focus:outline-none focus:border-primary transition-colors'
          )}
        />
      )}
    </div>
  );
}
