import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { usePrintExpanded } from '@/shared/hooks/usePrintExpanded';
import { cn } from '@/shared/lib/cn';

export interface CollapsibleProps {
  readonly title: ReactNode;
  readonly badge?: ReactNode;
  readonly headerActions?: ReactNode;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly className?: string;
  readonly contentClassName?: string;
}

export function Collapsible({
  title,
  badge,
  headerActions,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  contentClassName,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const isPrinting = usePrintExpanded();
  const open = isPrinting || (controlledOpen ?? internalOpen);

  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      className={cn(
        'rounded-xl border border-stone-200/90 bg-white/60 transition-all duration-300 ease-in-out',
        open && 'border-stone-300',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <CollapsiblePrimitive.Trigger className="focus-visible:outline-subject-600 flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/[0.04]">
          <span className="flex min-w-0 items-center gap-2.5">
            <span>{title}</span>
            {badge}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-stone-500 transition-transform duration-300 ease-in-out',
              open && 'rotate-180 text-stone-900 dark:text-[var(--text-main)]',
            )}
            aria-hidden="true"
          />
        </CollapsiblePrimitive.Trigger>
        {headerActions && <div className="shrink-0 pr-2 print:hidden">{headerActions}</div>}
      </div>
      <CollapsiblePrimitive.Content
        className={cn(
          'border-t border-stone-200/50 px-4 py-3.5 text-sm leading-relaxed text-stone-700 transition-all duration-300 ease-in-out',
          contentClassName,
        )}
      >
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
