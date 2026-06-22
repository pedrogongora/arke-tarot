'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSettings, useSettingsActions } from '@/store';
import type { ThemeMode, ColorPalette, AIProviderName, SupportedLocale } from '@/types';
import { cn } from '@/lib/utils/cn';

const THEMES: ThemeMode[] = ['light', 'dark', 'system'];
const PALETTES: ColorPalette[] = ['midnight', 'forest', 'crimson', 'celestial'];
const AI_PROVIDERS: AIProviderName[] = ['none', 'claude', 'openai', 'deepseek'];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  label: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg border transition-all',
            opt === value
              ? 'border-primary bg-primary/20 text-primary font-medium'
              : 'border-border text-muted hover:border-primary/50 hover:text-foreground'
          )}
        >
          {label(opt)}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const settings = useSettings();
  const { setTheme, setLocale, updateSettings, setAIProvider } = useSettingsActions();

  const switchLocale = (next: SupportedLocale) => {
    setLocale(next);
    const path = window.location.pathname;
    const segments = path.split('/');
    segments[1] = next;
    router.push(segments.join('/'));
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>

      {/* Language */}
      <div>
        <SectionTitle>{t('language.label')}</SectionTitle>
        <OptionGroup
          options={['en', 'es'] as SupportedLocale[]}
          value={settings.locale}
          onChange={switchLocale}
          label={(v) => t(`language.${v}` as Parameters<typeof t>[0])}
        />
      </div>

      {/* Theme mode */}
      <div>
        <SectionTitle>{t('theme.label')}</SectionTitle>
        <OptionGroup
          options={THEMES}
          value={settings.themeMode}
          onChange={(mode) => setTheme(mode)}
          label={(v) => t(`theme.${v}` as Parameters<typeof t>[0])}
        />
      </div>

      {/* Color palette */}
      <div>
        <SectionTitle>{t('palette.label')}</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {PALETTES.map((palette) => (
            <button
              key={palette}
              onClick={() => setTheme(settings.themeMode, palette)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                palette === settings.colorPalette
                  ? 'border-primary shadow-md shadow-primary/20'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <PaletteSwatch palette={palette} />
              <span className="text-xs text-muted">
                {t(`palette.${palette}` as Parameters<typeof t>[0])}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reversal */}
      <div>
        <SectionTitle>{t('reversal.label')}</SectionTitle>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">{t('reversal.label')}</span>
            <ToggleSwitch
              checked={settings.reversalEnabled}
              onChange={(v) => updateSettings({ reversalEnabled: v })}
            />
          </label>

          {settings.reversalEnabled && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-muted">
                <span>{t('reversal.chanceLabel')}</span>
                <span>{Math.round(settings.reversalChance * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.reversalChance}
                onChange={(e) => updateSettings({ reversalChance: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted">{t('reversal.chanceHint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* AI */}
      <div>
        <SectionTitle>{t('ai.label')}</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-muted mb-1 block">{t('ai.provider')}</label>
            <OptionGroup
              options={AI_PROVIDERS}
              value={settings.aiProvider}
              onChange={(p) => setAIProvider(p)}
              label={(v) => t(`ai.${v}` as Parameters<typeof t>[0])}
            />
          </div>

          {settings.aiProvider !== 'none' && (
            <>
              <div>
                <label className="text-xs text-muted mb-1 block">{t('ai.apiKey')}</label>
                <input
                  type="password"
                  value={settings.aiApiKey ?? ''}
                  onChange={(e) => updateSettings({ aiApiKey: e.target.value })}
                  placeholder={t('ai.apiKeyPlaceholder')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-muted mt-1">{t('ai.apiKeyHint')}</p>
              </div>

              <div>
                <label className="text-xs text-muted mb-1 block">{t('ai.model')}</label>
                <input
                  type="text"
                  value={settings.aiModel ?? ''}
                  onChange={(e) => updateSettings({ aiModel: e.target.value })}
                  placeholder={
                    settings.aiProvider === 'claude'
                      ? 'claude-sonnet-4-6'
                      : settings.aiProvider === 'openai'
                      ? 'gpt-4o'
                      : 'deepseek-chat'
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        checked ? 'bg-primary' : 'bg-border'
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  );
}

const PALETTE_COLORS: Record<ColorPalette, [string, string, string]> = {
  midnight:  ['#9b8fe8', '#1a1730', '#c9a84c'],
  forest:    ['#5fa874', '#122018', '#c4874e'],
  crimson:   ['#e05858', '#2a1010', '#d4a060'],
  celestial: ['#6688dd', '#101830', '#9999ee'],
  custom:    ['#888888', '#222222', '#aaaaaa'],
};

function PaletteSwatch({ palette }: { palette: ColorPalette }) {
  const [primary, surface, accent] = PALETTE_COLORS[palette] ?? ['#888', '#222', '#aaa'];
  return (
    <div className="flex gap-1">
      {[primary, surface, accent].map((color, i) => (
        <span
          key={i}
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
