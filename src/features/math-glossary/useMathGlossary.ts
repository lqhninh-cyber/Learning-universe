import { useContext } from 'react';
import { MathGlossaryContext, type MathGlossaryContextValue } from './context';

export function useMathGlossary(): MathGlossaryContextValue {
  const ctx = useContext(MathGlossaryContext);
  if (!ctx) {
    throw new Error('useMathGlossary must be used within a MathGlossaryProvider');
  }
  return ctx;
}
