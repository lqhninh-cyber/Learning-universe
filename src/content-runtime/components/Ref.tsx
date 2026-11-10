import type { ReactNode } from 'react';
import { useLessonContext } from '../lesson-context';

export interface RefProps {
  /** `id` của khối đích (ví dụ: `def-nhom`, `thm-gian-uoc-nghich-dao`). */
  readonly to: string;
  /** Nhãn đầy đủ do `remark-theorem-numbering` tự động điền (ví dụ: "Định lý 1.1.2"). */
  readonly label?: string;
  /** Anchor DOM của khối đích do `remark-theorem-numbering` tự động điền. */
  readonly anchorId?: string;
  readonly children?: ReactNode;
}

export function Ref({ to, label, anchorId, children }: RefProps) {
  const { resolveBlock } = useLessonContext();
  const fallback = !label || !anchorId ? resolveBlock(to) : undefined;
  const resolvedLabel = label ?? fallback?.label ?? to;
  const resolvedAnchor = anchorId ?? fallback?.anchorId ?? to;

  return (
    <a
      href={`#${resolvedAnchor}`}
      className="font-medium text-[var(--indigo-link)] underline decoration-1 underline-offset-4 transition-opacity hover:opacity-80"
    >
      {children ?? resolvedLabel}
    </a>
  );
}
