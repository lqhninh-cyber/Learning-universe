import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import {
  detectCourseIdFromPath,
  findGlossaryEntry,
  type MathGlossaryEntry,
} from '@/data/math-glossary';
import { cn } from '@/shared/lib/cn';
import { useMathGlossary } from './useMathGlossary';

export interface MathGlossaryTermProps {
  readonly entry?: MathGlossaryEntry;
  readonly term?: string;
  readonly scope?: string;
  readonly currentCourseId?: string;
  readonly courseId?: string;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function MathGlossaryTerm({
  entry: initialEntry,
  term,
  scope,
  currentCourseId,
  courseId,
  children,
  className,
}: MathGlossaryTermProps) {
  const {
    isEnabled,
    showPopover,
    hidePopover,
    togglePopover,
    currentCourseId: ctxCourseId,
  } = useMathGlossary();
  const spanRef = useRef<HTMLSpanElement>(null);

  const effectiveCourseId = useMemo(() => {
    if (scope) return scope;
    if (currentCourseId || courseId) return currentCourseId || courseId;
    if (ctxCourseId) return ctxCourseId;
    if (typeof window !== 'undefined') {
      return detectCourseIdFromPath(window.location?.pathname);
    }
    return undefined;
  }, [scope, currentCourseId, courseId, ctxCourseId]);

  const resolvedEntry = useMemo(() => {
    if (term) {
      const found = findGlossaryEntry(term, effectiveCourseId);
      if (found) return found;
    }
    if (initialEntry) {
      // Tự động phân giải các mục xung đột nếu là ID chung chưa phân định môn
      if (
        effectiveCourseId &&
        (initialEntry.id === 'dinh-ly-lagrange' ||
          initialEntry.id === 'dinh-ly-fermat' ||
          initialEntry.id === 'dinh-ly-cauchy')
      ) {
        const refined = findGlossaryEntry(
          initialEntry.term || initialEntry.nameVi || initialEntry.name || initialEntry.id,
          effectiveCourseId,
        );
        if (refined) return refined;
      }
      return initialEntry;
    }
    return undefined;
  }, [term, initialEntry, effectiveCourseId]);

  if (!resolvedEntry) {
    return <>{children || term}</>;
  }

  if (!isEnabled) {
    return <>{children || resolvedEntry.nameVi || term}</>;
  }

  const handleMouseEnter = () => {
    if (spanRef.current) {
      showPopover(resolvedEntry, spanRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    hidePopover(180);
  };

  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (spanRef.current) {
      togglePopover(resolvedEntry, spanRef.current.getBoundingClientRect());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (spanRef.current) {
        togglePopover(resolvedEntry, spanRef.current.getBoundingClientRect());
      }
    }
  };

  return (
    <span
      ref={spanRef}
      tabIndex={0}
      role="button"
      data-academic-term={resolvedEntry.id}
      aria-haspopup="dialog"
      aria-label={`Chú thích thuật ngữ: ${resolvedEntry.name || resolvedEntry.nameVi}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'lu-glossary-term inline cursor-pointer rounded-xs select-text',
        'border-b-[1.5px] border-dotted border-[var(--text-muted,#807060)]',
        'hover:border-solid hover:border-[var(--accent-verandah,#5A6830)] hover:bg-[rgba(90,104,48,0.08)]',
        'focus-visible:ring-1.5 focus-visible:ring-[var(--accent-verandah,#5A6830)] focus-visible:outline-hidden',
        'transition-colors duration-150',
        className,
      )}
    >
      {children || resolvedEntry.name || resolvedEntry.nameVi || term}
    </span>
  );
}
