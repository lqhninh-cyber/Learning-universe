export const INK_EXERCISE_HANDOFF_KEY = 'lu_ink_exercise_handoff' as const;

export interface InkExerciseHandoff {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly exerciseId: string;
  readonly exerciseLabel: string;
  readonly exerciseTitle?: string;
  readonly promptText: string;
  readonly returnPath: string;
  readonly createdAt: string;
}

export function saveExerciseHandoff(handoff: InkExerciseHandoff): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(INK_EXERCISE_HANDOFF_KEY, JSON.stringify(handoff));
  } catch {
    // Bỏ qua lỗi sessionStorage trong chế độ hạn chế
  }
}

export function readExerciseHandoff(): InkExerciseHandoff | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(INK_EXERCISE_HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<InkExerciseHandoff>;
    if (
      typeof parsed.lessonId !== 'string' ||
      typeof parsed.exerciseId !== 'string' ||
      typeof parsed.exerciseLabel !== 'string' ||
      typeof parsed.promptText !== 'string'
    ) {
      return null;
    }
    return {
      lessonId: parsed.lessonId,
      lessonTitle: typeof parsed.lessonTitle === 'string' ? parsed.lessonTitle : 'Bài giảng',
      exerciseId: parsed.exerciseId,
      exerciseLabel: parsed.exerciseLabel,
      exerciseTitle: typeof parsed.exerciseTitle === 'string' ? parsed.exerciseTitle : undefined,
      promptText: parsed.promptText,
      returnPath:
        typeof parsed.returnPath === 'string' && parsed.returnPath.startsWith('/')
          ? parsed.returnPath
          : '/learning-space',
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearExerciseHandoff(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(INK_EXERCISE_HANDOFF_KEY);
  } catch {
    // Bỏ qua lỗi sessionStorage
  }
}

function serializeNodeToMathMarkdown(node: Node): string {
  if (node.nodeType === 3) {
    return node.textContent ?? '';
  }
  if (node.nodeType !== 1) return '';

  const el = node as HTMLElement;
  // Bỏ qua khối Gợi ý / Lời giải để không làm lộ đáp án trên bảng nháp
  if (el.getAttribute('data-exercise-auxiliary') === 'true') {
    return '';
  }

  // Trích xuất chính xác công thức gốc LaTeX từ phần tử KaTeX đã render (ưu tiên data-tex từ output:'html')
  if (el.classList.contains('katex-display')) {
    const tex =
      el.getAttribute('data-tex')?.trim() ||
      el.querySelector('[data-tex]')?.getAttribute('data-tex')?.trim() ||
      el.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim();
    return tex ? `\n$$${tex}$$\n` : '';
  }
  if (el.classList.contains('katex')) {
    const tex =
      el.getAttribute('data-tex')?.trim() ||
      el.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim();
    return tex ? `$${tex}$` : (el.textContent ?? '');
  }

  const tag = el.tagName.toLowerCase();
  if (tag === 'br') return '\n';

  let inner = '';
  for (const child of Array.from(el.childNodes)) {
    inner += serializeNodeToMathMarkdown(child);
  }

  if (tag === 'p' || tag === 'div') {
    const trimmed = inner.trim();
    return trimmed ? `${trimmed}\n` : '';
  }
  if (tag === 'li') {
    const trimmed = inner.trim();
    return trimmed ? `• ${trimmed}\n` : '';
  }
  return inner;
}

/**
 * Trích xuất đề bài gốc (giữ nguyên công thức LaTeX $...$ từ KaTeX, loại bỏ Gợi ý & Lời giải)
 * từ khối DOM `<Exercise>` để ghim gọn trên Bảng viết.
 */
export function extractExercisePromptFromElement(
  bodyEl: HTMLElement | null,
  fallbackTitle?: string,
): string {
  if (!bodyEl) return fallbackTitle ?? '';
  const raw = serializeNodeToMathMarkdown(bodyEl)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
  if (!raw) return fallbackTitle ?? '';
  return raw.length > 1400 ? `${raw.slice(0, 1400).trim()}…` : raw;
}
