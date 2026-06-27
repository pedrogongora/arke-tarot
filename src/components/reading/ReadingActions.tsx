'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button } from '@/components/ui/Button';
import { CopyPromptModal } from '@/components/reading/CopyPromptModal';
import { useReadingStore, useLogStore } from '@/store';
import type { Reading, SupportedLocale } from '@/types';

export function ReadingActions() {
  const t = useTranslations('reading.actions');
  const locale = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCopyPrompt, setShowCopyPrompt] = useState(false);

  const activeReading = useReadingStore((s) => s.activeReading);
  const activeSpread = useReadingStore((s) => s.activeSpread);
  const clearReading = useReadingStore((s) => s.clearReading);
  const addReading = useLogStore((s) => s.addReading);

  const canSave = !!activeReading && activeReading.drawnCards.length > 0;

  const handleSave = () => {
    if (!activeReading) return;
    setSaving(true);
    const reading: Reading = { ...activeReading, id: activeReading.id || uuid() };
    addReading(reading);
    setSaving(false);
    setSaved(true);
  };

  const handleNew = () => {
    clearReading();
    router.push(`/${locale}/reading`);
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border">
        <Button onClick={handleSave} disabled={!canSave || saving || saved} variant="primary" size="sm" className="flex-1">
          {saving ? t('saving') : saved ? t('saved') : t('save')}
        </Button>

        {canSave && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCopyPrompt(true)}
            className="flex-1"
          >
            {t('copyPrompt')}
          </Button>
        )}

        <Button onClick={handleNew} variant="ghost" size="sm" className="flex-1">
          {t('new')}
        </Button>
      </div>

      {showCopyPrompt && activeReading && (
        <CopyPromptModal
          spread={activeSpread ?? undefined}
          drawnCards={activeReading.drawnCards}
          notes={activeReading.notes}
          locale={locale as SupportedLocale}
          onClose={() => setShowCopyPrompt(false)}
        />
      )}
    </>
  );
}
