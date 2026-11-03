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
 * Hỗ trợ khớp chính xác, chuẩn hóa khoảng trắng (như [G : H] -> [G:H]), và các ký hiệu trong biểu thức.
 */
export function matchLatexToGlossary(tex: string): MathGlossaryEntry | null {
  if (!tex) {
    return null;
  }
  const cleanTex = tex.trim();
  const normalizedTex = cleanTex.replace(/\s+/g, '');
  const allEntries = getAllGlossaryEntries();

  // 1. Khớp chính xác hoàn toàn (có khoảng trắng hoặc sau chuẩn hóa khoảng trắng)
  for (const entry of allEntries) {
    if (entry.symbol.trim() === cleanTex || entry.symbol.replace(/\s+/g, '') === normalizedTex) {
      return entry;
    }
    for (const p of entry.patterns) {
      if (p.trim() === cleanTex || p.replace(/\s+/g, '') === normalizedTex) {
        return entry;
      }
    }
  }

  // 2. Khớp các ký hiệu toán đặc trưng xuất hiện trong công thức (ví dụ \cong, \unlhd, [G:H], V_4)
  const SPECIAL_MATH_SYMBOLS = [
    '\\cong',
    '\\unlhd',
    '\\triangleleft',
    '[G:H]',
    'V_4',
    'V4',
    '\\ker',
    '\\operatorname{im}',
    '\\mathrm{Im}',
    '\\mathbb{Z}/n\\mathbb{Z}',
    '\\mathbb{A}^n',
    '\\mathbb{E}^n',
    '\\mathbb{P}^n',
    '\\operatorname{Frac}',
    'S_n',
    'A_n',
    'D_{2n}',
  ];

  for (const sym of SPECIAL_MATH_SYMBOLS) {
    const normSym = sym.replace(/\s+/g, '');
    if (normalizedTex.includes(normSym)) {
      const match = allEntries.find((e) => {
        const eSymNorm = e.symbol.replace(/\s+/g, '');
        return (
          eSymNorm.includes(normSym) ||
          e.patterns.some((p) => p.replace(/\s+/g, '').includes(normSym))
        );
      });
      if (match) {
        return match;
      }
    }
  }

  return null;
}

/**
 * Đệ quy bóc tách chuỗi văn bản và chèn MathGlossaryTerm cố định cho các thuật ngữ xuất hiện.
 */
export function annotateTextString(text: string, keyPrefix = 'glossary-term'): ReactNode[] {
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
    results.push(...annotateTextString(before, `${keyPrefix}-b`));
  }

  // Luôn bọc thuật ngữ trong MathGlossaryTerm để duy trì tương tác bền vững
  results.push(
    <MathGlossaryTerm key={`${keyPrefix}-${matcher.entry.id}-${index}`} entry={matcher.entry}>
      {matchedText}
    </MathGlossaryTerm>,
  );

  if (after) {
    results.push(...annotateTextString(after, `${keyPrefix}-a`));
  }

  return results;
}

/**
 * Quét và chú thích đệ quy trong danh sách React children của một đoạn văn/danh sách.
 * Ký hiệu và thuật ngữ luôn được duy trì bọc trong MathGlossaryTerm.
 */
export function annotateChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child, idx) => {
    if (typeof child === 'string') {
      const annotated = annotateTextString(child, `p-${idx}`);
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
        if (entry) {
          return (
            <MathGlossaryTerm key={`katex-${entry.id}-${idx}`} entry={entry}>
              {element}
            </MathGlossaryTerm>
          );
        }
      }
      return element;
    }

    // Không đệ quy vào các thẻ không phù hợp (link, button, code, pre)
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
        children: annotateChildren(element.props.children),
      });
    }

    return element;
  });
}
