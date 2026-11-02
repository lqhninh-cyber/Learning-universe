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
        title={<span className="font-semibold text-[var(--text-primary)]">{headerTitle}</span>}
        defaultOpen={defaultOpen}
        className="border-[var(--bg-muted)] bg-[var(--bg-surface)]/25"
        contentClassName="bg-[#FAF8F5] text-base text-[var(--text-primary)]"
      >
        <div className="space-y-3">{children}</div>
        <div
          className="mt-3 flex justify-end text-sm font-semibold text-[var(--accent-primary)] select-none"
          aria-label="Kết thúc chứng minh"
        >
          <span title="Điều phải chứng minh">∎</span>
        </div>
      </Collapsible>
    </div>
  );
}
