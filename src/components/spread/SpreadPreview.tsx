import type { SpreadDefinition } from '@/types';
import { cn } from '@/lib/utils/cn';

interface SpreadPreviewProps {
  spread: SpreadDefinition;
  className?: string;
}

/** Renders a miniature static diagram of a spread's card positions using plain divs. */
export function SpreadPreview({ spread, className }: SpreadPreviewProps) {
  if (spread.isConstellation) {
    return (
      <div className={cn('w-full aspect-[4/3] relative bg-background/50 rounded-lg border border-border flex items-center justify-center', className)}>
        <span className="text-2xl text-muted">✦✦✦</span>
      </div>
    );
  }

  return (
    <div className={cn('w-full aspect-[4/3] relative bg-background/50 rounded-lg border border-border overflow-hidden', className)}>
      {spread.positions.map((pos) => {
        const left = `${pos.x * 100}%`;
        const top = `${pos.y * 100}%`;
        return (
          <div
            key={pos.id}
            className="absolute w-[12%] aspect-[2/3] bg-surface border border-primary/40 rounded-sm transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
            style={{
              left,
              top,
              transform: `translate(-50%, -50%) rotate(${pos.rotation ?? 0}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
