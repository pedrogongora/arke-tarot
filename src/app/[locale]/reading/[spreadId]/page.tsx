'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { getSpread } from '@/data/spreads';
import { SpreadCanvas } from '@/components/canvas/SpreadCanvas';
import { ReadingPanel } from '@/components/reading/ReadingPanel';
import { ReadingNotes } from '@/components/reading/ReadingNotes';
import { ReadingActions } from '@/components/reading/ReadingActions';
import { InterpretationBlock } from '@/components/reading/InterpretationBlock';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useReadingStore, useSettings } from '@/store';
import { drawForSpread, drawSingleCard } from '@/lib/utils/deck';

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
  const updateCardPosition = useReadingStore((s) => s.updateCardPosition);
  const activeReading = useReadingStore((s) => s.activeReading);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [pendingCards, setPendingCards] = useState<ReturnType<typeof drawForSpread> | null>(null);
  const [drawnCount, setDrawnCount] = useState(0);

  // Constellation: label dialog state
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [pendingLabel, setPendingLabel] = useState('');

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

  const handleAddConstellationCard = () => {
    if (!spread?.isConstellation) return;
    const label = pendingLabel.trim() || t('constellation.addCard');
    const newCard = drawSingleCard(drawnCards, settings.reversalEnabled, settings.reversalChance);
    addDrawnCard({ ...newCard, userLabel: label });
    setPendingLabel('');
    setShowAddCardDialog(false);
  };

  const handleCardDrop = (cardId: string, normalizedX: number, normalizedY: number) => {
    updateCardPosition(cardId, normalizedX, normalizedY);
  };

  const drawnCards = activeReading?.drawnCards ?? [];

  const allDrawn = spread.isConstellation
    ? drawnCards.length >= (spread.maxCards ?? 22)
    : drawnCount >= (spread?.positions.length ?? 0);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:flex-row">

      {/* Canvas area — fixed height on mobile, flex-1 on desktop */}
      <div className="flex-shrink-0 h-[38vh] lg:h-auto lg:flex-1 flex flex-col min-h-0">
        {/* Spread title */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border">
          <h1 className="text-sm font-semibold text-foreground">
            {tAll(spread.nameKey as Parameters<typeof tAll>[0])}
          </h1>

          {/* Non-constellation draw buttons */}
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

          {/* Constellation controls */}
          {spread.isConstellation && (
            <div className="flex items-center gap-2">
              {drawnCards.length > 0 && (
                <span className="text-xs text-muted tabular-nums">
                  {drawnCards.length} / {spread.maxCards ?? 22}
                </span>
              )}
              <Button
                onClick={() => setShowAddCardDialog(true)}
                disabled={allDrawn}
                size="sm"
              >
                {t('constellation.addCard')}
              </Button>
            </div>
          )}
        </div>

        {/* Constellation empty-state hint */}
        {spread.isConstellation && drawnCards.length === 0 && (
          <p className="flex-shrink-0 px-4 py-2 text-xs text-muted text-center border-b border-border">
            {t('constellation.instructions')}
          </p>
        )}

        {/* Canvas */}
        <div className="flex-1 min-h-0 p-3 lg:p-4">
          <SpreadCanvas
            spread={spread}
            drawnCards={drawnCards}
            onCardSelect={setSelectedCardId}
            onCardDrop={handleCardDrop}
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
          <ReadingNotes className="px-4 pt-2.5 pb-1.5" />
          <ReadingActions />
        </div>
      </div>

      {/* Add Card dialog (constellation only) */}
      <Modal
        open={showAddCardDialog}
        onClose={() => { setShowAddCardDialog(false); setPendingLabel(''); }}
        title={t('constellation.labelDialog.title')}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">{t('constellation.labelDialog.prompt')}</p>
          <input
            autoFocus
            type="text"
            value={pendingLabel}
            onChange={(e) => setPendingLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddConstellationCard(); }}
            placeholder={t('constellation.labelDialog.placeholder')}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
            maxLength={60}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setShowAddCardDialog(false); setPendingLabel(''); }}
            >
              {t('constellation.labelDialog.cancel')}
            </Button>
            <Button size="sm" onClick={handleAddConstellationCard}>
              {t('constellation.labelDialog.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
