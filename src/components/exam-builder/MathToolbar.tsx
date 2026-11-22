import { ImagePlus, Sparkles } from 'lucide-react';
import { type ChangeEvent, type FC, useRef, useState } from 'react';
import {
  MATH_SNIPPET_CATEGORIES,
  MATH_SNIPPETS,
  type MathSnippetCategory,
  type MathSnippetItem,
} from '@/features/exam-builder';
import { cn } from '@/shared/lib/cn';

export interface MathToolbarProps {
  readonly onInsertSnippet: (snippet: MathSnippetItem) => void;
  readonly onUploadImage?: (dataUrl: string, fileName: string) => void;
  /** Ẩn nhóm mẫu cấu trúc (khi dùng bên trong ô sửa 1 câu hỏi cụ thể) */
  readonly compact?: boolean;
}

export const MathToolbar: FC<MathToolbarProps> = ({
  onInsertSnippet,
  onUploadImage,
  compact = false,
}) => {
  const categories = compact
    ? MATH_SNIPPET_CATEGORIES.filter((c) => c.id !== 'structure')
    : MATH_SNIPPET_CATEGORIES;

  const [activeCategory, setActiveCategory] = useState<MathSnippetCategory>(
    compact ? 'calculus' : 'structure',
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleSnippets = MATH_SNIPPETS.filter((item) => item.category === activeCategory);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadImage) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadImage(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div
      data-testid="exam-math-toolbar"
      className="space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-2.5"
    >
      {/* Hàng tab nhóm ký hiệu */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex flex-wrap items-center gap-1"
          role="tablist"
          aria-label="Nhóm ký hiệu toán học"
        >
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'cursor-pointer rounded-lg px-2.5 py-1 font-mono text-[10.5px] font-semibold transition-colors',
                  active
                    ? 'bg-[var(--accent-os)] text-white'
                    : 'bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {onUploadImage && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Chọn ảnh hình vẽ minh họa từ máy"
            />
            <button
              type="button"
              data-testid="exam-upload-image-btn"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 font-mono text-[10.5px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/50 hover:text-[var(--accent-os)]"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Chèn hình vẽ</span>
            </button>
          </div>
        )}
      </div>

      {/* Các nút chèn nhanh */}
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleSnippets.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`math-snippet-${item.id}`}
            onClick={() => onInsertSnippet(item)}
            title={item.title}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs font-medium text-[var(--text-main)] transition-all hover:border-[var(--accent-os)]/60 hover:bg-[var(--bg-workspace)] hover:text-[var(--accent-os)] active:scale-95"
          >
            <span className="font-serif text-[12.5px] font-semibold text-[var(--accent-os)]">
              {item.preview}
            </span>
            {activeCategory === 'structure' && (
              <span className="text-[11px] text-[var(--text-secondary)]">{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {!compact && (
        <p className="flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)]">
          <Sparkles className="h-3 w-3 shrink-0 text-[var(--accent-heritage)]" aria-hidden="true" />
          <span>
            Mẹo gõ tắt: <code className="font-mono">vec(AB)</code>,{' '}
            <code className="font-mono">goc(ABC)</code>, <code className="font-mono">can(3)</code>,{' '}
            <code className="font-mono">phan(1,3)</code>,{' '}
            <code className="font-mono">tp(1,2,2x-3)</code>, <code className="font-mono">*A.</code>{' '}
            (đánh dấu đáp án đúng).
          </span>
        </p>
      )}
    </div>
  );
};

export default MathToolbar;
