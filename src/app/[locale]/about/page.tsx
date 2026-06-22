import { getTranslations } from 'next-intl/server';
import { ArkeLogo } from '@/components/layout/ArkeLogo';

const FEATURES = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5', 'feature6'] as const;
const DEVELOPER_LINES = ['developer1', 'developer2', 'developer3', 'developer4', 'developer5', 'developer6'] as const;

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      <div className="flex flex-col items-center gap-2">
        <ArkeLogo variant="vertical" width={200} height={230} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t('appSection')}</h2>
        <p className="text-muted leading-relaxed">{t('appDescription')}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t('featuresTitle')}</h2>
        <ul className="flex flex-col gap-2">
          {FEATURES.map((key) => (
            <li key={key} className="flex items-start gap-2 text-muted">
              <span className="text-accent mt-0.5 select-none">◆</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t('developerTitle')}</h2>
        <div className="flex flex-col gap-2 text-muted leading-relaxed">
          {DEVELOPER_LINES.map((key) => (
            <p key={key}>{t(key)}</p>
          ))}
        </div>
        <a
          href="https://buymeacoffee.com/proyectomatrioska"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFDD00] text-[#000000] font-semibold text-sm hover:opacity-90 transition-opacity w-fit"
        >
          ☕ {t('coffeeLink')}
        </a>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">{t('sourceTitle')}</h2>
        <p className="text-muted leading-relaxed">{t('sourceText')}</p>
        <a
          href="https://github.com/pedrogongora/tarot-reader"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-colors w-fit"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
          </svg>
          {t('sourceLink')}
        </a>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t('licenseTitle')}</h2>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">{t('licenseCodeTitle')}</h3>
          <p className="text-muted text-sm">{t('licenseCodeText')}</p>
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline w-fit"
          >
            {t('licenseCodeLink')}
          </a>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">{t('licenseImagesTitle')}</h3>
          <p className="text-muted text-sm">{t('licenseImagesText')}</p>
          <a
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline w-fit"
          >
            {t('licenseImagesLink')}
          </a>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">{t('licenseContentTitle')}</h3>
          <p className="text-muted text-sm">{t('licenseContentText')}</p>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline w-fit"
          >
            {t('licenseContentLink')}
          </a>
        </div>
      </section>

      <div className="flex gap-3 text-border select-none pt-2">
        {['✦', '◆', '✦', '◆', '✦'].map((s, i) => (
          <span key={i} className="text-sm">{s}</span>
        ))}
      </div>
    </div>
  );
}
