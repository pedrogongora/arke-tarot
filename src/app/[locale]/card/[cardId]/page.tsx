import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCard, CARDS } from '@/data/cards';
import { routing } from '@/i18n/routing';
import { CardImage } from '@/components/card/CardImage';

interface CardPageProps {
  params: Promise<{ locale: string; cardId: string }>;
}

export default async function CardPage({ params }: CardPageProps) {
  const { locale, cardId } = await params;
  setRequestLocale(locale);
  const card = getCard(cardId);
  if (!card) notFound();

  const t = await getTranslations();
  const tCard = await getTranslations('card');

  const idx = CARDS.findIndex((c) => c.id === cardId);
  const prev = idx > 0 ? CARDS[idx - 1] : null;
  const next = idx < CARDS.length - 1 ? CARDS[idx + 1] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/${locale}/card`}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← {tCard('backToLibrary')}
        </Link>
        <span className="text-xs text-muted">
          {idx + 1} {tCard('of')} {CARDS.length}
        </span>
      </div>

      {/* Card detail */}
      <div className="flex flex-col sm:flex-row gap-8">
        <CardImage card={card} size="lg" priority />

        <div className="flex-1 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              {tCard(`suits.${card.suit}` as Parameters<typeof tCard>[0])}
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              {t(card.nameKey as Parameters<typeof t>[0])}
            </h1>
            {card.element && (
              <p className="text-sm text-muted mt-1">
                {tCard(`elements.${card.element}` as Parameters<typeof tCard>[0])}
              </p>
            )}
          </div>

          {/* Keywords */}
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{tCard('keywords')}</h2>
            <div className="flex flex-wrap gap-1">
              {card.keywords.map((kw) => (
                <span key={kw} className="text-xs px-2 py-0.5 bg-surface border border-border rounded-full text-foreground">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Upright */}
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{tCard('upright')}</h2>
            <p className="text-sm text-foreground leading-relaxed">
              {t(card.uprightKey as Parameters<typeof t>[0])}
            </p>
          </div>

          {/* Reversed */}
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{tCard('reversed')}</h2>
            <p className="text-sm text-foreground leading-relaxed">
              {t(card.reversedKey as Parameters<typeof t>[0])}
            </p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{tCard('description')}</h2>
            <p className="text-sm text-muted leading-relaxed">
              {t(card.descriptionKey as Parameters<typeof t>[0])}
            </p>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link
            href={`/${locale}/card/${prev.id}`}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group"
          >
            <span className="text-lg group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>{tCard('previous')}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/${locale}/card/${next.id}`}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group"
          >
            <span>{tCard('next')}</span>
            <span className="text-lg group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CARDS.map((card) => ({ locale, cardId: card.id }))
  );
}
