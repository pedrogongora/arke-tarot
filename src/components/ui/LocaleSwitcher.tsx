'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useSettingsActions } from '@/store';
import type { SupportedLocale } from '@/types';

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { setLocale } = useSettingsActions();

  const switchLocale = (next: SupportedLocale) => {
    setLocale(next);
    // Replace the locale segment in the current path
    const segments = pathname.split('/');
    segments[1] = next;
    router.push(segments.join('/'));
  };

  return (
    <div className={cn('flex gap-1', className)}>
      {(['en', 'es'] as SupportedLocale[]).map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={cn(
            'px-2 py-1 text-xs font-medium rounded transition-colors uppercase',
            locale === loc
              ? 'bg-primary text-background'
              : 'text-muted hover:text-foreground'
          )}
          aria-current={locale === loc ? 'true' : undefined}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
