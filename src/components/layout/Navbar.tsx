'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { ArkeLogo } from './ArkeLogo';

interface NavLink {
  href: string;
  labelKey: 'home' | 'reading' | 'log' | 'settings';
}

const NAV_LINKS: NavLink[] = [
  { href: '', labelKey: 'home' },
  { href: '/reading', labelKey: 'reading' },
  { href: '/log', labelKey: 'log' },
  { href: '/settings', labelKey: 'settings' },
];

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    if (href === '') return pathname === `/${locale}`;
    return pathname.startsWith(full);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center">
          <ArkeLogo variant="horizontal" width={160} height={49} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={`/${locale}${href}`}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(href)
                  ? 'text-primary bg-surface'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              )}
            >
              {t(labelKey)}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher className="hidden sm:flex" />
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t('menuClose') : t('menuOpen')}
            className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={`/${locale}${href}`}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(href)
                  ? 'text-primary bg-background'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {t(labelKey)}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-1">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
