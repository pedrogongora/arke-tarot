import { getTranslations } from 'next-intl/server';
import { SPREAD_DEFINITIONS } from '@/data/spreads';
import { SpreadSelector } from '@/components/spread/SpreadSelector';

export default async function ReadingPage() {
  const t = await getTranslations('reading');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">{t('selectSpread')}</h1>
      <p className="text-sm text-muted mb-6">
        Choose a spread to begin your reading.
      </p>
      <SpreadSelector spreads={SPREAD_DEFINITIONS} />
    </div>
  );
}
