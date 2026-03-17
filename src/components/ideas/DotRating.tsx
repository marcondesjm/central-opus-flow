import { cn } from '@/lib/utils';

interface DotRatingProps {
  value: number;
  max?: number;
  color?: string;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md';
}

export function DotRating({ value, max = 5, color = 'bg-primary', onChange, size = 'md' }: DotRatingProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i + 1)}
          className={cn(
            dotSize, 'rounded-full transition-all',
            i < value ? color : 'bg-muted',
            onChange && 'cursor-pointer hover:scale-125'
          )}
        />
      ))}
    </div>
  );
}
