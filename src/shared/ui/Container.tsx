import type { HTMLAttributes } from 'react';
import type { VariantProps } from 'tailwind-variants';
import { cn } from '@/shared/lib/cn';
import { containerVariants } from '@/shared/ui/variants';

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

export function Container({ className, size, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}
