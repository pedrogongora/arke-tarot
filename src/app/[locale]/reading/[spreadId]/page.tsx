import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SPREAD_DEFINITIONS } from '@/data/spreads';
import { SpreadReadingView } from './SpreadReadingView';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SPREAD_DEFINITIONS.map((spread) => ({ locale, spreadId: spread.id }))
  );
}

interface ReadingPageProps {
  params: Promise<{ locale: string; spreadId: string }>;
}

export default async function ReadingSpreadPage({ params }: ReadingPageProps) {
  const { locale, spreadId } = await params;
  setRequestLocale(locale);
  if (!SPREAD_DEFINITIONS.find((s) => s.id === spreadId)) notFound();
  return <SpreadReadingView spreadId={spreadId} />;
}
