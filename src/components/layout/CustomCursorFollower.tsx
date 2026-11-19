import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta } from '@/shared/lib/canvasSprites';

const DEFAULT_BORDER_COLOR = 'rgba(156, 122, 76, 0.45)';
const INTERACTIVE_GOLD_BORDER = 'rgba(156, 122, 76, 0.78)';
const RING_HALF_SIZE_PX = 14;

const SUBJECT_MINERAL_BORDERS: Readonly<Record<string, string>> = {
  'cau-truc-dai-so': 'rgba(156, 122, 76, 0.82)',
  'algebraic-structures': 'rgba(156, 122, 76, 0.82)',
  'hinh-hoc-affine': 'rgba(73, 118, 143, 0.82)',
  'affine-geometry': 'rgba(73, 118, 143, 0.82)',
  'giai-tich-ham-mot-bien': 'rgba(59, 122, 101, 0.82)',
  'single-variable-calculus': 'rgba(59, 122, 101, 0.82)',
  'giao-duc-hoc': 'rgba(158, 99, 86, 0.82)',
  pedagogy: 'rgba(158, 99, 86, 0.82)',
};

function detectCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(pointer: coarse)').matches;
}

function resolveMineralBorderColor(el: Element | null): string {
  if (!el) return INTERACTIVE_GOLD_BORDER;

  const subjectHost = el.closest<HTMLElement>(
    '[id^="atlas-subject-"], [data-subject], [data-subject-card], [style*="--subject-rgb"]',
  );
  if (subjectHost) {
    const inlineRgb = subjectHost.style?.getPropertyValue('--subject-rgb')?.trim();
    if (inlineRgb) {
      return `rgba(${inlineRgb}, 0.82)`;
    }

    const dataSubject = subjectHost.getAttribute('data-subject');
    if (dataSubject && SUBJECT_MINERAL_BORDERS[dataSubject]) {
      return SUBJECT_MINERAL_BORDERS[dataSubject]!;
    }

    const idAttr = subjectHost.id || '';
    if (idAttr.startsWith('atlas-subject-')) {
      const slug = idAttr.replace('atlas-subject-', '');
      if (SUBJECT_MINERAL_BORDERS[slug]) {
        return SUBJECT_MINERAL_BORDERS[slug]!;
      }
    }
  }

  const linkEl = el.closest<HTMLAnchorElement>('a[href]');
  if (linkEl) {
    const href = linkEl.getAttribute('href') ?? '';
    for (const [slug, color] of Object.entries(SUBJECT_MINERAL_BORDERS)) {
      if (href.includes(slug)) {
        return color;
      }
    }
  }

  return INTERACTIVE_GOLD_BORDER;
}

function isReadingOrFormulaContext(target: Element | null): boolean {
  if (typeof document !== 'undefined' && document.querySelector('[data-reading-article]')) {
    return true;
  }
  if (!target) return false;

  if (
    target.closest(
      '[data-reading-article], .lesson-content, .lu-prose, .prose, .katex, .katex-display, input, textarea, [contenteditable="true"]',
    )
  ) {
    return true;
  }

  return false;
}

function isInteractiveOrSubjectCard(target: Element | null): boolean {
  if (!target) return false;
  return Boolean(
    target.closest(
      'a, button, [role="button"], summary, label[for], select, .cursor-pointer, [id^="atlas-subject-"], [data-subject-card]',
    ),
  );
}

/**
 * Vòng Chuẩn Độ Ngữ Cảnh 120fps (`CustomCursorFollower`):
 * - Nội suy lò xo mượt (`damping = 0.18 * dtScale`) qua `translate3d(...)`, không dùng React state.
 * - Tự động ẩn (`opacity: 0, scale: 0.5`) trên vùng đọc bài giảng (`LessonPage`) và công thức toán (`.katex`).
 * - Giãn nhẹ (`scale: 1.35`) và đổi màu viền theo sắc thái khoáng thạch khi rê vào nút bấm hoặc thẻ môn học.
 * - Co nhẹ (`scale: 0.85`) khi nhấn chuột (`mousedown`) tạo phản hồi xúc giác tức thì.
 * - Vô hiệu hóa hoàn toàn trên thiết bị cảm ứng (`pointer: coarse`) và khi bật `prefers-reduced-motion`.
 */
export function CustomCursorFollower() {
  const prefersReducedMotion = useReducedMotion();
  const [isCoarsePointer, setIsCoarsePointer] = useState<boolean>(() => detectCoarsePointer());
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const handleChange = () => setIsCoarsePointer(mediaQuery.matches);
    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isCoarsePointer) return;
    const ringEl = ringRef.current;
    if (!ringEl) return;

    let targetX = -100;
    let targetY = -100;
    let currX = -100;
    let currY = -100;
    let hasMoved = false;

    let baseScale = 1;
    let targetOpacity = 0;
    let currScale = 1;
    let currOpacity = 0;
    let isPressed = false;
    let activeBorderColor = DEFAULT_BORDER_COLOR;

    const getEffectiveTargetScale = () => {
      if (targetOpacity === 0) return 0.5;
      if (isPressed) return 0.85;
      return baseScale;
    };

    const syncDataAttributes = (contextMode: 'reading' | 'interactive' | 'default' | 'hidden') => {
      const effectiveScale = getEffectiveTargetScale();
      ringEl.dataset.cursorContext = contextMode;
      ringEl.dataset.cursorPressed = isPressed ? 'true' : 'false';
      ringEl.dataset.targetScale = String(effectiveScale);
      ringEl.dataset.targetOpacity = String(targetOpacity);
      ringEl.style.borderColor = activeBorderColor;
    };

    const evaluateTargetContext = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;

      if (el?.closest('[data-hide-cursor-ring="true"]')) {
        baseScale = 0.5;
        targetOpacity = 0;
        activeBorderColor = DEFAULT_BORDER_COLOR;
        syncDataAttributes('hidden');
        return;
      }

      if (isReadingOrFormulaContext(el)) {
        baseScale = 0.5;
        targetOpacity = 0;
        activeBorderColor = DEFAULT_BORDER_COLOR;
        syncDataAttributes('reading');
        return;
      }

      if (isInteractiveOrSubjectCard(el)) {
        baseScale = 1.35;
        targetOpacity = 1;
        activeBorderColor = resolveMineralBorderColor(el);
        syncDataAttributes('interactive');
        return;
      }

      baseScale = 1;
      targetOpacity = 1;
      activeBorderColor = DEFAULT_BORDER_COLOR;
      syncDataAttributes('default');
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!hasMoved) {
        hasMoved = true;
        currX = targetX;
        currY = targetY;
      }
      evaluateTargetContext(event.target);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      isPressed = true;
      evaluateTargetContext(event.target);
    };

    const handleMouseUp = (event: MouseEvent) => {
      isPressed = false;
      evaluateTargetContext(event.target);
    };

    const handleMouseLeaveWindow = () => {
      isPressed = false;
      targetOpacity = 0;
      ringEl.dataset.targetOpacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    window.addEventListener('blur', handleMouseLeaveWindow);

    let rafId = 0;
    let prevNow = performance.now();

    const tick = (now: number) => {
      const { dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;

      if (!document.hidden && hasMoved) {
        const posDamp = Math.min(1, 0.18 * dtScale);
        const stateDamp = Math.min(1, 0.24 * dtScale);
        const desiredScale = getEffectiveTargetScale();

        currX += (targetX - currX) * posDamp;
        currY += (targetY - currY) * posDamp;
        currScale += (desiredScale - currScale) * stateDamp;
        currOpacity += (targetOpacity - currOpacity) * stateDamp;

        const tx = (currX - RING_HALF_SIZE_PX).toFixed(2);
        const ty = (currY - RING_HALF_SIZE_PX).toFixed(2);
        ringEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${currScale.toFixed(3)})`;
        ringEl.style.opacity = currOpacity.toFixed(3);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      window.removeEventListener('blur', handleMouseLeaveWindow);
    };
  }, [prefersReducedMotion, isCoarsePointer]);

  if (prefersReducedMotion || isCoarsePointer) {
    return null;
  }

  return (
    <div
      data-testid="custom-cursor-follower"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] hidden overflow-hidden lg:block"
    >
      <div
        ref={ringRef}
        data-testid="custom-cursor-follower-ring"
        data-cursor-context="default"
        data-cursor-pressed="false"
        data-target-scale="1"
        data-target-opacity="0"
        className="pointer-events-none absolute top-0 left-0 h-7 w-7 rounded-full border border-[#9C7A4C]/45 transition-[border-color] duration-150 will-change-[transform,opacity]"
        style={{
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0) scale(1)',
        }}
      >
        <span className="absolute top-0 left-1/2 h-1 w-[1px] -translate-x-1/2 bg-[#9C7A4C]/45" />
        <span className="absolute bottom-0 left-1/2 h-1 w-[1px] -translate-x-1/2 bg-[#9C7A4C]/45" />
        <span className="absolute top-1/2 left-0 h-[1px] w-1 -translate-y-1/2 bg-[#9C7A4C]/45" />
        <span className="absolute top-1/2 right-0 h-[1px] w-1 -translate-y-1/2 bg-[#9C7A4C]/45" />
      </div>
    </div>
  );
}

export default CustomCursorFollower;
