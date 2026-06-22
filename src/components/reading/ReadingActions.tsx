'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button } from '@/components/ui/Button';
import { useReadingStore, useLogStore, useSettings } from '@/store';
import type { Reading } from '@/types';
import type { AIRequest, ResolvedCard } from '@/lib/ai/types';

export function ReadingActions() {
  const t = useTranslations('reading.actions');
  const tAll = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeReading = useReadingStore((s) => s.activeReading);
  const activeSpread = useReadingStore((s) => s.activeSpread);
  const aiStatus = useReadingStore((s) => s.aiStatus);
  const clearReading = useReadingStore((s) => s.clearReading);
  const setAIStatus = useReadingStore((s) => s.setAIStatus);
  const appendAIStream = useReadingStore((s) => s.appendAIStream);
  const setAIError = useReadingStore((s) => s.setAIError);
  const finalizeAIInterpretation = useReadingStore((s) => s.finalizeAIInterpretation);
  const addReading = useLogStore((s) => s.addReading);
  const settings = useSettings();

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const canSave = !!activeReading && activeReading.drawnCards.length > 0;

  const handleSave = () => {
    if (!activeReading) return;
    setSaving(true);
    const reading: Reading = { ...activeReading, id: activeReading.id || uuid() };
    addReading(reading);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNew = () => {
    abortRef.current?.abort();
    clearReading();
    router.push(`/${locale}/reading`);
  };

  const canInterpret = canSave && settings.aiProvider !== 'none' && !!settings.aiApiKey;
  const isInterpreting = aiStatus === 'loading' || aiStatus === 'streaming';

  const handleInterpret = async () => {
    if (!activeReading || !canInterpret || isInterpreting) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAIStatus('loading');

    const resolvedCards: ResolvedCard[] = activeReading.drawnCards.map((dc) => ({
      positionLabel: tAll(dc.position.labelKey as Parameters<typeof tAll>[0]),
      positionDesc: tAll(dc.position.descriptionKey as Parameters<typeof tAll>[0]),
      cardName: tAll(dc.card.nameKey as Parameters<typeof tAll>[0]),
      orientation: dc.isReversed ? 'reversed' : 'upright',
      meaning: tAll(
        (dc.isReversed ? dc.card.reversedKey : dc.card.uprightKey) as Parameters<typeof tAll>[0]
      ),
    }));

    const resolvedSpreadName = activeSpread
      ? tAll(activeSpread.nameKey as Parameters<typeof tAll>[0])
      : activeReading.spreadId;

    const resolvedSpreadDescription = activeSpread
      ? tAll(activeSpread.descriptionKey as Parameters<typeof tAll>[0])
      : undefined;

    const aiRequest: AIRequest = {
      spread: activeSpread ?? ({ id: activeReading.spreadId } as AIRequest['spread']),
      drawnCards: activeReading.drawnCards,
      notes: activeReading.notes,
      locale: locale as 'en' | 'es',
      resolvedCards,
      resolvedSpreadName,
      resolvedSpreadDescription,
    };

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          provider: settings.aiProvider,
          apiKey: settings.aiApiKey,
          model: settings.aiModel ?? '',
          request: aiRequest,
        }),
      });

      if (!response.ok || !response.body) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        setAIError(err.error ?? 'Request failed');
        setAIStatus('error');
        return;
      }

      setAIStatus('streaming');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendAIStream(decoder.decode(value, { stream: true }));
      }

      finalizeAIInterpretation(settings.aiProvider, settings.aiModel ?? '');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setAIError(err instanceof Error ? err.message : 'Unknown error');
      setAIStatus('error');
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border">
      <Button onClick={handleSave} disabled={!canSave || saving} variant="primary" size="sm" className="flex-1">
        {saving ? t('saving') : saved ? t('saved') : t('save')}
      </Button>

      {canInterpret && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleInterpret}
          disabled={isInterpreting}
          className="flex-1"
        >
          {isInterpreting ? t('interpreting') : t('interpret')}
        </Button>
      )}

      <Button onClick={handleNew} variant="ghost" size="sm" className="flex-shrink-0 px-2.5">
        {t('new')}
      </Button>
    </div>
  );
}
