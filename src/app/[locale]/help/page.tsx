import { getTranslations } from 'next-intl/server';

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

export default async function HelpPage() {
  const t = await getTranslations('help');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t('howToUseTitle')}</h2>
        <p className="text-muted">{t('howToUseIntro')}</p>
        <ol className="flex flex-col gap-3">
          {STEPS.map((key, i) => (
            <li key={key} className="flex items-start gap-3 text-muted">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-border text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{t(key)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-foreground">{t('exportTitle')}</h2>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">{t('promptTitle')}</h3>
          <p className="text-muted text-sm leading-relaxed">{t('promptText')}</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">{t('imageTitle')}</h3>
          <p className="text-muted text-sm leading-relaxed">{t('imageText')}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3 p-5 rounded-xl bg-surface border border-border">
        <h2 className="text-lg font-semibold text-foreground">{t('privacyTitle')}</h2>
        <p className="text-muted leading-relaxed">{t('privacyText')}</p>
      </section>
    </div>
  );
}
