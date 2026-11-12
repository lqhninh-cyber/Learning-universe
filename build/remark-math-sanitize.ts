import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { normalizeMixedMathProse, sanitizeLatex } from '../src/shared/lib/math-sanitize.ts';

interface AstTextChild {
  type: 'text';
  value: string;
}

interface AstMathData {
  hName?: string;
  hProperties?: { className?: string[] };
  hChildren?: AstTextChild[];
}

interface AstNodeLike {
  type: string;
  value?: string;
  data?: AstMathData;
  children?: AstNodeLike[];
}

function setMathNodeValue(node: AstNodeLike, value: string): void {
  node.value = value;
  if (!node.data) {
    node.data = {};
  }
  const isDisplay = node.type === 'math';
  if (!node.data.hName) {
    node.data.hName = isDisplay ? 'pre' : 'code';
  }
  if (!node.data.hProperties) {
    node.data.hProperties = {
      className: isDisplay ? ['language-math', 'math-display'] : ['language-math', 'math-inline'],
    };
  }
  node.data.hChildren = [{ type: 'text', value }];
}

function createInlineMathNode(value: string): AstNodeLike {
  const node: AstNodeLike = { type: 'inlineMath', value };
  setMathNodeValue(node, value);
  return node;
}

function joinLatexParts(lhs: string, rhs: string, forceSpace = false): string {
  const cleanLhs = lhs.trimEnd();
  const cleanRhs = rhs.trimStart();
  if (!cleanLhs) return cleanRhs;
  if (!cleanRhs) return cleanLhs;
  if (forceSpace || (/\\[A-Za-z]+$/.test(cleanLhs) && /^[A-Za-z]/.test(cleanRhs))) {
    return `${cleanLhs} ${cleanRhs}`;
  }
  return `${cleanLhs}${cleanRhs}`;
}

function runMergePass(children: AstNodeLike[]): { next: AstNodeLike[]; changed: boolean } {
  const nextChildren: AstNodeLike[] = [];
  let changed = false;

  for (let i = 0; i < children.length; i += 1) {
    const current = children[i];
    const next = children[i + 1];
    const next2 = children[i + 2];

    if (!current) continue;

    // 1. Sửa mẫu *f*$^{-1}$ -> emphasis('f') + inlineMath('^{-1}')
    if (
      current.type === 'emphasis' &&
      Array.isArray(current.children) &&
      current.children.length === 1 &&
      current.children[0]?.type === 'text' &&
      typeof current.children[0].value === 'string' &&
      /^[A-Za-z][′']?$/.test(current.children[0].value) &&
      next?.type === 'inlineMath' &&
      typeof next.value === 'string' &&
      /^[_^]/.test(next.value.trimStart())
    ) {
      const base = current.children[0].value.replace(/′/g, "'");
      nextChildren.push(createInlineMathNode(`${base}${next.value.trimStart()}`));
      i += 1;
      changed = true;
      continue;
    }

    // 2. Sửa mẫu g∘*f* -> text('...g∘') + emphasis('f')
    if (
      current.type === 'text' &&
      typeof current.value === 'string' &&
      next?.type === 'emphasis' &&
      Array.isArray(next.children) &&
      next.children.length === 1 &&
      next.children[0]?.type === 'text' &&
      typeof next.children[0].value === 'string' &&
      /^[A-Za-zλμφψ][′']?$/.test(next.children[0].value)
    ) {
      const compMatch = current.value.match(/^(.*?)([A-Za-zλμφψ][′']?)\s*∘$/);
      if (compMatch) {
        const [, prefix = '', lhs = ''] = compMatch;
        const rhs = next.children[0].value.replace(/′/g, "'");
        if (prefix.length > 0) {
          nextChildren.push({ type: 'text', value: prefix });
        }
        nextChildren.push(createInlineMathNode(`${lhs.replace(/′/g, "'")} \\circ ${rhs}`));
        i += 1;
        changed = true;
        continue;
      }
    }

    // 3. Sửa mẫu t$_{0}$, a$_{0i}$, E′$_{0}$, 2$^{m}$, λ$_{i}$ -> text('...base') + inlineMath('_{...}')
    if (
      current.type === 'text' &&
      typeof current.value === 'string' &&
      next?.type === 'inlineMath' &&
      typeof next.value === 'string' &&
      /^[_^]/.test(next.value.trimStart())
    ) {
      const baseMatch = current.value.match(
        /^(.*?(?:^|[\s(=+\-*.,;:{}/|“"']))([A-Za-z0-9λμφψαβγ][′']?)$/,
      );
      if (baseMatch) {
        const [, prefix = '', base = ''] = baseMatch;
        if (prefix.length > 0) {
          nextChildren.push({ type: 'text', value: prefix });
        }
        nextChildren.push(
          createInlineMathNode(`${base.replace(/′/g, "'")}${next.value.trimStart()}`),
        );
        i += 1;
        changed = true;
        continue;
      }
    }

    // 4. Gộp hai inlineMath đứng sát nhau (vd: \sum_{i,j=1}^{n} + a_{ij} + b_{i} + c_{j})
    if (
      current.type === 'inlineMath' &&
      typeof current.value === 'string' &&
      next?.type === 'inlineMath' &&
      typeof next.value === 'string'
    ) {
      nextChildren.push(createInlineMathNode(joinLatexParts(current.value, next.value)));
      i += 1;
      changed = true;
      continue;
    }

    // 5. Gộp inlineMath bị ngắt bởi khoảng trắng quanh toán tử ở rìa ($x_{i} =$ $t_{0}$)
    if (
      current.type === 'inlineMath' &&
      typeof current.value === 'string' &&
      /[=+\-*/]\s*$/.test(current.value) &&
      next?.type === 'text' &&
      typeof next.value === 'string' &&
      /^\s*$/.test(next.value) &&
      next2?.type === 'inlineMath' &&
      typeof next2.value === 'string'
    ) {
      nextChildren.push(createInlineMathNode(joinLatexParts(current.value, next2.value, true)));
      i += 2;
      changed = true;
      continue;
    }

    nextChildren.push(current);
  }

  return { next: nextChildren, changed };
}

function mergeBrokenHtmlSubSupChildren(parent: AstNodeLike): void {
  if (!Array.isArray(parent.children) || parent.children.length === 0) {
    return;
  }

  let currentChildren = parent.children;
  for (let pass = 0; pass < 6; pass += 1) {
    const { next, changed } = runMergePass(currentChildren);
    currentChildren = next;
    if (!changed) break;
  }
  parent.children = currentChildren;
}

/**
 * Plugin Remark tiền xử lý trước `remarkMath`:
 * Gộp các mảnh công thức bị vỡ do chuyển đổi HTML -> MDX và chuẩn hóa khoảng trắng quanh `$...$`.
 */
export const remarkMathSanitizePre: Plugin<[], Root> = function remarkMathSanitizePre() {
  return (tree: Root) => {
    visit(tree, (node) => {
      mergeBrokenHtmlSubSupChildren(node as unknown as AstNodeLike);
    });

    visit(tree, 'text', (node) => {
      if (typeof node.value === 'string' && node.value.includes('$')) {
        node.value = normalizeMixedMathProse(node.value);
      }
    });
  };
};

/**
 * Plugin Remark hậu xử lý ngay sau `remarkMath`:
 * Làm sạch 100% nút `math` và `inlineMath` (cả `node.value` lẫn `data.hChildren`) qua `sanitizeLatex` trước khi truyền sang `rehypeKatex`.
 */
export const remarkMathSanitizePost: Plugin<[], Root> = function remarkMathSanitizePost() {
  return (tree: Root) => {
    visit(tree, ['math', 'inlineMath'], (node) => {
      const mathNode = node as unknown as AstNodeLike;
      if (typeof mathNode.value === 'string') {
        setMathNodeValue(mathNode, sanitizeLatex(mathNode.value));
      }
    });
  };
};
