import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import katex from 'katex';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdx from 'remark-mdx';

const mdxProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkMdx);

const katexMacros = JSON.parse(fs.readFileSync('content/_shared/katex-macros.json', 'utf8'));

const html = fs.readFileSync('raw-data/Hình học cao cấp.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// Read exercises from bt-data
const btData = JSON.parse(document.getElementById('bt-data').textContent);
const exercisesByRef = new Map();
for (const ex of btData) {
  if (!exercisesByRef.has(ex.ref)) {
    exercisesByRef.set(ex.ref, []);
  }
  exercisesByRef.get(ex.ref).push(ex);
}

function cleanMathText(text) {
  return text
    .replace(/ᾱ/g, '\\overline{\\alpha}')
    .replace(/β\s*̄|β̄/g, '\\overline{\\beta}')
    .replace(/γ\s*̄|γ̄/g, '\\overline{\\gamma}')
    .replace(/δ\s*̄|δ̄/g, '\\overline{\\delta}')
    .replace(/Ē/g, '\\overline{E}')
    .replace(/̄/g, '')
    .replace(/_\{(\w+)\}_\{(\w+)\}/g, '_{$1$2}')
    .replace(/−/g, '-')
    .replace(/′/g, "'")
    .replace(/×/g, ' \\times ')
    .replace(/→/g, ' \\to ')
    .replace(/⇒/g, ' \\implies ')
    .replace(/⇔/g, ' \\iff ')
    .replace(/∈/g, ' \\in ')
    .replace(/∉/g, ' \\notin ')
    .replace(/⊂/g, ' \\subset ')
    .replace(/⊃/g, ' \\supset ')
    .replace(/∪/g, ' \\cup ')
    .replace(/∩/g, ' \\cap ')
    .replace(/≠/g, ' \\neq ')
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/±/g, ' \\pm ')
    .replace(/⊥/g, ' \\perp ')
    .replace(/∥/g, ' \\parallel ')
    .replace(/λ/g, ' \\lambda ')
    .replace(/α/g, ' \\alpha ')
    .replace(/β/g, ' \\beta ')
    .replace(/γ/g, ' \\gamma ')
    .replace(/δ/g, ' \\delta ')
    .replace(/φ/g, ' \\varphi ')
    .replace(/ψ/g, ' \\psi ')
    .replace(/θ/g, ' \\theta ')
    .replace(/ω/g, ' \\omega ')
    .replace(/…/g, ' \\dots ')
    .replace(/∞/g, ' \\infty ')
    .replace(/∎/g, ' ')
    .replace(/✓/g, ' ')
    .replace(/&nbsp;/g, ' ');
}

function cleanExerciseText(text) {
  if (!text) return '';
  let s = text
    .replace(/−/g, '-')
    .replace(/′/g, "'")
    .replace(/λ/g, ' $\\lambda$ ')
    .replace(/α/g, ' $\\alpha$ ')
    .replace(/β/g, ' $\\beta$ ')
    .replace(/γ/g, ' $\\gamma$ ')
    .replace(/δ/g, ' $\\delta$ ')
    .replace(/φ/g, ' $\\varphi$ ')
    .replace(/ψ/g, ' $\\psi$ ')
    .replace(/θ/g, ' $\\theta$ ')
    .replace(/ω/g, ' $\\omega$ ')
    .replace(/≠/g, ' $\\neq$ ')
    .replace(/≤/g, ' $\\le$ ')
    .replace(/≥/g, ' $\\ge$ ')
    .replace(/∈/g, ' $\\in$ ')
    .replace(/∉/g, ' $\\notin$ ')
    .replace(/⊂/g, ' $\\subset$ ')
    .replace(/⊥/g, ' $\\perp$ ')
    .replace(/∥/g, ' $\\parallel$ ')
    .replace(/\\/g, ' ')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
  return s;
}

function nodeToKatex(node) {
  if (node.nodeType === 3) {
    return cleanMathText(node.textContent);
  }
  if (node.nodeType !== 1) return '';

  const el = node;
  const tagName = el.tagName.toLowerCase();
  const className = el.className || '';

  // Fraction
  if (className.includes('fr')) {
    const parts = el.querySelectorAll(':scope > i');
    if (parts.length >= 2) {
      const num = nodeToKatex(parts[0]).trim();
      const den = nodeToKatex(parts[1]).trim();
      return `\\frac{${num}}{${den}}`;
    }
  }

  // Radical
  if (className.includes('rad')) {
    const rr = el.querySelector(':scope > .rr');
    if (rr) {
      return `\\sqrt{${nodeToKatex(rr).trim()}}`;
    }
  }

  // Sum
  if (className.includes('sum')) {
    const up = el.querySelector(':scope > .up');
    const dn = el.querySelector(':scope > .dn');
    const uText = up ? nodeToKatex(up).trim() : '';
    const dText = dn ? nodeToKatex(dn).trim() : '';
    let res = '\\sum';
    if (dText) res += `_{${dText}}`;
    if (uText) res += `^{${uText}}`;
    return res;
  }

  // Matrix
  if (className.includes('mx')) {
    const items = [...el.querySelectorAll(':scope > i')].map((i) => nodeToKatex(i).trim());
    if (items.length === 4) {
      return `\\begin{pmatrix} ${items[0]} & ${items[1]} \\\\ ${items[2]} & ${items[3]} \\end{pmatrix}`;
    }
    if (items.length === 9) {
      return `\\begin{pmatrix} ${items[0]} & ${items[1]} & ${items[2]} \\\\ ${items[3]} & ${items[4]} & ${items[5]} \\\\ ${items[6]} & ${items[7]} & ${items[8]} \\end{pmatrix}`;
    }
    if (items.length > 0) {
      return `\\begin{pmatrix} ${items.join(' & ')} \\end{pmatrix}`;
    }
  }

  // System
  if (className.includes('sys')) {
    const rws = el.querySelectorAll('.rw');
    if (rws.length > 0) {
      const lines = [...rws].map((rw) => {
        const l = rw.querySelector('.l');
        const r = rw.querySelector('.r');
        const lText = l ? nodeToKatex(l).trim() : '';
        const rText = r ? nodeToKatex(r).trim() : '';
        return `${lText} = ${rText}`;
      });
      return `\\begin{cases} ${lines.join(' \\\\ ')} \\end{cases}`;
    }
  }

  // Vector
  if (className.includes('v')) {
    const inner = childrenToKatex(el).trim();
    if (inner.length === 1 && /[a-z0]/i.test(inner)) {
      return `\\vec{${inner}}`;
    }
    return `\\vect{${inner}}`;
  }

  // Bold math symbols
  if (tagName === 'b') {
    const text = el.textContent.trim();
    if (text === 'A') return '\\mathcal{A}';
    if (text === 'Ā') return '\\overline{\\mathcal{A}}';
    if (text === 'V') return 'V';
    if (text === 'R') return '\\R';
    if (text === 'C') return '\\C';
    if (text === 'K') return '\\mathbb{K}';
    if (text === 'E') return '\\mathbb{E}';
    if (text === 'P') return '\\mathbb{P}';
    return `\\mathbf{${cleanMathText(text)}}`;
  }

  // Sub / Sup
  if (tagName === 'sub') {
    const inner = childrenToKatex(el).trim();
    return `_{${inner}}`;
  }
  if (tagName === 'sup') {
    const inner = childrenToKatex(el).trim();
    return `^{${inner}}`;
  }

  if (tagName === 'i') {
    return childrenToKatex(el);
  }

  return childrenToKatex(el);
}

function childrenToKatex(parent) {
  let res = '';
  for (const child of parent.childNodes) {
    res += nodeToKatex(child);
  }
  return res;
}

function processInlineElement(node) {
  if (node.nodeType === 3) {
    return node.textContent;
  }
  if (node.nodeType !== 1) return '';

  const el = node;
  const tagName = el.tagName.toLowerCase();
  const className = el.className || '';

  // Display equation
  if (className.includes('eq') || className.includes('eqw') || className.includes('eqs')) {
    const math = nodeToKatex(el).trim().replace(/\s+/g, ' ');
    if (!math) return '';
    return `\n\n$$\n${math}\n$$\n\n`;
  }

  // Inline math
  if (className.includes('m')) {
    const math = nodeToKatex(el).trim().replace(/\s+/g, ' ');
    if (!math) return '';
    return `$${math}$`;
  }

  // Standalone vector
  if (className.includes('v')) {
    const math = nodeToKatex(el).trim().replace(/\s+/g, ' ');
    return `$${math}$`;
  }

  if (tagName === 'b') {
    const text = el.textContent.trim();
    if (['A', 'Ā', 'V', 'R', 'C', 'K', 'E', 'P'].includes(text)) {
      return `$${nodeToKatex(el).trim()}$`;
    }
    return `**${childrenToMarkdown(el)}**`;
  }

  if (tagName === 'i') {
    return `*${childrenToMarkdown(el)}*`;
  }

  if (tagName === 'sub') {
    return `$${nodeToKatex(el).trim()}$`;
  }

  if (tagName === 'sup') {
    return `$${nodeToKatex(el).trim()}$`;
  }

  if (tagName === 'br') {
    return '\n\n';
  }

  return childrenToMarkdown(el);
}

function childrenToMarkdown(parent) {
  let res = '';
  for (const child of parent.childNodes) {
    res += processInlineElement(child);
  }
  return res;
}

function mergeMath(text) {
  let prev = text;
  while (true) {
    const next = prev
      .replace(/\$([^\$\n]+)\$\s*\$([^\$\n]+)\$/g, (match, a, b) => {
        return `$${a} ${b}$`.replace(/\s+/g, ' ');
      })
      .replace(/_\{([^}]+)\}_\{([^}]+)\}/g, '_{$1$2}');
    if (next === prev) break;
    prev = next;
  }
  return prev;
}

function escapeMdxProse(mdxText) {
  const lines = mdxText.split('\n');
  let inDisplayMath = false;
  let inCodeBlock = false;

  const resultLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('$$')) {
      inDisplayMath = !inDisplayMath;
      return line;
    }
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inDisplayMath || inCodeBlock) {
      return line;
    }

    // JSX element opening or closing
    if (/^<[A-Za-z]/.test(trimmed) && trimmed.endsWith('>')) {
      return line;
    }
    if (/^<\/[A-Za-z]+>/.test(trimmed)) {
      return line;
    }

    // Split line by inline math $...$
    // Even indices are OUTSIDE math mode
    const parts = line.split(/(\$[^\$\n]+\$)/g);
    for (let i = 0; i < parts.length; i += 2) {
      parts[i] = parts[i].replace(/(?<!\\)\{/g, '\\{').replace(/(?<!\\)\}/g, '\\}');
    }
    return parts.join('');
  });

  return resultLines.join('\n');
}

// Map each section ID to its metadata
const SECTION_METADATA = [
  // Chapter 1: Không gian afin và hình học afin
  {
    secId: 's1',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 1,
    slug: 'khong-gian-affine',
    fileName: '01-khong-gian-affine.mdx',
    title: 'Khái niệm Không gian Affine và Quy tắc Chasles',
    description:
      'Định nghĩa không gian affine trên trường K, tiên đề Weyl, tiên đề Chasles và các tính chất cơ bản.',
    level: 'basic',
    tags: ['không gian affine', 'quy tắc Chasles', 'hình học tuyến tính'],
    pages: '7-15',
    preserveExisting: true,
  },
  {
    secId: 's2',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 2,
    slug: 'toa-do-afin-va-muc-tieu-afin',
    fileName: '02-toa-do-afin-va-muc-tieu-afin.mdx',
    title: 'Tọa độ Affine và Mục tiêu Affine',
    description: 'Mục tiêu affine, tọa độ điểm đối với mục tiêu và công thức đổi mục tiêu affine.',
    level: 'basic',
    tags: ['mục tiêu affine', 'tọa độ affine', 'đổi cơ sở'],
    pages: '16-24',
    takeaways: [
      'Mục tiêu affine trong không gian n chiều gồm n+1 điểm độc lập (một gốc và n đỉnh).',
      'Công thức đổi mục tiêu cho phép chuyển đổi tọa độ điểm giữa hai hệ quy chiếu qua ma trận chuyển cơ sở.',
    ],
  },
  {
    secId: 's3',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 3,
    slug: 'cac-phang-trong-khong-gian-afin',
    fileName: '03-cac-phang-trong-khong-gian-afin.mdx',
    title: 'Các Phẳng trong Không gian Affine',
    description:
      'Định nghĩa m-phẳng, phương của phẳng, vị trí tương đối và phương trình tham số, tổng quát.',
    level: 'intermediate',
    tags: ['m-phẳng', 'phương trình phẳng', 'vị trí tương đối'],
    pages: '25-33',
    takeaways: [
      'Một m-phẳng được xác định bởi một điểm đi qua và một không gian con vectơ m chiều làm phương.',
      'Hai phẳng có thể trùng nhau, song song, cắt nhau hoặc chéo nhau tùy thuộc vào quan hệ giữa hai phương.',
    ],
  },
  {
    secId: 's4',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 4,
    slug: 'tam-ti-cu-cua-mot-he-diem',
    fileName: '04-tam-ti-cu-cua-mot-he-diem.mdx',
    title: 'Tâm Tỉ Cự của một Hệ Điểm',
    description: 'Tâm tỉ cự, tọa độ tỉ cự, tính chất kết hợp và bao affine của tập hợp điểm.',
    level: 'intermediate',
    tags: ['tâm tỉ cự', 'tọa độ tỉ cự', 'bao affine'],
    pages: '34-39',
    takeaways: [
      'Tâm tỉ cự của hệ điểm với tổng hệ số khác 0 là điểm duy nhất thỏa mãn đẳng thức vectơ cơ bản.',
      'Tính chất kết hợp tâm tỉ cự cho phép thay thế một nhóm điểm bằng tâm tỉ cự bộ phận của chúng.',
    ],
  },
  {
    secId: 's5',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 5,
    slug: 'tap-loi-trong-khong-gian-afin-thuc',
    fileName: '05-tap-loi-trong-khong-gian-afin-thuc.mdx',
    title: 'Tập Lồi trong Không gian Affine Thực',
    description: 'Đoạn thẳng, tập lồi, tổ hợp lồi, bao lồi và đơn hình trong không gian thực.',
    level: 'intermediate',
    tags: ['tập lồi', 'bao lồi', 'đơn hình'],
    pages: '40-47',
    takeaways: [
      'Tập lồi chứa toàn bộ đoạn thẳng nối hai điểm bất kỳ thuộc tập.',
      'Bao lồi của một tập hợp là tập hợp tất cả các tổ hợp lồi của các phần tử thuộc tập đó.',
    ],
  },
  {
    secId: 's6',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 6,
    slug: 'anh-xa-afin-va-phep-bien-doi-afin',
    fileName: '06-anh-xa-afin-va-phep-bien-doi-afin.mdx',
    title: 'Ánh xạ Affine và Phép Biến đổi Affine',
    description:
      'Định nghĩa ánh xạ affine, ánh xạ tuyến tính liên kết, phương trình tọa độ và phép biến đổi affine.',
    level: 'intermediate',
    tags: ['ánh xạ affine', 'phép biến đổi', 'ma trận affine'],
    pages: '48-58',
    takeaways: [
      'Ánh xạ affine là ánh xạ giữa hai không gian affine bảo toàn quan hệ vectơ qua ánh xạ tuyến tính liên kết.',
      'Phép biến đổi affine hoàn toàn xác định khi biết ảnh của một mục tiêu affine.',
    ],
  },
  {
    secId: 's7',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 7,
    slug: 'nhom-cac-phep-bien-doi-afin-va-hinh-hoc-afin',
    fileName: '07-nhom-cac-phep-bien-doi-afin-va-hinh-hoc-afin.mdx',
    title: 'Nhóm các Phép Biến đổi Affine và Hình học Affine',
    description:
      'Cấu trúc nhóm của các phép biến đổi affine, quan điểm Erlangen của Klein và các bất biến affine.',
    level: 'advanced',
    tags: ['nhóm affine', 'quan điểm Klein', 'bất biến affine'],
    pages: '59-65',
    takeaways: [
      'Tập hợp các phép biến đổi affine của một không gian affine lập thành một nhóm đối với phép hợp thành.',
      'Theo quan điểm Klein, hình học affine là khoa học nghiên cứu các tính chất bất biến đối với nhóm affine.',
    ],
  },
  {
    secId: 's8',
    chapter: 1,
    chapterDir: '01-khong-gian-affine',
    order: 8,
    slug: 'cac-sieu-mat-bac-hai-trong-khong-gian-afin',
    fileName: '08-cac-sieu-mat-bac-hai-trong-khong-gian-afin.mdx',
    title: 'Các Siêu mặt Bậc hai trong Không gian Affine',
    description:
      'Phương trình bậc hai, tâm, phương tiệm cận và phân loại affine các siêu mặt bậc hai.',
    level: 'advanced',
    tags: ['siêu mặt bậc hai', 'phân loại affine', 'dạng toàn phương'],
    pages: '66-78',
    takeaways: [
      'Siêu mặt bậc hai là tập hợp các điểm có tọa độ thỏa mãn một phương trình đại số bậc hai.',
      'Phân loại affine dựa trên dấu và hạng của các ma trận hệ số trong phương trình chính tắc.',
    ],
  },

  // Chapter 2: Không gian Ơclit và hình học Ơclit
  {
    secId: 'e1',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 1,
    slug: 'bo-sung-ve-cac-phep-toan-tren-khong-gian-vecto',
    fileName: '01-bo-sung-ve-cac-phep-toan-tren-khong-gian-vecto.mdx',
    title: 'Bổ sung về các Phép toán trên Không gian Vectơ',
    description:
      'Tích vectơ, tích hỗn hợp, định thức Gram và thể tích định hướng trong không gian vectơ.',
    level: 'basic',
    tags: ['tích vectơ', 'tích hỗn hợp', 'định thức Gram'],
    pages: '80-87',
    takeaways: [
      'Tích vectơ trong không gian 3 chiều tạo ra vectơ vuông góc với cả hai vectơ nhân tử.',
      'Định thức Gram là công cụ hữu hiệu để kiểm tra tính độc lập tuyến tính và tính thể tích khối hộp.',
    ],
  },
  {
    secId: 'e2',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 2,
    slug: 'khong-gian-euclide',
    fileName: '02-khong-gian-euclide.mdx',
    title: 'Không gian Ơclit',
    description:
      'Định nghĩa không gian Ơclit thông qua không gian vectơ Euclid nền, khoảng cách giữa hai điểm.',
    level: 'basic',
    tags: ['không gian Ơclit', 'tích vô hướng', 'khoảng cách'],
    pages: '88-95',
    takeaways: [
      'Không gian Ơclit là không gian affine mà không gian vectơ liên kết được trang bị tích vô hướng xác định dương.',
      'Khoảng cách giữa hai điểm được định nghĩa bằng độ dài của vectơ nối hai điểm đó.',
    ],
  },
  {
    secId: 'e3',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 3,
    slug: 'muc-tieu-truc-chuan-toa-do-truc-chuan',
    fileName: '03-muc-tieu-truc-chuan-toa-do-truc-chuan.mdx',
    title: 'Mục tiêu Trực chuẩn và Tọa độ Trực chuẩn',
    description:
      'Cơ sở trực chuẩn, mục tiêu trực chuẩn, ma trận trực kinh và công thức đổi mục tiêu trực chuẩn.',
    level: 'basic',
    tags: ['mục tiêu trực chuẩn', 'tọa độ trực chuẩn', 'ma trận trực kinh'],
    pages: '96-102',
    takeaways: [
      'Trong mục tiêu trực chuẩn, tích vô hướng và khoảng cách có biểu thức tọa độ đơn giản nhất.',
      'Ma trận chuyển cơ sở giữa hai mục tiêu trực chuẩn là ma trận trực giao (trực kinh).',
    ],
  },
  {
    secId: 'e4',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 4,
    slug: 'cac-phang-trong-khong-gian-euclide',
    fileName: '04-cac-phang-trong-khong-gian-euclide.mdx',
    title: 'Các Phẳng trong Không gian Ơclit',
    description:
      'Bù vuông góc, khoảng cách từ điểm đến phẳng và khoảng cách giữa hai phẳng chéo nhau.',
    level: 'intermediate',
    tags: ['phẳng trực giao', 'khoảng cách', 'hình chiếu vuông góc'],
    pages: '103-112',
    takeaways: [
      'Hình chiếu vuông góc của một điểm lên phẳng cho điểm gần nhất thuộc phẳng.',
      'Khoảng cách giữa hai phẳng chéo nhau bằng độ dài đoạn vuông góc chung.',
    ],
  },
  {
    secId: 'e5',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 5,
    slug: 'goc-trong-khong-gian-euclide',
    fileName: '05-goc-trong-khong-gian-euclide.mdx',
    title: 'Góc trong Không gian Ơclit',
    description:
      'Định nghĩa góc giữa hai đường thẳng, góc giữa đường thẳng và phẳng, góc giữa hai phẳng.',
    level: 'intermediate',
    tags: ['góc', 'độ đo góc', 'trực giao'],
    pages: '113-120',
    takeaways: [
      'Góc giữa hai đường thẳng được xác định qua góc giữa hai vectơ chỉ phương của chúng.',
      'Hai phẳng vuông góc khi và chỉ khi vectơ pháp tuyến của chúng trực giao.',
    ],
  },
  {
    secId: 'e6',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 6,
    slug: 'anh-xa-dang-cu-va-phep-bien-doi-dang-cu',
    fileName: '06-anh-xa-dang-cu-va-phep-bien-doi-dang-cu.mdx',
    title: 'Ánh xạ Đẳng cự và Phép Biến đổi Đẳng cự',
    description:
      'Ánh xạ bảo toàn khoảng cách, cấu trúc đại số của nhóm đẳng cự, phép dời hình và phép phản xạ.',
    level: 'intermediate',
    tags: ['đẳng cự', 'phép dời hình', 'phép phản xạ'],
    pages: '121-129',
    takeaways: [
      'Mọi phép biến đổi đẳng cự đều là phép biến đổi affine có ánh xạ liên kết là biến đổi trực giao.',
      'Phép biến đổi đẳng cự có thể biểu diễn thành tích của các phép đối xứng qua siêu phẳng.',
    ],
  },
  {
    secId: 'e7',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 7,
    slug: 'hinh-hoc-euclide',
    fileName: '07-hinh-hoc-euclide.mdx',
    title: 'Hình học Ơclit theo Quan điểm Klein',
    description:
      'Các bất biến của nhóm đẳng cự, các hình bằng nhau và hệ thống tiên đề hình học Ơclit.',
    level: 'intermediate',
    tags: ['hình học Ơclit', 'bất biến đẳng cự', 'quan điểm Klein'],
    pages: '130-136',
    takeaways: [
      'Hình học Ơclit là hình học nghiên cứu các tính chất bất biến đối với nhóm các phép biến đổi đẳng cự.',
      'Hai hình được gọi là bằng nhau nếu tồn tại một phép đẳng cự biến hình này thành hình kia.',
    ],
  },
  {
    secId: 'e8',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 8,
    slug: 'hinh-hoc-dong-dang',
    fileName: '08-hinh-hoc-dong-dang.mdx',
    title: 'Hình học Đồng dạng',
    description:
      'Phép biến đổi đồng dạng, tỉ số đồng dạng, nhóm các phép biến đổi đồng dạng và hình học đồng dạng.',
    level: 'intermediate',
    tags: ['đồng dạng', 'nhóm đồng dạng', 'phép vị tự'],
    pages: '137-143',
    takeaways: [
      'Phép đồng dạng là phép biến đổi affine nhân mọi khoảng cách với cùng một hệ số k dương.',
      'Nhóm các phép biến đổi đồng dạng chứa nhóm đẳng cự như một nhóm con chuẩn tắc.',
    ],
  },
  {
    secId: 'e9',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 9,
    slug: 'sieu-mat-bac-hai-trong-khong-gian-euclide',
    fileName: '09-sieu-mat-bac-hai-trong-khong-gian-euclide.mdx',
    title: 'Siêu mặt Bậc hai trong Không gian Ơclit',
    description:
      'Phân loại mêtric các siêu mặt bậc hai, phương chính, trục đối xứng và dạng chính tắc.',
    level: 'advanced',
    tags: ['siêu mặt bậc hai', 'phân loại mêtric', 'dạng chính tắc'],
    pages: '144-153',
    takeaways: [
      'Bằng phép đổi mục tiêu trực chuẩn, phương trình siêu mặt bậc hai luôn đưa được về dạng chính tắc.',
      'Các bất biến mêtric của siêu mặt bậc hai được xác định qua trị riêng của ma trận dạng toàn phương.',
    ],
  },
  {
    secId: 'e10',
    chapter: 2,
    chapterDir: '02-khong-gian-euclide',
    order: 10,
    slug: 'sieu-cau-trong-khong-gian-euclide',
    fileName: '10-sieu-cau-trong-khong-gian-euclide.mdx',
    title: 'Siêu cầu trong Không gian Ơclit',
    description:
      'Tâm và bán kính siêu cầu, phương trình siêu cầu, vị trí tương đối giữa phẳng và siêu cầu.',
    level: 'advanced',
    tags: ['siêu cầu', 'tiếp diện', 'mặt cầu'],
    pages: '154-162',
    takeaways: [
      'Siêu cầu trong không gian n chiều là tập hợp các điểm cách đều một điểm cố định (tâm).',
      'Giao của siêu cầu với một phẳng nếu không rỗng thì là một siêu cầu trong không gian phẳng đó.',
    ],
  },

  // Chapter 3: Không gian xạ ảnh và hình học xạ ảnh
  {
    secId: 'p1',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 1,
    slug: 'khong-gian-xa-anh',
    fileName: '01-khong-gian-xa-anh.mdx',
    title: 'Không gian Xạ ảnh',
    description:
      'Định nghĩa không gian xạ ảnh xây dựng từ không gian vectơ, điểm xạ ảnh và số chiều.',
    level: 'basic',
    tags: ['không gian xạ ảnh', 'tia vectơ', 'chiều xạ ảnh'],
    pages: '165-173',
    takeaways: [
      'Không gian xạ ảnh n chiều là tập hợp tất cả các đường thẳng đi qua gốc tọa độ trong không gian vectơ n+1 chiều.',
      'Mọi cặp đường thẳng phân biệt trong mặt phẳng xạ ảnh đều cắt nhau tại đúng một điểm.',
    ],
  },
  {
    secId: 'p2',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 2,
    slug: 'toa-do-xa-anh-va-muc-tieu-xa-anh',
    fileName: '02-toa-do-xa-anh-va-muc-tieu-xa-anh.mdx',
    title: 'Tọa độ Xạ ảnh và Mục tiêu Xạ ảnh',
    description: 'Hệ tọa độ thuần nhất, mục tiêu xạ ảnh gồm n+2 điểm và công thức đổi mục tiêu.',
    level: 'basic',
    tags: ['mục tiêu xạ ảnh', 'tọa độ thuần nhất', 'đổi mục tiêu'],
    pages: '174-181',
    takeaways: [
      'Tọa độ xạ ảnh được xác định sai khác một thừa số tỷ lệ khác 0 (tọa độ thuần nhất).',
      'Một mục tiêu xạ ảnh trong không gian n chiều gồm n+2 điểm ở vị trí tổng quát (không có n+1 điểm nào nằm trên cùng một siêu phẳng).',
    ],
  },
  {
    secId: 'p3',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 3,
    slug: 'phuong-trinh-cua-m-phang-trong-khong-gian-xa-anh',
    fileName: '03-phuong-trinh-cua-m-phang-trong-khong-gian-xa-anh.mdx',
    title: 'Phương trình của m-Phẳng trong Không gian Xạ ảnh',
    description:
      'Phương trình tham số và phương trình thuần nhất của m-phẳng, chùm siêu phẳng xạ ảnh.',
    level: 'intermediate',
    tags: ['m-phẳng', 'phương trình thuần nhất', 'chùm siêu phẳng'],
    pages: '182-190',
    takeaways: [
      'Mỗi m-phẳng trong không gian xạ ảnh ứng với một không gian con vectơ m+1 chiều của không gian vectơ nền.',
      'Siêu phẳng xạ ảnh có phương trình là một phương trình tuyến tính thuần nhất đối với tọa độ xạ ảnh.',
    ],
  },
  {
    secId: 'p4',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 4,
    slug: 'anh-xa-xa-anh-va-bien-doi-xa-anh',
    fileName: '04-anh-xa-xa-anh-va-bien-doi-xa-anh.mdx',
    title: 'Ánh xạ Xạ ảnh và Biến đổi Xạ ảnh',
    description:
      'Ánh xạ xạ ảnh sinh bởi ánh xạ tuyến tính, tính đơn ánh/song ánh, ma trận của phép biến đổi xạ ảnh.',
    level: 'intermediate',
    tags: ['ánh xạ xạ ảnh', 'biến đổi xạ ảnh', 'ma trận xạ ảnh'],
    pages: '191-200',
    takeaways: [
      'Ánh xạ xạ ảnh biến các điểm thẳng hàng thành các điểm thẳng hàng và bảo toàn tính phụ thuộc xạ ảnh.',
      'Phép biến đổi xạ ảnh được biểu diễn qua ma trận vuông không suy biến sai khác một thừa số vô hướng.',
    ],
  },
  {
    secId: 'p5',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 5,
    slug: 'ti-so-kep',
    fileName: '05-ti-so-kep.mdx',
    title: 'Tỉ số Kép và Hàng điểm Điều hòa',
    description:
      'Tỉ số kép của bốn điểm thẳng hàng, tính bất biến qua phép chiếu xạ ảnh, hàng điểm điều hòa và tứ giác toàn phần.',
    level: 'intermediate',
    tags: ['tỉ số kép', 'hàng điểm điều hòa', 'tứ giác toàn phần'],
    pages: '201-212',
    takeaways: [
      'Tỉ số kép là bất biến cơ bản quan trọng nhất của hình học xạ ảnh.',
      'Hàng điểm điều hòa xuất hiện tự nhiên từ các đường chéo của tứ giác toàn phần.',
    ],
  },
  {
    secId: 'p6',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 6,
    slug: 'mo-hinh-xa-anh-cua-khong-gian-afin',
    fileName: '06-mo-hinh-xa-anh-cua-khong-gian-afin.mdx',
    title: 'Mô hình Xạ ảnh của Không gian Affine',
    description:
      'Phần bù xạ ảnh, siêu phẳng vô tận, tọa độ không thuần nhất và nhúng không gian affine vào xạ ảnh.',
    level: 'intermediate',
    tags: ['phần bù xạ ảnh', 'siêu phẳng vô tận', 'nhúng affine'],
    pages: '213-220',
    takeaways: [
      'Không gian affine có thể xem như phần bù của một siêu phẳng (siêu phẳng vô tận) trong không gian xạ ảnh.',
      'Các đường thẳng song song trong không gian affine sẽ cắt nhau tại một điểm thuộc siêu phẳng vô tận.',
    ],
  },
  {
    secId: 'p7',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 7,
    slug: 'nguyen-tac-doi-ngau-trong-khong-gian-xa-anh',
    fileName: '07-nguyen-tac-doi-ngau-trong-khong-gian-xa-anh.mdx',
    title: 'Nguyên tắc Đối ngẫu trong Không gian Xạ ảnh',
    description:
      'Không gian đối ngẫu, mối quan hệ đối ngẫu giữa điểm và siêu phẳng, nguyên tắc đối ngẫu hình học.',
    level: 'intermediate',
    tags: ['nguyên tắc đối ngẫu', 'không gian đối ngẫu', 'siêu phẳng'],
    pages: '221-228',
    takeaways: [
      'Không gian xạ ảnh đối ngẫu có các điểm là các siêu phẳng của không gian xạ ảnh ban đầu.',
      'Mọi định lý đúng trong không gian xạ ảnh đều dẫn đến một định lý đối ngẫu đúng bằng cách hoán đổi vai trò của điểm và siêu phẳng.',
    ],
  },
  {
    secId: 'p8',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 8,
    slug: 'sieu-mat-bac-hai-trong-khong-gian-xa-anh',
    fileName: '08-sieu-mat-bac-hai-trong-khong-gian-xa-anh.mdx',
    title: 'Siêu mặt Bậc hai trong Không gian Xạ ảnh',
    description:
      'Phương trình bậc hai thuần nhất, điểm kỳ dị, phân loại xạ ảnh các siêu mặt bậc hai thực và phức.',
    level: 'advanced',
    tags: ['siêu mặt bậc hai', 'phân loại xạ ảnh', 'dạng toàn phương thuần nhất'],
    pages: '229-237',
    takeaways: [
      'Siêu mặt bậc hai xạ ảnh được định nghĩa bởi phương trình dạng toàn phương thuần nhất bậc hai.',
      'Trong trường số phức, phân loại xạ ảnh chỉ phụ thuộc vào duy nhất một chỉ số: hạng của ma trận.',
    ],
  },
  {
    secId: 'p9',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 9,
    slug: 'cuc-va-sieu-phang-doi-cuc',
    fileName: '09-cuc-va-sieu-phang-doi-cuc.mdx',
    title: 'Cực và Siêu phẳng Đối cực đối với Siêu mặt Bậc hai',
    description:
      'Khái niệm liên hiệp, cực và siêu phẳng đối cực, tiếp diện và nón tiếp xúc đối với siêu mặt bậc hai.',
    level: 'advanced',
    tags: ['cực và đối cực', 'tiếp diện', 'liên hiệp'],
    pages: '238-245',
    takeaways: [
      'Mỗi điểm không kỳ dị có một siêu phẳng đối cực xác định qua quan hệ liên hiệp với siêu mặt bậc hai.',
      'Nếu điểm nằm trên siêu mặt bậc hai thì siêu phẳng đối cực chính là tiếp diện tại điểm đó.',
    ],
  },
  {
    secId: 'p10',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 10,
    slug: 'mot-so-dinh-li-quan-trong-trong-mat-phang-xa-anh',
    fileName: '10-mot-so-dinh-li-quan-trong-trong-mat-phang-xa-anh.mdx',
    title: 'Một số Định lí Quan trọng trong Mặt phẳng Xạ ảnh P2',
    description:
      'Các định lý hình học xạ ảnh kinh điển: Định lý Desargues, Định lý Pappus, Định lý Pascal và Định lý Brianchon.',
    level: 'advanced',
    tags: ['định lý Desargues', 'định lý Pappus', 'định lý Pascal', 'định lý Brianchon'],
    pages: '246-255',
    takeaways: [
      'Định lý Desargues liên hệ giữa hai tam giác thấu xạ từ một điểm và thấu xạ từ một đường thẳng.',
      'Định lý Pascal và Brianchon là cặp định lý đối ngẫu nổi tiếng đối với lục giác nội tiếp và ngoại tiếp conic.',
    ],
  },
  {
    secId: 'p11',
    chapter: 3,
    chapterDir: '03-khong-gian-xa-anh',
    order: 11,
    slug: 'mo-hinh-xa-anh-cua-khong-gian-euclide',
    fileName: '11-mo-hinh-xa-anh-cua-khong-gian-euclide.mdx',
    title: 'Mô hình Xạ ảnh của Không gian Ơclit',
    description:
      'Xạ ảnh hóa không gian Ơclit, siêu cầu tuyệt đối, góc và khoảng cách thông qua tỉ số kép Laguerre.',
    level: 'advanced',
    tags: ['mô hình xạ ảnh Ơclit', 'tuyệt đối', 'hệ thức Laguerre'],
    pages: '256-264',
    takeaways: [
      'Hình học Ơclit có thể xem như hình học xạ ảnh cố định một siêu phẳng vô tận và một siêu conic ảo trên đó (tuyệt đối).',
      'Công thức Laguerre biểu diễn góc giữa hai đường thẳng qua tỉ số kép với hai điểm liên hợp ảo của tuyệt đối.',
    ],
  },
];

// Ensure chapter directories exist and create/update chapter.yaml
const CHAPTER_CONFIGS = [
  {
    dir: '01-khong-gian-affine',
    content: `id: khong-gian-affine
title: Không gian Affine và Hình học Affine
description: Không gian affine, mục tiêu và tọa độ affine, các phẳng, tâm tỉ cự, tập lồi, ánh xạ affine và các siêu mặt bậc hai.
objectives:
  - Nắm vững định nghĩa không gian affine, tiên đề Weyl và tiên đề Chasles.
  - Vận dụng thành thạo mục tiêu affine, công thức đổi tọa độ và phương trình các phẳng.
  - Hiểu rõ khái niệm tâm tỉ cự, tập lồi và phép biến đổi affine.
  - Phân loại và khảo sát các siêu mặt bậc hai trong không gian affine.
`,
  },
  {
    dir: '02-khong-gian-euclide',
    content: `id: khong-gian-euclide
title: Không gian Ơclit và Hình học Ơclit
description: Không gian vectơ Ơclit, mục tiêu trực chuẩn, khoảng cách và góc, ánh xạ đẳng cự, hình học Ơclit và siêu mặt bậc hai.
objectives:
  - Nắm vững tích vô hướng, chuẩn vectơ, bất đẳng thức Cauchy-Schwarz và không gian Ơclit.
  - Sử dụng thành thạo mục tiêu trực chuẩn và ma trận trực kinh chuyển cơ sở.
  - Tính toán khoảng cách giữa các phẳng, góc giữa hai phẳng và phương trình siêu cầu.
  - Khảo sát các phép biến đổi đẳng cự, hình học đồng dạng và dạng chính tắc của siêu mặt bậc hai.
`,
  },
  {
    dir: '03-khong-gian-xa-anh',
    content: `id: khong-gian-xa-anh
title: Không gian Xạ ảnh và Hình học Xạ ảnh
description: Không gian xạ ảnh, tọa độ xạ ảnh, m-phẳng, ánh xạ xạ ảnh, tỉ số kép, nguyên tắc đối ngẫu và các định lý cổ điển.
objectives:
  - Nắm vững định nghĩa không gian xạ ảnh, mục tiêu và tọa độ xạ ảnh thuần nhất.
  - Viết và giải phương trình của m-phẳng trong không gian xạ ảnh.
  - Khai thác tính bất biến của tỉ số kép và ứng dụng hàng điểm điều hòa.
  - Vận dụng nguyên tắc đối ngẫu, cực và đối cực đối với siêu mặt bậc hai.
  - Nắm bắt các định lý hình học xạ ảnh kinh điển (Desargues, Pappus, Pascal, Brianchon).
`,
  },
];

for (const chap of CHAPTER_CONFIGS) {
  const fullDir = path.resolve('content/affine-geometry', chap.dir);
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  fs.writeFileSync(path.join(fullDir, 'chapter.yaml'), chap.content, 'utf8');
}

// Convert all 29 sections
let totalConverted = 0;
let totalKatexErrors = 0;
let totalMdxErrors = 0;

for (const meta of SECTION_METADATA) {
  const targetDir = path.resolve('content/affine-geometry', meta.chapterDir);
  const targetFile = path.join(targetDir, meta.fileName);

  if (meta.preserveExisting && fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, 'utf8');
    content = content.replace(/status:\s*draft/, 'status: published');
    content = content.replace(
      /sources:\s*\[\]/,
      `sources:\n  - source: gt-hhcc-nmh-2004\n    pages: '${meta.pages}'\n    sections: '§${meta.order}'`,
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`[PASS] Updated existing lesson: ${meta.fileName} (status: published)`);
    totalConverted++;
    continue;
  }

  // Convert from raw-data HTML
  const secHeading = document.getElementById(meta.secId);
  if (!secHeading) {
    console.error(`[ERROR] Section heading not found for ID: ${meta.secId}`);
    continue;
  }

  let bodyMd = '';
  let cur = secHeading.nextElementSibling;
  let boxCount = 0;
  let lastThmId = null;

  while (cur && cur.tagName !== 'H2') {
    if (cur.tagName === 'H3') {
      const headingText = cur.textContent.trim();
      bodyMd += `\n\n## ${headingText}\n\n`;
    } else if (cur.getAttribute('data-kind')) {
      boxCount++;
      const kind = cur.getAttribute('data-kind');
      const kEl = cur.querySelector('.k') || cur.querySelector('.pk');
      let title = kEl ? kEl.textContent.replace(/\.$/, '').trim() : '';
      if (!title) {
        if (kind === 'def') title = 'Định nghĩa';
        else if (kind === 'thm') title = 'Định lí';
        else if (kind === 'ex') title = 'Ví dụ';
        else if (kind === 'proof') title = 'Chứng minh';
      }

      const clone = cur.cloneNode(true);
      const kClone = clone.querySelector('.k') || clone.querySelector('.pk');
      if (kClone) kClone.remove();
      const qed = clone.querySelector('.qed');
      if (qed) qed.remove();

      const boxContent = mergeMath(childrenToMarkdown(clone).trim());

      let comp = 'Definition';
      let blockId = `def-${meta.secId}-${boxCount}`;
      if (kind === 'thm') {
        comp = 'Theorem';
        blockId = `thm-${meta.secId}-${boxCount}`;
        lastThmId = blockId;
      } else if (kind === 'ex') {
        comp = 'Example';
        blockId = `ex-${meta.secId}-${boxCount}`;
      } else if (kind === 'proof') {
        comp = 'Proof';
      }

      if (comp === 'Proof') {
        if (lastThmId) {
          bodyMd += `\n\n<Proof of="${lastThmId}">\n${boxContent}\n</Proof>\n\n`;
        } else {
          bodyMd += `\n\n<Proof>\n${boxContent}\n</Proof>\n\n`;
        }
      } else {
        bodyMd += `\n\n<${comp} id="${blockId}" title="${title}">\n${boxContent}\n</${comp}>\n\n`;
      }
    } else if (cur.className && cur.className.includes('note')) {
      const noteContent = mergeMath(childrenToMarkdown(cur).trim());
      bodyMd += `\n\n<Remark title="Chú ý">\n${noteContent}\n</Remark>\n\n`;
    } else if (cur.tagName === 'P') {
      const pContent = mergeMath(childrenToMarkdown(cur).trim());
      if (pContent.length > 0) {
        bodyMd += `\n\n${pContent}\n\n`;
      }
    }

    cur = cur.nextElementSibling;
  }

  // Add exercises from bt-data
  const secExercises = exercisesByRef.get(meta.secId) || [];
  if (secExercises.length > 0) {
    bodyMd += `\n\n## Bài tập vận dụng và củng cố\n\n`;
    let exIdx = 0;
    for (const ex of secExercises) {
      exIdx++;
      const exId = `exr-${meta.secId}-${exIdx}`;
      const exTitle = ex.th || `Bài tập ${meta.order}.${exIdx}`;
      const qText = cleanExerciseText(ex.q);
      const hText = cleanExerciseText(ex.h);
      const gText = ex.g ? ex.g.map((line) => cleanExerciseText(line)).join('\n\n') : '';
      const ansText = cleanExerciseText(ex.ans || (ex.a ? ex.a.join(', ') : ''));

      bodyMd += `<Exercise id="${exId}" title="${exTitle}">\n${qText}\n</Exercise>\n\n`;
      if (hText) {
        bodyMd += `<Hint>\n${hText}\n</Hint>\n\n`;
      }
      if (gText || ansText) {
        bodyMd += `<Solution>\n${gText}\n\n**Đáp án:** ${ansText}\n</Solution>\n\n`;
      }
    }
  }

  // Add KeyTakeaways
  const takeaways = meta.takeaways || [
    `Nắm vững các khái niệm và định nghĩa trọng tâm của bài ${meta.title}.`,
    `Vận dụng thành thạo các tính chất và phương pháp tính toán trong bài tập thực hành.`,
    `Hiểu rõ mối liên hệ giữa các cấu trúc hình học trong chương và toàn bộ học phần.`,
  ];

  bodyMd += `\n\n<KeyTakeaways>\n${takeaways.map((t) => `- ${t}`).join('\n')}\n</KeyTakeaways>\n`;

  // Escape unescaped curly braces in MDX prose
  bodyMd = escapeMdxProse(bodyMd);

  // Clean extra blank lines
  bodyMd = bodyMd.replace(/\n{3,}/g, '\n\n').trim();

  // Validate math in bodyMd
  const inlineMath = [...bodyMd.matchAll(/\$([^\$\n]+)\$/g)].map((m) => m[1]);
  const displayMath = [...bodyMd.matchAll(/\$\$([\s\S]*?)\$\$/g)].map((m) => m[1]);

  for (const math of [...inlineMath, ...displayMath]) {
    try {
      katex.renderToString(math.trim(), {
        macros: katexMacros,
        throwOnError: true,
        strict: 'ignore',
      });
    } catch (e) {
      totalKatexErrors++;
      console.warn(`[KaTeX WARN][${meta.slug}]`, math.trim(), '->', e.message);
    }
  }

  // Assemble full MDX file
  const fileContent = `---
id: ${meta.slug}
title: ${JSON.stringify(meta.title)}
description: ${JSON.stringify(meta.description)}
estimatedMinutes: 45
level: ${meta.level}
prerequisites: []
tags:
${meta.tags.map((t) => `  - ${JSON.stringify(t)}`).join('\n')}
sources:
  - source: gt-hhcc-nmh-2004
    pages: '${meta.pages}'
    sections: '§${meta.order}'
status: published
version: 1.0.0
authoring:
  aiAssisted: true
  tools:
    - Antigravity
  draftedAt: '2026-11-03'
---

${bodyMd}
`;

  // Test parse with remarkMdx
  try {
    mdxProcessor.parse(fileContent);
  } catch (err) {
    totalMdxErrors++;
    console.error(`[MDX PARSE ERROR][${meta.slug}]:`, err.message);
  }

  fs.writeFileSync(targetFile, fileContent, 'utf8');
  console.log(
    `[PASS] Created lesson: ${meta.chapterDir}/${meta.fileName} (Math: ${inlineMath.length} in, ${displayMath.length} disp)`,
  );
  totalConverted++;
}

console.log(`\n========================================`);
console.log(`Total lessons processed: ${totalConverted}/29`);
console.log(`Total KaTeX syntax errors: ${totalKatexErrors}`);
console.log(`Total MDX syntax errors: ${totalMdxErrors}`);
console.log(`========================================\n`);
