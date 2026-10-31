import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CollapsibleProps {
  readonly title: ReactNode;
  readonly badge?: ReactNode;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly className?: string;
  readonly contentClassName?: string;
}

export function Collapsible({
  title,
  badge,
  children,
  defaultOpen = false,
  className,
  contentClassName,
}: CollapsibleProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className={cn(
        'rounded-xl border border-stone-200/90 bg-white transition-colors',
        open && 'border-subject-200',
        className,
      )}
    >
      <CollapsiblePrimitive.Trigger className="focus-visible:outline-subject-600 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50/80 focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="flex items-center gap-2.5">
          <span>{title}</span>
          {badge}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200',
            open && 'text-subject-600 rotate-180',
          )}
          aria-hidden="true"
        />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content
        className={cn(
          'border-t border-stone-100 px-4 py-3.5 text-sm leading-relaxed text-stone-700',
          contentClassName,
        )}
      >
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
