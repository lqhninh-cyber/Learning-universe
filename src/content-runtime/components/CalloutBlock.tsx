import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CalloutBlockProps {
  readonly title?: string;
  readonly children: ReactNode;
}

type CalloutKind = 'Remark' | 'Note' | 'Warning';

const CALLOUT_STYLES: Record<
  CalloutKind,
  {
    readonly defaultTitle: string;
    readonly containerClass: string;
    readonly iconClass: string;
    readonly titleClass: string;
    readonly Icon: typeof Info;
  }
> = {
  Remark: {
    defaultTitle: 'Nhận xét',
    containerClass:
      'border-[var(--bg-muted)] bg-[var(--bg-surface)]/25 dark:border-[#1E3B2E] dark:bg-[#0E1E17] dark:text-[#E8F1EC]',
    iconClass: 'text-[var(--accent-primary)] dark:text-[#A1D1B7]',
    titleClass: 'text-[var(--text-primary)] dark:text-[#E8F1EC]',
    Icon: Lightbulb,
  },
  Note: {
    defaultTitle: 'Ghi chú',
    containerClass:
      'border-[var(--bg-muted)] bg-[var(--accent-verandah)]/10 dark:border-[#1E3B2E] dark:bg-[#0E1E17] dark:text-[#E8F1EC]',
    iconClass: 'text-[var(--accent-verandah)] dark:text-[#A1D1B7]',
    titleClass: 'text-[var(--text-primary)] dark:text-[#E8F1EC]',
    Icon: Info,
  },
  Warning: {
    defaultTitle: 'Lưu ý quan trọng',
    containerClass:
      'border-l-4 border-[var(--cinnabar-text)] bg-[var(--cinnabar-bg)] text-[var(--cinnabar-text)] border-y-transparent border-r-transparent',
    iconClass: 'text-[var(--cinnabar-text)]',
    titleClass: 'text-[var(--cinnabar-text)] font-bold',
    Icon: AlertTriangle,
  },
};

function BaseCalloutBlock({
  kind,
  title,
  children,
}: CalloutBlockProps & { readonly kind: CalloutKind }) {
  const style = CALLOUT_STYLES[kind];
  const IconComponent = style.Icon;
  const heading = title ? `${style.defaultTitle}: ${title}` : style.defaultTitle;

  return (
    <aside
      aria-label={heading}
      className={cn('my-5 rounded-xl border p-4 sm:p-5', style.containerClass)}
    >
      <div className="mb-2 flex items-center gap-2">
        <IconComponent className={cn('h-4 w-4 shrink-0', style.iconClass)} aria-hidden="true" />
        <p className={cn('text-sm font-semibold', style.titleClass)}>{heading}</p>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--text-secondary)] dark:text-[#E8F1EC]">
        {children}
      </div>
    </aside>
  );
}

export function Remark(props: CalloutBlockProps) {
  return <BaseCalloutBlock kind="Remark" {...props} />;
}

export function Note(props: CalloutBlockProps) {
  return <BaseCalloutBlock kind="Note" {...props} />;
}

export function Warning(props: CalloutBlockProps) {
  return <BaseCalloutBlock kind="Warning" {...props} />;
}
