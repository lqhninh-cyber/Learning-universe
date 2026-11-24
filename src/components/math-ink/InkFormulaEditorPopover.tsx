import { Check, Sigma, Trash2, Type, X } from 'lucide-react';
import { type FC, useMemo, useRef, useState } from 'react';
import { InlineMathText, KatexMath } from '@/features/math-glossary';
import type { InkTextItem } from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export type FormulaPadCategory = 'calculus' | 'algebra' | 'geometry' | 'matrix';

interface MathPadButtonItem {
  readonly id: string;
  readonly label: string;
  readonly previewLatex: string;
  readonly insertSnippet: string;
  readonly cursorBackOffset?: number;
}

const FORMULA_CATEGORIES: ReadonlyArray<{
  readonly key: FormulaPadCategory;
  readonly label: string;
}> = [
  { key: 'calculus', label: 'Giải tích' },
  { key: 'algebra', label: 'Đại số' },
  { key: 'geometry', label: 'Hình học' },
  { key: 'matrix', label: 'Hệ & Ma trận' },
];

const FORMULA_PAD_ITEMS: Readonly<Record<FormulaPadCategory, readonly MathPadButtonItem[]>> = {
  calculus: [
    {
      id: 'frac',
      label: 'Phân số',
      previewLatex: '\\frac{a}{b}',
      insertSnippet: '\\frac{a}{b}',
      cursorBackOffset: 4,
    },
    {
      id: 'sqrt',
      label: 'Căn bậc 2',
      previewLatex: '\\sqrt{x}',
      insertSnippet: '\\sqrt{x}',
      cursorBackOffset: 1,
    },
    {
      id: 'nthroot',
      label: 'Căn bậc n',
      previewLatex: '\\sqrt[n]{x}',
      insertSnippet: '\\sqrt[3]{x}',
      cursorBackOffset: 1,
    },
    {
      id: 'pow',
      label: 'Lũy thừa',
      previewLatex: 'x^{2}',
      insertSnippet: '^{2}',
      cursorBackOffset: 1,
    },
    {
      id: 'sub',
      label: 'Chỉ số dưới',
      previewLatex: 'a_{n}',
      insertSnippet: '_{n}',
      cursorBackOffset: 1,
    },
    {
      id: 'int',
      label: 'Tích phân',
      previewLatex: '\\int_{a}^{b}',
      insertSnippet: '\\int_{0}^{1} f(x)\\,dx',
    },
    {
      id: 'lim',
      label: 'Giới hạn',
      previewLatex: '\\lim_{x\\to a}',
      insertSnippet: '\\lim_{x \\to +\\infty} ',
    },
    {
      id: 'sum',
      label: 'Tổng Sigma',
      previewLatex: '\\sum_{k=1}^{n}',
      insertSnippet: '\\sum_{k=1}^{n} a_k',
    },
    {
      id: 'deriv',
      label: 'Đạo hàm',
      previewLatex: "f'(x)",
      insertSnippet: "f'(x) = ",
    },
    {
      id: 'pm-inf',
      label: 'Cộng trừ vô cực',
      previewLatex: '\\pm\\infty',
      insertSnippet: '\\pm\\infty',
    },
  ],
  algebra: [
    { id: 'forall', label: 'Với mọi', previewLatex: '\\forall', insertSnippet: '\\forall x \\in ' },
    { id: 'exists', label: 'Tồn tại', previewLatex: '\\exists', insertSnippet: '\\exists x \\in ' },
    { id: 'in', label: 'Thuộc', previewLatex: '\\in', insertSnippet: ' \\in ' },
    { id: 'subset', label: 'Tập con', previewLatex: '\\subset', insertSnippet: ' \\subset ' },
    { id: 'implies', label: 'Suy ra', previewLatex: '\\implies', insertSnippet: ' \\implies ' },
    { id: 'iff', label: 'Tương đương', previewLatex: '\\iff', insertSnippet: ' \\iff ' },
    {
      id: 'iso',
      label: 'Đẳng cấu',
      previewLatex: 'G/H \\cong',
      insertSnippet: 'G / \\ker\\varphi \\cong \\operatorname{Im}\\varphi',
    },
    {
      id: 'ker',
      label: 'Hạt nhân ker',
      previewLatex: '\\ker\\varphi',
      insertSnippet: '\\ker\\varphi',
    },
    {
      id: 'set-r',
      label: 'Tập số thực R',
      previewLatex: '\\mathbb{R}',
      insertSnippet: '\\mathbb{R}',
    },
    {
      id: 'set-z',
      label: 'Tập số nguyên Z',
      previewLatex: '\\mathbb{Z}',
      insertSnippet: '\\mathbb{Z}',
    },
  ],
  geometry: [
    {
      id: 'vec',
      label: 'Vectơ',
      previewLatex: '\\overrightarrow{AB}',
      insertSnippet: '\\overrightarrow{AB}',
      cursorBackOffset: 1,
    },
    { id: 'perp', label: 'Vuông góc', previewLatex: '\\perp', insertSnippet: ' \\perp ' },
    { id: 'para', label: 'Song song', previewLatex: '\\parallel', insertSnippet: ' \\parallel ' },
    {
      id: 'angle',
      label: 'Góc',
      previewLatex: '\\widehat{ABC}',
      insertSnippet: '\\widehat{ABC} = 90^\\circ',
    },
    {
      id: 'tri',
      label: 'Tam giác',
      previewLatex: '\\triangle ABC',
      insertSnippet: '\\triangle ABC',
    },
    {
      id: 'dist',
      label: 'Khoảng cách',
      previewLatex: 'd(M,(\\alpha))',
      insertSnippet: 'd(A, (SBC)) = \\frac{3V}{S_{\\triangle SBC}}',
    },
    { id: 'alpha', label: 'Alpha', previewLatex: '\\alpha', insertSnippet: '\\alpha' },
    { id: 'beta', label: 'Beta', previewLatex: '\\beta', insertSnippet: '\\beta' },
    { id: 'phi', label: 'Phi', previewLatex: '\\varphi', insertSnippet: '\\varphi' },
    { id: 'delta', label: 'Delta', previewLatex: '\\Delta', insertSnippet: '\\Delta' },
  ],
  matrix: [
    {
      id: 'cases2',
      label: 'Hệ 2 PT',
      previewLatex: '\\begin{cases} a \\\\ b \\end{cases}',
      insertSnippet: '\\begin{cases} x + y = 2 \\\\ 2x - y = 1 \\end{cases}',
    },
    {
      id: 'cases3',
      label: 'Hàm từng khúc',
      previewLatex: 'f(x)=\\begin{cases}\\dots\\end{cases}',
      insertSnippet:
        'f(x) = \\begin{cases} x^2 + 1 & \\text{khi } x \\ge 0 \\\\ -x + 1 & \\text{khi } x < 0 \\end{cases}',
    },
    {
      id: 'pmat2',
      label: 'Ma trận 2x2',
      previewLatex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      insertSnippet: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
    },
    {
      id: 'det2',
      label: 'Định thức 2x2',
      previewLatex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
      insertSnippet: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc',
    },
  ],
};

const FORMULA_COLORS: ReadonlyArray<{ readonly hex: string; readonly label: string }> = [
  { hex: '#17332C', label: 'Xanh thông đậm' },
  { hex: '#111827', label: 'Đen mực' },
  { hex: '#1D4ED8', label: 'Xanh bút bi' },
  { hex: '#B91C1C', label: 'Đỏ son nhấn' },
  { hex: '#1B5E4A', label: 'Lục ngọc' },
  { hex: '#8C5828', label: 'Hổ phách' },
  { hex: '#6D28D9', label: 'Tím đại số' },
];

const QUICK_SIZES: ReadonlyArray<{ readonly size: number; readonly label: string }> = [
  { size: 16, label: 'Nhỏ' },
  { size: 22, label: 'Vừa' },
  { size: 28, label: 'Lớn' },
  { size: 36, label: 'Tiêu đề' },
];

/**
 * Kết xuất thông minh một mục chữ / công thức trên Bảng viết:
 * - Nếu chuỗi có chứa dấu `$...$` hoặc `$$...$$`, dùng InlineMathText kết xuất văn bản trộn công thức.
 * - Nếu bật `isMath` và người dùng nhập thẳng LaTeX trần (như `\int_0^1 x^2 dx`), kết xuất thẳng qua KatexMath.
 */
export function SmartInkMathContent({
  text,
  isMath,
  className,
}: {
  readonly text: string;
  readonly isMath: boolean;
  readonly className?: string;
}) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (!isMath) {
    if (trimmed.includes('$')) {
      return <InlineMathText text={trimmed} className={cn('whitespace-pre-wrap', className)} />;
    }
    return <span className={cn('whitespace-pre-wrap', className)}>{trimmed}</span>;
  }

  if (trimmed.includes('$')) {
    return <InlineMathText text={trimmed} className={cn('whitespace-pre-wrap', className)} />;
  }

  const lines = trimmed.split('\n');
  const hasBlockEnv = /\\begin\{(?:cases|pmatrix|bmatrix|vmatrix|matrix|aligned)\}/.test(trimmed);
  if (hasBlockEnv || lines.length === 1) {
    return <KatexMath math={trimmed} display={hasBlockEnv} className={className} />;
  }

  return (
    <span className={cn('inline-flex flex-col items-start gap-1', className)}>
      {lines.map((line, idx) =>
        line.trim() ? <KatexMath key={idx} math={line.trim()} display={false} /> : null,
      )}
    </span>
  );
}

export interface InkFormulaEditorPopoverProps {
  readonly initialItem?: InkTextItem | null;
  readonly defaultColor?: string;
  readonly onSave: (payload: {
    readonly text: string;
    readonly isMath: boolean;
    readonly fontSize: number;
    readonly color: string;
  }) => void;
  readonly onDelete?: () => void;
  readonly onClose: () => void;
}

export const InkFormulaEditorPopover: FC<InkFormulaEditorPopoverProps> = ({
  initialItem,
  defaultColor = '#17332C',
  onSave,
  onDelete,
  onClose,
}) => {
  const [text, setText] = useState<string>(initialItem?.text ?? '');
  const [isMath, setIsMath] = useState<boolean>(initialItem?.isMath ?? true);
  const [fontSize, setFontSize] = useState<number>(initialItem?.fontSize ?? 22);
  const [color, setColor] = useState<string>(initialItem?.color ?? defaultColor);
  const [category, setCategory] = useState<FormulaPadCategory>('calculus');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const padItems = useMemo(() => FORMULA_PAD_ITEMS[category], [category]);

  const handleInsertSnippet = (item: MathPadButtonItem) => {
    const el = textareaRef.current;
    if (!isMath) {
      setIsMath(true);
    }
    if (!el) {
      setText((prev) => `${prev}${item.insertSnippet}`);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}${item.insertSnippet}${text.slice(end)}`;
    setText(next);

    const nextCaret = start + item.insertSnippet.length - Math.max(0, item.cursorBackOffset ?? 0);
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleSubmit = () => {
    const cleaned = text.trim();
    if (!cleaned) return;
    onSave({
      text: cleaned,
      isMath,
      fontSize: Math.min(48, Math.max(12, Math.round(fontSize))),
      color,
    });
  };

  return (
    <div
      data-testid="ink-formula-editor-popover"
      onPointerDown={(e) => e.stopPropagation()}
      className="w-[min(92vw,396px)] space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 text-[var(--text-main)] shadow-2xl"
    >
      {/* ĐẦU HỘP CÔNG THỨC */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent-os)]/12 text-[var(--accent-os)]">
            <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-main)]">
              {initialItem ? 'Chỉnh sửa Công thức / Nhãn' : 'Chèn Công thức Toán học (KaTeX)'}
            </p>
            <p className="text-[10.5px] text-[var(--text-muted)]">
              Bấm phím ký hiệu bên dưới hoặc gõ trực tiếp LaTeX
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp công thức"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* CHUYỂN CHẾ ĐỘ TOÁN / VĂN BẢN */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1 text-[11px]">
        <button
          type="button"
          data-testid="formula-mode-math"
          onClick={() => setIsMath(true)}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1 font-semibold transition-all',
            isMath
              ? 'bg-[var(--accent-os)] text-white shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Công thức KaTeX</span>
        </button>
        <button
          type="button"
          data-testid="formula-mode-text"
          onClick={() => setIsMath(false)}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1 font-semibold transition-all',
            !isMath
              ? 'bg-[var(--accent-os)] text-white shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          <Type className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Văn bản / Trộn $...$</span>
        </button>
      </div>

      {/* BÀN PHÍM KÝ HIỆU TOÁN TRỰC QUAN 4 NHÓM */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {FORMULA_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              data-testid={`formula-cat-${cat.key}`}
              onClick={() => setCategory(cat.key)}
              className={cn(
                'cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors',
                category === cat.key
                  ? 'bg-[#17332C] text-white dark:bg-[#52B394] dark:text-[#0C1814]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1.5">
          {padItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`formula-pad-${item.id}`}
              onClick={() => handleInsertSnippet(item)}
              title={`${item.label} (${item.insertSnippet})`}
              className={cn(
                'flex min-h-[34px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 py-1 text-[11px] text-[var(--text-main)] transition-all hover:-translate-y-[1px] hover:border-[var(--accent-os)]/50 hover:shadow-2xs active:scale-[0.98]',
                category === 'matrix' && 'col-span-5 justify-between px-2.5 sm:col-span-2',
              )}
            >
              <KatexMath math={item.previewLatex} className="pointer-events-none text-[11.5px]" />
              {category === 'matrix' && (
                <span className="ml-1 truncate text-[10px] text-[var(--text-muted)]">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ô NHẬP LIỆU */}
      <div className="space-y-1">
        <textarea
          ref={textareaRef}
          rows={2}
          autoFocus
          data-testid="ink-formula-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onClose();
            }
          }}
          placeholder={
            isMath
              ? 'Ví dụ: \\int_{0}^{1} \\frac{x^2}{x+1}\\,dx = \\ln 2 - \\frac{1}{2}'
              : 'Ví dụ: Ta có $f(x) = x^3 - 3x + 2$ đồng biến trên $(1; +\\infty)$'
          }
          className="w-full resize-none rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 font-mono text-xs text-[var(--text-main)] placeholder:font-sans placeholder:text-[var(--text-muted)] focus:border-[var(--accent-os)] focus:outline-none"
        />
        <p className="text-[10px] text-[var(--text-muted)]">
          Mẹo: Nhấn <kbd className="font-mono font-semibold">Ctrl+Enter</kbd> để chèn nhanh · Nhấp
          đúp vào công thức trên vở bất kỳ lúc nào để sửa lại.
        </p>
      </div>

      {/* KHUNG XEM TRƯỚC TRỰC TIẾP */}
      <div
        data-testid="ink-formula-preview"
        className="flex min-h-[54px] items-center justify-center overflow-x-auto rounded-xl border border-dashed border-[var(--border-hairline)] bg-[#FCFBF7] px-3 py-2.5 dark:bg-[#141A18]"
      >
        {text.trim() ? (
          <div style={{ color, fontSize: `${Math.min(30, Math.max(14, fontSize))}px` }}>
            <SmartInkMathContent text={text} isMath={isMath} />
          </div>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)] italic">
            Xem trước công thức sẽ hiển thị tại đây...
          </span>
        )}
      </div>

      {/* CỠ CHỮ & MÀU MỰC */}
      <div className="space-y-2 border-t border-[var(--border-hairline)] pt-2">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-medium text-[var(--text-secondary)]">
            Cỡ chữ: <strong className="font-mono text-[var(--text-main)]">{fontSize}px</strong>
          </span>
          <div className="flex items-center gap-1">
            {QUICK_SIZES.map((q) => (
              <button
                key={q.size}
                type="button"
                onClick={() => setFontSize(q.size)}
                className={cn(
                  'cursor-pointer rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors',
                  fontSize === q.size
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)]/12 text-[var(--accent-os)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]',
                )}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <input
          type="range"
          min={14}
          max={42}
          step={1}
          aria-label="Cỡ chữ công thức"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-[var(--accent-os)]"
        />

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
            {FORMULA_COLORS.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => setColor(swatch.hex)}
                title={swatch.label}
                aria-label={`Màu ${swatch.label}`}
                style={{ backgroundColor: swatch.hex }}
                className={cn(
                  'h-5 w-5 cursor-pointer rounded-full border border-white/60 transition-transform hover:scale-110',
                  color === swatch.hex && 'ring-2 ring-[var(--accent-os)] ring-offset-1',
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {initialItem && onDelete && (
              <button
                type="button"
                data-testid="ink-formula-delete-btn"
                onClick={onDelete}
                title="Xóa công thức này"
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-[#8F3D35]/30 bg-[#8F3D35]/10 px-2 text-xs font-semibold text-[#8F3D35] hover:bg-[#8F3D35] hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 cursor-pointer rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              Hủy
            </button>
            <button
              type="button"
              data-testid="ink-formula-submit-btn"
              disabled={!text.trim()}
              onClick={handleSubmit}
              className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{initialItem ? 'Cập nhật' : 'Chèn vào trang'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InkFormulaEditorPopover;
