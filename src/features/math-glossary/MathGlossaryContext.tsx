import { type ReactNode, useCallback, useRef, useState } from 'react';
import type { MathGlossaryEntry } from '@/data/math-glossary';
import { useLearningStore } from '@/features/learning';
import { MathGlossaryContext } from './context';

export interface MathGlossaryProviderProps {
  readonly children: ReactNode;
}

export function MathGlossaryProvider({ children }: MathGlossaryProviderProps) {
  const isEnabled = useLearningStore((state) => state.glossaryAnnotationsEnabled);
  const [activeEntry, setActiveEntry] = useState<MathGlossaryEntry | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (!isPinned) {
        setActiveEntry(entry);
        setAnchorRect(rect);
      }
    },
    [cancelHide, isPinned],
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

  const togglePopover = useCallback(
    (entry: MathGlossaryEntry, rect: DOMRect) => {
      cancelHide();
      // Nếu đang mở popover cho chính term này: nhấp lại sẽ đóng (toggle)
      if (activeEntry?.id === entry.id) {
        closePopover();
      } else {
        // Mở popover và ghim (pinned)
        setActiveEntry(entry);
        setAnchorRect(rect);
        setIsPinned(true);
      }
    },
    [activeEntry?.id, cancelHide, closePopover],
  );

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
        togglePopover,
        closePopover,
      }}
    >
      {children}
    </MathGlossaryContext.Provider>
  );
}
