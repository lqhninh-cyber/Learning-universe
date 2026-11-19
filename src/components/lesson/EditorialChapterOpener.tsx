import { BookOpen, ChevronDown, Target } from 'lucide-react';
import { useState, type FC, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { toRomanNumeral } from './toRomanNumeral';

export type ChapterDifficultyLevel =
  'Nền tảng' | 'Trung cấp' | 'Chuyên sâu' | 'Nghiệp vụ thực hành';

export interface ChapterCloItem {
  readonly code: string;
  readonly description: string;
}

export interface EditorialChapterOpenerProps {
  /** Mã học phần (tùy chọn) */
  readonly subjectCode?: string;
  /** Tên học phần (tùy chọn) */
  readonly subjectName?: string;
  /** Số thứ tự chương */
  readonly chapterNumber: number;
  /** Ký tự số La Mã chìm (tự động tính nếu không cung cấp) */
  readonly romanNumeral?: string;
  /** Tiêu đề chính của chương / bài học */
  readonly title: string;
  /** Tiêu đề phụ / mô tả học thuật trang trọng (in nghiêng) */
  readonly subtitle?: string;
  /** Thời lượng nghiên cứu ước tính (phút - tùy chọn) */
  readonly estimatedReadingMinutes?: number;
  /** Mức độ phức tạp học thuật */
  readonly difficultyLevel?: ChapterDifficultyLevel;
  /** Danh sách Chuẩn đầu ra học phần (Course Learning Outcomes — CLO) */
  readonly clos?: readonly ChapterCloItem[];
  /** Nguồn giáo trình và số trang đối chiếu (HCMUE / NXB Giáo dục) */
  readonly curriculumSource?: string;
  /** Nội dung kiến thức tiên quyết hoặc bổ trợ tùy chọn */
  readonly prerequisites?: ReactNode;
  /** Thu gọn CLO & Giáo trình đối chiếu vào dải 1 dòng có thể bấm mở rộng */
  readonly collapsibleMeta?: boolean;
  /** Các phần tử tùy chọn bổ sung */
  readonly children?: ReactNode;
  readonly className?: string;
}

const DIFFICULTY_CONFIG: Record<
  ChapterDifficultyLevel,
  {
    readonly dot: string;
    readonly text: string;
    readonly pill: string;
  }
> = {
  'Nền tảng': {
    dot: 'bg-emerald-500',
    text: 'text-emerald-800 dark:text-emerald-300',
    pill: 'border-emerald-600/25 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-950/40',
  },
  'Trung cấp': {
    dot: 'bg-[#C5A262]',
    text: 'text-amber-800 dark:text-[#E5C78A]',
    pill: 'border-[#C5A262]/35 bg-[#C5A262]/10 dark:border-[#C5A262]/30 dark:bg-[#C5A262]/15',
  },
  'Chuyên sâu': {
    dot: 'bg-rose-500',
    text: 'text-rose-800 dark:text-rose-300',
    pill: 'border-rose-600/25 bg-rose-500/10 dark:border-rose-500/30 dark:bg-rose-950/40',
  },
  'Nghiệp vụ thực hành': {
    dot: 'bg-teal-500',
    text: 'text-teal-800 dark:text-teal-300',
    pill: 'border-teal-600/25 bg-teal-500/10 dark:border-teal-500/30 dark:bg-teal-950/40',
  },
};

/**
 * EDITORIAL CHAPTER OPENER
 * Component mở đầu chương học thuật trang trọng mang thẩm mỹ báo chí cổ điển kết hợp phong cách Zen:
 * - Ký tự số La Mã chìm khổng lồ ở góc trên-phải (z-0 watermark).
 * - Nền card vát góc lớn bo tròn với hiệu ứng gradient ngà ấm sang xanh ngọc nhạt (Light) và sơn mài đen rêu (Dark).
 * - Huy hiệu năng lực Chuẩn đầu ra (CLO Badges) viền vàng thếp cổ #C5A262.
 * - Chỉ dấu thời lượng nghiên cứu ước tính và chấm nhấp nháy chỉ báo độ phức tạp.
 * - Tương thích hoàn hảo với Zen Focus Mode và WCAG AA Contrast.
 */
export const EditorialChapterOpener: FC<EditorialChapterOpenerProps> = ({
  chapterNumber,
  romanNumeral,
  title,
  subtitle,
  difficultyLevel = 'Trung cấp',
  clos = [],
  curriculumSource,
  prerequisites,
  collapsibleMeta = false,
  children,
  className,
}) => {
  const [isMetaExpanded, setIsMetaExpanded] = useState(!collapsibleMeta);
  const roman = romanNumeral || toRomanNumeral(chapterNumber);
  const diffConfig = DIFFICULTY_CONFIG[difficultyLevel] ?? DIFFICULTY_CONFIG['Trung cấp'];
  const rawChapter = chapterNumber === 0 ? 'Chương 0' : `Chương ${roman}`;
  const chapterName = rawChapter.replace(/\s*\(\d+\)$/, '');
  const hasMetaSection = (clos && clos.length > 0) || Boolean(curriculumSource);

  return (
    <header
      role="banner"
      aria-label={`Giới thiệu chương ${chapterNumber}: ${title}`}
      style={{ borderTopColor: 'var(--subject-accent-ink, #245746)' }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-t-[3px] border-[#DCE7E1] bg-gradient-to-br from-[#FAFBF9] via-[#F5F8F6] to-[#EDF2EF] shadow-sm transition-all duration-300 dark:border-[#1E3B2D] dark:bg-gradient-to-br dark:from-[#0E1A15] dark:via-[#12241C] dark:to-[#0C1813]',
        collapsibleMeta ? 'mb-5 p-5 md:rounded-2xl md:p-6' : 'mb-8 p-6 md:rounded-3xl md:p-8',
        className,
      )}
    >
      {/* Ký tự số La Mã chìm khổng lồ (Watermark Giant Roman Numeral) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-3 z-0 font-serif text-[160px] leading-none font-bold tracking-tighter text-zinc-900/[0.04] transition-opacity duration-300 select-none md:-top-16 md:text-[240px] dark:text-[#C5A262]/[0.08]"
      >
        {roman}
      </div>

      {/* Nội dung lớp nổi (Foreground Content z-10) */}
      <div className={cn('relative z-10', collapsibleMeta ? 'space-y-3.5' : 'space-y-5')}>
        {/* Hàng huy hiệu tinh gọn: Chỉ gồm Badge Chương và Badge Mức độ */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Badge Chương đã chuẩn hóa */}
          <span className="inline-flex items-center rounded-full border border-stone-300/80 bg-white/70 px-3 py-1 font-mono text-xs font-semibold text-zinc-700 shadow-2xs dark:border-[#1E3B2D] dark:bg-[#16271E] dark:text-[#E2ECE6]">
            {chapterName}
          </span>

          {/* Badge Mức độ */}
          {difficultyLevel && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-2xs backdrop-blur-xs',
                diffConfig.pill,
                diffConfig.text,
              )}
            >
              <span
                className={cn('h-1.5 w-1.5 animate-pulse rounded-full', diffConfig.dot)}
                aria-hidden="true"
              />
              <span>{difficultyLevel}</span>
            </span>
          )}
        </div>

        {/* Tiêu đề & Tiêu đề phụ */}
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl md:text-[34px] dark:text-[#F5F2EB]">
            {title}
          </h1>

          {subtitle && (
            <p className="font-serif text-sm leading-relaxed text-zinc-600 italic sm:text-base dark:text-[#C8D7CE]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dải metadata 1 dòng thu gọn (khi collapsibleMeta = true) */}
        {collapsibleMeta && hasMetaSection && (
          <div className="border-t border-[#DCE7E1]/80 pt-2.5 dark:border-[#1E3B2D]/80">
            <button
              type="button"
              data-testid="lesson-meta-collapse-toggle"
              aria-expanded={isMetaExpanded}
              onClick={() => setIsMetaExpanded((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-0.5 font-mono text-[11.5px] font-semibold text-[#354E48] transition-colors hover:text-[#142622] dark:text-[#A8BEB2] dark:hover:text-[#F5F2EB]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[var(--gold-text)]" aria-hidden="true" />
              <span>Chi tiết CLO &amp; Giáo trình</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  isMetaExpanded && 'rotate-180',
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* Khung Chuẩn đầu ra (CLO Badges) & Giáo trình đối chiếu */}
        {(!collapsibleMeta || isMetaExpanded) && (
          <>
            {clos && clos.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-[#8EAA9B]">
                  <Target className="h-3.5 w-3.5 text-[var(--gold-text)]" aria-hidden="true" />
                  <span>Chuẩn đầu ra học phần (Course Learning Outcomes — CLO):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clos.map((clo) => (
                    <div
                      key={clo.code}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#C5A262]/40 bg-[#C5A262]/10 px-3.5 py-1 text-xs text-zinc-800 shadow-2xs transition-colors duration-200 hover:border-[#C5A262]/70 dark:bg-[#16271E] dark:text-[#E2D4BA]"
                    >
                      <strong className="shrink-0 font-mono font-bold text-[var(--gold-text)]">
                        {clo.code}
                      </strong>
                      <span className="truncate text-zinc-700 dark:text-[#C8D7CE]">
                        {clo.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nguồn giáo trình đối chiếu (HCMUE / NXB Giáo dục) */}
            {curriculumSource && (
              <div className="flex flex-wrap items-center gap-2 border-t border-[#DCE7E1]/80 pt-3 text-xs text-zinc-600 dark:border-[#1E3B2D]/80 dark:text-[#8EAA9B]">
                <BookOpen
                  className="h-3.5 w-3.5 shrink-0 text-[var(--gold-text)]"
                  aria-hidden="true"
                />
                <span className="font-medium">Giáo trình đối chiếu:</span>
                <span className="font-serif text-zinc-700 italic dark:text-[#A8BEB2]">
                  {curriculumSource}
                </span>
              </div>
            )}
          </>
        )}

        {/* Kiến thức tiên quyết (nếu có) */}
        {prerequisites}

        {children}
      </div>
    </header>
  );
};

export default EditorialChapterOpener;
