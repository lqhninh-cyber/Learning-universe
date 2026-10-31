import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface DrawerProps {
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly trigger?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly side?: 'left' | 'right';
  readonly children: ReactNode;
  readonly className?: string;
}

export function Drawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  side = 'left',
  children,
  className,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-stone-950/30 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-0 bottom-0 z-50 flex w-80 max-w-[88vw] flex-col bg-white p-6 shadow-xl focus:outline-none',
            side === 'left'
              ? 'left-0 border-r border-stone-200'
              : 'right-0 border-l border-stone-200',
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="space-y-1">
              <DialogPrimitive.Title className="text-base font-semibold text-stone-900">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-xs text-stone-500">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">
                  {title}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Đóng ngăn kéo"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="mt-4 flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
