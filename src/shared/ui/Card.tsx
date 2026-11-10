import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly accent?: 'none' | 'subjectTop' | 'subjectLeft' | 'subjectBorder';
  readonly interactive?: boolean;
}

export function Card({ className, accent = 'none', interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] shadow-[var(--shadow-editorial)]',
        accent === 'subjectTop' && 'border-t-subject-500 border-t-4',
        accent === 'subjectLeft' && 'border-l-subject-500 border-l-4',
        accent === 'subjectBorder' && 'border-subject-200/90',
        interactive &&
          'hover:border-subject-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6 pb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold tracking-tight text-stone-900', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed text-stone-600', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-3', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-stone-100 px-6 py-4',
        className,
      )}
      {...props}
    />
  );
}
