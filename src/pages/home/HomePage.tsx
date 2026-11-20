import {
  ArrowRight,
  BookMarked,
  Gamepad2,
  Hourglass,
  Landmark,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { HERITAGE_ARTWORKS } from '@/components/home/HeritageArtShowcase';
import { HeritageExhibitionPavilion } from '@/components/home/HeritageExhibitionPavilion';
import { getLessonById, getSubjects, getSubjectStats, type LessonLocation } from '@/content-runtime';
import { getIslandSubjectByIdOrSlug } from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { useLearningStore } from '@/features/learning';
import { getAllGlossaryEntries, KatexMath } from '@/features/math-glossary';
import { SCHOLARLY_QUOTES } from '@/pages/home/RotatingScholarlyQuote';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

const MineralBilliardsStage = lazy(() =>
  import('@/components/home/MineralBilliardsStage').then((mod) => ({
    default: mod.MineralBilliardsStage,
  })),
);

const SUBJECT_ACCENT_MAP: Record<
  string,
  { readonly code: string; readonly color: string; readonly tint: string }
> = {
  'cau-truc-dai-so': { code: 'CTĐS', color: '#8C5828', tint: '#FDF8F3' },
  'hinh-hoc-affine': { code: 'HHAVE', color: '#1D4F6E', tint: '#F3F8FB' },
  'giai-tich-ham-mot-bien': { code: 'GTHMB', color: '#1B5E4A', tint: '#F2F9F6' },
  'giao-duc-hoc': { code: 'GDH', color: '#8F3D35', tint: '#FBF4F3' },
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

function BilliardsStageSkeleton() {
  return (
    <section
      id="ban-bida-khoang-thach"
      aria-label="Đang tải Sân khấu Bida 8 Ball Pool Khoáng Thạch"
      data-testid="billiards-stage-skeleton"
      className="relative scroll-mt-16 border-t border-[var(--border-hairline)] bg-[var(--bg-shell)]"
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 py-10 lg:px-10">
        <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]">
          <span className="font-mono text-xs tracking-wider text-[var(--text-muted)] uppercase">
            Đang chuẩn bị bàn Bida Khoáng Thạch 2.5D…
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * TRANG CHỦ (/): WORKSPACE DASHBOARD — ACADEMIC OS (SỨ BẠCH & THAN ĐÁ)
 * - 1 màn hình tổng quan vào việc ngay: Chào mừng + Danh ngôn 1 dòng, Tiếp tục học tập,
 *   Nhịp độ & Pomodoro, Lưới 4 học phần, Di sản trong ngày, Thuật ngữ KaTeX & Sảnh Bida.
 * - Phía dưới là khu vực chuyển tiếp Sảnh Thư giãn (40 Di sản & Bida 8-Ball) trước khi tách sang /thu-gian ở Giai đoạn 4.
 */
export function HomePage() {
  const prefersReducedMotion = useReducedMotion();
  const subjects = getSubjects();
  const allGlossaryEntries = useMemo(() => getAllGlossaryEntries(), []);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const { pomodoro, startPomodoro, pausePomodoro, resumePomodoro, resetPomodoro } = useIsland();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [heritageIndex, setHeritageIndex] = useState(() =>
    getDaySeedIndex(HERITAGE_ARTWORKS.length),
  );
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

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const target = document.getElementById(sectionId);
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    },
    [prefersReducedMotion],
  );

  // Thống kê tổng & từng môn học
  const { totalLessons, completedCount, totalPercent, subjectCards } = useMemo(() => {
    let total = 0;
    const cards = subjects.map((subject) => {
      const stats = getSubjectStats(subject);
      total += stats.lessonCount;
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
      };
      return {
        subject,
        chapterCount: stats.chapterCount,
        lessonCount: stats.lessonCount,
        completedCount: done,
        percent,
        code: style.code,
        color: style.color,
      };
    });

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

  return (
    <div
      data-testid="workspace-dashboard"
      className="min-h-screen bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      {/* =====================================================================
          WORKSPACE DASHBOARD — 1 MÀN HÌNH TỔNG QUAN TỐI GIẢN VÀO VIỆC NGAY
          ===================================================================== */}
      <div className="mx-auto max-w-[1240px] space-y-6 px-6 py-8 lg:px-10">
        {/* A. THANH CHÀO MỪNG & DANH NGÔN 1 DÒNG */}
        <header className="flex flex-col justify-between gap-3 border-b border-[var(--border-hairline)] pb-5 sm:flex-row sm:items-end">
          <div className="min-w-0 space-y-1.5">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-main)]">
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
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px] font-medium whitespace-nowrap text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)] active:scale-95"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                <span>Câu khác</span>
              </button>
            </div>
          </div>

          <time
            data-testid="dashboard-date"
            className="shrink-0 font-mono text-xs whitespace-nowrap text-[var(--text-muted)]"
          >
            {todayFormatted}
          </time>
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
            className="flex flex-col justify-between gap-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:p-6 lg:col-span-7"
          >
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: resumeAccentColor }}
                    aria-hidden="true"
                  />
                  <span>ĐANG HỌC DỞ</span>
                </span>
                {resumeCardStats && (
                  <span className="font-mono text-[11px] font-medium text-[var(--text-muted)] tabular-nums">
                    {resumeCardStats.code} · {resumeCardStats.completedCount}/
                    {resumeCardStats.lessonCount} bài ({resumeCardStats.percent}%)
                  </span>
                )}
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

              {/* Thanh tiến độ mảnh h-1.5 của học phần */}
              <div className="pt-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${Math.max(resumeCardStats?.percent ?? 0, resumeCardStats?.completedCount ? 6 : 0)}%`,
                      backgroundColor: resumeAccentColor,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Link
                to={resumeHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-os)] px-4 py-2.5 text-xs font-semibold text-white transition-all duration-150 hover:opacity-95 active:scale-[0.98]"
              >
                <span>Vào bài học ngay</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              <Link
                to={ROUTES.learningSpace}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)]"
              >
                <span>Mở Không gian học tập</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Cột Phải (5 cột) — Thẻ "Nhịp độ & Chỉ số" + Pomodoro nhanh */}
          <div
            data-testid="dashboard-metrics-card"
            className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 lg:col-span-5"
          >
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
                className="group rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 transition-colors hover:border-[var(--accent-os)]/40"
              >
                <p className="font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                  Kho Thuật ngữ
                </p>
                <p className="mt-1.5 font-mono text-base font-semibold text-[var(--text-main)] tabular-nums group-hover:text-[var(--accent-os)]">
                  {allGlossaryEntries.length}+
                </p>
              </Link>
            </div>

            {/* Thanh khởi động nhanh Phiên Pomodoro (25:00) */}
            <div
              data-testid="dashboard-pomodoro-bar"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <Hourglass
                  className="h-4 w-4 shrink-0 text-[var(--accent-heritage)]"
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

              <div className="flex items-center gap-1.5">
                {isPomodoroActive ? (
                  <>
                    <button
                      type="button"
                      onClick={isPomodoroRunning ? pausePomodoro : resumePomodoro}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[var(--accent-os)] px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
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
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    data-testid="dashboard-pomodoro-start"
                    onClick={() => startPomodoro(25, 'Tiêu chuẩn')}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)]"
                  >
                    <Play className="h-3 w-3" aria-hidden="true" />
                    <span>Bắt đầu phiên tập trung</span>
                  </button>
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
              className="font-mono text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)]"
            >
              Xem tất cả →
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
                className="group flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent-os)]/40 hover:bg-[var(--bg-workspace)] hover:shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span>{item.code}</span>
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                      {item.percent}%
                    </span>
                  </div>

                  <h3 className="font-serif text-[15.5px] leading-snug font-medium text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
                    {item.subject.title}
                  </h3>
                </div>

                <div className="space-y-2">
                  <p className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                    {item.chapterCount} chương · {item.lessonCount} bài
                  </p>
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
            className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 lg:col-span-7"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                <Landmark className="h-3.5 w-3.5 text-[var(--accent-heritage)]" aria-hidden="true" />
                <span>Di sản trong ngày</span>
              </span>
              <button
                type="button"
                data-testid="dashboard-heritage-shuffle"
                onClick={handleShuffleHeritage}
                aria-label="Đổi tác phẩm di sản ngẫu nhiên"
                title="Đổi tác phẩm khác"
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--text-main)] active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={currentHeritage.imageSrc}
                alt={currentHeritage.alt}
                loading="lazy"
                className="h-28 w-full shrink-0 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-shell)] object-cover sm:w-36"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="font-mono text-[11px] text-[var(--text-muted)]">
                  {currentHeritage.yearOrEra}
                </p>
                <h3 className="truncate font-serif text-base font-semibold text-[var(--text-main)]">
                  {currentHeritage.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {currentHeritage.coreAcademicValue}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => scrollToSection('khong-gian-di-san')}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[var(--accent-heritage)] transition-opacity hover:opacity-80"
                  >
                    <span>Mở phòng trưng bày 40 Di sản</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Phải (5 cột) — "Ôn nhanh & Giải lao" */}
          <div className="flex flex-col gap-3 lg:col-span-5">
            {/* Thẻ con 1: Thuật ngữ ngẫu nhiên + KaTeX */}
            {currentGlossary && (
              <div
                data-testid="dashboard-glossary-card"
                className="flex flex-1 flex-col justify-between gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4"
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
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>

                <Link
                  to={`${ROUTES.glossary}?q=${encodeURIComponent(currentGlossary.nameVi)}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-2 transition-colors hover:border-[var(--accent-os)]/40"
                >
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
                </Link>
              </div>
            )}

            {/* Thẻ con 2: Sảnh Bida 8-Ball WPA */}
            <div
              data-testid="dashboard-billiards-card"
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--accent-heritage)]">
                  <Gamepad2 className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-main)]">
                    Sảnh Bida 8-Ball WPA
                  </p>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    Nghỉ giải lao 5 phút · Bàn 15 bi chuẩn WPA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => scrollToSection('ban-bida-khoang-thach')}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)]"
              >
                <span>Mở bàn</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================================
          KHU VỰC CHUYỂN TIẾP SẢNH THƯ GIÃN (40 DI SẢN & BIDA 8-BALL)
          Giữ hoạt động trọn vẹn trước khi tách sang route /thu-gian ở Giai đoạn 4
          ===================================================================== */}
      <div className="border-t border-[var(--border-hairline)]">
        <HeritageExhibitionPavilion />
        <Suspense fallback={<BilliardsStageSkeleton />}>
          <MineralBilliardsStage />
        </Suspense>
      </div>
    </div>
  );
}

export default HomePage;
