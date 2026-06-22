'use client';

import { use, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogStore, useLogActions } from '@/store';
import { ReadingDetail } from '@/components/log/ReadingDetail';
import { Button } from '@/components/ui/Button';

interface LogDetailPageProps {
  params: Promise<{ readingId: string }>;
}

export default function LogDetailPage({ params }: LogDetailPageProps) {
  const { readingId } = use(params);
  const t = useTranslations('common');
  const tLog = useTranslations('log');
  const locale = useLocale();
  const router = useRouter();
  const getReading = useLogStore((s) => s.getReading);
  const { deleteReading } = useLogActions();
  const reading = getReading(readingId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = () => {
    deleteReading(readingId);
    router.push(`/${locale}/log`);
  };

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

      <div className="mt-8 pt-6 border-t border-border">
        {confirmingDelete ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">{tLog('confirmDelete')}</p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete}>{tLog('delete')}</Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>{tLog('cancel')}</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}
            className="text-muted hover:text-red-500">
            {tLog('deleteReading')}
          </Button>
        )}
      </div>
    </div>
  );
}
