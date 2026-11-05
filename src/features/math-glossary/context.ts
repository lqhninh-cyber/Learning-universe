import { createContext } from 'react';
import type { MathGlossaryEntry } from '@/data/math-glossary';

export interface MathGlossaryContextValue {
  readonly isEnabled: boolean;
  readonly activeEntry: MathGlossaryEntry | null;
  readonly anchorRect: DOMRect | null;
  readonly isPinned: boolean;
  readonly currentCourseId?: string;
  readonly showPopover: (entry: MathGlossaryEntry, rect: DOMRect) => void;
  readonly hidePopover: (delayMs?: number) => void;
  readonly cancelHide: () => void;
  readonly togglePopover: (entry: MathGlossaryEntry, rect: DOMRect) => void;
  readonly closePopover: () => void;
}

export const MathGlossaryContext = createContext<MathGlossaryContextValue | null>(null);
