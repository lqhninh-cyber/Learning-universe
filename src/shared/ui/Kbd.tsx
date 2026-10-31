import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-stone-700 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]',
        className,
      )}
      {...props}
    />
  );
}
