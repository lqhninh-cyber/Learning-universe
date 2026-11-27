import { ChevronLeft, ChevronRight, Eye, Focus } from 'lucide-react';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { useSkimmableOpen } from '@/context/useSkimmableOpen';
import { usePrintExpanded } from '@/shared/hooks/usePrintExpanded';
import { cn } from '@/shared/lib/cn';
import { Collapsible } from '@/shared/ui';
import { useLessonContext } from '../lesson-context';
import {
  clampProofStep,
  countProofSteps,
  decorateProofSteps,
  stepProofSpotlight,
} from './proof-spotlight';

export interface ProofProps {
  readonly id?: string;
  /** `id` của mệnh đề/định lý được chứng minh (tùy chọn). */
  readonly of?: string;
  /** Nhãn đầy đủ do `remark-theorem-numbering` tự động điền (ví dụ: "Định lý 1.1.2"). */
  readonly ofLabel?: string;
  /** Anchor của mệnh đề/định lý do `remark-theorem-numbering` tự động điền. */
  readonly ofAnchor?: string;
  readonly title?: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function Proof({
  id,
  of,
  ofLabel,
  ofAnchor,
  title,
  defaultOpen = false,
  children,
}: ProofProps) {
  const generatedId = useId().replace(/:/g, '');
  const { resolveBlock } = useLessonContext();
  const fallbackTarget = of && !ofLabel ? resolveBlock(of) : undefined;
  const resolvedLabel = ofLabel ?? fallbackTarget?.label;
  const resolvedAnchor = ofAnchor ?? fallbackTarget?.anchorId;
  const blockId = id ?? (resolvedAnchor ? `proof-${resolvedAnchor}` : `proof-${generatedId}`);

  const { isOpen, setOpen: setIsOpen } = useSkimmableOpen(defaultOpen);
  const isPrinting = usePrintExpanded();

  const stepCount = useMemo(() => countProofSteps(children), [children]);
  const canUseSpotlight = stepCount >= 2;
  const [isSpotlight, setIsSpotlight] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const safeActiveStep = clampProofStep(activeStep, stepCount);
  const spotlightVisible = canUseSpotlight && isSpotlight && !isPrinting;

  const handleToggleSpotlight = useCallback(() => {
    if (!canUseSpotlight) return;
    setIsSpotlight((prev) => {
      const next = !prev;
      if (next) {
        setActiveStep(0);
        setIsOpen(true);
      }
      return next;
    });
  }, [canUseSpotlight, setIsOpen]);

  const handleShowAll = useCallback(() => {
    setIsSpotlight(false);
  }, []);

  const handlePrevStep = useCallback(() => {
    setActiveStep((prev) => stepProofSpotlight(prev, -1, stepCount));
  }, [stepCount]);

  const handleNextStep = useCallback(() => {
    setActiveStep((prev) => stepProofSpotlight(prev, 1, stepCount));
  }, [stepCount]);

  const handleSelectStep = useCallback(
    (stepIndex: number) => {
      setActiveStep(clampProofStep(stepIndex, stepCount));
    },
    [stepCount],
  );

  const handleProofKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!spotlightVisible) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        handleNextStep();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        handlePrevStep();
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveStep(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveStep(Math.max(0, stepCount - 1));
      }
    },
    [handleNextStep, handlePrevStep, spotlightVisible, stepCount],
  );

  const renderedBody = useMemo(() => {
    if (!spotlightVisible) {
      return children;
    }
    return decorateProofSteps(children, {
      activeStep: safeActiveStep,
      onSelectStep: handleSelectStep,
    }).content;
  }, [children, handleSelectStep, safeActiveStep, spotlightVisible]);

  const isAtFirstStep = safeActiveStep <= 0;
  const isAtLastStep = safeActiveStep >= stepCount - 1;

  return (
    <section
      id={blockId}
      data-kind="proof"
      data-proof-of={resolvedAnchor}
      data-spotlight-active={spotlightVisible ? 'true' : undefined}
      tabIndex={spotlightVisible ? 0 : undefined}
      onKeyDown={handleProofKeyDown}
      className="semantic-proof-block my-4 scroll-mt-24 pl-4 transition-colors focus-visible:rounded-lg sm:pl-5"
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultOpen={defaultOpen}
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="semantic-proof-kicker">Chứng minh</span>
            {resolvedLabel && !title && (
              <>
                {' '}
                <span className="semantic-proof-target font-serif text-xs font-medium">
                  ({resolvedLabel})
                </span>
              </>
            )}
            {title && title !== 'Chứng minh' && (
              <>
                {' '}
                <span className="semantic-proof-target font-serif text-xs font-medium">
                  · {title}
                </span>
              </>
            )}
          </span>
        }
        headerActions={
          canUseSpotlight ? (
            <button
              type="button"
              data-testid="proof-spotlight-toggle"
              aria-pressed={isSpotlight}
              title={
                isSpotlight
                  ? 'Tắt chế độ chiếu sáng từng bước'
                  : `Lật từng bước chứng minh (${stepCount} bước)`
              }
              onClick={handleToggleSpotlight}
              className={cn(
                'proof-spotlight-toggle inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] active:scale-[0.98]',
                isSpotlight
                  ? 'proof-spotlight-toggle-active'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-control)] hover:text-[var(--text-main)]',
              )}
            >
              <Focus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Từng bước</span>
            </button>
          ) : undefined
        }
        className="semantic-proof-card border-transparent bg-transparent"
        contentClassName="bg-transparent text-[var(--text-main)] [&_p]:mb-4 [&_p:last-child]:mb-0"
      >
        {spotlightVisible && (
          <div
            data-testid="proof-spotlight-controls"
            role="toolbar"
            aria-label="Điều khiển từng bước chứng minh"
            className="proof-spotlight-toolbar mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 print:hidden"
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="proof-spotlight-prev"
                disabled={isAtFirstStep}
                onClick={handlePrevStep}
                aria-label="Bước chứng minh trước"
                className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 text-xs font-medium text-[var(--text-main)] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:border-[var(--border-control)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trước</span>
              </button>

              <span
                data-testid="proof-spotlight-counter"
                aria-live="polite"
                className="min-w-[84px] text-center font-mono text-xs font-semibold text-[var(--text-secondary)] tabular-nums"
              >
                Bước {safeActiveStep + 1} / {stepCount}
              </span>

              <button
                type="button"
                data-testid="proof-spotlight-next"
                disabled={isAtLastStep}
                onClick={handleNextStep}
                aria-label="Bước chứng minh tiếp theo"
                className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 text-xs font-medium text-[var(--text-main)] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:border-[var(--border-control)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
              >
                <span>Tiếp</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              data-testid="proof-spotlight-show-all"
              onClick={handleShowAll}
              className="inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-transparent px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:border-[var(--border-control)] hover:text-[var(--text-main)] active:scale-[0.98]"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Hiện toàn bộ</span>
            </button>
          </div>
        )}

        <div className={cn('space-y-3', spotlightVisible && 'proof-spotlight-body space-y-2')}>
          {renderedBody}
        </div>
        <div
          className={cn(
            'proof-spotlight-qed mt-3 flex items-center justify-end gap-1.5 text-sm font-semibold text-[var(--text-muted)] select-none',
            spotlightVisible && !isAtLastStep && 'opacity-25',
          )}
          aria-label="Kết thúc chứng minh"
          title="Điều phải chứng minh (Q.E.D.)"
        >
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Q.E.D.</span>
          <span className="kb-halmos text-base leading-none font-bold" aria-hidden="true">
            ∎
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            data-qed-glyph="vietnamese-lozenge"
            className="ml-0.5 inline-block h-3.5 w-3.5 align-middle text-[var(--text-muted)] opacity-80"
          >
            <path
              d="M12 2L22 12L12 22L2 12L12 2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M12 5.5L18.5 12L12 18.5L5.5 12L12 5.5Z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeOpacity="0.65"
            />
            <path d="M12 9L15 12L12 15L9 12L12 9Z" fill="currentColor" />
          </svg>
        </div>
      </Collapsible>
    </section>
  );
}
