import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { getAllGlossaryEntries, type MathGlossaryEntry } from '@/data/math-glossary';
import { MathGlossaryTerm } from './MathGlossaryTerm';

interface TextPatternMatcher {
  readonly entry: MathGlossaryEntry;
  readonly pattern: string;
  readonly regex: RegExp;
}

// Xây dựng danh sách mẫu regex có word boundary cho các thuật ngữ tiếng Việt
const TEXT_MATCHERS: readonly TextPatternMatcher[] = (() => {
  const allEntries = getAllGlossaryEntries();
  const list: TextPatternMatcher[] = [];

  for (const entry of allEntries) {
    for (const pattern of entry.patterns) {
      // Chỉ dùng regex đối với các cụm từ tiếng Việt hoặc chữ (không phải macro LaTeX bắt đầu bằng \)
      if (!pattern.startsWith('\\') && pattern.length >= 3) {
        try {
          const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(?<![\\p{L}\\p{N}])(${escaped})(?![\\p{L}\\p{N}])`, 'iu');
          list.push({ entry, pattern, regex });
        } catch {
          // Bỏ qua nếu regex không hợp lệ
        }
      }
    }
  }

  // Ưu tiên cụm từ dài trước cụm từ ngắn
  return list.sort((a, b) => b.pattern.length - a.pattern.length);
})();

/**
 * Trích xuất mã TeX thô từ các thuộc tính của phần tử KaTeX sinh ra từ rehype-katex.
 */
export function extractLatexFromKatexNode(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const el = node as {
    props?: {
      encoding?: string;
      children?: unknown;
      className?: string;
    };
  };

  if (el.props) {
    if (el.props.encoding === 'application/x-tex' && typeof el.props.children === 'string') {
      return el.props.children.trim();
    }
    if (el.props.children) {
      if (Array.isArray(el.props.children)) {
        for (const child of el.props.children) {
          const found = extractLatexFromKatexNode(child);
          if (found) {
            return found;
          }
        }
      } else {
        const found = extractLatexFromKatexNode(el.props.children);
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
}

/**
 * Khớp chuỗi LaTeX với một mục thuật ngữ trong từ điển.
 */
export function matchLatexToGlossary(tex: string): MathGlossaryEntry | null {
  if (!tex) {
    return null;
  }
  const cleanTex = tex.trim();
  const allEntries = getAllGlossaryEntries();

  // 1. Khớp chính xác hoàn toàn (symbol hoặc pattern)
  for (const entry of allEntries) {
    if (entry.symbol.trim() === cleanTex) {
      return entry;
    }
    for (const p of entry.patterns) {
      if (p.trim() === cleanTex) {
        return entry;
      }
    }
  }

  // 2. Khớp các ký hiệu toán đặc trưng xuất hiện trong công thức (ví dụ \cong, \unlhd)
  const SPECIAL_MATH_SYMBOLS = [
    '\\cong',
    '\\unlhd',
    '\\triangleleft',
    '\\ker',
    '\\operatorname{im}',
    '\\mathrm{Im}',
    '\\mathbb{Z}/n\\mathbb{Z}',
    '\\mathbb{A}^n',
    '\\mathbb{E}^n',
    '\\mathbb{P}^n',
    'V_4',
  ];

  for (const sym of SPECIAL_MATH_SYMBOLS) {
    if (cleanTex.includes(sym)) {
      const match = allEntries.find(
        (e) => e.symbol.includes(sym) || e.patterns.some((p) => p.includes(sym)),
      );
      if (match) {
        return match;
      }
    }
  }

  return null;
}

/**
 * Đệ quy bóc tách chuỗi văn bản và chèn MathGlossaryTerm cho các thuật ngữ xuất hiện lần đầu.
 */
export function annotateTextString(
  text: string,
  claimFirstOccurrence: (termId: string) => boolean,
  keyPrefix = 'glossary-term',
): ReactNode[] {
  if (!text || typeof text !== 'string') {
    return [text];
  }

  // Tìm vị trí xuất hiện sớm nhất của một thuật ngữ trong văn bản
  let earliestMatch: {
    matcher: TextPatternMatcher;
    index: number;
    length: number;
    matchedText: string;
  } | null = null;

  for (const matcher of TEXT_MATCHERS) {
    const match = text.match(matcher.regex);
    if (match && typeof match.index === 'number') {
      if (!earliestMatch || match.index < earliestMatch.index) {
        earliestMatch = {
          matcher,
          index: match.index,
          length: match[0].length,
          matchedText: match[0],
        };
      }
    }
  }

  if (!earliestMatch) {
    return [text];
  }

  const { matcher, index, length, matchedText } = earliestMatch;
  const before = text.slice(0, index);
  const after = text.slice(index + length);

  const results: ReactNode[] = [];

  if (before) {
    results.push(...annotateTextString(before, claimFirstOccurrence, `${keyPrefix}-b`));
  }

  // Kiểm tra xem thuật ngữ này đã xuất hiện lần đầu trong bài chưa
  const isFirst = claimFirstOccurrence(matcher.entry.id);
  if (isFirst) {
    results.push(
      <MathGlossaryTerm key={`${keyPrefix}-${matcher.entry.id}-${index}`} entry={matcher.entry}>
        {matchedText}
      </MathGlossaryTerm>,
    );
  } else {
    results.push(matchedText);
  }

  if (after) {
    results.push(...annotateTextString(after, claimFirstOccurrence, `${keyPrefix}-a`));
  }

  return results;
}

/**
 * Quét và chú thích đệ quy trong danh sách React children của một đoạn văn/danh sách.
 */
export function annotateChildren(
  children: ReactNode,
  claimFirstOccurrence: (termId: string) => boolean,
): ReactNode {
  return Children.map(children, (child, idx) => {
    if (typeof child === 'string') {
      const annotated = annotateTextString(child, claimFirstOccurrence, `p-${idx}`);
      return annotated.length === 1 ? annotated[0] : <>{annotated}</>;
    }

    if (!isValidElement(child)) {
      return child;
    }

    const element = child as ReactElement<{
      className?: string;
      children?: ReactNode;
    }>;

    // Nếu phần tử này là một thẻ KaTeX
    if (typeof element.props.className === 'string' && element.props.className.includes('katex')) {
      const tex = extractLatexFromKatexNode(element);
      if (tex) {
        const entry = matchLatexToGlossary(tex);
        if (entry && claimFirstOccurrence(entry.id)) {
          return (
            <MathGlossaryTerm key={`katex-${entry.id}-${idx}`} entry={entry}>
              {element}
            </MathGlossaryTerm>
          );
        }
      }
      return element;
    }

    // Không đệ quy vào các thẻ không phù hợp (link, button, code)
    if (
      element.type === 'a' ||
      element.type === 'button' ||
      element.type === 'code' ||
      element.type === 'pre'
    ) {
      return element;
    }

    // Nếu có children bên trong, tiếp tục đệ quy xử lý
    if (element.props.children) {
      return cloneElement(element, {
        children: annotateChildren(element.props.children, claimFirstOccurrence),
      });
    }

    return element;
  });
}
