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
  const [pendingCards, setPendingCards] = useState<ReturnType<typeof drawForSpread> | null>(null);
  const [drawnCount, setDrawnCount] = useState(0);

  // Initialize the reading when the spread page loads
  useEffect(() => {
    if (!activeReading || activeReading.spreadId !== spreadId) {
      initReading(spread!);
      setPendingCards(null);
      setDrawnCount(0);
    }
  }, [spreadId]);

  const getOrCreatePendingCards = () => {
    if (pendingCards) return pendingCards;
    const cards = drawForSpread(spread!.positions, settings.reversalEnabled, settings.reversalChance);
    setPendingCards(cards);
    return cards;
  };

  const handleDrawNext = () => {
    if (!spread || drawnCount >= spread.positions.length) return;
    const cards = getOrCreatePendingCards();
    addDrawnCard(cards[drawnCount]);
    setDrawnCount((n) => n + 1);
  };

  const handleDrawAll = () => {
    if (!spread || drawnCount >= spread.positions.length) return;
    const cards = getOrCreatePendingCards();
    cards.slice(drawnCount).forEach((dc) => addDrawnCard(dc));
    setDrawnCount(spread.positions.length);
  };

  const allDrawn = drawnCount >= (spread?.positions.length ?? 0);
  const drawnCards = activeReading?.drawnCards ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:flex-row">

      {/* Canvas area — fixed height on mobile, flex-1 on desktop */}
      <div className="flex-shrink-0 h-[42vh] lg:h-auto lg:flex-1 flex flex-col min-h-0">
        {/* Spread title */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="text-sm font-semibold text-foreground">
            {tAll(spread.nameKey as Parameters<typeof tAll>[0])}
          </h1>
          {!allDrawn && !spread.isConstellation && (
            <div className="flex items-center gap-2">
              {drawnCount > 0 && (
                <span className="text-xs text-muted tabular-nums">
                  {drawnCount} / {spread.positions.length}
                </span>
              )}
              <Button onClick={handleDrawNext} size="sm" variant="secondary">
                {t('draw')}
              </Button>
              <Button onClick={handleDrawAll} size="sm">
                {t('drawAll')}
              </Button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-0 p-3 lg:p-4">
          <SpreadCanvas
            spread={spread}
            drawnCards={drawnCards}
            onCardSelect={setSelectedCardId}
            className="rounded-xl border border-border bg-surface/30"
          />
        </div>
      </div>

      {/* Side panel — fills remaining height on mobile, fixed width on desktop */}
      <div className="flex-1 min-h-0 lg:flex-none lg:w-80 xl:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border">

        {/* Scrollable: card list + streaming AI interpretation */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ReadingPanel
            spread={spread}
            drawnCards={drawnCards}
            selectedCardId={selectedCardId}
            onCardSelect={setSelectedCardId}
          />
          <InterpretationBlock />
        </div>

        {/* Sticky bottom: notes + save/new */}
        <div className="flex-shrink-0 border-t border-border">
          <ReadingNotes className="px-4 py-3" />
          <ReadingActions />
        </div>
      </div>
    </div>
  );
}
