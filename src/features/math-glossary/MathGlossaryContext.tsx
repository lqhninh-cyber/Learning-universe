import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import {
  detectCourseIdFromPath,
  findGlossaryEntry,
  type MathGlossaryEntry,
} from '@/data/math-glossary';
import { useLearningStore } from '@/features/learning';
import { MathGlossaryContext } from './context';

export interface MathGlossaryProviderProps {
  readonly children: ReactNode;
  readonly courseId?: string;
  readonly currentCourseId?: string;
}

export function MathGlossaryProvider({
  children,
  courseId,
  currentCourseId: propCourseId,
}: MathGlossaryProviderProps) {
  const isEnabled = useLearningStore((state) => state.glossaryAnnotationsEnabled);
  const [activeEntry, setActiveEntry] = useState<MathGlossaryEntry | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const effectiveCourseId = useMemo(() => {
    if (propCourseId || courseId) return propCourseId || courseId;
    if (typeof window !== 'undefined') {
      return detectCourseIdFromPath(window.location?.pathname);
    }
    return undefined;
  }, [propCourseId, courseId]);

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

  const resolveEntryWithContext = useCallback(
    (entry: MathGlossaryEntry): MathGlossaryEntry => {
      if (!effectiveCourseId) return entry;
      if (
        (entry.id.includes('lagrange') ||
          entry.id.includes('fermat') ||
          entry.id.includes('cauchy')) &&
        entry.subject !== effectiveCourseId &&
        entry.courseId !== effectiveCourseId
      ) {
        const refined = findGlossaryEntry(
          entry.term || entry.nameVi || entry.name || entry.id,
          effectiveCourseId,
        );
        if (refined) return refined;
      }
      return entry;
    },
    [effectiveCourseId],
  );

  const showPopover = useCallback(
    (entry: MathGlossaryEntry, rect: DOMRect) => {
      cancelHide();
      if (!isPinned) {
        setActiveEntry(resolveEntryWithContext(entry));
        setAnchorRect(rect);
      }
    },
    [cancelHide, isPinned, resolveEntryWithContext],
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
      const resolved = resolveEntryWithContext(entry);
      // Nếu đang mở popover cho chính term này: nhấp lại sẽ đóng (toggle)
      if (activeEntry?.id === resolved.id) {
        closePopover();
      } else {
        // Mở popover và ghim (pinned)
        setActiveEntry(resolved);
        setAnchorRect(rect);
        setIsPinned(true);
      }
    },
    [activeEntry?.id, cancelHide, closePopover, resolveEntryWithContext],
  );

  return (
    <MathGlossaryContext.Provider
      value={{
        isEnabled,
        activeEntry,
        anchorRect,
        isPinned,
        currentCourseId: effectiveCourseId,
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
