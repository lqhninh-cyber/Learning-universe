import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import type { MathGlossaryEntry } from '@/data/math-glossary';
import { useLearningStore } from '@/features/learning';
import { MathGlossaryContext } from './context';

export interface MathGlossaryProviderProps {
  readonly children: ReactNode;
  /** Tùy chọn đặt lại danh sách từ đã xuất hiện khi đổi bài học. */
  readonly resetKey?: string;
}

export function MathGlossaryProvider({ children, resetKey }: MathGlossaryProviderProps) {
  const isEnabled = useLearningStore((state) => state.glossaryAnnotationsEnabled);
  const [activeEntry, setActiveEntry] = useState<MathGlossaryEntry | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenTermIdsRef = useRef<Set<string>>(new Set());

  // Đặt lại các thuật ngữ đã ghi nhận khi đổi bài học
  useEffect(() => {
    seenTermIdsRef.current.clear();
  }, [resetKey]);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const closePopover = useCallback(() => {
    cancelHide();
    setActiveEntry(null);
    setAnchorRect(null);
    setIsPinned(false);
  }, [cancelHide]);

  const showPopover = useCallback(
    (entry: MathGlossaryEntry, rect: DOMRect) => {
      cancelHide();
      setActiveEntry(entry);
      setAnchorRect(rect);
    },
    [cancelHide],
  );

  const hidePopover = useCallback(
    (delayMs = 180) => {
      cancelHide();
      if (isPinned) {
        return;
      }
      hideTimeoutRef.current = setTimeout(() => {
        setActiveEntry(null);
        setAnchorRect(null);
      }, delayMs);
    },
    [cancelHide, isPinned],
  );

  const togglePin = useCallback(
    (entry: MathGlossaryEntry, rect: DOMRect) => {
      cancelHide();
      if (activeEntry?.id === entry.id && isPinned) {
        closePopover();
      } else {
        setActiveEntry(entry);
        setAnchorRect(rect);
        setIsPinned(true);
      }
    },
    [activeEntry?.id, isPinned, cancelHide, closePopover],
  );

  const claimFirstOccurrence = useCallback((termId: string): boolean => {
    if (seenTermIdsRef.current.has(termId)) {
      return false;
    }
    seenTermIdsRef.current.add(termId);
    return true;
  }, []);

  return (
    <MathGlossaryContext.Provider
      value={{
        isEnabled,
        activeEntry,
        anchorRect,
        isPinned,
        showPopover,
        hidePopover,
        cancelHide,
        togglePin,
        closePopover,
        claimFirstOccurrence,
      }}
    >
      {children}
    </MathGlossaryContext.Provider>
  );
}
