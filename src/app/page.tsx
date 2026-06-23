'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SupportedLocale } from '@/types';

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es'];

function detectLocale(): SupportedLocale {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const base = lang.split('-')[0].toLowerCase() as SupportedLocale;
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return 'en';
}

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${detectLocale()}`);
  }, [router]);
  return null;
}
