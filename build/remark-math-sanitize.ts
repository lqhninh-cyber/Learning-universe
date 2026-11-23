import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
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

    // 0a. Sửa phân số tỉ số đơn/kép bị vỡ dấu sao từ HTML->MDX: *1***/***MPQ* hoặc *CAB***/***DAB*
    if (
      current.type === 'emphasis' &&
      Array.isArray(current.children) &&
      current.children.length === 1 &&
      current.children[0]?.type === 'text' &&
      typeof current.children[0].value === 'string' &&
      /^(?:1|[A-Z]{3,4})$/.test(current.children[0].value.trim()) &&
      next?.type === 'text' &&
      next.value === '**/**' &&
      next2?.type === 'emphasis' &&
      Array.isArray(next2.children) &&
      next2.children.length === 1 &&
      next2.children[0]?.type === 'text' &&
      typeof next2.children[0].value === 'string' &&
      /^[A-Z]{3,4}$/.test(next2.children[0].value.trim())
    ) {
      const rawNum = current.children[0].value.trim();
      const rawDen = next2.children[0].value.trim();
      const numTex = /^[A-Z]{3,4}$/.test(rawNum) ? `(${rawNum})` : rawNum;
      const denTex = `(${rawDen})`;
      nextChildren.push(createInlineMathNode(`\\dfrac{${numTex}}{${denTex}}`));
      i += 2;
      changed = true;
      continue;
    }

    // 0b. Sửa mẫu phân số tỉ số đơn bị tách giữa text và inlineMath: " (MPQ)/((MPQ) " + inlineMath("- 1)")
    if (
      current.type === 'text' &&
      typeof current.value === 'string' &&
      next?.type === 'inlineMath' &&
      typeof next.value === 'string'
    ) {
      const fracLead = current.value.match(/^(.*?)(\([A-Z]{3,4}\))\/\((\([A-Z]{3,4}\))\s*$/);
      const fracTail = next.value.trim().match(/^([+-]\s*\d+)\)$/);
      if (fracLead && fracTail) {
        const [, prefix = '', numTuple = '', denTuple = ''] = fracLead;
        const [, tailExpr = ''] = fracTail;
        if (prefix.length > 0) {
          nextChildren.push({ type: 'text', value: prefix });
        }
        nextChildren.push(createInlineMathNode(`\\dfrac{${numTuple}}{${denTuple} ${tailExpr}}`));
        i += 1;
        changed = true;
        continue;
      }
    }

    // 0c. Gộp bộ điểm tỉ số đứng ngay trước inlineMath bắt đầu bằng dấu "=": "(MQP) " + inlineMath("= ...")
    if (
      current.type === 'text' &&
      typeof current.value === 'string' &&
      next?.type === 'inlineMath' &&
      typeof next.value === 'string' &&
      /^\s*=/.test(next.value)
    ) {
      const tupleLead = current.value.match(/^(.*?)(\([A-Z]{3,4}\))\s*$/);
      if (tupleLead) {
        const [, prefix = '', tuple = ''] = tupleLead;
        if (prefix.length > 0) {
          nextChildren.push({ type: 'text', value: prefix });
        }
        nextChildren.push(createInlineMathNode(`${tuple} ${next.value.trimStart()}`));
        i += 1;
        changed = true;
        continue;
      }
    }

    // 0d. Gộp bộ điểm tỉ số đứng ngay sau inlineMath kết thúc bằng toán tử (=, +, -): inlineMath("(QPM) = 1 -") + text(" (MPQ).")
    if (
      current.type === 'inlineMath' &&
      typeof current.value === 'string' &&
      /[=+-]\s*$/.test(current.value) &&
      next?.type === 'text' &&
      typeof next.value === 'string'
    ) {
      const tupleTrail = next.value.match(/^\s*(\([A-Z]{3,4}\))(.*)$/);
      if (tupleTrail) {
        const [, tuple = '', rest = ''] = tupleTrail;
        nextChildren.push(createInlineMathNode(`${current.value.trimEnd()} ${tuple}`));
        if (rest.length > 0) {
          nextChildren.push({ type: 'text', value: rest });
        }
        i += 1;
        changed = true;
        continue;
      }
    }

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

    // 5. Gộp inlineMath bị ngắt bởi khoảng trắng quanh toán tử ở rìa ($x_{i} =$ $t_{0}$) hoặc vế phải bắt đầu bằng '='
    if (
      current.type === 'inlineMath' &&
      typeof current.value === 'string' &&
      next?.type === 'text' &&
      typeof next.value === 'string' &&
      /^\s*$/.test(next.value) &&
      next2?.type === 'inlineMath' &&
      typeof next2.value === 'string' &&
      (/[=+\-*/]\s*$/.test(current.value) || /^\s*=/.test(next2.value))
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
    visit(tree, (node) => {
      mergeBrokenHtmlSubSupChildren(node as unknown as AstNodeLike);
    });

    visit(tree, ['math', 'inlineMath'], (node) => {
      const mathNode = node as unknown as AstNodeLike;
      if (typeof mathNode.value === 'string') {
        setMathNodeValue(mathNode, sanitizeLatex(mathNode.value));
      }
    });
  };
};

interface HastNodeLike {
  type: string;
  tagName?: string;
  value?: string;
  properties?: {
    className?: string[];
    [key: string]: unknown;
  };
  children?: HastNodeLike[];
}

const KATEX_CLASS_COMPAT_MAP: Readonly<Record<string, string>> = {
  base: 'katex-base',
  strut: 'katex-strut',
  vbox: 'katex-vbox',
  thinbox: 'katex-thinbox',
  inner: 'katex-inner',
  fix: 'katex-fix',
  sizing: 'katex-sizing',
  overline: 'katex-overline',
  underline: 'katex-underline',
  rule: 'katex-rule',
  hline: 'katex-hline',
  hdashline: 'katex-hdashline',
  smash: 'katex-smash',
  root: 'katex-root',
  accent: 'katex-accent',
  overlay: 'katex-overlay',
  stretchy: 'katex-stretchy',
  sout: 'katex-sout',
  tag: 'katex-tag',
  newline: 'katex-newline',
};

const AMS_NEG_HAST_MAP: Readonly<Record<string, string>> = {
  '∤': '∣',
  '⊈': '⊆',
  '⊉': '⊇',
  '≁': '∼',
  '∦': '∥',
  '≠': '=',
  '∉': '∈',
  '≢': '≡',
  '⊄': '⊂',
  '⊅': '⊃',
};

function hasHastClass(node: HastNodeLike | undefined, cls: string): boolean {
  const list = node?.properties?.className;
  return Array.isArray(list) && list.includes(cls);
}

function addHastClass(node: HastNodeLike, cls: string): void {
  if (!node.properties) {
    node.properties = {};
  }
  if (!Array.isArray(node.properties.className)) {
    node.properties.className = [];
  }
  if (!node.properties.className.includes(cls)) {
    node.properties.className.push(cls);
  }
}

function removeHastClass(node: HastNodeLike, cls: string): void {
  if (Array.isArray(node.properties?.className)) {
    node.properties.className = node.properties.className.filter((c) => c !== cls);
  }
}

function hasHastDescendantClass(node: HastNodeLike | undefined, cls: string): boolean {
  if (!node) return false;
  if (hasHastClass(node, cls)) return true;
  if (Array.isArray(node.children)) {
    return node.children.some((child) => hasHastDescendantClass(child, cls));
  }
  return false;
}

function getHastText(node: HastNodeLike | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) {
    return node.children.map((child) => getHastText(child)).join('');
  }
  return '';
}

const VOID_HTML_TAGS = new Set(['br', 'hr', 'img', 'input', 'wbr']);
const SVG_PRESERVE_CASE_ATTRS = new Set(['viewBox', 'preserveAspectRatio', 'gradientUnits']);

function escapeHtmlText(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtmlAttr(str: string): string {
  return escapeHtmlText(str).replace(/"/g, '&quot;');
}

function toHtmlAttrName(propKey: string): string {
  if (propKey === 'className') return 'class';
  if (propKey === 'htmlFor') return 'for';
  if (SVG_PRESERVE_CASE_ATTRS.has(propKey)) return propKey;
  if (propKey.startsWith('data') || propKey.startsWith('aria')) {
    return propKey.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  }
  return propKey.toLowerCase();
}

/** Tuần tự hóa cây con HAST của KaTeX (`span`/`svg`/`path`) sang chuỗi HTML gọn để tránh phình JSX trong bundle MDX. */
function serializeHastNodesToHtml(nodes: readonly HastNodeLike[]): string {
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      out += escapeHtmlText(node.value ?? '');
      continue;
    }
    if (node.type !== 'element' || !node.tagName) continue;

    let attrs = '';
    if (node.properties) {
      for (const [key, rawVal] of Object.entries(node.properties)) {
        if (rawVal === undefined || rawVal === null || rawVal === false) continue;
        const attrName = toHtmlAttrName(key);
        if (rawVal === true) {
          attrs += ` ${attrName}`;
        } else if (Array.isArray(rawVal)) {
          const joined = rawVal.join(' ').trim();
          if (joined) attrs += ` ${attrName}="${escapeHtmlAttr(joined)}"`;
        } else {
          attrs += ` ${attrName}="${escapeHtmlAttr(String(rawVal))}"`;
        }
      }
    }

    if (VOID_HTML_TAGS.has(node.tagName)) {
      out += `<${node.tagName}${attrs}>`;
      continue;
    }
    const inner = Array.isArray(node.children) ? serializeHastNodesToHtml(node.children) : '';
    out += `<${node.tagName}${attrs}>${inner}</${node.tagName}>`;
  }
  return out;
}

/**
 * Plugin Rehype chạy NGAY TRƯỚC `rehypeKatex`:
 * Lưu giữ chuỗi LaTeX gốc vào thẻ bọc tạm `<lu-tex-wrap data-tex="...">` vì `rehypeKatex`
 * thay thế hoàn toàn phần tử gốc bằng kết quả HTML (khi dùng `output: 'html'`, không có `.katex-mathml`).
 * Thẻ tạm sẽ được gỡ bỏ hoàn toàn ngay sau `rehypeKatex` trong `rehypeFixKatexNegations`.
 */
export const rehypePreserveMathTexPre: Plugin<[]> = function rehypePreserveMathTexPre() {
  return (tree) => {
    visit(tree, 'element', (rawNode, index, rawParent) => {
      const node = rawNode as unknown as HastNodeLike;
      const parent = rawParent as unknown as HastNodeLike | undefined;
      if (!parent || !Array.isArray(parent.children) || typeof index !== 'number') {
        return;
      }
      if (node.tagName === 'lu-tex-wrap') {
        return SKIP;
      }

      // Trường hợp 1: <pre><code class="language-math ...">...</code></pre>
      if (node.tagName === 'pre' && Array.isArray(node.children)) {
        const mathCode = node.children.find(
          (child) =>
            child.type === 'element' &&
            child.tagName === 'code' &&
            hasHastClass(child, 'language-math'),
        );
        if (mathCode) {
          const rawTex = getHastText(node).trim();
          const wrapper: HastNodeLike = {
            type: 'element',
            tagName: 'lu-tex-wrap',
            properties: { 'data-tex': rawTex },
            children: [node],
          };
          parent.children[index] = wrapper;
          return [SKIP, index + 1];
        }
      }

      // Trường hợp 2: <code class="language-math math-inline"> hoặc <span class="math-display/math-inline">
      if (
        hasHastClass(node, 'language-math') ||
        hasHastClass(node, 'math-display') ||
        hasHastClass(node, 'math-inline')
      ) {
        const rawTex = getHastText(node).trim();
        const wrapper: HastNodeLike = {
          type: 'element',
          tagName: 'lu-tex-wrap',
          properties: { 'data-tex': rawTex },
          children: [node],
        };
        parent.children[index] = wrapper;
        return [SKIP, index + 1];
      }

      return undefined;
    });
  };
};

/**
 * Plugin Rehype hậu xử lý ngay sau `rehypeKatex`:
 * 0. Gỡ bỏ `<lu-tex-wrap data-tex="...">` và chuyển `data-tex` trực tiếp lên phần tử `.katex` / `.katex-display`.
 * 1. Đồng bộ các class nội bộ giữa KaTeX 0.16.x (`rehype-katex`) và KaTeX 0.19.x (`katex.min.css`).
 * 2. Loại bỏ các thẻ `.rlap` / `.llap` chứa ký tự gạch chéo phủ định (`\uE020`, `\u0338`, `/`) và gắn `.lu-negated-rel` trực tiếp lên toán tử quan hệ (`=`, `∈`, `∣`, `≡`, `⊂`, `⊆`, `∼`, `∥`).
 */
export const rehypeFixKatexNegations: Plugin<[]> = function rehypeFixKatexNegations() {
  return (tree) => {
    visit(tree, 'element', (rawNode, index, rawParent) => {
      const node = rawNode as unknown as HastNodeLike;
      const parent = rawParent as unknown as HastNodeLike | undefined;

      // 0. Gỡ thẻ bọc tạm lu-tex-wrap và gắn data-tex lên root KaTeX đã kết xuất
      if (
        node.tagName === 'lu-tex-wrap' &&
        parent &&
        Array.isArray(parent.children) &&
        typeof index === 'number'
      ) {
        const rawTex =
          typeof node.properties?.['data-tex'] === 'string' ? node.properties['data-tex'] : '';
        const unwrapped = Array.isArray(node.children) ? node.children : [];
        if (rawTex) {
          for (const child of unwrapped) {
            if (child.type === 'element') {
              if (!child.properties) {
                child.properties = {};
              }
              child.properties['data-tex'] = rawTex;
            }
          }
        }
        parent.children.splice(index, 1, ...unwrapped);
        return index;
      }

      // 1. Đồng bộ class KaTeX 0.16.x <-> 0.19.x
      const classes = node.properties?.className;
      if (Array.isArray(classes)) {
        for (const cls of [...classes]) {
          const mapped = KATEX_CLASS_COMPAT_MAP[cls];
          if (mapped && !classes.includes(mapped)) {
            classes.push(mapped);
          }
        }
      }

      // 2. Chuyển đổi các ký tự phủ định đơn lẻ thuộc font AMS (∤, ⊈, ⊉, ≁, ∦) sang toán tử gốc + .lu-negated-rel
      if (
        hasHastClass(node, 'mrel') &&
        Array.isArray(node.children) &&
        node.children.length === 1
      ) {
        const onlyChild = node.children[0];
        if (onlyChild?.type === 'text' && typeof onlyChild.value === 'string') {
          const baseOp = AMS_NEG_HAST_MAP[onlyChild.value];
          if (baseOp) {
            onlyChild.value = baseOp;
            removeHastClass(node, 'amsrm');
            addHastClass(node, 'lu-negated-rel');
          }
        }
      }

      // 3. Thu gọn cụm .rlap / .llap phủ định trong mảng children
      if (Array.isArray(node.children) && node.children.length > 1) {
        const nextChildren: HastNodeLike[] = [];
        for (let i = 0; i < node.children.length; i += 1) {
          const cur = node.children[i];
          const next1 = node.children[i + 1];
          const next2 = node.children[i + 2];

          if (!cur) continue;

          // Trường hợp A: \notin -> cur chứa '∈', next1 chứa '.llap'
          if (
            cur.type === 'element' &&
            getHastText(cur) === '∈' &&
            next1?.type === 'element' &&
            hasHastDescendantClass(next1, 'llap')
          ) {
            addHastClass(node, 'lu-negated-rel');
            nextChildren.push({ type: 'text', value: '∈' });
            i += 1;
            continue;
          }

          // Trường hợp B: \neq, \not\equiv, \not\subset, \not\mid -> cur là .mrel chứa '.rlap'
          if (
            cur.type === 'element' &&
            hasHastClass(cur, 'mrel') &&
            hasHastDescendantClass(cur, 'rlap')
          ) {
            if (
              next1?.type === 'element' &&
              hasHastClass(next1, 'mspace') &&
              hasHastClass(next1, 'nobreak') &&
              next2?.type === 'element' &&
              hasHastClass(next2, 'mrel')
            ) {
              addHastClass(next2, 'lu-negated-rel');
              nextChildren.push(next2);
              i += 2;
              continue;
            }
            if (next1?.type === 'element' && hasHastClass(next1, 'mrel')) {
              addHastClass(next1, 'lu-negated-rel');
              nextChildren.push(next1);
              i += 1;
              continue;
            }
          }

          nextChildren.push(cur);
        }
        node.children = nextChildren;
      }
    });

    // 4. Nén cây con HAST bên trong `.katex` / `.katex-display` thành chuỗi HTML tĩnh gọn (`data-katex-html`)
    // giúp cắt giảm ~65-75% dung lượng 103 chunk MDX và tăng tốc kết xuất React DOM.
    visit(tree, 'element', (rawNode) => {
      const node = rawNode as unknown as HastNodeLike;
      if (
        node.tagName === 'span' &&
        (hasHastClass(node, 'katex-display') || hasHastClass(node, 'katex')) &&
        Array.isArray(node.children) &&
        node.children.length > 0
      ) {
        if (!node.properties) {
          node.properties = {};
        }
        node.properties['data-katex-html'] = serializeHastNodesToHtml(node.children);
        node.children = [];
        return SKIP;
      }
      return undefined;
    });
  };
};
