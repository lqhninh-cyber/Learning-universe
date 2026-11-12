import { type ReactNode, useId } from 'react';
import { useSkimmableOpen } from '@/context/useSkimmableOpen';
import { Collapsible } from '@/shared/ui';
import { useLessonContext } from '../lesson-context';

export interface ProofProps {
  readonly id?: string;
  /** `id` của mệnh đề/định lý được chứng minh (tùy chọn). */
  readonly of?: string;
  /** Nhãn đầy đủ do `remark-theorem-numbering` tự động điền (ví dụ: "Định lý 1.1.2"). */
  readonly ofLabel?: string;
  /** Anchor của mệnh đề/định lý do `remark-theorem-numbering` tự động điền. */
  readonly ofAnchor?: string;
  readonly title?: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function Proof({
  id,
  of,
  ofLabel,
  ofAnchor,
  title,
  defaultOpen = false,
  children,
}: ProofProps) {
  const generatedId = useId().replace(/:/g, '');
  const { resolveBlock } = useLessonContext();
  const fallbackTarget = of && !ofLabel ? resolveBlock(of) : undefined;
  const resolvedLabel = ofLabel ?? fallbackTarget?.label;
  const resolvedAnchor = ofAnchor ?? fallbackTarget?.anchorId;
  const blockId = id ?? (resolvedAnchor ? `proof-${resolvedAnchor}` : `proof-${generatedId}`);

  const { isOpen, setOpen: setIsOpen } = useSkimmableOpen(defaultOpen);

  return (
    <section
      id={blockId}
      data-kind="proof"
      data-proof-of={resolvedAnchor}
      className="semantic-proof-block my-4 scroll-mt-24 pl-4 transition-colors sm:pl-5"
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultOpen={defaultOpen}
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="semantic-proof-kicker">Chứng minh</span>
            {resolvedLabel && !title && (
              <>
                {' '}
                <span className="semantic-proof-target font-serif text-xs font-medium">
                  ({resolvedLabel})
                </span>
              </>
            )}
            {title && title !== 'Chứng minh' && (
              <>
                {' '}
                <span className="semantic-proof-target font-serif text-xs font-medium">
                  · {title}
                </span>
              </>
            )}
          </span>
        }
        className="semantic-proof-card border-[#CFDADB] bg-white/40 dark:border-[#1E3B2E] dark:bg-[#0E1E17]/60"
        contentClassName="bg-[#F7FAFA]/80 text-base text-[#29383D] dark:bg-[#0E1E17] dark:text-[#E8F1EC]"
      >
        <div className="space-y-3">{children}</div>
        <div
          className="mt-3 flex items-center justify-end gap-1.5 text-sm font-semibold text-stone-700 select-none dark:text-stone-300"
          aria-label="Kết thúc chứng minh"
          title="Điều phải chứng minh (Q.E.D.)"
        >
          <span className="font-mono text-[10px] tracking-[0.18em] text-stone-500 uppercase dark:text-stone-400">
            Q.E.D.
          </span>
          <span className="kb-halmos text-base leading-none font-bold" aria-hidden="true">
            ∎
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            data-qed-glyph="vietnamese-lozenge"
            className="ml-0.5 inline-block h-3.5 w-3.5 align-middle text-stone-600 opacity-80 dark:text-stone-300"
          >
            <path
              d="M12 2L22 12L12 22L2 12L12 2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M12 5.5L18.5 12L12 18.5L5.5 12L12 5.5Z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeOpacity="0.65"
            />
            <path d="M12 9L15 12L12 15L9 12L12 9Z" fill="currentColor" />
          </svg>
        </div>
      </Collapsible>
    </section>
  );
}
