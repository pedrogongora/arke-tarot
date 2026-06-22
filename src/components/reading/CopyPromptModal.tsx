'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { buildCopyPrompt } from '@/lib/ai/buildCopyPrompt';
import { cn } from '@/lib/utils/cn';
import type { DrawnCard, SpreadDefinition, SupportedLocale } from '@/types';
import type { ResolvedCard } from '@/lib/ai/types';

interface CopyPromptModalProps {
  spread: SpreadDefinition | undefined;
  drawnCards: DrawnCard[];
  notes: string;
  locale: SupportedLocale;
  onClose: () => void;
}

export function CopyPromptModal({ spread, drawnCards, notes, locale, onClose }: CopyPromptModalProps) {
  const t = useTranslations('reading.copyPrompt');
  const tAll = useTranslations();

  const [includeReflections, setIncludeReflections] = useState(() => notes.trim().length > 0);
  const [reflections, setReflections] = useState(notes);
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const resolvedCards: ResolvedCard[] = useMemo(
    () =>
      drawnCards.map((dc) => ({
        positionLabel: dc.userLabel ?? (
          dc.position.labelKey ? tAll(dc.position.labelKey as Parameters<typeof tAll>[0]) : ''
        ),
        positionDesc: dc.position.descriptionKey
          ? tAll(dc.position.descriptionKey as Parameters<typeof tAll>[0])
          : '',
        cardName: tAll(dc.card.nameKey as Parameters<typeof tAll>[0]),
        orientation: dc.isReversed ? 'reversed' : 'upright',
        meaning: tAll(
          (dc.isReversed ? dc.card.reversedKey : dc.card.uprightKey) as Parameters<typeof tAll>[0]
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drawnCards]
  );

  const resolvedSpreadName = spread
    ? tAll(spread.nameKey as Parameters<typeof tAll>[0])
    : '';

  const resolvedSpreadDescription = spread
    ? tAll(spread.descriptionKey as Parameters<typeof tAll>[0])
    : undefined;

  const prompt = useMemo(
    () =>
      buildCopyPrompt({
        resolvedSpreadName,
        resolvedSpreadDescription,
        resolvedCards,
        notes: includeReflections ? reflections : '',
        locale,
      }),
    [resolvedSpreadName, resolvedSpreadDescription, resolvedCards, includeReflections, reflections, locale]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = prompt;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-2xl bg-background border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
            <p className="text-xs text-muted mt-0.5">{t('description')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors ml-4 mt-0.5 shrink-0"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="16" y2="16" />
              <line x1="16" y1="2" x2="2" y2="16" />
            </svg>
          </button>
        </div>

        {/* Reflections toggle */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <label className="flex items-center justify-between cursor-pointer select-none">
            <span className="text-sm text-foreground">{t('includeReflections')}</span>
            <ToggleSwitch checked={includeReflections} onChange={setIncludeReflections} />
          </label>

          {includeReflections && (
            <textarea
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              placeholder={t('reflectionsPlaceholder')}
              rows={3}
              className="mt-3 w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:border-primary resize-none"
            />
          )}
        </div>

        {/* Prompt preview */}
        <div className="flex flex-col min-h-0 flex-1 px-5 py-3 border-t border-border">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2 shrink-0">{t('promptLabel')}</p>
          <pre className="flex-1 overflow-y-auto text-xs text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap bg-surface/50 border border-border rounded-lg p-3">
            {prompt}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleCopy}
            className={cn('w-full transition-all', copied && 'bg-green-600 hover:opacity-100')}
          >
            {copied ? t('copied') : t('copyButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0',
        checked ? 'bg-primary' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  );
}
