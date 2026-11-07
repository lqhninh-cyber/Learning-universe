import type { ReactNode } from 'react';
import { Collapsible } from '@/shared/ui';
import { useLessonContext } from '../lesson-context';

export interface ProofProps {
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

export function Proof({ of, ofLabel, ofAnchor, title, defaultOpen = false, children }: ProofProps) {
  const { resolveBlock } = useLessonContext();
  const fallbackTarget = of && !ofLabel ? resolveBlock(of) : undefined;
  const resolvedLabel = ofLabel ?? fallbackTarget?.label;
  const resolvedAnchor = ofAnchor ?? fallbackTarget?.anchorId;

  const headerTitle = title ?? (resolvedLabel ? `Chứng minh (${resolvedLabel})` : 'Chứng minh');

  return (
    <div className="my-4" data-proof-of={resolvedAnchor}>
      <Collapsible
        title={<span className="font-serif font-semibold text-stone-900">{headerTitle}</span>}
        defaultOpen={defaultOpen}
        className="border-[#CFDADB] bg-white/40"
        contentClassName="bg-[#F7FAFA]/80 text-base text-[#29383D]"
      >
        <div className="space-y-3">{children}</div>
        <div
          className="mt-3 flex items-center justify-end text-sm font-semibold text-stone-700 select-none dark:text-stone-300"
          aria-label="Kết thúc chứng minh"
          title="Điều phải chứng minh (Q.E.D.)"
        >
          <span className="font-mono text-[10px] tracking-[0.18em] text-stone-500 uppercase dark:text-stone-400">
            Q.E.D.
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            data-qed-glyph="vietnamese-lozenge"
            className="ml-2 inline-block h-4 w-4 align-middle text-stone-700 dark:text-stone-300"
          >
            {/* Khung thoi kỷ hà ngoài (Hoa văn khắc gỗ / bia tiến sĩ Việt Nam) */}
            <path
              d="M12 2L22 12L12 22L2 12L12 2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Khung thoi lồng bên trong */}
            <path
              d="M12 5.5L18.5 12L12 18.5L5.5 12L12 5.5Z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeOpacity="0.65"
            />
            {/* Nhân thoi đặc trung tâm */}
            <path d="M12 9L15 12L12 15L9 12L12 9Z" fill="currentColor" />
          </svg>
        </div>
      </Collapsible>
    </div>
  );
}
