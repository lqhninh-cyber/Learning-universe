import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  Flame,
  Hourglass,
  Landmark,
  MoonStar,
  Pause,
  Pin,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { AtmosphericCanopy } from '@/components/atmosphere/AtmosphericCanopy';
import { ActiveChapterConstellation } from '@/components/home/ActiveChapterConstellation';
import { DashboardAnalyticsCard } from '@/components/home/DashboardAnalyticsCard';
import { DashboardLayoutCustomizer } from '@/components/home/DashboardLayoutCustomizer';
import {
  GlossaryFlashcardCard,
  type ResolvedDueReviewLesson,
} from '@/components/home/GlossaryFlashcardCard';
import {
  HERITAGE_ARTWORKS,
  HeritageFallbackIllustration,
} from '@/components/home/HeritageArtShowcase';
import { RecentStudioShelf } from '@/components/home/RecentStudioShelf';
import {
  StudyPlannerWidget,
  type PlannerSubjectProgress,
} from '@/components/home/StudyPlannerWidget';
import {
  SubjectMathCard,
  type SubjectMathCardRecentLesson,
} from '@/components/home/SubjectMathCard';
import { TodayAgendaCard } from '@/components/home/TodayAgendaCard';
import {
  getLessonById,
  getSubjects,
  getSubjectStats,
  type LessonLocation,
} from '@/content-runtime/manifest';
import { getIslandSubjectByIdOrSlug } from '@/context/island-helpers';
import { usePomodoro } from '@/context/PomodoroContext';
import { getHeritageMathConnection } from '@/data/heritageMathConnections';
import { useOptionalAuth } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { getAllGlossaryEntries } from '@/features/math-glossary';
import {
  computeDaysUntilDate,
  computeDueReviewLessons,
  computeExamPacePlan,
  computeStudyActivityMetrics,
  formatCountdownLabel,
  getVietnameseTimeGreeting,
  normalizeDashboardLayout,
  selectActiveWorkspaceBucket,
  useWorkspaceStore,
  WORKSPACE_SUBJECT_META,
  type DashboardSectionId,
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

function DashboardPomodoroBar() {
  const { pomodoro, startPomodoro, pausePomodoro, resumePomodoro, resetPomodoro } = usePomodoro();
  const isPomodoroActive = pomodoro.status !== 'idle';
  const isPomodoroRunning = pomodoro.status === 'running';

  return (
    <div className="space-y-2.5">
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
  );
}

/**
 * TRANG TỔNG QUAN (/): ACADEMIC OS PERSONALIZED WORKSPACE
 * - Khối A: Khung Hero thích ứng theo khung giờ (Sáng/Chiều/Tối/Đêm) + lời chào cá nhân hóa, KHÔNG lặp thanh tìm kiếm.
 * - Khối B: 3 thẻ (Đang học dở | Chỉ số + Pomodoro | Việc hôm nay & mục tiêu tuần).
 *   Lối tắt điều hướng (Không gian học tập, Bảng viết, Soạn đề, Thư giãn) đã có ở Rail trái nên không lặp lại.
 * - Khối C: 4 Thẻ Học Phần với đồ họa vector toán học siêu mảnh (SVG thuần, 0% ảnh phong cảnh) + bài học gần nhất theo môn.
 * - Khối D: Lịch biểu (Calendar) + Mốc kỳ thi + To-Do List cá nhân hóa theo tài khoản & Nhịp chuyên cần (Streak, Nhiệt đồ 28 ngày, Mục tiêu tuần).
 * - Khối E: Di sản trong ngày (kèm dòng liên hệ Toán học/Sư phạm 40/40) + Thuật ngữ KaTeX (có chế độ Flashcard).
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
  const toggleDashboardSection = useWorkspaceStore((state) => state.toggleDashboardSection);
  const moveDashboardSection = useWorkspaceStore((state) => state.moveDashboardSection);
  const resetDashboardLayout = useWorkspaceStore((state) => state.resetDashboardLayout);
  const markLessonReviewed = useWorkspaceStore((state) => state.markLessonReviewed);

  const dashboardLayout = useMemo(
    () => normalizeDashboardLayout(workspaceBucket.dashboardLayout),
    [workspaceBucket.dashboardLayout],
  );

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [heritageIndex, setHeritageIndex] = useState(() =>
    getDaySeedIndex(HERITAGE_ARTWORKS.length),
  );
  const [failedHeritageId, setFailedHeritageId] = useState<string | null>(null);
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
    // Chỉ đếm bài còn tồn tại trong manifest (tránh % > 100 khi còn ID bài cũ trong store)
    const completed = cards.reduce((sum, card) => sum + card.completedCount, 0);
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

  const isHeritageFallback = failedHeritageId === currentHeritage.id;
  const heritageNumberLabel = String(heritageIndex + 1).padStart(2, '0');

  const subjectProgressBySlug = useMemo<Readonly<Record<string, PlannerSubjectProgress>>>(() => {
    const map: Record<string, PlannerSubjectProgress> = {};
    for (const card of subjectCards) {
      map[card.subject.slug] = {
        code: card.code,
        completedCount: card.completedCount,
        lessonCount: card.lessonCount,
      };
    }
    return map;
  }, [subjectCards]);

  const nearestMilestone = useMemo(() => {
    const upcoming = workspaceBucket.milestones
      .map((m) => {
        const daysUntil = computeDaysUntilDate(m.examDate);
        const progress = m.subjectSlug ? subjectProgressBySlug[m.subjectSlug] : undefined;
        const pacePlan = progress
          ? computeExamPacePlan({
              daysUntil,
              completedCount: progress.completedCount,
              lessonCount: progress.lessonCount,
              subjectCode: progress.code,
            })
          : null;
        return { milestone: m, daysUntil, pacePlan };
      })
      .filter((item) => item.daysUntil >= 0 && item.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    return upcoming[0] ?? null;
  }, [subjectProgressBySlug, workspaceBucket.milestones]);

  const pendingTasksCount = useMemo(
    () => workspaceBucket.tasks.filter((t) => !t.completed).length,
    [workspaceBucket.tasks],
  );

  // Gợi ý bài cần ôn tập hôm nay theo chu kỳ lặp lại ngắt quãng 1 / 3 / 7 ngày
  const dueReviewLessons = useMemo<readonly ResolvedDueReviewLesson[]>(() => {
    const rawItems = computeDueReviewLessons({
      completedLessons,
      reviewedLessons: workspaceBucket.reviewedLessons,
    });
    const resolved: ResolvedDueReviewLesson[] = [];
    for (const item of rawItems) {
      const loc = getLessonById(item.lessonId);
      if (!loc) continue;
      const meta = WORKSPACE_SUBJECT_META[loc.subject.slug as keyof typeof WORKSPACE_SUBJECT_META];
      resolved.push({
        lessonId: item.lessonId,
        title: loc.lesson.title,
        chapterLabel: `Bài ${loc.chapter.number}.${loc.lesson.number}`,
        subjectCode: meta?.code ?? loc.subject.slug.toUpperCase().slice(0, 5),
        subjectPillClass:
          meta?.pillClass ??
          'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]',
        intervalDays: item.intervalDays,
        daysAgo: item.daysAgo,
        reviewedToday: item.reviewedToday,
        to: ROUTES.lesson(loc.subject.slug, loc.chapter.slug, loc.lesson.slug),
      });
    }
    return resolved;
  }, [completedLessons, workspaceBucket.reviewedLessons]);

  const resumeChapterSummary = useMemo(() => {
    if (!resumeLocation) return null;
    const lessons = resumeLocation.chapter.lessons;
    const doneInChapter = lessons.filter((ls) => Boolean(completedLessons[ls.id])).length;
    const nextUnfinished =
      lessons.find((ls) => ls.id !== resumeLocation.lesson.id && !completedLessons[ls.id]) ?? null;
    return {
      doneInChapter,
      totalInChapter: lessons.length,
      nextUnfinished: nextUnfinished
        ? {
            label: `${resumeLocation.chapter.number}.${nextUnfinished.number}`,
            title: nextUnfinished.title,
            to: ROUTES.lesson(
              resumeLocation.subject.slug,
              resumeLocation.chapter.slug,
              nextUnfinished.slug,
            ),
          }
        : null,
    };
  }, [completedLessons, resumeLocation]);

  const miniRingRadius = 11;
  const miniRingCirc = 2 * Math.PI * miniRingRadius;
  const miniRingFill = (Math.max(0, Math.min(100, totalPercent)) / 100) * miniRingCirc;

  return (
    <div
      data-testid="workspace-dashboard"
      className="lu-dashboard-atmosphere relative min-h-[calc(100vh-3rem)] overflow-x-clip text-[var(--text-main)]"
    >
      {/* Dải đường trắc địa & quỹ đạo kiến trúc nền phủ toàn trang (0% che khuất nội dung) */}
      <svg
        viewBox="0 0 1440 1600"
        fill="none"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
        data-testid="dashboard-ambient-backdrop"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.42] dark:opacity-[0.26]"
      >
        <circle
          cx="1260"
          cy="420"
          r="320"
          stroke="#0F7656"
          strokeOpacity="0.14"
          strokeWidth="1"
          strokeDasharray="5 8"
        />
        <circle
          cx="1260"
          cy="420"
          r="210"
          stroke="#C27824"
          strokeOpacity="0.14"
          strokeWidth="0.9"
        />
        <circle
          cx="140"
          cy="1040"
          r="280"
          stroke="#1D4F6E"
          strokeOpacity="0.14"
          strokeWidth="1"
          strokeDasharray="4 7"
        />
        <path
          d="M-60 660C240 580 540 740 860 640C1140 552 1320 620 1500 560"
          stroke="#0F7656"
          strokeOpacity="0.11"
          strokeWidth="1.2"
        />
        <path
          d="M-40 1240C300 1160 620 1320 960 1220C1200 1150 1360 1210 1500 1170"
          stroke="#8C5828"
          strokeOpacity="0.1"
          strokeWidth="1.1"
          strokeDasharray="6 8"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-[1340px] space-y-8 px-4 py-5 sm:px-6 lg:px-8">
        {/* ========================================================================
            TẦNG 1: SÂN KHẤU KỂ CHUYỆN CHUYỂN TẦNG MỀM + 3 THẺ BENTO BO TRÒN LỚN
            ======================================================================== */}
        <div className="relative">
          {/* KHỐI A — KHUNG HERO THÍCH ỨNG KHUNG GIỜ + CHÒM SAO TIẾN ĐỘ CHƯƠNG + SÓNG MÂY */}
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
              className="min-h-[320px] md:min-h-[390px] lg:min-h-[450px]"
            >
              <div className="relative z-10 flex flex-col justify-between gap-6 p-6 pb-20 sm:p-8 sm:pb-24 md:flex-row md:items-center md:justify-between md:pb-32 lg:p-11 lg:pb-38">
                <div className="flex max-w-2xl flex-col justify-between gap-5">
                  {/* Hàng trên: Nhãn khung giờ + ngày hôm nay + pill kỳ thi sắp tới (nếu có) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      data-testid="hero-period-badge"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3.5 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-white/95 backdrop-blur-md"
                    >
                      {renderPeriodIcon(timeGreeting.period)}
                      <span>{timeGreeting.badgeLabel}</span>
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
                        data-testid="hero-milestone-pill"
                        title={
                          nearestMilestone.pacePlan?.summary ?? nearestMilestone.milestone.title
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#F0C87D]/45 bg-[#17332C]/75 px-3 py-1 font-mono text-[10.5px] font-semibold text-[#F5D89B] backdrop-blur-md transition-colors hover:bg-[#17332C]"
                      >
                        <Pin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span className="max-w-[260px] truncate">
                          {formatCountdownLabel(nearestMilestone.daysUntil)} ·{' '}
                          {nearestMilestone.milestone.title}
                          {nearestMilestone.pacePlan
                            ? ` · ${nearestMilestone.pacePlan.shortLabel}`
                            : ''}
                        </span>
                      </a>
                    )}
                  </div>

                  {/* Khối câu tục ngữ chủ đạo kiểu ấn phẩm di sản + danh ngôn học thuật */}
                  <div className="max-w-2xl space-y-3.5">
                    <div className="relative pl-4 sm:pl-5">
                      {/* Thanh dọc ánh vàng đồng — ngọc bích tạo khung trích dẫn học thuật */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1 bottom-1 left-0 w-[2.5px] rounded-full bg-gradient-to-b from-[#F5D38E] via-[#7DD9B4]/75 to-transparent"
                      />
                      {/* Dấu ngoặc kép thư pháp lớn làm nền mờ tinh tế */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-5 -left-1.5 font-serif text-6xl leading-none text-[#F5D38E]/22 select-none sm:text-7xl"
                      >
                        &ldquo;
                      </span>

                      <h1
                        data-testid="hero-time-greeting"
                        className="relative font-serif text-[28px] leading-[1.18] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)] sm:text-[36px] lg:text-[42px]"
                      >
                        <span className="sr-only">LEARNING UNIVERSE — Không gian Tổng quan — </span>
                        <span className="block font-medium text-white/95">Đi một ngày đàng,</span>
                        <span className="mt-0.5 block pl-4 sm:pl-8">
                          <span className="font-normal text-white/88 italic">học một </span>
                          <span className="relative inline-block pr-1.5 font-semibold italic">
                            <span className="bg-gradient-to-r from-[#FFF6D9] via-[#F4CE80] to-[#A6E9CE] bg-clip-text text-transparent">
                              sàng khôn
                            </span>
                            {/* Nét bút uốn lượn ánh vàng đồng nhấn dưới cụm "sàng khôn" */}
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 180 12"
                              preserveAspectRatio="none"
                              className="pointer-events-none absolute -bottom-1 left-0 h-2.5 w-full overflow-visible"
                            >
                              <path
                                d="M2 8.5 Q 52 2.5, 118 6.5 T 178 4.5"
                                fill="none"
                                stroke="url(#proverb-gold-stroke)"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient
                                  id="proverb-gold-stroke"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop offset="0%" stopColor="#F5D38E" stopOpacity="0.92" />
                                  <stop offset="65%" stopColor="#A6E9CE" stopOpacity="0.82" />
                                  <stop offset="100%" stopColor="#A6E9CE" stopOpacity="0.15" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </span>
                        </span>
                      </h1>

                      <div className="mt-3 flex items-center gap-2.5 pl-4 sm:pl-8">
                        <span
                          aria-hidden="true"
                          className="h-px w-8 bg-gradient-to-r from-[#F5D38E]/90 to-[#F5D38E]/15"
                        />
                        <span
                          aria-hidden="true"
                          className="text-[9px] text-[#F5D38E]/90 select-none"
                        >
                          ◆
                        </span>
                        <span className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-[#F5D89B]/95 uppercase">
                          Tục ngữ Việt Nam
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <p
                        data-testid="dashboard-quote-text"
                        className="font-serif text-[13.5px] leading-relaxed text-white/82 italic sm:text-[14.5px]"
                      >
                        &ldquo;{currentQuote.content}&rdquo; —{' '}
                        <span className="font-sans text-xs font-medium text-white/68 not-italic">
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
                    <a
                      href="#lich-bieu-hoc-tap"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-medium text-white/95 backdrop-blur-md transition-colors hover:bg-white/20"
                    >
                      <CalendarDays className="h-3.5 w-3.5 text-[#6EE7B7]" aria-hidden="true" />
                      <span>Lịch biểu hôm nay</span>
                    </a>
                  </div>
                </div>

                {/* Cột phải Hero: Chòm sao tiến độ chương đang học (SVG tĩnh, 0% CPU nhàn rỗi) */}
                <div className="hidden shrink-0 flex-col items-center justify-center md:flex">
                  <ActiveChapterConstellation
                    subjectsOverride={subjects}
                    completedLessonsOverride={completedLessons}
                    lastVisitedGlobalOverride={lastVisitedGlobal}
                  />
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
              className="relative flex min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_18px_42px_-18px_rgba(16,45,35,0.16)] lg:col-span-5 dark:border-white/[0.07] dark:bg-[#141D1A]"
            >
              {/* Dải sắc độ học phần viền đỉnh thẻ + hoa văn bản vẽ cổ điển góc phải */}
              <div
                aria-hidden="true"
                style={{
                  background: `linear-gradient(90deg, ${resumeAccentColor} 0%, #0F7656 55%, #D4AF6A 100%)`,
                }}
                className="pointer-events-none absolute inset-x-0 top-0 h-1.5 opacity-85"
              />
              <div
                aria-hidden="true"
                style={{
                  background: `radial-gradient(circle at 90% 12%, ${resumeAccentColor}22 0%, transparent 58%)`,
                }}
                className="pointer-events-none absolute inset-0"
              />
              <svg
                viewBox="0 0 200 130"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 -right-2 h-32 w-48 opacity-[0.2] dark:opacity-[0.28]"
              >
                <circle
                  cx="148"
                  cy="42"
                  r="44"
                  stroke={resumeAccentColor}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="lu-orbit-ring"
                />
                <circle cx="148" cy="42" r="28" stroke={resumeAccentColor} strokeWidth="0.9" />
                <polygon
                  points="148,16 172,42 148,68 124,42"
                  fill={resumeAccentColor}
                  fillOpacity="0.1"
                  stroke={resumeAccentColor}
                  strokeWidth="1"
                />
                <path d="M100 42H192M148 0V88" stroke={resumeAccentColor} strokeWidth="0.7" />
                <circle cx="148" cy="42" r="3" fill={resumeAccentColor} />
              </svg>

              <div className="relative z-10 space-y-3">
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

                {/* Trên mobile (< md) chòm sao Hero ẩn nên hiển thị dãy chip bài trong chương tại đây;
                    trên màn rộng (md+) chòm sao Hero đã hiển thị đầy đủ nên chỉ hiện tóm tắt tiến độ chương */}
                {resumeLocation && (
                  <>
                    <div
                      data-testid="resume-chapter-chips-mobile"
                      className="flex flex-wrap items-center gap-1.5 pt-0.5 md:hidden"
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

                    {resumeChapterSummary && (
                      <div
                        data-testid="resume-chapter-summary-desktop"
                        className="hidden flex-wrap items-center justify-between gap-2 pt-0.5 text-[11.5px] text-[var(--text-secondary)] md:flex"
                      >
                        <span className="font-mono text-[11px] tabular-nums">
                          Chương {resumeLocation.chapter.number}:{' '}
                          <strong className="text-[var(--text-main)]">
                            {resumeChapterSummary.doneInChapter}/
                            {resumeChapterSummary.totalInChapter}
                          </strong>{' '}
                          bài hoàn thành
                        </span>
                        {resumeChapterSummary.nextUnfinished && (
                          <Link
                            to={resumeChapterSummary.nextUnfinished.to}
                            title={resumeChapterSummary.nextUnfinished.title}
                            className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold text-[#0F7656] hover:underline dark:text-[#4AD1A3]"
                          >
                            <span>Bài tiếp {resumeChapterSummary.nextUnfinished.label}</span>
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    )}
                  </>
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
                {/* Ô 1: Sắc Hổ Phách — Bài hoàn thành + họa tiết trang sách chìm */}
                <div className="relative overflow-hidden rounded-[18px] border border-[#E7D7C5]/70 bg-gradient-to-br from-[#FDF8F1]/90 via-white/80 to-[#F9F1E4]/75 p-2.5 dark:border-[#3A2D20] dark:from-[#211A13]/85 dark:via-[#182320]/80 dark:to-[#1D1711]/80">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -bottom-2 h-11 w-11 text-[#8C5828]/15 dark:text-[#D99B5E]/20"
                  >
                    <rect
                      x="10"
                      y="10"
                      width="24"
                      height="28"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 18H28M16 24H28M16 30H22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="font-mono text-[9.5px] font-semibold tracking-wider text-[#8C5828] uppercase dark:text-[#D99B5E]">
                    Bài hoàn thành
                  </p>
                  <p className="mt-1.5 font-mono text-base font-bold text-[var(--text-main)] tabular-nums">
                    {completedCount}
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">
                      /{totalLessons}
                    </span>
                  </p>
                </div>

                {/* Ô 2: Sắc Ngọc Lục Bảo — Tiến độ tổng */}
                <div className="relative overflow-hidden rounded-[18px] border border-[#C5DFD4]/75 bg-gradient-to-br from-[#EFF9F4]/90 via-white/80 to-[#E4F3EC]/75 p-2.5 dark:border-[#1F3B31] dark:from-[#12241D]/85 dark:via-[#182320]/80 dark:to-[#10201A]/80">
                  <p className="font-mono text-[9.5px] font-semibold tracking-wider text-[#0F7656] uppercase dark:text-[#4AD1A3]">
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
                        className="text-[#CDE3DA] dark:text-[#23322D]"
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

                {/* Ô 3: Sắc Hồng Ngọc — Chuỗi ngày học liên tiếp (thay số lượng thuật ngữ tĩnh) */}
                <div
                  data-testid="dashboard-streak-cell"
                  title={`Kỷ lục: ${activityMetrics.bestStreak} ngày`}
                  className="relative overflow-hidden rounded-[18px] border border-[#F0D9C4]/75 bg-gradient-to-br from-[#FDF4E7]/90 via-white/80 to-[#FBEBDD]/75 p-2.5 dark:border-[#3A2A1C] dark:from-[#261D12]/85 dark:via-[#182320]/80 dark:to-[#21170F]/80"
                >
                  <Flame
                    className="pointer-events-none absolute -right-1.5 -bottom-1.5 h-10 w-10 text-[#C27824]/15 dark:text-[#E5A95C]/20"
                    aria-hidden="true"
                  />
                  <p className="font-mono text-[9.5px] font-semibold tracking-wider text-[#C27824] uppercase dark:text-[#E5A95C]">
                    Chuỗi ngày
                  </p>
                  <p className="mt-1.5 font-mono text-base font-bold text-[var(--text-main)] tabular-nums">
                    {activityMetrics.currentStreak}
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">
                      {' '}
                      / {activityMetrics.bestStreak}
                    </span>
                  </p>
                </div>
              </div>

              {/* Thanh khởi động nhanh Pomodoro (cô lập 1Hz re-render) */}
              <DashboardPomodoroBar />
            </div>

            {/* THẺ 3 (3/12) — NGỌC LỤC BẢO: Việc hôm nay + mục tiêu tuần (thay lối tắt trùng Rail) */}
            <TodayAgendaCard
              tasks={workspaceBucket.tasks}
              weekLessonsCount={activityMetrics.weekLessonsCount}
              targetLessons={workspaceBucket.weeklyGoal.targetLessons}
            />
          </section>
        </div>

        {/* Thanh điều khiển tùy chỉnh ẩn/hiện & sắp xếp các tầng theo tài khoản */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="font-mono text-[10.5px] text-[var(--text-muted)]">
            Không gian cá nhân hóa · {dashboardLayout.order.length - dashboardLayout.hidden.length}/
            {dashboardLayout.order.length} khối đang hiển thị
          </p>
          <DashboardLayoutCustomizer
            layout={dashboardLayout}
            onToggleSection={toggleDashboardSection}
            onMoveSection={moveDashboardSection}
            onReset={resetDashboardLayout}
          />
        </div>

        {/* ========================================================================
            CÁC TẦNG MÔ-ĐUN TÙY CHỈNH THỨ TỰ & ẨN/HIỆN THEO TÀI KHOẢN
            ======================================================================== */}
        {(() => {
          const hiddenSet = new Set(dashboardLayout.hidden);
          const visibleIds = dashboardLayout.order.filter((id) => !hiddenSet.has(id));

          if (visibleIds.length === 0) {
            return (
              <div
                data-testid="dashboard-all-sections-hidden"
                className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-dashed border-[var(--border-hairline)] bg-white/80 p-8 text-center dark:bg-[#141D1A]/80"
              >
                <p className="font-serif text-base font-semibold text-[var(--text-main)]">
                  Tất cả các khối nội dung bên dưới đang được ẩn
                </p>
                <button
                  type="button"
                  onClick={resetDashboardLayout}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#0F7656] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Khôi phục bố cục mặc định</span>
                </button>
              </div>
            );
          }

          const renderSectionBlock = (id: DashboardSectionId, colSpanClass?: string): ReactNode => {
            if (id === 'rhythm') {
              return (
                <div
                  key="rhythm"
                  data-dashboard-section="rhythm"
                  className={colSpanClass ?? 'w-full'}
                >
                  <DashboardAnalyticsCard metrics={activityMetrics} />
                </div>
              );
            }

            if (id === 'studio') {
              return (
                <div
                  key="studio"
                  data-dashboard-section="studio"
                  className={colSpanClass ?? 'w-full'}
                >
                  <RecentStudioShelf />
                </div>
              );
            }

            if (id === 'subjects') {
              return (
                <section
                  key="subjects"
                  data-dashboard-section="subjects"
                  aria-label="Bốn học phần trọng tâm"
                  className="space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.04] bg-white/75 px-4 py-3 shadow-2xs backdrop-blur-md dark:border-white/[0.06] dark:bg-[#141D1A]/80">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F7656] to-[#17332C] text-[#F5D078] shadow-xs">
                        <Compass className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-mono text-[10.5px] font-bold tracking-[0.14em] text-[#0F7656] uppercase dark:text-[#4AD1A3]">
                            Học phần trọng tâm
                          </h2>
                          <span aria-hidden="true" className="text-xs text-[#D4AF6A]">
                            ◆
                          </span>
                          <span className="hidden font-mono text-[10px] text-[var(--text-muted)] sm:inline">
                            {subjectCards.length} học phần · {totalLessons} bài giảng
                          </span>
                        </div>
                        <p className="font-serif text-base font-semibold text-[var(--text-main)] sm:text-[17px]">
                          Bản đồ Mô hình Toán học &amp; Khoa học Giáo dục
                        </p>
                      </div>
                    </div>

                    <Link
                      to={ROUTES.learningSpace}
                      className="group/all inline-flex items-center gap-1.5 rounded-full border border-[#0F7656]/25 bg-[#EAF5F0] px-3.5 py-1.5 font-mono text-[11px] font-semibold text-[#0F7656] shadow-2xs transition-all hover:bg-[#0F7656] hover:text-white dark:border-[#4AD1A3]/25 dark:bg-[#132C24] dark:text-[#4AD1A3] dark:hover:bg-[#286D57] dark:hover:text-white"
                    >
                      <span>Mở bản đồ đầy đủ</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-150 group-hover/all:translate-x-0.5"
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
              );
            }

            if (id === 'planner') {
              return (
                <section
                  key="planner"
                  id="lich-bieu-hoc-tap"
                  data-dashboard-section="planner"
                  aria-label="Kế hoạch cá nhân hóa và đếm ngược kỳ thi"
                  data-testid="calendar-studio-section"
                  className="scroll-mt-16 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.04] bg-white/75 px-4 py-3 shadow-2xs backdrop-blur-md dark:border-white/[0.06] dark:bg-[#141D1A]/80">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F7656] to-[#1D4F6E] text-white shadow-xs">
                        <CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-mono text-[10.5px] font-bold tracking-[0.14em] text-[#0F7656] uppercase dark:text-[#4AD1A3]">
                            Không gian Lịch biểu &amp; Kỳ thi
                          </h2>
                          <span aria-hidden="true" className="text-xs text-[#D4AF6A]">
                            ◆
                          </span>
                        </div>
                        <p className="font-serif text-base font-semibold text-[var(--text-main)] sm:text-[17px]">
                          Kế hoạch Ôn tập &amp; Đếm ngược Kỳ thi theo Tiến độ
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--text-secondary)]">
                      <span className="rounded-full border border-[#0F7656]/20 bg-[#EAF5F0]/80 px-3 py-1 font-medium shadow-2xs dark:border-[#4AD1A3]/20 dark:bg-[#132C24]">
                        <strong className="text-[#0F7656] dark:text-[#4AD1A3]">
                          {pendingTasksCount}
                        </strong>{' '}
                        việc đang chờ
                      </span>
                    </div>
                  </div>

                  <StudyPlannerWidget
                    activityByDate={activityMetrics.activityByDate}
                    subjectProgressBySlug={subjectProgressBySlug}
                  />
                </section>
              );
            }

            if (id === 'heritage') {
              return (
                <div
                  key="heritage"
                  data-dashboard-section="heritage"
                  data-testid="dashboard-heritage-card"
                  className={cn(
                    'group/heritage relative flex min-w-0 flex-col justify-between gap-4 overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 dark:border-white/[0.07] dark:bg-[#141D1A]',
                    colSpanClass,
                  )}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-12 -left-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,175,106,0.18)_0%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(212,175,106,0.14)_0%,transparent_72%)]"
                  />
                  <div className="relative z-10 flex items-center justify-between gap-2">
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
              );
            }

            // id === 'review'
            if (!currentGlossary) return null;
            return (
              <div
                key="review"
                data-dashboard-section="review"
                className={colSpanClass ?? 'w-full'}
              >
                <GlossaryFlashcardCard
                  entry={currentGlossary}
                  onShuffle={handleShuffleGlossary}
                  dueReviews={dueReviewLessons}
                  onMarkReviewed={markLessonReviewed}
                />
              </div>
            );
          };

          const isPaired = (a: DashboardSectionId, b: DashboardSectionId): boolean =>
            (a === 'rhythm' && b === 'studio') ||
            (a === 'studio' && b === 'rhythm') ||
            (a === 'heritage' && b === 'review') ||
            (a === 'review' && b === 'heritage');

          const getPairSpan = (id: DashboardSectionId): string =>
            id === 'rhythm' || id === 'heritage' ? 'lg:col-span-7' : 'lg:col-span-5';

          const rows: ReactNode[] = [];
          for (let i = 0; i < visibleIds.length; i += 1) {
            const curr = visibleIds[i]!;
            const next = visibleIds[i + 1];
            if (next && isPaired(curr, next)) {
              rows.push(
                <div
                  key={`${curr}-${next}`}
                  className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
                >
                  {renderSectionBlock(curr, getPairSpan(curr))}
                  {renderSectionBlock(next, getPairSpan(next))}
                </div>,
              );
              i += 1;
            } else {
              rows.push(renderSectionBlock(curr));
            }
          }

          return <div className="space-y-8">{rows}</div>;
        })()}
      </div>
    </div>
  );
}

export default HomePage;
