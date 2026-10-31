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
      className="text-subject-700 decoration-subject-300 hover:text-subject-900 hover:decoration-subject-600 font-medium underline underline-offset-4 transition-colors"
    >
      {children ?? resolvedLabel}
    </a>
  );
}
