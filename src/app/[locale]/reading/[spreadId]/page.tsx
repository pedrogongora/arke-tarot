'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getSpread } from '@/data/spreads';
import { SpreadCanvas } from '@/components/canvas/SpreadCanvas';
import { ReadingPanel } from '@/components/reading/ReadingPanel';
import { ReadingNotes } from '@/components/reading/ReadingNotes';
import { ReadingActions } from '@/components/reading/ReadingActions';
import { InterpretationBlock } from '@/components/reading/InterpretationBlock';
import { Button } from '@/components/ui/Button';
import { useReadingStore, useSettings } from '@/store';
import { drawForSpread } from '@/lib/utils/deck';

interface ReadingPageProps {
  params: Promise<{ spreadId: string; locale: string }>;
}

export default function ReadingSpreadPage({ params }: ReadingPageProps) {
  const { spreadId } = use(params);
  const spread = getSpread(spreadId);

  if (!spread) notFound();

  const t = useTranslations('reading');
  const tAll = useTranslations();
  const settings = useSettings();
  const initReading = useReadingStore((s) => s.initReading);
  const addDrawnCard = useReadingStore((s) => s.addDrawnCard);
  const activeReading = useReadingStore((s) => s.activeReading);
  const phase = useReadingStore((s) => s.phase);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [drawn, setDrawn] = useState(false);

  // Initialize the reading when the spread page loads
  useEffect(() => {
    if (!activeReading || activeReading.spreadId !== spreadId) {
      initReading(spread!);
      setDrawn(false);
    }
  }, [spreadId]);

  const handleDrawAll = () => {
    if (!spread || drawn) return;
    const drawnCards = drawForSpread(
      spread.positions,
      settings.reversalEnabled,
      settings.reversalChance
    );
    drawnCards.forEach((dc) => addDrawnCard(dc));
    setDrawn(true);
  };

  const drawnCards = activeReading?.drawnCards ?? [];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
      {/* Canvas area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Spread title */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="text-sm font-semibold text-foreground">
              {tAll(spread.nameKey as Parameters<typeof tAll>[0])}
          </h1>
          {!drawn && !spread.isConstellation && (
            <Button onClick={handleDrawAll} size="sm">
              {t('drawAll')}
            </Button>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <SpreadCanvas
            spread={spread}
            drawnCards={drawnCards}
            onCardSelect={setSelectedCardId}
            className="rounded-xl border border-border bg-surface/30"
          />
        </div>
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
        <div className="flex-1 overflow-y-auto">
          <ReadingPanel
            drawnCards={drawnCards}
            selectedCardId={selectedCardId}
            onCardSelect={setSelectedCardId}
          />
        </div>
        <ReadingNotes className="px-4 py-3 border-t border-border" />
        <InterpretationBlock />
        <ReadingActions />
      </div>
    </div>
  );
}
