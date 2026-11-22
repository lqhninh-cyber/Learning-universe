/**
 * Bộ phân tích và tính giá trị biểu thức toán học thuần TypeScript (Recursive Descent Parser).
 * - Tuyệt đối KHÔNG dùng eval / new Function (100% an toàn CSP & bảo mật).
 * - Hỗ trợ nhân ngầm định: 2x, 3(x+1), (x-1)(x+2), 2sin(x), x^2 - 3x + 2, |x|.
 * - Hỗ trợ hàm chuẩn THPT & Đại học: sin, cos, tan, cot, asin, acos, atan, sqrt, cbrt, abs, ln, log, exp, floor, ceil.
 * - Hỗ trợ hằng số: pi, e.
 * - Tích hợp tìm giao điểm trục, cực trị xấp xỉ và tích phân xác định bằng quy tắc Simpson.
 */

type TokenType = 'number' | 'ident' | 'op' | 'lparen' | 'rparen' | 'eof';

interface Token {
  readonly type: TokenType;
  readonly value: string;
}

const FUNCTIONS_MAP: Readonly<Record<string, (v: number) => number>> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  cot: (v) => 1 / Math.tan(v),
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: Math.sqrt,
  can: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  log2: Math.log2,
  exp: Math.exp,
  floor: Math.floor,
  ceil: Math.ceil,
};

function preprocessExpression(raw: string): string {
  let s = raw
    .trim()
    .replace(/^(?:y|f\s*\(\s*x\s*\)|g\s*\(\s*x\s*\)|h\s*\(\s*x\s*\))\s*=\s*/i, '')
    .replace(/,/g, '.')
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi');

  // Chuyển |expr| thành abs(expr) cho trường hợp đơn giản
  let guard = 0;
  while (s.includes('|') && guard < 8) {
    const next = s.replace(/\|([^|]+)\|/g, 'abs($1)');
    if (next === s) break;
    s = next;
    guard += 1;
  }

  return s;
}

function tokenize(expr: string): readonly Token[] {
  const rawTokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i]!;
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i]!)) {
        num += expr[i]!;
        i += 1;
      }
      rawTokens.push({ type: 'number', value: num });
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i]!)) {
        ident += expr[i]!;
        i += 1;
      }
      const lower = ident.toLowerCase();
      // Tách dạng viết liền như "2sin" đã tách số ở trên; nếu người dùng viết "sinx" -> "sin", "x"
      if (lower.endsWith('x') && lower.length > 1 && FUNCTIONS_MAP[lower.slice(0, -1)]) {
        rawTokens.push({ type: 'ident', value: lower.slice(0, -1) });
        rawTokens.push({ type: 'ident', value: 'x' });
      } else {
        rawTokens.push({ type: 'ident', value: lower });
      }
      continue;
    }

    if (ch === '(' || ch === '[') {
      rawTokens.push({ type: 'lparen', value: '(' });
      i += 1;
      continue;
    }
    if (ch === ')' || ch === ']') {
      rawTokens.push({ type: 'rparen', value: ')' });
      i += 1;
      continue;
    }
    if ('+-*/^'.includes(ch)) {
      rawTokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }

    throw new Error(`Ký tự không hợp lệ: ${ch}`);
  }

  // Chèn toán tử nhân ngầm định `*` (VD: 2x, 2sin(x), (x-1)(x+1), x(x+1), pi x)
  const out: Token[] = [];
  for (let idx = 0; idx < rawTokens.length; idx += 1) {
    const cur = rawTokens[idx]!;
    const prev = out[out.length - 1];
    if (prev) {
      const prevIsValue =
        prev.type === 'number' ||
        prev.type === 'rparen' ||
        (prev.type === 'ident' && !FUNCTIONS_MAP[prev.value]);
      const curStartsFactor =
        cur.type === 'ident' || cur.type === 'lparen' || cur.type === 'number';
      if (prevIsValue && curStartsFactor) {
        out.push({ type: 'op', value: '*' });
      }
    }
    out.push(cur);
  }

  out.push({ type: 'eof', value: '' });
  return out;
}

type EvalNode = (x: number) => number;

function buildAst(tokens: readonly Token[]): EvalNode {
  let pos = 0;

  const peek = (): Token => tokens[pos] ?? { type: 'eof', value: '' };
  const consume = (): Token => {
    const t = peek();
    pos += 1;
    return t;
  };

  const parseExpression = (): EvalNode => {
    let left = parseTerm();
    while (peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = consume().value;
      const right = parseTerm();
      const l = left;
      const r = right;
      left = op === '+' ? (x) => l(x) + r(x) : (x) => l(x) - r(x);
    }
    return left;
  };

  const parseTerm = (): EvalNode => {
    let left = parseUnary();
    while (peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
      const op = consume().value;
      const right = parseUnary();
      const l = left;
      const r = right;
      left = op === '*' ? (x) => l(x) * r(x) : (x) => l(x) / r(x);
    }
    return left;
  };

  const parseUnary = (): EvalNode => {
    if (peek().type === 'op' && peek().value === '+') {
      consume();
      return parseUnary();
    }
    if (peek().type === 'op' && peek().value === '-') {
      consume();
      const operand = parseUnary();
      return (x) => -operand(x);
    }
    return parsePower();
  };

  const parsePower = (): EvalNode => {
    const base = parsePrimary();
    if (peek().type === 'op' && peek().value === '^') {
      consume();
      const exponent = parseUnary();
      return (x) => Math.pow(base(x), exponent(x));
    }
    return base;
  };

  const parsePrimary = (): EvalNode => {
    const token = peek();

    if (token.type === 'number') {
      consume();
      const val = Number.parseFloat(token.value);
      if (!Number.isFinite(val)) throw new Error('Số không hợp lệ');
      return () => val;
    }

    if (token.type === 'ident') {
      consume();
      if (token.value === 'x') return (x) => x;
      if (token.value === 'pi') return () => Math.PI;
      if (token.value === 'e') return () => Math.E;

      const fn = FUNCTIONS_MAP[token.value];
      if (fn) {
        if (peek().type === 'lparen') {
          consume();
          const arg = parseExpression();
          if (peek().type === 'rparen') consume();
          return (x) => fn(arg(x));
        }
        // Hỗ trợ viết không ngoặc như sin x, cos 2x
        const arg = parseUnary();
        return (x) => fn(arg(x));
      }

      throw new Error(`Không nhận diện hàm hoặc biến: ${token.value}`);
    }

    if (token.type === 'lparen') {
      consume();
      const inner = parseExpression();
      if (peek().type === 'rparen') consume();
      return inner;
    }

    throw new Error('Biểu thức chưa hoàn chỉnh');
  };

  const root = parseExpression();
  if (peek().type !== 'eof') {
    throw new Error(`Dư ký tự "${peek().value}"`);
  }
  return root;
}

export interface CompiledMathFunction {
  readonly ok: true;
  readonly evaluate: (x: number) => number;
}

export interface MathCompileError {
  readonly ok: false;
  readonly error: string;
}

export type MathCompileResult = CompiledMathFunction | MathCompileError;

export function compileMathExpression(rawExpression: string): MathCompileResult {
  const cleaned = preprocessExpression(rawExpression);
  if (!cleaned) {
    return { ok: false, error: 'Biểu thức trống' };
  }
  try {
    const tokens = tokenize(cleaned);
    const evaluate = buildAst(tokens);
    return { ok: true, evaluate };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Biểu thức toán học không hợp lệ',
    };
  }
}

export interface SpecialGraphPoint {
  readonly x: number;
  readonly y: number;
  readonly kind: 'root' | 'y-intercept' | 'extremum';
  readonly label: string;
}

function roundNice(v: number): number {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}

/**
 * Tìm tự động các điểm đặc biệt trong khung nhìn [xMin, xMax] × [yMin, yMax]:
 * giao điểm Oy, nghiệm giao trục Ox (bisection), và cực trị địa phương.
 */
export function findSpecialGraphPoints(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
): readonly SpecialGraphPoint[] {
  const points: SpecialGraphPoint[] = [];
  const ySpan = Math.max(1, yMax - yMin);

  // 1. Giao điểm trục tung Oy (x = 0)
  if (xMin <= 0 && xMax >= 0) {
    const y0 = fn(0);
    if (Number.isFinite(y0) && y0 >= yMin && y0 <= yMax) {
      points.push({
        x: 0,
        y: y0,
        kind: 'y-intercept',
        label: `(0; ${roundNice(y0)})`,
      });
    }
  }

  const samples = 240;
  const dx = (xMax - xMin) / samples;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const x = xMin + i * dx;
    xs.push(x);
    ys.push(fn(x));
  }

  const pushUnique = (pt: SpecialGraphPoint) => {
    const exists = points.some(
      (p) => Math.hypot(p.x - pt.x, p.y - pt.y) < Math.max(0.18, (xMax - xMin) * 0.025),
    );
    if (!exists && points.length < 10) {
      points.push(pt);
    }
  };

  for (let i = 1; i < samples; i += 1) {
    const yPrev = ys[i - 1]!;
    const yCur = ys[i]!;
    const yNext = ys[i + 1]!;
    if (!Number.isFinite(yPrev) || !Number.isFinite(yCur) || !Number.isFinite(yNext)) continue;
    // Bỏ qua điểm gián đoạn / tiệm cận đứng
    if (Math.abs(yCur - yPrev) > ySpan * 0.6 || Math.abs(yNext - yCur) > ySpan * 0.6) continue;

    // Giao trục Ox (đổi dấu)
    if (yPrev * yCur <= 0 && Math.abs(yPrev - yCur) < ySpan * 0.5) {
      let lo = xs[i - 1]!;
      let hi = xs[i]!;
      let flo = yPrev;
      for (let iter = 0; iter < 16; iter += 1) {
        const mid = (lo + hi) / 2;
        const fmid = fn(mid);
        if (!Number.isFinite(fmid)) break;
        if (flo * fmid <= 0) {
          hi = mid;
        } else {
          lo = mid;
          flo = fmid;
        }
      }
      const rootX = (lo + hi) / 2;
      if (Math.abs(fn(rootX)) < 0.05) {
        pushUnique({
          x: rootX,
          y: 0,
          kind: 'root',
          label: `(${roundNice(rootX)}; 0)`,
        });
      }
    }

    // Cực trị địa phương (đạo hàm đổi dấu)
    const isMax = yCur > yPrev && yCur >= yNext;
    const isMin = yCur < yPrev && yCur <= yNext;
    if ((isMax || isMin) && yCur >= yMin && yCur <= yMax) {
      const rx = xs[i]!;
      pushUnique({
        x: rx,
        y: yCur,
        kind: 'extremum',
        label: `(${roundNice(rx)}; ${roundNice(yCur)})`,
      });
    }
  }

  return points;
}

/**
 * Tính gần đúng tích phân xác định bằng quy tắc Simpson tổng hợp (an toàn với điểm gián đoạn).
 */
export function computeDefiniteIntegral(
  fn: (x: number) => number,
  from: number,
  to: number,
  steps = 200,
): number | null {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  if (Math.abs(to - from) < 1e-9) return 0;

  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = (to - from) / n;
  let sum = 0;

  for (let i = 0; i <= n; i += 1) {
    const x = from + i * h;
    const y = fn(x);
    if (!Number.isFinite(y) || Math.abs(y) > 1e6) return null;
    const weight = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    sum += weight * y;
  }

  return (sum * h) / 3;
}
