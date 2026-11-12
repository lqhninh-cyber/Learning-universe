import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { findHighlightRanges } from '@/utils/vietnamese-text';

const INPAGE_MARK_ATTR = 'data-inpage-mark';
const FLASH_CLASS = 'search-flash-highlight';

const SKIP_WALKER_SELECTOR = [
  '.katex',
  '.katex-html',
  '.katex-mathml',
  'svg',
  'script',
  'style',
  'noscript',
  'textarea',
  'input',
  'select',
  'button',
  '.mermaid',
  '.viz',
  '[data-inpage-nav]',
  '[aria-hidden="true"]',
].join(', ');

/**
 * Mở mọi khối thu gọn (`<details>`, Radix `<Collapsible>`) bao quanh hoặc chính là phần tử đích
 * để phần tử luôn hiển thị rõ trước khi cuộn và phát sáng.
 */
export function openCollapsibleAncestors(target: HTMLElement): boolean {
  let didOpen = false;
  let current: HTMLElement | null = target;

  while (current) {
    if (current.tagName === 'DETAILS') {
      const details = current as HTMLDetailsElement;
      if (!details.open) {
        const directSummary = Array.from(details.children).find(
          (child): child is HTMLElement => child.tagName === 'SUMMARY',
        );
        if (directSummary) {
          directSummary.click();
        }
        if (!details.open) {
          details.open = true;
        }
        didOpen = true;
      }
    } else if (current.getAttribute('data-state') === 'closed') {
      const trigger = current.parentElement?.querySelector<HTMLButtonElement>(
        'button[aria-expanded="false"]',
      );
      if (trigger) {
        trigger.click();
        didOpen = true;
      }
    }
    current = current.parentElement;
  }

  return didOpen;
}

/** Kích hoạt hiệu ứng chớp vàng 1.8 giây trên khối kiến thức hoặc kết quả vừa nhảy tới. */
export function triggerFlashHighlight(element: HTMLElement, timerRegistry?: Set<number>): void {
  element.classList.remove(FLASH_CLASS);
  // Đọc offsetWidth để khởi động lại CSS animation ngay cả khi nhảy cùng một khối nhiều lần
  void element.offsetWidth;
  element.classList.add(FLASH_CLASS);

  const timeoutId = window.setTimeout(() => {
    element.classList.remove(FLASH_CLASS);
    timerRegistry?.delete(timeoutId);
  }, 1850);
  timerRegistry?.add(timeoutId);
}

/** Gỡ bỏ an toàn toàn bộ `<mark data-inpage-mark="true">` về lại text node gốc. */
export function unwrapInPageMarks(container: HTMLElement | null): void {
  if (!container) {
    return;
  }
  const marks = container.querySelectorAll<HTMLElement>(`mark[${INPAGE_MARK_ATTR}="true"]`);
  if (marks.length === 0) {
    return;
  }

  const parentsToNormalize = new Set<Node>();
  for (const mark of marks) {
    const parent = mark.parentNode;
    if (!parent) continue;
    parentsToNormalize.add(parent);
    const textNode = document.createTextNode(mark.textContent ?? '');
    parent.replaceChild(textNode, mark);
  }

  for (const parent of parentsToNormalize) {
    parent.normalize();
  }
}

function collectAndHighlightTextNodes(container: HTMLElement, query: string): HTMLElement[] {
  const createdMarks: HTMLElement[] = [];
  const textNodes: Text[] = [];

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      const textNode = currentNode as Text;
      const value = textNode.nodeValue ?? '';
      const parentEl = textNode.parentElement;
      if (value.trim().length > 0 && parentEl && !parentEl.closest(SKIP_WALKER_SELECTOR)) {
        textNodes.push(textNode);
      }
    }
    currentNode = walker.nextNode();
  }

  const phraseMatchesExist = textNodes.some(
    (node) => findHighlightRanges(node.nodeValue ?? '', query, { phraseOnly: true }).length > 0,
  );

  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? '';
    const ranges = findHighlightRanges(text, query, { phraseOnly: phraseMatchesExist });
    if (ranges.length === 0 || !textNode.parentNode) {
      continue;
    }

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    for (const [start, end] of ranges) {
      if (start > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, start)));
      }
      const mark = document.createElement('mark');
      mark.setAttribute(INPAGE_MARK_ATTR, 'true');
      mark.className = 'lu-inpage-mark';
      mark.textContent = text.slice(start, end);
      fragment.appendChild(mark);
      createdMarks.push(mark);
      cursor = end;
    }

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  }

  return createdMarks;
}

function syncActiveMarkClass(marks: readonly HTMLElement[], activeIndex: number): void {
  marks.forEach((mark, idx) => {
    if (idx === activeIndex) {
      mark.classList.add('lu-inpage-mark-active');
      mark.setAttribute('data-active-match', 'true');
    } else {
      mark.classList.remove('lu-inpage-mark-active');
      mark.removeAttribute('data-active-match');
    }
  });
}

function resolveFlashContainer(mark: HTMLElement): HTMLElement {
  return (
    mark.closest<HTMLElement>('[data-kind], .semantic-block, .ex-block, details, section, li, p') ??
    mark
  );
}

export interface UseInPageSearchOptions {
  readonly containerRef: RefObject<HTMLElement | null>;
  /** Khóa báo hiệu nội dung bất đồng bộ (MDX / bài thi) đã sẵn sàng trong DOM. */
  readonly contentReadyKey?: string;
}

export interface UseInPageSearchResult {
  readonly query: string;
  readonly totalMatches: number;
  readonly activeIndex: number;
  readonly goToPrev: () => void;
  readonly goToNext: () => void;
  readonly clearSearch: () => void;
}

/**
 * Hook điều khiển nhảy tới khối `#id` (tự động mở `<details>`/`Collapsible` + chớp vàng 1.8s),
 * tô sáng các kết quả khớp `?q=` trong trang và cung cấp điều hướng Trước / Sau / Xóa highlight.
 */
export function useInPageSearch({
  containerRef,
  contentReadyKey = 'ready',
}: UseInPageSearchOptions): UseInPageSearchResult {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const rawQuery = (searchParams.get('q') ?? '').trim();
  const hashAnchor = location.hash ? decodeURIComponent(location.hash.replace(/^#/, '')) : '';

  const marksRef = useRef<HTMLElement[]>([]);
  const timersRef = useRef<Set<number>>(new Set());

  const [matchState, setMatchState] = useState<{
    readonly scanKey: string;
    readonly total: number;
    readonly activeIndex: number;
  }>({
    scanKey: '',
    total: 0,
    activeIndex: 0,
  });

  const currentScanKey = `${location.pathname}|${rawQuery}|${hashAnchor}|${contentReadyKey}`;

  useEffect(() => {
    const container = containerRef.current;
    const activeTimers = timersRef.current;

    if (!container) {
      return undefined;
    }

    unwrapInPageMarks(container);
    marksRef.current = [];

    const runTimer = window.setTimeout(() => {
      const targetEl = hashAnchor ? document.getElementById(hashAnchor) : null;
      const didOpenTarget = targetEl ? openCollapsibleAncestors(targetEl) : false;

      const createdMarks = rawQuery ? collectAndHighlightTextNodes(container, rawQuery) : [];
      marksRef.current = createdMarks;

      let initialActive = 0;
      if (targetEl && createdMarks.length > 0) {
        const insideIdx = createdMarks.findIndex((mark) => targetEl.contains(mark));
        if (insideIdx >= 0) {
          initialActive = insideIdx;
        }
      }

      if (createdMarks.length > 0) {
        syncActiveMarkClass(createdMarks, initialActive);
      }

      const focusTarget = (): void => {
        if (targetEl) {
          targetEl.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          triggerFlashHighlight(targetEl, activeTimers);
          return;
        }

        const firstMark = createdMarks[initialActive];
        if (firstMark) {
          openCollapsibleAncestors(firstMark);
          firstMark.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          triggerFlashHighlight(resolveFlashContainer(firstMark), activeTimers);
        }
      };

      if (didOpenTarget) {
        const settleTimer = window.setTimeout(focusTarget, 40);
        activeTimers.add(settleTimer);
      } else {
        focusTarget();
      }

      setMatchState({
        scanKey: currentScanKey,
        total: createdMarks.length,
        activeIndex: initialActive,
      });
    }, 0);

    activeTimers.add(runTimer);

    return () => {
      for (const id of activeTimers) {
        window.clearTimeout(id);
      }
      activeTimers.clear();
      unwrapInPageMarks(container);
      marksRef.current = [];
    };
  }, [containerRef, rawQuery, hashAnchor, contentReadyKey, currentScanKey]);

  const effectiveTotal = rawQuery && matchState.scanKey === currentScanKey ? matchState.total : 0;
  const effectiveActiveIndex =
    effectiveTotal > 0 ? Math.min(Math.max(0, matchState.activeIndex), effectiveTotal - 1) : 0;

  const stepMatch = useCallback(
    (delta: number) => {
      const marks = marksRef.current;
      if (marks.length === 0) {
        return;
      }

      const nextIndex = (effectiveActiveIndex + delta + marks.length) % marks.length;
      syncActiveMarkClass(marks, nextIndex);

      const activeMark = marks[nextIndex];
      if (activeMark) {
        const didOpen = openCollapsibleAncestors(activeMark);
        const scrollAndFlash = () => {
          activeMark.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
          triggerFlashHighlight(resolveFlashContainer(activeMark), timersRef.current);
        };
        if (didOpen) {
          const timerId = window.setTimeout(scrollAndFlash, 40);
          timersRef.current.add(timerId);
        } else {
          scrollAndFlash();
        }
      }

      setMatchState((prev) => ({
        ...prev,
        activeIndex: nextIndex,
      }));
    },
    [effectiveActiveIndex],
  );

  const goToPrev = useCallback(() => stepMatch(-1), [stepMatch]);
  const goToNext = useCallback(() => stepMatch(1), [stepMatch]);

  const clearSearch = useCallback(() => {
    unwrapInPageMarks(containerRef.current);
    marksRef.current = [];

    const nextParams = new URLSearchParams(location.search);
    nextParams.delete('q');
    const nextSearch = nextParams.toString();

    void navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
        hash: location.hash,
      },
      { replace: true },
    );
  }, [containerRef, location.hash, location.pathname, location.search, navigate]);

  return {
    query: rawQuery,
    totalMatches: effectiveTotal,
    activeIndex: effectiveActiveIndex,
    goToPrev,
    goToNext,
    clearSearch,
  };
}
