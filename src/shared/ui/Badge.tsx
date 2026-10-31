import type { HTMLAttributes } from 'react';
import type { VariantProps } from 'tailwind-variants';
import { cn } from '@/shared/lib/cn';
import { badgeVariants } from '@/shared/ui/variants';

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
