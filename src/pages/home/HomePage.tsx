import {
  ArrowRight,
  BookMarked,
  Clock,
  Gamepad2,
  Hourglass,
  Landmark,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  HERITAGE_ARTWORKS,
  HeritageFallbackIllustration,
} from '@/components/home/HeritageArtShowcase';
import {
  getLessonById,
  getSubjects,
  getSubjectStats,
  type LessonLocation,
} from '@/content-runtime';
import { getIslandSubjectByIdOrSlug } from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { useLayout } from '@/context/LayoutContext';
import { useLearningStore } from '@/features/learning';
import { getAllGlossaryEntries, InlineMathText, KatexMath } from '@/features/math-glossary';
import { SCHOLARLY_QUOTES } from '@/pages/home/RotatingScholarlyQuote';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

const SUBJECT_ACCENT_MAP: Record<
  string,
  {
    readonly code: string;
    readonly color: string;
    readonly tint: string;
    readonly domainLabel: string;
    readonly pillClass: string;
    readonly focusNote: string;
  }
> = {
  'cau-truc-dai-so': {
    code: 'CTĐS',
    color: '#8C5828',
    tint: '#FDF8F3',
    domainLabel: 'Đại số trừu tượng',
    pillClass:
      'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
    focusNote: 'Nhóm · Vành · Trường & Định lý đẳng cấu',
  },
  'hinh-hoc-affine': {
    code: 'HHAVE',
    color: '#1D4F6E',
    tint: '#F3F8FB',
    domainLabel: 'Hình học & Tuyến tính',
    pillClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    focusNote: 'Không gian Affine · Euclide & Siêu mặt bậc hai',
  },
  'giai-tich-ham-mot-bien': {
    code: 'GTHMB',
    color: '#1B5E4A',
    tint: '#F2F9F6',
    domainLabel: 'Giải tích thực',
    pillClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    focusNote: 'Giới hạn · Vi tích phân Riemann & Chuỗi hàm',
  },
  'giao-duc-hoc': {
    code: 'GDH',
    color: '#8F3D35',
    tint: '#FBF4F3',
    domainLabel: 'Khoa học Giáo dục',
    pillClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    focusNote: 'Lý luận dạy học · Sư phạm & Nghiệp vụ chủ nhiệm',
  },
};

function formatVietnameseToday(): string {
  try {
    const raw = new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date());
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  } catch {
    return 'Hôm nay';
  }
}

function formatMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getDaySeedIndex(length: number): number {
  if (length <= 0) return 0;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.abs(dayOfYear) % length;
}

/**
 * TRANG CHỦ (/): WORKSPACE DASHBOARD — ACADEMIC OS (SỨ BẠCH & THAN ĐÁ)
 * - Thuần túy 1 màn hình tổng quan tải tức thì: Chào mừng + Danh ngôn 1 dòng, Tiếp tục học tập,
 *   Nhịp độ & Pomodoro, Lưới 4 học phần, Di sản trong ngày, Thuật ngữ KaTeX & Sảnh Bida.
 * - Bảo tàng 40 Di sản & Bida 8-Ball WPA đã được quy hoạch riêng sang `/thu-gian`.
 */
export function HomePage() {
  const subjects = getSubjects();
  const allGlossaryEntries = useMemo(() => getAllGlossaryEntries(), []);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const { pomodoro, startPomodoro, pausePomodoro, resumePomodoro, resetPomodoro } = useIsland();
  const { openCommandPalette } = useLayout();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [heritageIndex, setHeritageIndex] = useState(() =>
    getDaySeedIndex(HERITAGE_ARTWORKS.length),
  );
  const [failedHeritageId, setFailedHeritageId] = useState<string | null>(null);
  const [glossaryIndex, setGlossaryIndex] = useState(() =>
    getDaySeedIndex(Math.max(1, allGlossaryEntries.length)),
  );

  const todayFormatted = useMemo(() => formatVietnameseToday(), []);
  const currentQuote = SCHOLARLY_QUOTES[quoteIndex] ?? SCHOLARLY_QUOTES[0]!;
  const currentHeritage = HERITAGE_ARTWORKS[heritageIndex] ?? HERITAGE_ARTWORKS[0]!;
  const currentGlossary = allGlossaryEntries[glossaryIndex] ?? allGlossaryEntries[0];

  const handleNextQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % SCHOLARLY_QUOTES.length);
  }, []);

  const handleShuffleHeritage = useCallback(() => {
    setHeritageIndex((prev) => {
      if (HERITAGE_ARTWORKS.length <= 1) return 0;
      const step = 1 + (Math.floor(Math.random() * (HERITAGE_ARTWORKS.length - 1)) % 7);
      return (prev + step) % HERITAGE_ARTWORKS.length;
    });
  }, []);

  const handleShuffleGlossary = useCallback(() => {
    setGlossaryIndex((prev) => {
      if (allGlossaryEntries.length <= 1) return 0;
      return (prev + 3) % allGlossaryEntries.length;
    });
  }, [allGlossaryEntries.length]);

  // Thống kê tổng & từng môn học
  const { totalLessons, completedCount, totalPercent, subjectCards } = useMemo(() => {
    const cards = subjects.map((subject) => {
      const stats = getSubjectStats(subject);
      let done = 0;
      for (const ch of subject.chapters) {
        for (const ls of ch.lessons) {
          if (completedLessons[ls.id]) done += 1;
        }
      }
      const percent = stats.lessonCount > 0 ? Math.round((done / stats.lessonCount) * 100) : 0;
      const style = SUBJECT_ACCENT_MAP[subject.slug] ?? {
        code: subject.slug.toUpperCase().slice(0, 5),
        color: '#17332C',
        tint: '#F8FAFB',
        domainLabel: 'Học phần',
        pillClass:
          'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]',
        focusNote: subject.description,
      };
      return {
        subject,
        chapterCount: stats.chapterCount,
        lessonCount: stats.lessonCount,
        completedCount: done,
        percent,
        code: style.code,
        color: style.color,
        domainLabel: style.domainLabel,
        pillClass: style.pillClass,
        focusNote: style.focusNote,
      };
    });

    const total = cards.reduce((sum, card) => sum + card.lessonCount, 0);
    const completed = Object.keys(completedLessons).length;
    const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalLessons: total,
      completedCount: completed,
      totalPercent: overallPct,
      subjectCards: cards,
    };
  }, [completedLessons, subjects]);

  // Bài học "Tiếp tục học tập": ưu tiên lịch sử gần nhất, mặc định gợi ý bài mở đầu 1.1
  const resumeLocation = useMemo<LessonLocation | null>(() => {
    if (lastVisitedGlobal?.lessonId) {
      const loc = getLessonById(lastVisitedGlobal.lessonId);
      if (loc) return loc;
    }
    const firstSubject = subjects[0];
    if (!firstSubject) return null;
    const firstChapter = firstSubject.chapters[0];
    const firstLesson = firstChapter?.lessons[0];
    if (!firstChapter || !firstLesson) return null;
    return { subject: firstSubject, chapter: firstChapter, lesson: firstLesson };
  }, [lastVisitedGlobal, subjects]);

  // Tìm bài học kế tiếp ngay sau bài đang đọc dở để hiển thị gợi ý lộ trình
  const nextUpLocation = useMemo<LessonLocation | null>(() => {
    if (!resumeLocation) return null;
    const flat: LessonLocation[] = [];
    for (const ch of resumeLocation.subject.chapters) {
      for (const ls of ch.lessons) {
        flat.push({ subject: resumeLocation.subject, chapter: ch, lesson: ls });
      }
    }
    const idx = flat.findIndex((item) => item.lesson.id === resumeLocation.lesson.id);
    if (idx >= 0 && idx + 1 < flat.length) {
      return flat[idx + 1] ?? null;
    }
    return null;
  }, [resumeLocation]);

  const resumeSubjectMeta = resumeLocation
    ? (getIslandSubjectByIdOrSlug(resumeLocation.subject.slug) ??
      getIslandSubjectByIdOrSlug(resumeLocation.subject.id))
    : null;
  const resumeCardStats = resumeLocation
    ? subjectCards.find((card) => card.subject.slug === resumeLocation.subject.slug)
    : undefined;
  const resumeAccentColor = resumeSubjectMeta?.accentColor ?? resumeCardStats?.color ?? '#8C5828';
  const resumeHref = resumeLocation
    ? ROUTES.lesson(
        resumeLocation.subject.slug,
        resumeLocation.chapter.slug,
        resumeLocation.lesson.slug,
      )
    : ROUTES.learningSpace;

  const isPomodoroActive = pomodoro.status !== 'idle';
  const isPomodoroRunning = pomodoro.status === 'running';
  const isHeritageFallback = failedHeritageId === currentHeritage.id;

  return (
    <div
      data-testid="workspace-dashboard"
      className="min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      <div className="mx-auto max-w-[1240px] space-y-6 px-6 py-7 lg:px-10">
        {/* A. THANH CHÀO MỪNG & DANH NGÔN 1 DÒNG */}
        <header className="flex flex-col justify-between gap-3.5 border-b border-[var(--border-hairline)] pb-5 sm:flex-row sm:items-end">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--accent-os)]"
                  aria-hidden="true"
                />
                <span>Academic OS · Bàn làm việc</span>
              </span>
              <span className="hidden font-mono text-[11px] text-[var(--text-muted)] sm:inline">
                4 học phần · {totalLessons} bài giảng chuẩn hóa
              </span>
            </div>

            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-main)] sm:text-[1.7rem]">
              <span className="sr-only">LEARNING UNIVERSE — </span>
              Không gian Tổng quan
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
              <p data-testid="dashboard-quote-text" className="font-serif text-[13.5px] italic">
                &ldquo;{currentQuote.content}&rdquo; —{' '}
                <span className="font-sans text-xs font-medium text-[var(--text-muted)] not-italic">
                  {currentQuote.author}
                </span>
              </p>
              <button
                type="button"
                data-testid="dashboard-quote-next"
                onClick={handleNextQuote}
                aria-label="Đổi câu danh ngôn học thuật mới"
                title="Đổi câu danh ngôn"
                className="group/quote inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px] font-medium whitespace-nowrap text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--accent-os)]/40 hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] active:scale-95"
              >
                <RefreshCw
                  className="h-3 w-3 transition-transform duration-300 group-hover/quote:rotate-180"
                  aria-hidden="true"
                />
                <span>Câu khác</span>
              </button>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <time
              data-testid="dashboard-date"
              className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-[var(--text-secondary)]"
            >
              {todayFormatted}
            </time>
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--accent-os)]/45 hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] active:scale-[0.98] sm:inline-flex"
            >
              <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              <span>Tra cứu</span>
              <kbd className="py-0.2 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* B. HÀNG BENTO 1 — HÀNH ĐỘNG CHÍNH (7 : 5) */}
        <section
          aria-label="Hành động chính và tiến độ học tập"
          className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        >
          {/* Cột Trái (7 cột) — Thẻ "Tiếp tục học tập" */}
          <div
            data-testid="dashboard-resume-card"
            style={{
              borderLeftWidth: '3px',
              borderLeftColor: resumeAccentColor,
            }}
            className="group/resume relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)] sm:p-6 lg:col-span-7"
          >
            {/* Dải sắc môn học mảnh ở đỉnh thẻ */}
            <div
              aria-hidden="true"
              style={{
                background: `linear-gradient(90deg, ${resumeAccentColor} 0%, transparent 80%)`,
              }}
              className="pointer-events-none absolute top-0 right-0 left-0 h-[2px] opacity-60 transition-opacity duration-200 group-hover/resume:opacity-100"
            />

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: resumeAccentColor }}
                      aria-hidden="true"
                    />
                    <span>ĐANG HỌC DỞ</span>
                  </span>
                  {resumeCardStats && (
                    <span
                      className={cn(
                        'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold',
                        resumeCardStats.pillClass,
                      )}
                    >
                      {resumeCardStats.code}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-[var(--text-muted)] tabular-nums">
                  {resumeLocation && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-0.5 text-[10.5px]">
                      <Clock className="h-3 w-3 text-[var(--text-muted)]" aria-hidden="true" />
                      <span>~{resumeLocation.lesson.estimatedMinutes} phút</span>
                    </span>
                  )}
                  {resumeCardStats && (
                    <span>
                      {resumeCardStats.completedCount}/{resumeCardStats.lessonCount} bài (
                      {resumeCardStats.percent}%)
                    </span>
                  )}
                </div>
              </div>

              {resumeLocation ? (
                <>
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    {resumeLocation.subject.title} · Chương {resumeLocation.chapter.number}:{' '}
                    {resumeLocation.chapter.title}
                  </p>
                  <h2 className="font-serif text-lg leading-snug font-semibold text-[var(--text-main)] sm:text-xl">
                    {resumeLocation.lesson.title}
                  </h2>
                </>
              ) : (
                <h2 className="font-serif text-lg font-semibold text-[var(--text-main)]">
                  Bắt đầu hành trình học tập
                </h2>
              )}

              <div className="pt-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${Math.max(resumeCardStats?.percent ?? 0, resumeCardStats?.completedCount ? 6 : 4)}%`,
                      backgroundColor: resumeAccentColor,
                    }}
                  />
                </div>
              </div>

              {nextUpLocation && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs">
                  <span className="min-w-0 truncate text-[var(--text-secondary)]">
                    <strong className="font-mono text-[10.5px] font-semibold text-[var(--text-muted)] uppercase">
                      Kế tiếp:{' '}
                    </strong>
                    <span className="font-medium text-[var(--text-main)]">
                      Bài {nextUpLocation.chapter.number}.{nextUpLocation.lesson.number} —{' '}
                      {nextUpLocation.lesson.title}
                    </span>
                  </span>
                  <Link
                    to={ROUTES.lesson(
                      nextUpLocation.subject.slug,
                      nextUpLocation.chapter.slug,
                      nextUpLocation.lesson.slug,
                    )}
                    className="shrink-0 font-mono text-[10.5px] font-semibold text-[var(--accent-os)] hover:underline"
                  >
                    Xem →
                  </Link>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Link
                to={resumeHref}
                className="group/cta inline-flex items-center gap-2 rounded-lg bg-[var(--accent-os)] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all duration-150 hover:bg-[var(--accent-primary-hover)] active:scale-[0.98]"
              >
                <span>Vào bài học ngay</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover/cta:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to={ROUTES.learningSpace}
                className="group/space inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)]"
              >
                <span>Mở Không gian học tập</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover/space:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Cột Phải (5 cột) — Thẻ "Nhịp độ & Chỉ số" + Pomodoro nhanh */}
          <div
            data-testid="dashboard-metrics-card"
            className="flex flex-col justify-between gap-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)] lg:col-span-5"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3">
                  <p className="font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Bài hoàn thành
                  </p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[var(--text-main)] tabular-nums">
                    {completedCount}
                    <span className="text-xs font-normal text-[var(--text-muted)]">
                      /{totalLessons}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3">
                  <p className="font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Tiến độ tổng
                  </p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[var(--accent-os)] tabular-nums">
                    {totalPercent}%
                  </p>
                </div>

                <Link
                  to={ROUTES.glossary}
                  className="group rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent-os)]/40"
                >
                  <p className="font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Kho Thuật ngữ
                  </p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[var(--text-main)] tabular-nums group-hover:text-[var(--accent-os)]">
                    {allGlossaryEntries.length}+
                  </p>
                </Link>
              </div>

              {/* Thanh phân bổ quy mô 4 học phần */}
              <div className="space-y-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-2">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                  {subjectCards.map((card) => (
                    <div
                      key={card.subject.slug}
                      title={`${card.subject.title}: ${card.lessonCount} bài`}
                      style={{
                        width: `${totalLessons > 0 ? (card.lessonCount / totalLessons) * 100 : 25}%`,
                        backgroundColor: card.color,
                      }}
                      className="h-full border-r border-[var(--bg-workspace)] last:border-r-0"
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 font-mono text-[10px] text-[var(--text-muted)]">
                  {subjectCards.map((card) => (
                    <span key={card.subject.slug} className="inline-flex items-center gap-1">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: card.color }}
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-[var(--text-secondary)]">
                        {card.code}
                      </span>
                      <span className="tabular-nums">
                        {card.completedCount}/{card.lessonCount}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              data-testid="dashboard-pomodoro-bar"
              className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <Hourglass
                  className={cn(
                    'h-4 w-4 shrink-0 text-[var(--accent-heritage)]',
                    isPomodoroRunning && 'animate-pulse',
                  )}
                  aria-hidden="true"
                />
                <div className="leading-tight">
                  <p className="text-xs font-medium text-[var(--text-main)]">
                    Nhịp học tập Pomodoro
                  </p>
                  <p className="font-mono text-[11px] font-semibold text-[var(--accent-heritage)] tabular-nums">
                    {isPomodoroActive ? formatMmSs(pomodoro.remainingSeconds) : '25:00'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {isPomodoroActive ? (
                  <>
                    <button
                      type="button"
                      onClick={isPomodoroRunning ? pausePomodoro : resumePomodoro}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[var(--accent-os)] px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 active:scale-95"
                    >
                      {isPomodoroRunning ? (
                        <>
                          <Pause className="h-3 w-3" aria-hidden="true" />
                          <span>Tạm dừng</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" aria-hidden="true" />
                          <span>Tiếp tục</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetPomodoro}
                      aria-label="Đặt lại phiên tập trung"
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startPomodoro(45, 'Chuyên sâu')}
                      title="Phiên đọc sâu 45 phút"
                      className="hidden cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1.5 font-mono text-[10.5px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)] sm:inline-flex"
                    >
                      45p
                    </button>
                    <button
                      type="button"
                      data-testid="dashboard-pomodoro-start"
                      onClick={() => startPomodoro(25, 'Tiêu chuẩn')}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-all duration-150 hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)] active:scale-[0.98]"
                    >
                      <Play className="h-3 w-3" aria-hidden="true" />
                      <span>Bắt đầu phiên tập trung</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* C. HÀNG BENTO 2 — LƯỚI 4 HỌC PHẦN (CTĐS · HHAVE · GTHMB · GDH) */}
        <section aria-label="Bốn học phần trọng tâm" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Học phần trọng tâm ({subjectCards.length})
            </h2>
            <Link
              to={ROUTES.learningSpace}
              className="group/all inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)]"
            >
              <span>Xem tất cả &amp; Bản đồ 3D</span>
              <ArrowRight
                className="h-3 w-3 transition-transform duration-150 group-hover/all:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div
            data-testid="dashboard-subjects-grid"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {subjectCards.map((item) => (
              <Link
                key={item.subject.slug}
                to={ROUTES.subjectOverview(item.subject.slug)}
                data-testid={`dashboard-subject-card-${item.subject.slug}`}
                className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4.5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-workspace)] hover:shadow-[var(--shadow-bento-hover)]"
              >
                {/* Dải màu nhận diện môn học trên đỉnh thẻ */}
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: item.color }}
                  className="pointer-events-none absolute top-0 right-0 left-0 h-[2px] opacity-65 transition-opacity duration-200 group-hover:opacity-100"
                />

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-bold',
                        item.pillClass,
                      )}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span>{item.code}</span>
                    </span>
                    <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                      {item.domainLabel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-[16px] leading-snug font-semibold text-[var(--text-main)] transition-colors group-hover:text-[var(--accent-os)]">
                      {item.subject.title}
                    </h3>
                    <p className="line-clamp-1 text-xs text-[var(--text-secondary)]">
                      {item.focusNote}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[var(--border-hairline)] pt-2.5">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                    <span>
                      {item.chapterCount} chương · {item.lessonCount} bài
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-main)]">
                      <span>{item.percent}%</span>
                      <ArrowRight
                        className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${Math.max(item.percent, item.completedCount > 0 ? 8 : 0)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* D. HÀNG BENTO 3 — VĂN HIẾN & THƯ GIÃN (7 : 5) */}
        <section
          aria-label="Di sản học thuật, thuật ngữ và giải lao"
          className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        >
          {/* Cột Trái (7 cột) — "Di sản trong ngày" */}
          <div
            data-testid="dashboard-heritage-card"
            className="group/heritage flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)] lg:col-span-7"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  <Landmark
                    className="h-3.5 w-3.5 text-[var(--accent-heritage)]"
                    aria-hidden="true"
                  />
                  <span>Di sản trong ngày</span>
                </span>
                <span className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--accent-heritage)] tabular-nums">
                  #{String(heritageIndex + 1).padStart(2, '0')} / {HERITAGE_ARTWORKS.length}
                </span>
              </div>

              <button
                type="button"
                data-testid="dashboard-heritage-shuffle"
                onClick={handleShuffleHeritage}
                aria-label="Đổi tác phẩm di sản ngẫu nhiên"
                title="Đổi tác phẩm khác"
                className="group/hbtn inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--text-main)] active:scale-95"
              >
                <RefreshCw
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover/hbtn:rotate-180"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-shell)] sm:w-40">
                {isHeritageFallback ? (
                  <HeritageFallbackIllustration artwork={currentHeritage} compact />
                ) : (
                  <img
                    src={currentHeritage.imageSrc}
                    alt={currentHeritage.alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailedHeritageId(currentHeritage.id)}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/heritage:scale-105"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">
                  {currentHeritage.yearOrEra} · {currentHeritage.artistOrOrigin}
                </p>
                <h3
                  title={currentHeritage.title}
                  className="truncate font-serif text-base font-semibold text-[var(--text-main)]"
                >
                  {currentHeritage.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {currentHeritage.coreAcademicValue}
                </p>
                <div className="pt-1">
                  <Link
                    to={ROUTES.sanctuaryTab('di-san')}
                    className="group/hlink inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-heritage)] transition-opacity hover:opacity-85"
                  >
                    <span>Mở phòng trưng bày 40 Di sản</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-150 group-hover/hlink:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Phải (5 cột) — "Ôn nhanh & Giải lao" */}
          <div className="flex flex-col gap-3.5 lg:col-span-5">
            {currentGlossary && (
              <div
                data-testid="dashboard-glossary-card"
                className="flex flex-1 flex-col justify-between gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    <BookMarked
                      className="h-3.5 w-3.5 text-[var(--accent-os)]"
                      aria-hidden="true"
                    />
                    <span>Thuật ngữ ngẫu nhiên</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleShuffleGlossary}
                    aria-label="Đổi thuật ngữ ngẫu nhiên"
                    className="group/gbtn inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)] active:scale-95"
                  >
                    <RefreshCw
                      className="h-3 w-3 transition-transform duration-300 group-hover/gbtn:rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <Link
                  to={`${ROUTES.glossary}?q=${encodeURIComponent(currentGlossary.nameVi)}`}
                  className="group flex flex-col gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-2.5 transition-colors hover:border-[var(--accent-os)]/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
                        {currentGlossary.nameVi}
                      </p>
                      <p className="truncate text-[11px] text-[var(--text-muted)]">
                        {currentGlossary.nameEn}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 text-xs text-[var(--text-main)]">
                      <KatexMath math={currentGlossary.formula || currentGlossary.symbol} />
                    </span>
                  </div>
                  {currentGlossary.brief && (
                    <p className="line-clamp-1 border-t border-[var(--border-hairline)] pt-1.5 text-[11px] text-[var(--text-secondary)]">
                      <InlineMathText text={currentGlossary.brief} />
                    </p>
                  )}
                </Link>
              </div>
            )}

            <div
              data-testid="dashboard-billiards-card"
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--accent-heritage)] shadow-2xs">
                  <Gamepad2 className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-[var(--text-main)]">
                      Sảnh Bida 8-Ball WPA
                    </p>
                    <span className="py-0.2 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 font-mono text-[9.5px] font-semibold text-[var(--accent-heritage)]">
                      120FPS
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    Nghỉ giải lao 5 phút · Bàn 15 bi chuẩn WPA
                  </p>
                </div>
              </div>
              <Link
                to={ROUTES.sanctuaryTab('bida')}
                className="group/bida inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-all duration-150 hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)] active:scale-[0.98]"
              >
                <span>Mở bàn</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover/bida:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
