import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-lg bg-stone-200/80', className)}
      {...props}
    />
  );
}
