import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  Check,
  Compass,
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
import { AtmosphericCanopy } from '@/components/atmosphere/AtmosphericCanopy';
import {
  HERITAGE_ARTWORKS,
  HeritageFallbackIllustration,
} from '@/components/home/HeritageArtShowcase';
import { getSubjectPortalAsset, SANCTUARY_BANNER_ASSET } from '@/config/atmosphereAssets';
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

interface SubjectPortalStyle {
  readonly code: string;
  readonly color: string;
  readonly pillClass: string;
}

const SUBJECT_STYLE_MAP: Record<string, SubjectPortalStyle> = {
  'cau-truc-dai-so': {
    code: 'CTĐS',
    color: '#8C5828',
    pillClass:
      'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
  },
  'hinh-hoc-affine': {
    code: 'HHAVE',
    color: '#1D4F6E',
    pillClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
  },
  'giai-tich-ham-mot-bien': {
    code: 'GTHMB',
    color: '#1B5E4A',
    pillClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
  },
  'giao-duc-hoc': {
    code: 'GDH',
    color: '#8F3D35',
    pillClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
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
 * TRANG TỔNG QUAN (/): SPATIAL EDITORIAL PORTAL (SPACES THAT INSPIRE × POMAII)
 * - Khối A: Khung Hero Kiến trúc – Thiên nhiên tràn viền (ảnh chụp thật 0% AI + Floating Action Pill).
 * - Khối B: Hàng 3 thẻ tương phản chất liệu (Sứ Trắng | Kính Mờ xuyên ảnh thật | Xanh Than Đặc) gác trực tiếp lên chân ảnh Hero.
 * - Khối C: 4 Thẻ Cổng Học Phần tràn viền (Full-Bleed Subject Portal Cards).
 * - Khối D: Khối Biên tập Văn hiến (Editorial Overlap Card + Thuật ngữ KaTeX) & Banner đáy Sảnh Thư Giãn Xanh Rừng.
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
  const [failedPortals, setFailedPortals] = useState<Record<string, boolean>>({});
  const [sanctuaryImgFailed, setSanctuaryImgFailed] = useState(false);
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
      const style = SUBJECT_STYLE_MAP[subject.slug] ?? {
        code: subject.slug.toUpperCase().slice(0, 5),
        color: '#17332C',
        pillClass:
          'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]',
      };
      const portalAsset = getSubjectPortalAsset(subject.slug);
      return {
        subject,
        chapterCount: stats.chapterCount,
        lessonCount: stats.lessonCount,
        completedCount: done,
        percent,
        code: style.code,
        color: style.color,
        pillClass: style.pillClass,
        portalAsset,
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
  const heritageNumberLabel = String(heritageIndex + 1).padStart(2, '0');

  return (
    <div
      data-testid="workspace-dashboard"
      className="min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      <div className="mx-auto max-w-[1320px] space-y-8 px-4 py-5 sm:px-6 lg:px-8">
        {/* ========================================================================
            KHỐI A & KHỐI B: KHUNG HERO TRÀN VIỀN + HÀNG 3 THẺ TƯƠNG PHẢN CHẤT LIỆU
            ======================================================================== */}
        <div className="relative">
          {/* KHỐI A — KHUNG HERO KIẾN TRÚC – THIÊN NHIÊN TRÀN VIỀN (Spatial Hero Frame) */}
          <section
            aria-label="Không gian Tổng quan"
            data-testid="spatial-hero-frame"
            className="relative overflow-hidden rounded-[28px] border border-[var(--border-hairline)] shadow-[0_24px_60px_-24px_rgba(17,26,24,0.18)]"
          >
            <AtmosphericCanopy
              variant="dashboard"
              fullBleedPhoto
              enableCelestialOverlay={false}
              enableParallax
              testId="dashboard-atmospheric-canopy"
              className="min-h-[320px] md:min-h-[380px] lg:min-h-[450px]"
            >
              <div className="flex flex-col justify-between gap-5 p-6 pb-16 sm:p-8 sm:pb-20 md:pb-28 lg:p-12 lg:pb-36">
                {/* Hàng trên gọn: Nhãn ngữ cảnh kính mờ + ngày hiện tại (không lặp nút ⌘K) */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-white/95 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF6A]" aria-hidden="true" />
                    <span>Learning Universe · Academic OS</span>
                  </span>
                  <time
                    data-testid="dashboard-date"
                    className="rounded-full border border-white/20 bg-black/25 px-3 py-1 font-mono text-[11px] whitespace-nowrap text-white/85 backdrop-blur-md"
                  >
                    {todayFormatted}
                  </time>
                </div>

                {/* Khối tiêu đề Serif cỡ lớn & Danh ngôn học thuật sát gọn */}
                <div className="max-w-2xl space-y-3">
                  <h1 className="font-serif text-3xl leading-[1.12] font-semibold tracking-tight text-white drop-shadow-xs sm:text-4xl lg:text-[46px]">
                    <span className="sr-only">LEARNING UNIVERSE — </span>
                    Không gian Tổng quan
                  </h1>

                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      data-testid="dashboard-quote-text"
                      className="font-serif text-[14.5px] leading-relaxed text-white/85 italic sm:text-[15.5px]"
                    >
                      &ldquo;{currentQuote.content}&rdquo; —{' '}
                      <span className="font-sans text-xs font-medium text-white/70 not-italic">
                        {currentQuote.author}
                      </span>
                    </p>
                    <button
                      type="button"
                      data-testid="dashboard-quote-next"
                      onClick={handleNextQuote}
                      aria-label="Đổi câu danh ngôn học thuật mới"
                      title="Đổi câu danh ngôn"
                      className="group/quote inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-white/25 bg-black/30 px-2.5 py-0.5 font-mono text-[10.5px] font-medium whitespace-nowrap text-white/90 backdrop-blur-md transition-all duration-150 hover:bg-black/45 active:scale-95"
                    >
                      <RefreshCw
                        className="h-3 w-3 transition-transform duration-300 group-hover/quote:rotate-180"
                        aria-hidden="true"
                      />
                      <span>Câu khác</span>
                    </button>
                  </div>
                </div>

                {/* Thanh Tìm kiếm & Lối tắt Dạng Viên Thuốc (Floating Action Pill — Pomaii/Poulls) */}
                <div
                  data-testid="hero-floating-pill"
                  className="flex w-full max-w-xl items-center justify-between gap-2 rounded-full border border-white/55 bg-white/90 p-1.5 pl-4 shadow-lg backdrop-blur-md dark:border-white/15 dark:bg-[#121716]/85"
                >
                  <button
                    type="button"
                    onClick={openCommandPalette}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-1.5 text-left text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)] sm:text-[13px]"
                  >
                    <Search
                      className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      Tìm nhanh bài giảng, định lý, thuật ngữ (⌘K)...
                    </span>
                  </button>
                  <Link
                    to={resumeHref}
                    className="group/cta inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#17332C] px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#21463C] active:scale-[0.98] sm:px-4"
                  >
                    <span>Vào bài học ngay</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-150 group-hover/cta:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </AtmosphericCanopy>
          </section>

          {/* KHỐI B — HÀNG 3 THẺ TƯƠNG PHẢN CHẤT LIỆU GÁC TRỰC TIẾP LÊN CHÂN ẢNH HERO */}
          <section
            aria-label="Hành động chính, tiến độ và điều phối nhanh"
            data-testid="three-material-dock"
            className="relative z-20 -mt-10 grid grid-cols-1 gap-4 px-3 sm:px-6 md:-mt-20 lg:-mt-28 lg:grid-cols-12 lg:px-8"
          >
            {/* THẺ 1 (5/12) — CHẤT LIỆU SỨ TRẮNG SẠCH: Đang học dở (không còn hộp xám thước đo cũ) */}
            <div
              data-testid="dashboard-resume-card"
              data-material="ceramic"
              className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-5 shadow-[0_18px_40px_-15px_rgba(17,26,24,0.12)] lg:col-span-5 dark:bg-[#161E1C]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
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
                        'rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums',
                        resumeCardStats.pillClass,
                      )}
                    >
                      {resumeCardStats.code} · {resumeCardStats.percent}%
                    </span>
                  )}
                </div>

                {resumeLocation ? (
                  <div className="space-y-1">
                    <p className="truncate text-xs font-medium text-[var(--text-secondary)]">
                      {resumeLocation.subject.title} · Chương {resumeLocation.chapter.number}:{' '}
                      {resumeLocation.chapter.title}
                    </p>
                    <h2 className="font-serif text-lg leading-snug font-semibold text-[var(--text-main)]">
                      {resumeLocation.lesson.title}
                    </h2>
                  </div>
                ) : (
                  <h2 className="font-serif text-lg font-semibold text-[var(--text-main)]">
                    Bắt đầu hành trình học tập
                  </h2>
                )}

                {/* Hàng nút chọn nhanh các bài trong chương */}
                {resumeLocation && (
                  <div
                    className="flex flex-wrap items-center gap-1.5 pt-0.5"
                    aria-label="Các bài trong chương hiện tại"
                  >
                    {resumeLocation.chapter.lessons.slice(0, 6).map((ls) => {
                      const isCurrent = ls.id === resumeLocation.lesson.id;
                      const isDone = Boolean(completedLessons[ls.id]);
                      return (
                        <Link
                          key={ls.id}
                          to={ROUTES.lesson(
                            resumeLocation.subject.slug,
                            resumeLocation.chapter.slug,
                            ls.slug,
                          )}
                          title={ls.title}
                          className={cn(
                            'inline-flex h-6 items-center gap-1 rounded-md border px-2 font-mono text-[10.5px] font-semibold transition-all duration-150',
                            isCurrent
                              ? 'border-transparent text-white shadow-2xs'
                              : isDone
                                ? 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent-os)]'
                                : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]',
                          )}
                          style={isCurrent ? { backgroundColor: resumeAccentColor } : undefined}
                        >
                          {isDone && !isCurrent && (
                            <Check className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                          )}
                          <span>
                            {resumeLocation.chapter.number}.{ls.number}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border-hairline)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${Math.max(resumeCardStats?.percent ?? 0, resumeCardStats?.completedCount ? 8 : 4)}%`,
                      backgroundColor: resumeAccentColor,
                    }}
                  />
                </div>
                <Link
                  to={resumeHref}
                  className="group/read inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent-os)] px-3.5 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-[var(--accent-primary-hover)] active:scale-[0.98]"
                >
                  <span>Tiếp tục đọc</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover/read:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* THẺ 2 (4/12) — CHẤT LIỆU KÍNH MỜ XUYÊN ẢNH THẬT: Nhịp độ, Chỉ số & Pomodoro */}
            <div
              data-testid="dashboard-metrics-card"
              data-material="frosted-glass"
              className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-white/65 bg-white/68 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_40px_-15px_rgba(17,26,24,0.14)] backdrop-blur-xl backdrop-saturate-150 lg:col-span-4 dark:border-white/12 dark:bg-[#121716]/72"
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/55 bg-white/60 p-2.5 dark:border-white/10 dark:bg-[#181F1D]/72">
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Bài hoàn thành
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-[var(--text-main)] tabular-nums">
                    {completedCount}
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">
                      /{totalLessons}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-white/55 bg-white/60 p-2.5 dark:border-white/10 dark:bg-[#181F1D]/72">
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Tiến độ tổng
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-[var(--accent-os)] tabular-nums">
                    {totalPercent}%
                  </p>
                </div>

                <Link
                  to={ROUTES.glossary}
                  className="group rounded-xl border border-white/55 bg-white/60 p-2.5 transition-colors hover:border-[var(--accent-os)]/50 dark:border-white/10 dark:bg-[#181F1D]/72"
                >
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Kho Thuật ngữ
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-[var(--text-main)] tabular-nums group-hover:text-[var(--accent-os)]">
                    {allGlossaryEntries.length}+
                  </p>
                </Link>
              </div>

              {/* Thanh khởi động nhanh Pomodoro nối thẳng state Pomodoro hiện có */}
              <div
                data-testid="dashboard-pomodoro-bar"
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/55 bg-white/60 px-3 py-2.5 dark:border-white/10 dark:bg-[#181F1D]/72"
              >
                <div className="flex items-center gap-2">
                  <Hourglass
                    className={cn(
                      'h-4 w-4 shrink-0 text-[var(--accent-heritage)]',
                      isPomodoroRunning && 'animate-pulse',
                    )}
                    aria-hidden="true"
                  />
                  <div className="leading-tight">
                    <p className="text-[11.5px] font-semibold text-[var(--text-main)]">Pomodoro</p>
                    <p className="font-mono text-[11px] font-bold text-[var(--accent-heritage)] tabular-nums">
                      {isPomodoroActive ? formatMmSs(pomodoro.remainingSeconds) : '25:00'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isPomodoroActive ? (
                    <>
                      <button
                        type="button"
                        onClick={isPomodoroRunning ? pausePomodoro : resumePomodoro}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 active:scale-95"
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
                        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      data-testid="dashboard-pomodoro-start"
                      onClick={() => startPomodoro(25, 'Tiêu chuẩn')}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)] active:scale-[0.98]"
                    >
                      <Play className="h-3 w-3" aria-hidden="true" />
                      <span>Tập trung</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* THẺ 3 (3/12) — CHẤT LIỆU XANH THAN ĐẶC: Điểm neo điều phối nhanh */}
            <div
              data-testid="dashboard-quick-hub-card"
              data-material="deep-emerald"
              className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#17332C] p-5 text-white shadow-[0_18px_40px_-15px_rgba(17,26,24,0.22)] lg:col-span-3 dark:bg-[#1F443A]"
            >
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#D4AF6A] uppercase">
                  ĐIỀU PHỐI NHANH
                </p>
                <h2 className="font-serif text-lg leading-snug font-semibold text-white">
                  Bắt đầu phiên học sâu
                </h2>
              </div>

              <div className="space-y-2">
                <Link
                  to={ROUTES.learningSpace}
                  className="group/q1 flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-medium text-white/95 transition-colors hover:bg-white/16"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Compass className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" aria-hidden="true" />
                    <span className="truncate">Không gian học tập</span>
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-white/75 transition-transform duration-150 group-hover/q1:translate-x-0.5 group-hover/q1:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={ROUTES.sanctuaryTab('bida')}
                  className="group/q2 flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs font-medium text-white/95 transition-colors hover:bg-white/16"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Gamepad2 className="h-3.5 w-3.5 shrink-0 text-[#D4AF6A]" aria-hidden="true" />
                    <span className="truncate">Sảnh Bida 8-Ball</span>
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-white/75 transition-transform duration-150 group-hover/q2:translate-x-0.5 group-hover/q2:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================================
            KHỐI C — 4 THẺ CỔNG HỌC PHẦN TRÀN VIỀN (Full-Bleed Subject Portal Cards)
            ======================================================================== */}
        <section aria-label="Bốn học phần trọng tâm" className="space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Học phần trọng tâm
            </h2>
            <Link
              to={ROUTES.learningSpace}
              className="group/all inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)]"
            >
              <span>Mở bản đồ đầy đủ</span>
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
            {subjectCards.map((item) => {
              const portal = item.portalAsset;
              const isPortalFailed = Boolean(failedPortals[item.subject.slug]);
              return (
                <Link
                  key={item.subject.slug}
                  to={ROUTES.subjectOverview(item.subject.slug)}
                  data-testid={`dashboard-subject-card-${item.subject.slug}`}
                  style={{
                    backgroundImage:
                      portal?.fallbackGradient ??
                      'linear-gradient(135deg, #17332C 0%, #0D1A17 100%)',
                  }}
                  className="group relative flex h-[240px] min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-hairline)] p-4 shadow-xs transition-shadow duration-200 hover:shadow-lg"
                >
                  {/* Ảnh chụp thật tràn viền phóng nhẹ khi hover */}
                  {portal && !isPortalFailed && (
                    <img
                      src={portal.src}
                      alt={portal.alt}
                      loading="lazy"
                      decoding="async"
                      onError={() =>
                        setFailedPortals((prev) => ({ ...prev, [item.subject.slug]: true }))
                      }
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  )}

                  {/* Lớp phủ tối dịu từ đáy lên bảo đảm tương phản chữ trắng > 7:1 */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1A17]/90 via-[#0D1A17]/35 to-[#0D1A17]/10"
                  />

                  {/* Góc trên: Pill mã môn kính mờ + Badge % tiến độ */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur-md">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span>{item.code}</span>
                    </span>
                    <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 font-mono text-[11px] font-semibold text-white tabular-nums backdrop-blur-md">
                      {item.percent}%
                    </span>
                  </div>

                  {/* Đáy thẻ: Tên học phần Serif trắng + số chương/bài */}
                  <div className="relative z-10 space-y-1 pb-1.5">
                    <h3 className="drop-shadow-2xs font-serif text-lg leading-snug font-medium text-white">
                      {item.subject.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-white/75">
                      <span className="font-mono text-[11px] tabular-nums">
                        {item.chapterCount} chương · {item.lessonCount} bài
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-white/80 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Thanh tiến độ siêu mảnh (h-1) sắc nhấn từng môn chạy sát đáy thẻ */}
                  <div
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 z-10 h-1 bg-white/15"
                  >
                    <div
                      className="h-full transition-[width] duration-300"
                      style={{
                        width: `${item.completedCount > 0 ? Math.max(item.percent, 8) : 6}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ========================================================================
            KHỐI D — BIÊN TẬP VĂN HIẾN & BANNER ĐÁY SẢNH THƯ GIÃN XANH RỪNG
            ======================================================================== */}
        <section aria-label="Di sản học thuật, thuật ngữ và Sảnh Thư Giãn" className="space-y-5">
          {/* Hàng 1: Di sản trong ngày (Editorial Overlap Card 7/12) + Thuật ngữ KaTeX (5/12) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Cột Trái (7/12) — Di sản trong ngày (Editorial Overlap Card) */}
            <div
              data-testid="dashboard-heritage-card"
              className="group/heritage flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 lg:col-span-7"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  <Landmark
                    className="h-3.5 w-3.5 text-[var(--accent-heritage)]"
                    aria-hidden="true"
                  />
                  <span>Di sản trong ngày</span>
                </span>

                <button
                  type="button"
                  data-testid="dashboard-heritage-shuffle"
                  onClick={handleShuffleHeritage}
                  aria-label="Đổi tác phẩm di sản ngẫu nhiên"
                  title="Đổi tác phẩm khác"
                  className="group/hbtn inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--text-main)] active:scale-95"
                >
                  <RefreshCw
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover/hbtn:rotate-180"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Ảnh Di sản sắc nét + Thẻ badge nhỏ chồng góc dưới (Blockfolio Overlap) */}
                <div className="relative shrink-0 pb-2 sm:w-48">
                  <div className="h-36 w-full overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-shell)]">
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
                  <div
                    data-testid="heritage-overlap-badge"
                    className="absolute right-2.5 bottom-0 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--text-main)] shadow-md"
                  >
                    <span className="text-[var(--accent-heritage)] tabular-nums">
                      {heritageNumberLabel}/{HERITAGE_ARTWORKS.length}
                    </span>
                    <span aria-hidden="true" className="text-[var(--border-strong)]">
                      ·
                    </span>
                    <span className="max-w-[110px] truncate text-[var(--text-secondary)]">
                      {currentHeritage.yearOrEra}
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="truncate font-mono text-[10.5px] text-[var(--text-muted)]">
                      {currentHeritage.artistOrOrigin}
                    </p>
                    <h3
                      title={currentHeritage.title}
                      className="truncate font-serif text-lg font-semibold text-[var(--text-main)]"
                    >
                      {currentHeritage.title}
                    </h3>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {currentHeritage.coreAcademicValue}
                  </p>
                  <div className="pt-1">
                    <Link
                      to={ROUTES.sanctuaryTab('di-san')}
                      className="group/hlink inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-heritage)] transition-opacity hover:opacity-85"
                    >
                      <span>Xem phòng trưng bày 40 Di sản</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-150 group-hover/hlink:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột Phải (5/12) — Thuật ngữ ngẫu nhiên KaTeX */}
            {currentGlossary && (
              <div
                data-testid="dashboard-glossary-card"
                className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 lg:col-span-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
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
                    className="group/gbtn inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)] active:scale-95"
                  >
                    <RefreshCw
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover/gbtn:rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <Link
                  to={`${ROUTES.glossary}?q=${encodeURIComponent(currentGlossary.nameVi)}`}
                  className="group flex flex-1 flex-col justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 transition-colors hover:border-[var(--accent-os)]/45"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
                        {currentGlossary.nameVi}
                      </p>
                      <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">
                        {currentGlossary.nameEn}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-sm text-[var(--text-main)]">
                      <KatexMath math={currentGlossary.formula || currentGlossary.symbol} />
                    </span>
                  </div>

                  {currentGlossary.brief && (
                    <p className="line-clamp-2 border-t border-[var(--border-hairline)] pt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      <InlineMathText text={currentGlossary.brief} />
                    </p>
                  )}
                </Link>

                <div className="flex justify-end">
                  <Link
                    to={ROUTES.glossary}
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent-os)] hover:underline"
                  >
                    <span>Tra cứu trên Kho Thuật ngữ</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Hàng 2 — Banner Đáy Sảnh Thư Giãn Xanh Rừng (Pomaii Deep Emerald Sanctuary Banner) */}
          <div
            data-testid="dashboard-sanctuary-banner"
            style={{ backgroundImage: SANCTUARY_BANNER_ASSET.fallbackGradient }}
            className="relative min-h-[180px] overflow-hidden rounded-[24px] border border-white/10 bg-[#17332C] text-white shadow-[0_20px_50px_-20px_rgba(17,26,24,0.28)]"
          >
            {/* Ảnh thiên nhiên tĩnh lặng bên trái hòa tan ngang mượt vào nền đặc #17332C bên phải */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-[52%]"
            >
              {!sanctuaryImgFailed && (
                <img
                  src={SANCTUARY_BANNER_ASSET.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  onError={() => setSanctuaryImgFailed(true)}
                  className="h-full w-full object-cover opacity-35 md:opacity-90"
                />
              )}
              <div
                style={{
                  background:
                    'linear-gradient(90deg, rgba(23, 51, 44, 0.25) 0%, rgba(23, 51, 44, 0.72) 62%, #17332C 100%)',
                }}
                className="absolute inset-0"
              />
            </div>

            <div className="relative z-10 flex flex-col justify-between gap-5 p-6 sm:p-8 md:pl-[44%] lg:flex-row lg:items-center">
              <div className="max-w-xl space-y-2">
                <p className="font-mono text-[10.5px] font-semibold tracking-[0.16em] text-[#D4AF6A] uppercase">
                  SẢNH THƯ GIÃN · POMODORO BREAK
                </p>
                <h2 className="font-serif text-xl leading-snug font-semibold text-white sm:text-2xl">
                  Nghỉ nhịp 5 phút giữa các phiên chứng minh
                </h2>
                <p className="text-xs leading-relaxed text-white/80 sm:text-[13px]">
                  Thư giãn nhẹ giữa các khối lý thuyết với Bảo tàng 40 Di sản Học thuật và bàn Bida
                  8-Ball vật lý 120fps chuẩn luật WPA.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                <Link
                  to={ROUTES.sanctuaryTab('bida')}
                  className="group/sbida inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#17332C] shadow-sm transition-all duration-150 hover:bg-[#F3F5F6] active:scale-[0.98]"
                >
                  <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mở bàn Bida 8-Ball</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover/sbida:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={ROUTES.sanctuaryTab('di-san')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <Landmark className="h-3.5 w-3.5 text-[#D4AF6A]" aria-hidden="true" />
                  <span>Bảo tàng 40 Di sản</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
