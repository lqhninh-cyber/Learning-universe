import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useRef } from 'react';
import type { MathGlossaryEntry } from '@/data/math-glossary';
import { cn } from '@/shared/lib/cn';
import { useMathGlossary } from './useMathGlossary';

export interface MathGlossaryTermProps {
  readonly entry: MathGlossaryEntry;
  readonly children: ReactNode;
  readonly className?: string;
}

export function MathGlossaryTerm({ entry, children, className }: MathGlossaryTermProps) {
  const { isEnabled, showPopover, hidePopover, togglePopover } = useMathGlossary();
  const spanRef = useRef<HTMLSpanElement>(null);

  if (!isEnabled) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    if (spanRef.current) {
      showPopover(entry, spanRef.current.getBoundingClientRect());
    }
  };

  const handleMouseLeave = () => {
    hidePopover(180);
  };

  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (spanRef.current) {
      togglePopover(entry, spanRef.current.getBoundingClientRect());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (spanRef.current) {
        togglePopover(entry, spanRef.current.getBoundingClientRect());
      }
    }
  };

  return (
    <span
      ref={spanRef}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`Chú thích thuật ngữ: ${entry.nameVi}`}
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
      {children}
    </span>
  );
}
