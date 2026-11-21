import { ArrowRight, BookOpenCheck, PlayCircle } from 'lucide-react';
import { type FC } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';

export interface SubjectMathCardRecentLesson {
  readonly title: string;
  readonly label: string;
  readonly to: string;
  readonly isResuming: boolean;
}

export interface SubjectMathCardProps {
  readonly slug: string;
  readonly code: string;
  readonly title: string;
  readonly color: string;
  readonly pillClass: string;
  readonly chapterCount: number;
  readonly lessonCount: number;
  readonly completedCount: number;
  readonly percent: number;
  readonly overviewHref: string;
  readonly recentLesson: SubjectMathCardRecentLesson | null;
}

/**
 * Đồ họa vector toán học siêu mảnh (SVG thuần, 0% ảnh phong cảnh/kiến trúc)
 * thiết kế riêng theo bản chất học thuật của từng học phần Sư phạm Toán.
 */
const SubjectMathWatermark: FC<{ readonly slug: string; readonly color: string }> = ({
  slug,
  color,
}) => {
  if (slug === 'cau-truc-dai-so') {
    // Biểu đồ giao hoán nhóm/vành & phân hoạch lớp kề (G -> G/K ≅ Im φ)
    return (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        data-testid="subject-svg-cau-truc-dai-so"
        className="pointer-events-none absolute -top-2 -right-2 h-32 w-44 opacity-[0.11] transition-opacity duration-300 group-hover/card:opacity-[0.2] dark:opacity-[0.16] dark:group-hover/card:opacity-[0.26]"
      >
        <circle cx="42" cy="30" r="14" stroke={color} strokeWidth="1.2" />
        <circle cx="136" cy="30" r="14" stroke={color} strokeWidth="1.2" />
        <circle cx="89" cy="92" r="16" stroke={color} strokeWidth="1.2" strokeDasharray="3 3" />
        <path d="M58 30H118" stroke={color} strokeWidth="1.1" />
        <path d="M113 26L119 30L113 34" stroke={color} strokeWidth="1.1" />
        <path d="M51 42L79 77" stroke={color} strokeWidth="1.1" />
        <path d="M74 75L80 78L79 71" stroke={color} strokeWidth="1.1" />
        <path d="M100 78L127 42" stroke={color} strokeWidth="1.1" strokeDasharray="4 3" />
        <path d="M121 44L128 41L126 48" stroke={color} strokeWidth="1.1" />
        <circle cx="42" cy="30" r="2.2" fill={color} />
        <circle cx="136" cy="30" r="2.2" fill={color} />
        <circle cx="89" cy="92" r="2.2" fill={color} />
      </svg>
    );
  }

  if (slug === 'hinh-hoc-affine') {
    // Hệ tọa độ Affine, hai vectơ cơ sở, đường song song & mặt bậc hai
    return (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        data-testid="subject-svg-hinh-hoc-affine"
        className="pointer-events-none absolute -top-2 -right-2 h-32 w-44 opacity-[0.11] transition-opacity duration-300 group-hover/card:opacity-[0.2] dark:opacity-[0.16] dark:group-hover/card:opacity-[0.26]"
      >
        <path d="M26 96L156 96" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
        <path d="M46 106L74 18" stroke={color} strokeWidth="1.1" />
        <path d="M69 24L74 17L76 26" stroke={color} strokeWidth="1.1" />
        <path d="M46 96L142 54" stroke={color} strokeWidth="1.15" />
        <path d="M135 53L143 54L138 60" stroke={color} strokeWidth="1.15" />
        <path d="M64 52L152 14" stroke={color} strokeWidth="0.95" strokeDasharray="4 3" />
        <ellipse
          cx="114"
          cy="60"
          rx="36"
          ry="18"
          transform="rotate(-22 114 60)"
          stroke={color}
          strokeWidth="1.15"
        />
        <circle cx="46" cy="96" r="2.5" fill={color} />
        <circle cx="114" cy="60" r="2.2" fill={color} />
      </svg>
    );
  }

  if (slug === 'giai-tich-ham-mot-bien') {
    // Đường cong hàm liên tục f(x), các dải tổng tích phân Riemann & tiếp tuyến
    return (
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        data-testid="subject-svg-giai-tich-ham-mot-bien"
        className="pointer-events-none absolute -top-2 -right-2 h-32 w-44 opacity-[0.11] transition-opacity duration-300 group-hover/card:opacity-[0.2] dark:opacity-[0.16] dark:group-hover/card:opacity-[0.26]"
      >
        <path d="M18 96H164" stroke={color} strokeWidth="1" />
        <path d="M32 18V106" stroke={color} strokeWidth="1" />
        <rect
          x="48"
          y="64"
          width="16"
          height="32"
          stroke={color}
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />
        <rect
          x="64"
          y="46"
          width="16"
          height="50"
          stroke={color}
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />
        <rect
          x="80"
          y="38"
          width="16"
          height="58"
          stroke={color}
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />
        <rect
          x="96"
          y="48"
          width="16"
          height="48"
          stroke={color}
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />
        <rect
          x="112"
          y="66"
          width="16"
          height="30"
          stroke={color}
          strokeWidth="0.9"
          strokeDasharray="2 2"
        />
        <path
          d="M24 88C46 84 62 32 88 34C112 36 124 82 158 58"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path d="M62 34L114 34" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="88" cy="34" r="2.5" fill={color} />
      </svg>
    );
  }

  // Giáo dục học: 3 vòng tròn đồng tâm cấu trúc sư phạm (Tri thức – Phương pháp – Nhân cách)
  return (
    <svg
      viewBox="0 0 180 120"
      fill="none"
      aria-hidden="true"
      data-testid="subject-svg-giao-duc-hoc"
      className="pointer-events-none absolute -top-2 -right-2 h-32 w-44 opacity-[0.11] transition-opacity duration-300 group-hover/card:opacity-[0.2] dark:opacity-[0.16] dark:group-hover/card:opacity-[0.26]"
    >
      <circle cx="108" cy="58" r="42" stroke={color} strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="108" cy="58" r="28" stroke={color} strokeWidth="1.1" />
      <circle cx="108" cy="58" r="14" stroke={color} strokeWidth="1.2" />
      <path d="M54 58H162" stroke={color} strokeWidth="0.9" strokeDasharray="2 3" />
      <path d="M108 12V104" stroke={color} strokeWidth="0.9" strokeDasharray="2 3" />
      <circle cx="108" cy="58" r="2.8" fill={color} />
      <circle cx="136" cy="58" r="2" fill={color} />
      <circle cx="108" cy="30" r="2" fill={color} />
    </svg>
  );
};

export const SubjectMathCard: FC<SubjectMathCardProps> = ({
  slug,
  code,
  title,
  color,
  pillClass,
  chapterCount,
  lessonCount,
  completedCount,
  percent,
  overviewHref,
  recentLesson,
}) => {
  return (
    <article
      data-subject-card-style="math-vector"
      className="group/card relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] shadow-[0_8px_24px_-16px_rgba(17,26,24,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[0_16px_34px_-18px_rgba(17,26,24,0.2)] dark:bg-[#161E1C]"
    >
      {/* Dải màu định danh siêu mảnh sát mép trên theo học phần */}
      <div
        aria-hidden="true"
        className="h-[3px] w-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Phần thân chính dẫn tới trang tổng quan học phần */}
      <Link
        to={overviewHref}
        data-testid={`dashboard-subject-card-${slug}`}
        className="relative flex flex-1 flex-col justify-between gap-4 p-4 focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none focus-visible:ring-inset"
      >
        <SubjectMathWatermark slug={slug} color={color} />

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-bold tracking-wide',
              pillClass,
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span>{code}</span>
          </span>

          <span className="font-mono text-[11px] font-semibold text-[var(--text-secondary)] tabular-nums">
            {percent}%
          </span>
        </div>

        <div className="relative z-10 space-y-2.5">
          <div>
            <h3 className="font-serif text-[17px] leading-snug font-semibold text-[var(--text-main)] transition-colors group-hover/card:text-[var(--accent-os)]">
              {title}
            </h3>
            <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
              {chapterCount} chương · {completedCount}/{lessonCount} bài
            </p>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${completedCount > 0 ? Math.max(percent, 8) : 4}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      </Link>

      {/* Dải cá nhân hóa đáy thẻ: Bài gần nhất của riêng học phần này */}
      {recentLesson && (
        <Link
          to={recentLesson.to}
          data-testid={`dashboard-subject-recent-${slug}`}
          title={recentLesson.title}
          className="group/recent flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]/80 px-4 py-2.5 text-xs transition-colors hover:bg-[var(--bg-surface)] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none focus-visible:ring-inset"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {recentLesson.isResuming ? (
              <PlayCircle className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden="true" />
            ) : (
              <BookOpenCheck
                className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                aria-hidden="true"
              />
            )}
            <span className="truncate text-[11.5px] text-[var(--text-secondary)] group-hover/recent:text-[var(--text-main)]">
              <strong className="font-mono text-[10.5px] font-semibold text-[var(--text-muted)]">
                {recentLesson.isResuming ? 'Gần nhất' : 'Bắt đầu'}:{' '}
              </strong>
              {recentLesson.label}
            </span>
          </span>

          <ArrowRight
            className="h-3 w-3 shrink-0 text-[var(--text-muted)] transition-transform duration-150 group-hover/recent:translate-x-0.5 group-hover/recent:text-[var(--text-main)]"
            aria-hidden="true"
          />
        </Link>
      )}
    </article>
  );
};

export default SubjectMathCard;
