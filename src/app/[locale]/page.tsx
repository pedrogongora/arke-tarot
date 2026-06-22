import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12 text-center">
      {/* Symbol */}
      <div className="text-6xl text-accent mb-6 select-none">✦</div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
        {t('title')}
      </h1>
      <p className="text-lg text-muted mb-10 max-w-md">
        {t('subtitle')}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/${locale}/reading`}
          className="px-6 py-3 rounded-lg bg-primary text-background font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {t('startReading')}
        </Link>
        <Link
          href={`/${locale}/log`}
          className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
        >
          {t('viewLog')}
        </Link>
        <Link
          href={`/${locale}/card`}
          className="px-6 py-3 rounded-lg text-muted font-semibold text-sm hover:text-foreground transition-colors"
        >
          {t('browseCards')}
        </Link>
      </div>

      {/* Decorative */}
      <div className="mt-16 flex gap-3 text-border select-none">
        {['✦', '◆', '✦', '◆', '✦'].map((s, i) => (
          <span key={i} className="text-sm">{s}</span>
        ))}
      </div>
    </div>
  );
}
