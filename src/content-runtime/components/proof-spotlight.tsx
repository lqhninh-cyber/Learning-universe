import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/shared/lib/cn';

export type ProofStepState = 'past' | 'active' | 'future';

export interface DecorateProofStepsOptions {
  readonly activeStep: number;
  readonly onSelectStep: (stepIndex: number) => void;
}

export interface DecoratedProofStepsResult {
  readonly stepCount: number;
  readonly content: ReactNode;
}

const INTRINSIC_INLINE_TAGS = new Set<string>([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'i',
  'ins',
  'kbd',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',
]);

const KNOWN_INLINE_COMPONENT_NAMES = new Set<string>([
  'a',
  'Cite',
  'Ref',
  'GlossaryTerm',
  'AcademicPopover',
  'AcademicTerm',
  'Sidenote',
  'InlineMathText',
]);

const DECORATIVE_NON_STEP_TAGS = new Set<string>(['hr']);

interface GenericElementProps {
  readonly className?: string;
  readonly children?: ReactNode;
  readonly block?: boolean;
  readonly displayMode?: boolean;
  readonly onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  readonly onKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void;
  readonly [key: string]: unknown;
}

function getClassNameString(props: GenericElementProps): string {
  return typeof props.className === 'string' ? props.className : '';
}

function isDisplayMathElement(element: ReactElement<GenericElementProps>): boolean {
  const cls = getClassNameString(element.props);
  if (/\bkatex-display\b|\bmath-display\b/.test(cls)) {
    return true;
  }
  return element.props.block === true || element.props.displayMode === true;
}

function isListContainerElement(element: ReactElement<GenericElementProps>): boolean {
  return element.type === 'ol' || element.type === 'ul';
}

function isListItemElement(node: ReactNode): node is ReactElement<GenericElementProps> {
  return isValidElement<GenericElementProps>(node) && node.type === 'li';
}

function isWhitespaceOnlyNode(node: ReactNode): boolean {
  return (
    node === null ||
    node === undefined ||
    typeof node === 'boolean' ||
    (typeof node === 'string' && node.trim().length === 0)
  );
}

function isInlineProofNode(node: ReactNode): boolean {
  if (typeof node === 'string' || typeof node === 'number') {
    return true;
  }
  if (!isValidElement<GenericElementProps>(node)) {
    return true;
  }
  if (isDisplayMathElement(node)) {
    return false;
  }
  if (typeof node.type === 'string') {
    if (node.type === 'span') {
      return true;
    }
    return INTRINSIC_INLINE_TAGS.has(node.type);
  }
  if (typeof node.type === 'function') {
    const fn = node.type as { displayName?: string; name?: string };
    const name = fn.displayName ?? fn.name ?? '';
    if (name === 'span') {
      return true;
    }
    if (name === 'KatexMath' || name === 'MathRenderer') {
      return !isDisplayMathElement(node);
    }
    return KNOWN_INLINE_COMPONENT_NAMES.has(name);
  }
  return false;
}

function flattenMeaningfulChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isWhitespaceOnlyNode(child)) return;
    if (isValidElement<GenericElementProps>(child) && child.type === Fragment) {
      result.push(...flattenMeaningfulChildren(child.props.children));
      return;
    }
    result.push(child);
  });
  return result;
}

/** Giới hạn chỉ số bước Spotlight hợp lệ trong khoảng `[0, totalSteps - 1]`. */
export function clampProofStep(step: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.max(0, Math.min(totalSteps - 1, Math.trunc(step)));
}

/** Dịch chuyển bước Spotlight theo `delta` (+1 / -1) với chặn biên an toàn `0..N-1`. */
export function stepProofSpotlight(current: number, delta: number, totalSteps: number): number {
  return clampProofStep(current + delta, totalSteps);
}

/** Xác định trạng thái trực quan của bước `index` so với `activeStep`. */
export function getProofStepState(index: number, activeStep: number): ProofStepState {
  if (index === activeStep) return 'active';
  return index < activeStep ? 'past' : 'future';
}

/**
 * Đếm số bước cấp cao có thể chiếu sáng trong `<Proof>` mà không cần sửa tệp `.mdx`:
 * - Khối văn bản `p`, khối công thức display KaTeX, bảng, trích dẫn... mỗi khối là 1 bước.
 * - Danh sách `ol` / `ul` cấp cao tự tách từng phần tử `li` trực tiếp thành từng bước độc lập.
 * - Các nút nội dòng liên tiếp không nằm trong khối sẽ gộp thành 1 bước duy nhất.
 */
export function countProofSteps(children: ReactNode): number {
  const nodes = flattenMeaningfulChildren(children);
  let count = 0;
  let hasOpenInlineRun = false;

  const flushInlineRun = () => {
    if (hasOpenInlineRun) {
      count += 1;
      hasOpenInlineRun = false;
    }
  };

  for (const node of nodes) {
    if (isInlineProofNode(node)) {
      hasOpenInlineRun = true;
      continue;
    }

    flushInlineRun();

    if (
      isValidElement<GenericElementProps>(node) &&
      typeof node.type === 'string' &&
      DECORATIVE_NON_STEP_TAGS.has(node.type)
    ) {
      continue;
    }

    if (isValidElement<GenericElementProps>(node) && isListContainerElement(node)) {
      const items = flattenMeaningfulChildren(node.props.children).filter(isListItemElement);
      count += items.length > 0 ? items.length : 1;
      continue;
    }

    count += 1;
  }

  flushInlineRun();
  return count;
}

function handleStepClick(
  event: ReactMouseEvent<HTMLElement>,
  stepIndex: number,
  state: ProofStepState,
  onSelectStep: (stepIndex: number) => void,
  originalOnClick?: (event: ReactMouseEvent<HTMLElement>) => void,
): void {
  originalOnClick?.(event);
  if (state === 'active') return;

  const target = event.target as HTMLElement | null;
  if (state === 'future') {
    if (target?.closest('a')) {
      event.preventDefault();
    }
    onSelectStep(stepIndex);
    return;
  }

  if (!target?.closest('a, button, input, textarea, select')) {
    onSelectStep(stepIndex);
  }
}

function handleStepKeyDown(
  event: ReactKeyboardEvent<HTMLElement>,
  stepIndex: number,
  onSelectStep: (stepIndex: number) => void,
  originalOnKeyDown?: (event: ReactKeyboardEvent<HTMLElement>) => void,
): void {
  originalOnKeyDown?.(event);
  if (event.defaultPrevented) return;
  if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    onSelectStep(stepIndex);
  }
}

/**
 * Bọc / gắn thuộc tính Spotlight cho từng bước cấp cao trong `<Proof>`,
 * giữ nguyên cấu trúc danh sách `<ol>`/`<ul>` hợp lệ của HTML5 và sắc nét công thức KaTeX.
 */
export function decorateProofSteps(
  children: ReactNode,
  options: DecorateProofStepsOptions,
): DecoratedProofStepsResult {
  const nodes = flattenMeaningfulChildren(children);
  const totalSteps = countProofSteps(children);
  const safeActiveStep = clampProofStep(options.activeStep, totalSteps);
  const decorated: ReactNode[] = [];

  let stepCursor = 0;
  let inlineRun: ReactNode[] = [];

  const flushInlineRun = () => {
    if (inlineRun.length === 0) return;
    const stepIndex = stepCursor;
    stepCursor += 1;
    const state = getProofStepState(stepIndex, safeActiveStep);
    const runContent = inlineRun;
    inlineRun = [];

    decorated.push(
      <div
        key={`proof-step-${stepIndex}`}
        data-proof-step={stepIndex}
        data-spotlight-state={state}
        aria-current={state === 'active' ? 'step' : undefined}
        tabIndex={0}
        onClick={(event) => handleStepClick(event, stepIndex, state, options.onSelectStep)}
        onKeyDown={(event) => handleStepKeyDown(event, stepIndex, options.onSelectStep)}
        className="proof-spotlight-step"
      >
        {runContent}
      </div>,
    );
  };

  for (let nodeIdx = 0; nodeIdx < nodes.length; nodeIdx += 1) {
    const node = nodes[nodeIdx];
    if (isInlineProofNode(node)) {
      inlineRun.push(node);
      continue;
    }

    flushInlineRun();

    if (
      isValidElement<GenericElementProps>(node) &&
      typeof node.type === 'string' &&
      DECORATIVE_NON_STEP_TAGS.has(node.type)
    ) {
      decorated.push(node);
      continue;
    }

    if (isValidElement<GenericElementProps>(node) && isListContainerElement(node)) {
      const listChildren = flattenMeaningfulChildren(node.props.children);
      const hasLi = listChildren.some(isListItemElement);

      if (hasLi) {
        const decoratedListItems = listChildren.map((item, itemIdx) => {
          if (!isListItemElement(item)) {
            return item;
          }
          const stepIndex = stepCursor;
          stepCursor += 1;
          const state = getProofStepState(stepIndex, safeActiveStep);
          return cloneElement(item, {
            key: item.key ?? `proof-li-step-${stepIndex}-${itemIdx}`,
            'data-proof-step': stepIndex,
            'data-spotlight-state': state,
            'aria-current': state === 'active' ? 'step' : undefined,
            tabIndex: 0,
            className: cn(item.props.className, 'proof-spotlight-step'),
            onClick: (event: ReactMouseEvent<HTMLElement>) =>
              handleStepClick(event, stepIndex, state, options.onSelectStep, item.props.onClick),
            onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) =>
              handleStepKeyDown(event, stepIndex, options.onSelectStep, item.props.onKeyDown),
          });
        });

        decorated.push(
          cloneElement(node, {
            key: node.key ?? `proof-list-${nodeIdx}`,
            className: cn(node.props.className, 'proof-spotlight-list'),
            children: decoratedListItems,
          }),
        );
        continue;
      }
    }

    const stepIndex = stepCursor;
    stepCursor += 1;
    const state = getProofStepState(stepIndex, safeActiveStep);

    decorated.push(
      <div
        key={`proof-step-${stepIndex}`}
        data-proof-step={stepIndex}
        data-spotlight-state={state}
        aria-current={state === 'active' ? 'step' : undefined}
        tabIndex={0}
        onClick={(event) => handleStepClick(event, stepIndex, state, options.onSelectStep)}
        onKeyDown={(event) => handleStepKeyDown(event, stepIndex, options.onSelectStep)}
        className="proof-spotlight-step"
      >
        {node}
      </div>,
    );
  }

  flushInlineRun();

  return {
    stepCount: stepCursor,
    content: decorated,
  };
}
