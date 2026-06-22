import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { CARDS } from '@/data/cards';
import type { Suit } from '@/types';

const SUIT_ORDER: Suit[] = ['major', 'cups', 'pentacles', 'swords', 'wands'];

export default async function CardLibraryPage() {
  const t = await getTranslations('card');
  const tCards = await getTranslations('cards');
  const locale = await getLocale();

  const grouped = SUIT_ORDER.map((suit) => ({
    suit,
    label: t(`suits.${suit}` as Parameters<typeof t>[0]),
    cards: CARDS.filter((c) => c.suit === suit),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">{t('library')}</h1>

      <div className="flex flex-col gap-12">
        {grouped.map(({ suit, label, cards }) => (
          <section key={suit}>
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              {label}
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-11 gap-2 sm:gap-3">
              {cards.map((card) => (
                <Link
                  key={card.id}
                  href={`/${locale}/card/${card.id}`}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <div className="relative overflow-hidden rounded shadow-md w-full aspect-[0.565] transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <Image
                      src={card.imagePath}
                      alt={card.id}
                      fill
                      sizes="(max-width: 640px) 22vw, (max-width: 768px) 15vw, 10vw"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-muted text-center leading-tight group-hover:text-foreground transition-colors line-clamp-2">
                    {tCards(`${card.id}.name` as Parameters<typeof tCards>[0])}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
