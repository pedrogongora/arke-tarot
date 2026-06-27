import Image from 'next/image';
import type { Card } from '@/types';
import { cn } from '@/lib/utils/cn';

interface CardImageProps {
  card: Card;
  isReversed?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  sm:   { width: 80,  height: 141 },
  md:   { width: 140, height: 248 },
  lg:   { width: 200, height: 354 },
  full: { width: 300, height: 530 },
};

export function CardImage({ card, isReversed = false, size = 'md', className, priority = false }: CardImageProps) {
  const { width, height } = sizeMap[size];
  const src = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${card.imagePath}`;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md shadow-lg flex-shrink-0',
        size === 'md' ? 'w-[100px] h-[177px] sm:w-[140px] sm:h-[248px]' : '',
        className
      )}
      style={size !== 'md' ? { width, height } : undefined}
    >
      <Image
        src={src}
        alt={card.id}
        width={width}
        height={height}
        priority={priority}
        className={cn('object-cover transition-transform duration-300', isReversed && 'rotate-180')}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
