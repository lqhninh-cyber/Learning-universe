import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Compass,
  FilePenLine,
  Gamepad2,
  Hourglass,
  Landmark,
  MoonStar,
  Pause,
  PenTool,
  Pin,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AtmosphericCanopy } from '@/components/atmosphere/AtmosphericCanopy';
import { DashboardAnalyticsCard } from '@/components/home/DashboardAnalyticsCard';
import { GlossaryFlashcardCard } from '@/components/home/GlossaryFlashcardCard';
import {
  HERITAGE_ARTWORKS,
  HeritageFallbackIllustration,
} from '@/components/home/HeritageArtShowcase';
import { RecentStudioShelf } from '@/components/home/RecentStudioShelf';
import { StudyPlannerWidget } from '@/components/home/StudyPlannerWidget';
import { StudyRhythmCard } from '@/components/home/StudyRhythmCard';
import {
  SubjectMathCard,
  type SubjectMathCardRecentLesson,
} from '@/components/home/SubjectMathCard';
import { SANCTUARY_BANNER_ASSET } from '@/config/atmosphereAssets';
import {
  getLessonById,
  getSubjects,
  getSubjectStats,
  type LessonLocation,
} from '@/content-runtime';
import { getIslandSubjectByIdOrSlug } from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { getHeritageMathConnection } from '@/data/heritageMathConnections';
import { useOptionalAuth } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { getAllGlossaryEntries } from '@/features/math-glossary';
import {
  computeDaysUntilDate,
  computeStudyActivityMetrics,
  formatCountdownLabel,
  getVietnameseTimeGreeting,
  selectActiveWorkspaceBucket,
  useWorkspaceStore,
  WORKSPACE_SUBJECT_META,
  type DayPeriod,
} from '@/features/workspace';
import { SCHOLARLY_QUOTES } from '@/pages/home/RotatingScholarlyQuote';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

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

function renderPeriodIcon(period: DayPeriod) {
  if (period === 'morning')
    return <Sunrise className="h-3.5 w-3.5 text-[#E6C27A]" aria-hidden="true" />;
  if (period === 'afternoon')
    return <Sun className="h-3.5 w-3.5 text-[#D4AF6A]" aria-hidden="true" />;
  if (period === 'evening')
    return <Sunset className="h-3.5 w-3.5 text-[#D99B5E]" aria-hidden="true" />;
  return <MoonStar className="h-3.5 w-3.5 text-[#8BC5B0]" aria-hidden="true" />;
}

/**
 * TRANG TỔNG QUAN (/): ACADEMIC OS PERSONALIZED WORKSPACE
 * - Khối A: Khung Hero thích ứng theo khung giờ (Sáng/Chiều/Tối/Đêm) + lời chào cá nhân hóa, KHÔNG lặp thanh tìm kiếm.
 * - Khối B: 3 thẻ tương phản chất liệu (Sứ Trắng | Kính Mờ xuyên ảnh thật | Xanh Than Đặc).
 * - Khối C: 4 Thẻ Học Phần với đồ họa vector toán học siêu mảnh (SVG thuần, 0% ảnh phong cảnh) + bài học gần nhất theo môn.
 * - Khối D: Lịch biểu (Calendar) + Mốc kỳ thi + To-Do List cá nhân hóa theo tài khoản & Nhịp chuyên cần (Streak, Nhiệt đồ 28 ngày, Mục tiêu tuần).
 * - Khối E: Di sản trong ngày (kèm dòng liên hệ Toán học/Sư phạm 40/40) + Thuật ngữ KaTeX (có chế độ Flashcard) & Banner Sảnh Thư Giãn.
 */
export function HomePage() {
  const subjects = getSubjects();
  const allGlossaryEntries = useMemo(() => getAllGlossaryEntries(), []);
  const auth = useOptionalAuth();
  const user = auth?.user ?? null;
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedBySubject = useLearningStore((state) => state.lastVisitedBySubject);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const isStoreAuth = useLearningStore((state) => state.isAuthenticated);
  const storeLearnerName = useLearningStore((state) => state.learnerName);
  const workspaceBucket = useWorkspaceStore(selectActiveWorkspaceBucket);
  const { pomodoro, startPomodoro, pausePomodoro, resumePomodoro, resetPomodoro } = useIsland();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [heritageIndex, setHeritageIndex] = useState(() =>
    getDaySeedIndex(HERITAGE_ARTWORKS.length),
  );
  const [failedHeritageId, setFailedHeritageId] = useState<string | null>(null);
  const [sanctuaryImgFailed, setSanctuaryImgFailed] = useState(false);
  const [glossaryIndex, setGlossaryIndex] = useState(() =>
    getDaySeedIndex(Math.max(1, allGlossaryEntries.length)),
  );

  const todayFormatted = useMemo(() => formatVietnameseToday(), []);
  const personalizedDisplayName =
    user?.fullName ||
    (isStoreAuth && storeLearnerName && storeLearnerName !== 'Sinh viên Sư phạm Toán'
      ? storeLearnerName
      : null);

  const timeGreeting = useMemo(
    () => getVietnameseTimeGreeting(new Date(), personalizedDisplayName),
    [personalizedDisplayName],
  );

  const activityMetrics = useMemo(
    () =>
      computeStudyActivityMetrics({
        completedLessons,
        tasks: workspaceBucket.tasks,
        pomodoroLogs: workspaceBucket.pomodoroLogs,
      }),
    [completedLessons, workspaceBucket.pomodoroLogs, workspaceBucket.tasks],
  );

  const currentQuote = SCHOLARLY_QUOTES[quoteIndex] ?? SCHOLARLY_QUOTES[0]!;
  const currentHeritage = HERITAGE_ARTWORKS[heritageIndex] ?? HERITAGE_ARTWORKS[0]!;
  const currentHeritageMath = useMemo(
    () => getHeritageMathConnection(currentHeritage.id),
    [currentHeritage.id],
  );
  const currentHeritageSubjectMeta = WORKSPACE_SUBJECT_META[currentHeritageMath.subjectSlug];
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
      const style = WORKSPACE_SUBJECT_META[subject.slug as keyof typeof WORKSPACE_SUBJECT_META] ?? {
        code: subject.slug.toUpperCase().slice(0, 5),
        shortLabel: subject.title,
        color: '#17332C',
        pillClass:
          'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]',
      };

      // Tìm bài gần nhất của riêng môn này (ưu tiên lịch sử cá nhân, dự phòng bài đầu tiên)
      const visitedEntry =
        lastVisitedBySubject[subject.id] ?? lastVisitedBySubject[subject.slug] ?? null;
      const visitedLoc = visitedEntry?.lessonId ? getLessonById(visitedEntry.lessonId) : null;
      let recentLesson: SubjectMathCardRecentLesson | null = null;

      if (visitedLoc && visitedLoc.subject.slug === subject.slug) {
        recentLesson = {
          title: visitedLoc.lesson.title,
          label: `Bài ${visitedLoc.chapter.number}.${visitedLoc.lesson.number} · ${visitedLoc.lesson.title}`,
          to: ROUTES.lesson(
            visitedLoc.subject.slug,
            visitedLoc.chapter.slug,
            visitedLoc.lesson.slug,
          ),
          isResuming: true,
        };
      } else {
        const firstChapter = subject.chapters[0];
        const firstLesson = firstChapter?.lessons[0];
        if (firstChapter && firstLesson) {
          recentLesson = {
            title: firstLesson.title,
            label: `Bài ${firstChapter.number}.${firstLesson.number} · ${firstLesson.title}`,
            to: ROUTES.lesson(subject.slug, firstChapter.slug, firstLesson.slug),
            isResuming: false,
          };
        }
      }

      return {
        subject,
        chapterCount: stats.chapterCount,
        lessonCount: stats.lessonCount,
        completedCount: done,
        percent,
        code: style.code,
        color: style.color,
        pillClass: style.pillClass,
        recentLesson,
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
  }, [completedLessons, lastVisitedBySubject, subjects]);

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

  const nearestMilestone = useMemo(() => {
    const upcoming = workspaceBucket.milestones
      .map((m) => ({ milestone: m, daysUntil: computeDaysUntilDate(m.examDate) }))
      .filter((item) => item.daysUntil >= 0 && item.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    return upcoming[0] ?? null;
  }, [workspaceBucket.milestones]);

  const pendingTasksCount = useMemo(
    () => workspaceBucket.tasks.filter((t) => !t.completed).length,
    [workspaceBucket.tasks],
  );

  const subjectAnalyticsData = useMemo(
    () =>
      subjectCards.map((c) => ({
        slug: c.subject.slug,
        code: c.code,
        title: c.subject.title,
        color: c.color,
        completedCount: c.completedCount,
        lessonCount: c.lessonCount,
        percent: c.percent,
      })),
    [subjectCards],
  );

  const miniRingRadius = 11;
  const miniRingCirc = 2 * Math.PI * miniRingRadius;
  const miniRingFill = (Math.max(0, Math.min(100, totalPercent)) / 100) * miniRingCirc;

  return (
    <div
      data-testid="workspace-dashboard"
      className="min-h-[calc(100vh-3rem)] bg-[#EEF1EE] text-[var(--text-main)] dark:bg-[#0C1210]"
    >
      <div className="mx-auto max-w-[1340px] space-y-8 px-4 py-5 sm:px-6 lg:px-8">
        {/* ========================================================================
            TẦNG 1: SÂN KHẤU KỂ CHUYỆN CHUYỂN TẦNG MỀM + 3 THẺ BENTO BO TRÒN LỚN
            ======================================================================== */}
        <div className="relative">
          {/* KHỐI A — KHUNG HERO THÍCH ỨNG KHUNG GIỜ + SÓNG MÂY CHUYỂN TẦNG MỀM */}
          <section
            aria-label="Không gian Tổng quan"
            data-testid="spatial-hero-frame"
            data-day-period={timeGreeting.period}
            className="relative overflow-hidden rounded-[28px] border border-black/[0.06] shadow-[0_26px_64px_-26px_rgba(15,45,35,0.28)] dark:border-white/[0.08]"
          >
            <AtmosphericCanopy
              variant="dashboard"
              fullBleedPhoto
              scrimGradient={timeGreeting.scrimGradient}
              enableCelestialOverlay={false}
              enableParallax
              testId="dashboard-atmospheric-canopy"
              className="min-h-[320px] md:min-h-[380px] lg:min-h-[440px]"
            >
              {/* Chòm sao hình học siêu mảnh góc trên-phải gợi tinh thần Learning Universe */}
              <svg
                viewBox="0 0 320 180"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute top-4 right-5 hidden h-40 w-72 opacity-40 md:block"
              >
                <path
                  d="M36 92L112 44L198 76L278 28M112 44L148 128L198 76M148 128L252 132L278 28"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <circle cx="36" cy="92" r="2.5" fill="#D4AF6A" />
                <circle cx="112" cy="44" r="3" fill="#FFFFFF" />
                <circle cx="198" cy="76" r="2.5" fill="#6EE7B7" />
                <circle cx="148" cy="128" r="2.2" fill="#FFFFFF" />
                <circle cx="252" cy="132" r="2.5" fill="#D4AF6A" />
                <circle cx="278" cy="28" r="3.2" fill="#6EE7B7" />
                <circle
                  cx="198"
                  cy="76"
                  r="18"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="0.9"
                  strokeDasharray="2 3"
                />
              </svg>

              <div className="relative z-10 flex flex-col justify-between gap-5 p-6 pb-20 sm:p-8 sm:pb-24 md:pb-32 lg:p-11 lg:pb-38">
                {/* Hàng trên: Nhãn khung giờ + ngày hôm nay + pill kỳ thi sắp tới (nếu có) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    data-testid="hero-period-badge"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3.5 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-white/95 backdrop-blur-md"
                  >
                    {renderPeriodIcon(timeGreeting.period)}
                    <span>{timeGreeting.badgeLabel} · Không gian Tổng quan</span>
                  </span>
                  <time
                    data-testid="dashboard-date"
                    className="rounded-full border border-white/20 bg-black/25 px-3 py-1 font-mono text-[11px] whitespace-nowrap text-white/85 backdrop-blur-md"
                  >
                    {todayFormatted}
                  </time>
                  {nearestMilestone && (
                    <a
                      href="#lich-bieu-hoc-tap"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#F0C87D]/45 bg-[#17332C]/75 px-3 py-1 font-mono text-[10.5px] font-semibold text-[#F5D89B] backdrop-blur-md transition-colors hover:bg-[#17332C]"
                    >
                      <Pin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="max-w-[190px] truncate">
                        {formatCountdownLabel(nearestMilestone.daysUntil)} ·{' '}
                        {nearestMilestone.milestone.title}
                      </span>
                    </a>
                  )}
                </div>

                {/* Khối lời chào thích ứng theo khung giờ + danh ngôn học thuật */}
                <div className="max-w-2xl space-y-2.5">
                  <h1
                    data-testid="hero-time-greeting"
                    className="font-serif text-3xl leading-[1.12] font-semibold tracking-tight text-white drop-shadow-xs sm:text-4xl lg:text-[44px]"
                  >
                    <span className="sr-only">LEARNING UNIVERSE — Không gian Tổng quan — </span>
                    {timeGreeting.headline}
                  </h1>

                  <p className="text-xs font-medium text-white/82 sm:text-sm">
                    {timeGreeting.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <p
                      data-testid="dashboard-quote-text"
                      className="font-serif text-[14px] leading-relaxed text-white/85 italic sm:text-[15px]"
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

                {/* Hành động trọng tâm trên Hero */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to={resumeHref}
                    className="group/cta inline-flex items-center gap-2 rounded-full bg-[#0F7656] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_12px_28px_-10px_rgba(15,118,86,0.7)] ring-1 ring-white/25 transition-all duration-150 hover:bg-[#138A63] active:scale-[0.98]"
                  >
                    <span>Vào bài học ngay</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-150 group-hover/cta:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    to={ROUTES.learningSpace}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-4 py-2.5 text-xs font-medium text-white/95 backdrop-blur-md transition-colors hover:bg-black/45"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#D4AF6A]" aria-hidden="true" />
                    <span>Bản đồ học phần</span>
                  </Link>
                  <a
                    href="#lich-bieu-hoc-tap"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-medium text-white/95 backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-[#6EE7B7]" aria-hidden="true" />
                    <span>Lịch biểu hôm nay</span>
                  </a>
                </div>
              </div>

              {/* Dải sóng mây hữu cơ 2 lớp chuyển tầng mềm từ ảnh Hero sang nền Xám-Ngà Sứ */}
              <svg
                viewBox="0 0 1440 120"
                preserveAspectRatio="none"
                aria-hidden="true"
                data-testid="hero-soft-wave-divider"
                className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-14 w-full sm:h-18 lg:h-24"
              >
                <path
                  d="M0,62 C220,12 460,104 740,56 C1020,8 1240,86 1440,42 L1440,120 L0,120 Z"
                  className="fill-[#EEF1EE]/45 dark:fill-[#0C1210]/45"
                />
                <path
                  d="M0,84 C260,36 540,116 840,70 C1100,30 1300,92 1440,62 L1440,120 L0,120 Z"
                  className="fill-[#EEF1EE] dark:fill-[#0C1210]"
                />
              </svg>
            </AtmosphericCanopy>
          </section>

          {/* KHỐI B — HÀNG 3 THẺ BENTO BO TRÒN LỚN (26px) GÁC MỀM LÊN DẢI SÓNG HERO */}
          <section
            aria-label="Hành động chính, tiến độ và điều phối nhanh"
            data-testid="three-material-dock"
            className="relative z-20 -mt-10 grid grid-cols-1 gap-4 px-2 sm:px-5 md:-mt-20 lg:-mt-28 lg:grid-cols-12 lg:px-7"
          >
            {/* THẺ 1 (5/12) — SỨ TRẮNG BO TRÒN LỚN: Đang học dở */}
            <div
              data-testid="dashboard-resume-card"
              data-material="ceramic"
              className="flex min-w-0 flex-col justify-between gap-4 rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_18px_42px_-18px_rgba(16,45,35,0.16)] lg:col-span-5 dark:border-white/[0.07] dark:bg-[#141D1A]"
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
                        'rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums',
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
                            'inline-flex h-6 items-center gap-1 rounded-full border px-2.5 font-mono text-[10.5px] font-semibold transition-all duration-150',
                            isCurrent
                              ? 'border-transparent text-white shadow-2xs'
                              : isDone
                                ? 'border-[#0F7656]/25 bg-[#EAF5F0] text-[#0F7656] dark:bg-[#132C24] dark:text-[#4AD1A3]'
                                : 'border-[var(--border-hairline)] bg-[#F6F8F7] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)] dark:bg-[#0F1715]',
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
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EAF0ED] dark:bg-[#1D2A26]">
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
                  className="group/read inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0F7656] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#0D664A] active:scale-[0.98]"
                >
                  <span>Tiếp tục đọc</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover/read:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* THẺ 2 (4/12) — KÍNH MỜ BO TRÒN LỚN: Chỉ số có vòng tròn tiến độ & Pomodoro */}
            <div
              data-testid="dashboard-metrics-card"
              data-material="frosted-glass"
              className="flex min-w-0 flex-col justify-between gap-4 rounded-[26px] border border-white/75 bg-white/76 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_42px_-16px_rgba(16,45,35,0.16)] backdrop-blur-xl backdrop-saturate-150 lg:col-span-4 dark:border-white/12 dark:bg-[#121B18]/78"
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[18px] border border-white/65 bg-white/70 p-2.5 dark:border-white/10 dark:bg-[#182320]/75">
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Bài hoàn thành
                  </p>
                  <p className="mt-1.5 font-mono text-base font-bold text-[var(--text-main)] tabular-nums">
                    {completedCount}
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">
                      /{totalLessons}
                    </span>
                  </p>
                </div>

                <div className="rounded-[18px] border border-white/65 bg-white/70 p-2.5 dark:border-white/10 dark:bg-[#182320]/75">
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Tiến độ tổng
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <svg
                      viewBox="0 0 28 28"
                      className="h-6 w-6 shrink-0 -rotate-90"
                      aria-hidden="true"
                    >
                      <circle
                        cx="14"
                        cy="14"
                        r={miniRingRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-[#DCE6E2] dark:text-[#23322D]"
                      />
                      {totalPercent > 0 && (
                        <circle
                          cx="14"
                          cy="14"
                          r={miniRingRadius}
                          fill="none"
                          stroke="#0F7656"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${miniRingFill} ${miniRingCirc}`}
                        />
                      )}
                    </svg>
                    <p className="font-mono text-sm font-bold text-[#0F7656] tabular-nums dark:text-[#4AD1A3]">
                      {totalPercent}%
                    </p>
                  </div>
                </div>

                <Link
                  to={ROUTES.glossary}
                  className="group rounded-[18px] border border-white/65 bg-white/70 p-2.5 transition-colors hover:border-[#0F7656]/50 dark:border-white/10 dark:bg-[#182320]/75"
                >
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Kho Thuật ngữ
                  </p>
                  <p className="mt-1.5 font-mono text-base font-bold text-[var(--text-main)] tabular-nums group-hover:text-[#0F7656] dark:group-hover:text-[#4AD1A3]">
                    {allGlossaryEntries.length}+
                  </p>
                </Link>
              </div>

              {/* Thanh khởi động nhanh Pomodoro */}
              <div
                data-testid="dashboard-pomodoro-bar"
                className="flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-white/65 bg-white/75 px-3.5 py-2.5 dark:border-white/10 dark:bg-[#182320]/75"
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF4E7] text-[#C27824] dark:bg-[#261D12] dark:text-[#E5A95C]">
                    <Hourglass
                      className={cn('h-4 w-4 shrink-0', isPomodoroRunning && 'animate-pulse')}
                      aria-hidden="true"
                    />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[11.5px] font-semibold text-[var(--text-main)]">Pomodoro</p>
                    <p className="font-mono text-xs font-bold text-[#C27824] tabular-nums dark:text-[#E5A95C]">
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
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#0F7656] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 active:scale-95"
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
                        className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[var(--border-hairline)] bg-white text-[var(--text-secondary)] hover:text-[var(--text-main)] dark:bg-[#141D1A]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      data-testid="dashboard-pomodoro-start"
                      onClick={() => startPomodoro(25, 'Tiêu chuẩn')}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#0F7656] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#0D664A] active:scale-[0.98]"
                    >
                      <Play className="h-3 w-3" aria-hidden="true" />
                      <span>Tập trung</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* THẺ 3 (3/12) — THẺ NHẤN NGỌC LỤC BẢO RỰC NÉT KIỂU QUIXOTIC: Điều phối nhanh */}
            <div
              data-testid="dashboard-quick-hub-card"
              data-material="deep-emerald"
              className="relative flex min-w-0 flex-col justify-between gap-3.5 overflow-hidden rounded-[26px] border border-white/15 bg-[#17332C] bg-gradient-to-br from-[#127D59] via-[#154C3B] to-[#17332C] p-5 text-white shadow-[0_20px_44px_-16px_rgba(15,82,58,0.42)] lg:col-span-3"
            >
              {/* Vòng sáng trang trí siêu mịn kiểu thẻ Quixotic */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-[#4AD1A3]/18 blur-2xl"
              />

              <div className="relative z-10 space-y-1">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#A7F3D0] uppercase">
                  ĐIỀU PHỐI NHANH
                </p>
                <h2 className="font-serif text-lg leading-snug font-semibold text-white">
                  Bắt đầu phiên học sâu
                </h2>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-1.5">
                <Link
                  to={ROUTES.learningSpace}
                  className="group/q1 flex items-center justify-between gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-xs transition-colors hover:bg-white/20"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Compass className="h-3.5 w-3.5 shrink-0 text-[#A7F3D0]" aria-hidden="true" />
                    <span className="truncate">Không gian học tập</span>
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-white/75 transition-transform duration-150 group-hover/q1:translate-x-0.5 group-hover/q1:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={ROUTES.mathInk}
                  className="group/qink flex items-center justify-between gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-xs transition-colors hover:bg-white/20"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <PenTool className="h-3.5 w-3.5 shrink-0 text-[#A7F3D0]" aria-hidden="true" />
                    <span className="truncate">Bảng viết</span>
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-white/75 transition-transform duration-150 group-hover/qink:translate-x-0.5 group-hover/qink:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={ROUTES.examBuilder}
                  className="group/qexam flex items-center justify-between gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-xs transition-colors hover:bg-white/20"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FilePenLine
                      className="h-3.5 w-3.5 shrink-0 text-[#F0C87D]"
                      aria-hidden="true"
                    />
                    <span className="truncate">Soạn đề</span>
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 shrink-0 text-white/75 transition-transform duration-150 group-hover/qexam:translate-x-0.5 group-hover/qexam:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to={ROUTES.sanctuaryTab('bida')}
                  className="group/q2 flex items-center justify-between gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-xs transition-colors hover:bg-white/20"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Gamepad2 className="h-3.5 w-3.5 shrink-0 text-[#F0C87D]" aria-hidden="true" />
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
            TẦNG 2 — BIỂU ĐỒ CỘT BO TRÒN + VÒNG TRÒN TIẾN ĐỘ (7/12) & KỆ STUDIO GẦN ĐÂY (5/12)
            ======================================================================== */}
        <section
          aria-label="Phân tích nhịp học trực quan và Studio gần đây"
          className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <DashboardAnalyticsCard
              metrics={activityMetrics}
              subjectProgress={subjectAnalyticsData}
              totalPercent={totalPercent}
              completedCount={completedCount}
              totalLessons={totalLessons}
            />
          </div>
          <div className="lg:col-span-5">
            <RecentStudioShelf />
          </div>
        </section>

        {/* ========================================================================
            TẦNG 3 — 4 THẺ HỌC PHẦN TOÁN HỌC BO TRÒN MỀM (SVG VECTOR + VÒNG TIẾN ĐỘ)
            ======================================================================== */}
        <section aria-label="Bốn học phần trọng tâm" className="space-y-3.5">
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Học phần trọng tâm
            </h2>
            <Link
              to={ROUTES.learningSpace}
              className="group/all inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-mono text-[11px] font-semibold text-[#0F7656] shadow-2xs transition-colors hover:bg-[#EAF5F0] dark:bg-[#141D1A] dark:text-[#4AD1A3]"
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
            {subjectCards.map((item) => (
              <SubjectMathCard
                key={item.subject.slug}
                slug={item.subject.slug}
                code={item.code}
                title={item.subject.title}
                color={item.color}
                pillClass={item.pillClass}
                chapterCount={item.chapterCount}
                lessonCount={item.lessonCount}
                completedCount={item.completedCount}
                percent={item.percent}
                overviewHref={ROUTES.subjectOverview(item.subject.slug)}
                recentLesson={item.recentLesson}
              />
            ))}
          </div>
        </section>

        {/* ========================================================================
            TẦNG 4 — KHÔNG GIAN LỊCH BIỂU & NHỊP HỌC RIÊNG RỘNG TRỌN MÀN HÌNH (12/12)
            ======================================================================== */}
        <section
          id="lich-bieu-hoc-tap"
          aria-label="Kế hoạch cá nhân hóa và nhịp chuyên cần"
          data-testid="calendar-studio-section"
          className="scroll-mt-16 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-white text-[#0F7656] shadow-2xs dark:bg-[#141D1A] dark:text-[#4AD1A3]">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <h2 className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Không gian Lịch biểu & Nhịp học cá nhân
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)]">
              <span className="rounded-full bg-white px-3 py-1 shadow-2xs dark:bg-[#141D1A]">
                <strong className="text-[#0F7656] dark:text-[#4AD1A3]">{pendingTasksCount}</strong>{' '}
                việc đang chờ
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-2xs dark:bg-[#141D1A]">
                Chuỗi{' '}
                <strong className="text-[var(--accent-heritage)]">
                  {activityMetrics.currentStreak} ngày
                </strong>
              </span>
            </div>
          </div>

          {/* Lịch biểu + Kế hoạch trải rộng trọn 12 cột thoáng đãng như 1 màn hình lịch chuyên dụng */}
          <StudyPlannerWidget activityByDate={activityMetrics.activityByDate} />

          {/* Dải ngang Nhịp chuyên cần + Nhiệt đồ 28 ngày + Mục tiêu tuần nối liền bên dưới */}
          <StudyRhythmCard metrics={activityMetrics} layout="horizontal" />
        </section>

        {/* ========================================================================
            TẦNG 5 — DI SẢN LIÊN HỆ TOÁN HỌC + THUẬT NGỮ FLASHCARD & BANNER SẢNH THƯ GIÃN
            ======================================================================== */}
        <section aria-label="Di sản học thuật, thuật ngữ và Sảnh Thư Giãn" className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Cột Trái (7/12) — Di sản trong ngày + Dòng liên hệ Toán học / Sư phạm */}
            <div
              data-testid="dashboard-heritage-card"
              className="group/heritage flex min-w-0 flex-col justify-between gap-4 rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 lg:col-span-7 dark:border-white/[0.07] dark:bg-[#141D1A]"
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
                  className="group/hbtn inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[#F6F8F7] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--text-main)] active:scale-95 dark:bg-[#0F1715]"
                >
                  <RefreshCw
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover/hbtn:rotate-180"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0 pb-2 sm:w-52">
                  <div className="h-40 w-full overflow-hidden rounded-[20px] border border-black/[0.06] bg-[var(--bg-shell)] shadow-xs dark:border-white/[0.08]">
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
                    className="absolute right-2.5 bottom-0 inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-mono text-[10px] font-semibold text-[var(--text-main)] shadow-md dark:border-white/[0.1] dark:bg-[#18221F]"
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

                <div className="min-w-0 flex-1 space-y-2.5">
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

                  {/* Dòng liên hệ Toán học / Sư phạm gắn chặt với 4 học phần */}
                  <div
                    data-testid="heritage-math-connection"
                    className="rounded-[18px] bg-[#F6F8F7] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[var(--text-secondary)] dark:bg-[#0F1715]"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wider text-[#0F7656] uppercase dark:text-[#4AD1A3]">
                        <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span>Liên hệ học phần</span>
                      </span>
                      <Link
                        to={ROUTES.subjectOverview(currentHeritageMath.subjectSlug)}
                        className={cn(
                          'rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-bold transition-opacity hover:opacity-85',
                          currentHeritageSubjectMeta.pillClass,
                        )}
                      >
                        {currentHeritageMath.subjectCode} ↗
                      </Link>
                    </div>
                    <p>{currentHeritageMath.connection}</p>
                  </div>

                  <div className="pt-0.5">
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

            {/* Cột Phải (5/12) — Thuật ngữ ngẫu nhiên KaTeX có chế độ Flashcard ôn nhanh */}
            {currentGlossary && (
              <GlossaryFlashcardCard entry={currentGlossary} onShuffle={handleShuffleGlossary} />
            )}
          </div>

          {/* Hàng 2 — Banner Đáy Sảnh Thư Giãn Bo Tròn Mềm Ngọc Lục Bảo */}
          <div
            data-testid="dashboard-sanctuary-banner"
            style={{ backgroundImage: SANCTUARY_BANNER_ASSET.fallbackGradient }}
            className="relative min-h-[188px] overflow-hidden rounded-[28px] border border-white/10 bg-[#17332C] text-white shadow-[0_24px_56px_-22px_rgba(15,45,35,0.34)]"
          >
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
                    'linear-gradient(90deg, rgba(18, 92, 68, 0.25) 0%, rgba(23, 51, 44, 0.78) 62%, #17332C 100%)',
                }}
                className="absolute inset-0"
              />
            </div>

            <div className="relative z-10 flex flex-col justify-between gap-5 p-6 sm:p-8 md:pl-[44%] lg:flex-row lg:items-center">
              <div className="max-w-xl space-y-2">
                <p className="font-mono text-[10.5px] font-semibold tracking-[0.16em] text-[#A7F3D0] uppercase">
                  SẢNH THƯ GIÃN · POMODORO BREAK
                </p>
                <h2 className="font-serif text-xl leading-snug font-semibold text-white sm:text-2xl">
                  Nghỉ nhịp 5 phút giữa các phiên chứng minh
                </h2>
                <p className="text-xs leading-relaxed text-white/82 sm:text-[13px]">
                  Thư giãn nhẹ giữa các khối lý thuyết với Bảo tàng 40 Di sản Học thuật và bàn Bida
                  8-Ball vật lý 120fps chuẩn luật WPA.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                <Link
                  to={ROUTES.sanctuaryTab('bida')}
                  className="group/sbida inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#17332C] shadow-sm transition-all duration-150 hover:bg-[#EAF5F0] active:scale-[0.98]"
                >
                  <Gamepad2 className="h-3.5 w-3.5 text-[#0F7656]" aria-hidden="true" />
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
                  <Landmark className="h-3.5 w-3.5 text-[#F0C87D]" aria-hidden="true" />
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
