import { useContext } from 'react';
import { MathGlossaryContext, type MathGlossaryContextValue } from './context';

const DEFAULT_GLOSSARY_CONTEXT: MathGlossaryContextValue = {
  isEnabled: true,
  activeEntry: null,
  anchorRect: null,
  isPinned: false,
  currentCourseId: undefined,
  showPopover: () => {},
  hidePopover: () => {},
  cancelHide: () => {},
  togglePopover: () => {},
  closePopover: () => {},
};

export function useMathGlossary(): MathGlossaryContextValue {
  const ctx = useContext(MathGlossaryContext);
  return ctx ?? DEFAULT_GLOSSARY_CONTEXT;
}
