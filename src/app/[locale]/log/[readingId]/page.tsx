'use client';

import { use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useLogStore } from '@/store';
import { ReadingDetail } from '@/components/log/ReadingDetail';
import { Button } from '@/components/ui/Button';

interface LogDetailPageProps {
  params: Promise<{ readingId: string }>;
}

export default function LogDetailPage({ params }: LogDetailPageProps) {
  const { readingId } = use(params);
  const t = useTranslations('common');
  const locale = useLocale();
  const getReading = useLogStore((s) => s.getReading);
  const reading = getReading(readingId);

  if (!reading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-muted mb-4">Reading not found.</p>
        <Link href={`/${locale}/log`}>
          <Button variant="secondary" size="sm">{t('back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link href={`/${locale}/log`} className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1">
          ← {t('back')}
        </Link>
      </div>
      <ReadingDetail reading={reading} />
    </div>
  );
}
