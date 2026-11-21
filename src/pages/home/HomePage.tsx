import {
  ArrowRight,
  BookMarked,
  Check,
  Hourglass,
  Landmark,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react';
import { type CSSProperties, type MouseEvent, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  HERITAGE_ARTWORKS,
  HeritageFallbackIllustration,
} from '@/components/home/HeritageArtShowcase';
import { SubjectStageCanvas } from '@/components/home/SubjectStageCanvas';
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

interface SubjectVisualStyle {
  readonly code: string;
  readonly color: string;
  readonly darkColor: string;
  readonly rgb: string;
  readonly pillClass: string;
  readonly formulaBadge: string;
}

const SUBJECT_ACCENT_MAP: Record<string, SubjectVisualStyle> = {
  'cau-truc-dai-so': {
    code: 'CTĐS',
    color: '#8C5828',
    darkColor: '#D99B5E',
    rgb: '140, 88, 40',
    pillClass:
      'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
    formulaBadge: 'G / ker φ ≅ Im φ',
  },
  'hinh-hoc-affine': {
    code: 'HHAVE',
    color: '#1D4F6E',
    darkColor: '#64A8D1',
    rgb: '29, 79, 110',
    pillClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    formulaBadge: 'Aff(E) ⋉ GL(V)',
  },
  'giai-tich-ham-mot-bien': {
    code: 'GTHMB',
    color: '#1B5E4A',
    darkColor: '#52B394',
    rgb: '27, 94, 74',
    pillClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    formulaBadge: '∫ f(x)dx = F(b) − F(a)',
  },
  'giao-duc-hoc': {
    code: 'GDH',
    color: '#8F3D35',
    darkColor: '#DF7B70',
    rgb: '143, 61, 53',
    pillClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    formulaBadge: 'Tri thức ↔ Sư phạm',
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

function updateCardSpotlight(event: MouseEvent<HTMLElement>): void {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--spot-x', `${Math.round(event.clientX - rect.left)}px`);
  el.style.setProperty('--spot-y', `${Math.round(event.clientY - rect.top)}px`);
}

/**
 * Minh họa hình học tương tác riêng cho từng thẻ trong lưới 4 học phần tại Trang Tổng quan (/).
 */
function SubjectMiniVisualStage({
  slug,
  color,
}: {
  readonly slug: string;
  readonly color: string;
}) {
  if (slug === 'cau-truc-dai-so') {
    return (
      <svg
        viewBox="0 0 260 92"
        aria-hidden="true"
        className="h-full w-full overflow-visible transition-transform duration-500 ease-out group-hover:scale-105"
      >
        <g className="lu-orbit-ring" stroke={color} fill="none">
          <circle cx="72" cy="46" r="32" strokeOpacity="0.22" strokeDasharray="3 3" />
          <polygon
            points="72,18 96,32 96,60 72,74 48,60 48,32"
            strokeWidth="1.35"
            strokeOpacity="0.78"
            fill={color}
            fillOpacity="0.07"
          />
          <line x1="72" y1="18" x2="72" y2="74" strokeOpacity="0.35" strokeWidth="0.9" />
          <line x1="48" y1="32" x2="96" y2="60" strokeOpacity="0.35" strokeWidth="0.9" />
          <line x1="96" y1="32" x2="48" y2="60" strokeOpacity="0.35" strokeWidth="0.9" />
          {[
            [72, 18],
            [96, 32],
            [96, 60],
            [72, 74],
            [48, 60],
            [48, 32],
          ].map(([cx, cy], idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r="2.8"
              fill={idx % 2 === 0 ? color : 'var(--bg-workspace)'}
              stroke={color}
              strokeWidth="1.3"
            />
          ))}
        </g>

        <path
          d="M 110 46 C 126 32, 142 32, 158 46"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeOpacity="0.65"
          className="lu-dg-stream"
        />

        <g
          className="origin-[194px_46px] transition-transform duration-500 ease-out group-hover:rotate-12"
          stroke={color}
          fill="none"
        >
          <circle cx="194" cy="46" r="24" strokeWidth="1.3" strokeOpacity="0.75" />
          <rect
            x="178"
            y="30"
            width="32"
            height="32"
            rx="3"
            strokeWidth="1.15"
            strokeOpacity="0.55"
            fill={color}
            fillOpacity="0.06"
          />
          <circle cx="194" cy="46" r="3.5" fill={color} />
        </g>
      </svg>
    );
  }

  if (slug === 'hinh-hoc-affine') {
    return (
      <svg
        viewBox="0 0 260 92"
        aria-hidden="true"
        className="h-full w-full overflow-visible transition-transform duration-500 ease-out group-hover:scale-105"
      >
        <g stroke={color} strokeOpacity="0.32" strokeDasharray="3 3" fill="none">
          <line x1="28" y1="54" x2="126" y2="20" />
          <line x1="28" y1="54" x2="138" y2="52" />
          <line x1="28" y1="54" x2="118" y2="78" />
        </g>
        <circle cx="28" cy="54" r="3.2" fill={color} />
        <polygon
          points="86,31 98,52 80,68"
          fill={color}
          fillOpacity="0.09"
          stroke={color}
          strokeWidth="1.35"
          className="origin-[88px_50px] transition-transform duration-500 group-hover:translate-x-1"
        />
        <polygon
          points="126,20 138,52 118,78"
          fill={color}
          fillOpacity="0.05"
          stroke={color}
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />

        <g
          className="origin-[196px_46px] transition-transform duration-500 ease-out group-hover:rotate-[-6deg]"
          stroke={color}
          fill="none"
        >
          <ellipse
            cx="196"
            cy="46"
            rx="40"
            ry="22"
            fill={color}
            fillOpacity="0.07"
            strokeWidth="1.35"
          />
          <ellipse
            cx="196"
            cy="46"
            rx="40"
            ry="9"
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />
          <ellipse cx="196" cy="46" rx="14" ry="22" strokeWidth="1" strokeOpacity="0.55" />
          <circle cx="196" cy="46" r="3" fill={color} />
        </g>
      </svg>
    );
  }

  if (slug === 'giai-tich-ham-mot-bien') {
    return (
      <svg
        viewBox="0 0 260 92"
        aria-hidden="true"
        className="h-full w-full overflow-visible transition-transform duration-500 ease-out group-hover:scale-105"
      >
        <line x1="18" y1="72" x2="242" y2="72" stroke={color} strokeOpacity="0.3" strokeWidth="1" />
        {[34, 54, 74, 94, 114, 134, 154, 174, 194].map((x, idx) => {
          const h = [22, 34, 44, 48, 40, 28, 22, 30, 42][idx] ?? 28;
          return (
            <rect
              key={x}
              x={x}
              y={72 - h}
              width="16"
              height={h}
              rx="2"
              fill={color}
              fillOpacity={0.08 + (idx % 3) * 0.04}
              stroke={color}
              strokeOpacity="0.38"
              strokeWidth="0.9"
            />
          );
        })}
        <path
          d="M 22 64 C 52 24, 92 14, 132 36 C 166 56, 198 42, 238 18"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 22 64 C 52 24, 92 14, 132 36 C 166 56, 198 42, 238 18"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="lu-dg-stream"
        />
        <circle
          cx="102"
          cy="24"
          r="3.5"
          fill="var(--bg-workspace)"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 92"
      aria-hidden="true"
      className="h-full w-full overflow-visible transition-transform duration-500 ease-out group-hover:scale-105"
    >
      <g
        className="origin-[84px_46px] transition-transform duration-500 ease-out group-hover:rotate-12"
        stroke={color}
        fill="none"
      >
        <circle cx="84" cy="34" r="20" fill={color} fillOpacity="0.07" strokeWidth="1.35" />
        <circle cx="71" cy="54" r="20" fill={color} fillOpacity="0.07" strokeWidth="1.35" />
        <circle cx="97" cy="54" r="20" fill={color} fillOpacity="0.07" strokeWidth="1.35" />
        <circle cx="84" cy="47" r="3" fill={color} />
      </g>
      <path
        d="M 122 46 L 156 46"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        strokeOpacity="0.6"
      />
      <g className="lu-orbit-ring-reverse" stroke={color} fill="none">
        <circle cx="194" cy="46" r="25" strokeOpacity="0.28" strokeDasharray="3 3" />
        <polygon
          points="194,23 201,39 217,46 201,53 194,69 187,53 171,46 187,39"
          fill={color}
          fillOpacity="0.08"
          strokeWidth="1.25"
        />
        <circle cx="194" cy="46" r="3.2" fill={color} />
      </g>
    </svg>
  );
}

/**
 * TRANG CHỦ (/): WORKSPACE DASHBOARD — KINETIC MATHEMATICAL ATELIER
 */
export function HomePage() {
  const subjects = getSubjects();
  const allGlossaryEntries = useMemo(() => getAllGlossaryEntries(), []);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const { pomodoro, startPomodoro, pausePomodoro, resumePomodoro, resetPomodoro } = useIsland();
  const { openCommandPalette } = useLayout();

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isResumeStageHovered, setIsResumeStageHovered] = useState(false);
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
        darkColor: '#52B394',
        rgb: '23, 51, 44',
        pillClass:
          'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]',
        formulaBadge: subject.shortTitle,
      };
      return {
        subject,
        chapterCount: stats.chapterCount,
        lessonCount: stats.lessonCount,
        completedCount: done,
        percent,
        code: style.code,
        color: style.color,
        darkColor: style.darkColor,
        rgb: style.rgb,
        pillClass: style.pillClass,
        formulaBadge: style.formulaBadge,
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

  // 4 tác phẩm tiêu biểu gần vị trí hiện tại để chọn nhanh trên filmstrip
  const featuredHeritageStrip = useMemo(() => {
    const len = HERITAGE_ARTWORKS.length;
    if (len === 0) return [];
    const base = Math.floor(heritageIndex / 4) * 4;
    return [0, 1, 2, 3].map((offset) => {
      const idx = (base + offset) % len;
      return { idx, artwork: HERITAGE_ARTWORKS[idx]! };
    });
  }, [heritageIndex]);

  const isPomodoroActive = pomodoro.status !== 'idle';
  const isPomodoroRunning = pomodoro.status === 'running';
  const pomodoroTotalSec = Math.max(1, pomodoro.totalSeconds || 1500);
  const pomodoroProgressRatio = isPomodoroActive
    ? Math.min(1, Math.max(0, 1 - pomodoro.remainingSeconds / pomodoroTotalSec))
    : 0;
  const isHeritageFallback = failedHeritageId === currentHeritage.id;

  return (
    <div
      data-testid="workspace-dashboard"
      className="lu-atelier-backdrop min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      <div className="mx-auto max-w-[1240px] space-y-6 px-6 py-7 lg:px-10">
        {/* A. THANH CHÀO MỪNG & DANH NGÔN 1 DÒNG (SẠCH GỌN, KHÔNG CHỮ THỪA) */}
        <header className="flex flex-col justify-between gap-3 border-b border-[var(--border-hairline)] pb-4 sm:flex-row sm:items-end">
          <div className="min-w-0 space-y-1">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-main)] sm:text-[1.75rem]">
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

          <div className="flex shrink-0 items-center gap-2">
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
              <kbd className="font-mono text-[10.5px] font-semibold text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* B. HÀNG BENTO 1 — SÂN KHẤU HỌC TIẾP TƯƠNG TÁC & ĐỒNG HỒ RADIAL TẬP TRUNG (7 : 5) */}
        <section
          aria-label="Hành động chính và tiến độ học tập"
          className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        >
          {/* Cột Trái (7 cột) — Sân khấu "Tiếp tục học tập" kèm Canvas Toán học sống động & Lộ trình bước chương */}
          <div
            data-testid="dashboard-resume-card"
            onMouseMove={updateCardSpotlight}
            onMouseEnter={() => setIsResumeStageHovered(true)}
            onMouseLeave={() => setIsResumeStageHovered(false)}
            style={
              {
                borderLeftWidth: '3px',
                borderLeftColor: resumeAccentColor,
                '--spot-glow': `rgba(${resumeCardStats?.rgb ?? '140, 88, 40'}, 0.11)`,
                '--spot-glow-dark': `rgba(${resumeCardStats?.rgb ?? '140, 88, 40'}, 0.22)`,
              } as CSSProperties
            }
            className="lu-bento-interactive group/resume flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)] sm:p-6 lg:col-span-7"
          >
            <div className="relative z-10 grid grid-cols-1 items-center gap-5 sm:grid-cols-12">
              {/* Cột Nội dung bài đang đọc (7/12) */}
              <div className="flex flex-col justify-between space-y-3 sm:col-span-7">
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
                      {resumeCardStats.code} · {resumeCardStats.percent}%
                    </span>
                  )}
                </div>

                {resumeLocation ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {resumeLocation.subject.title} · Chương {resumeLocation.chapter.number}
                    </p>
                    <h2 className="font-serif text-lg leading-snug font-semibold text-[var(--text-main)] sm:text-xl">
                      {resumeLocation.lesson.title}
                    </h2>
                  </div>
                ) : (
                  <h2 className="font-serif text-lg font-semibold text-[var(--text-main)]">
                    Bắt đầu hành trình học tập
                  </h2>
                )}

                {/* Thanh bước bài học trong chương hiện tại (Interactive Chapter Step-Track) */}
                {resumeLocation && (
                  <div className="space-y-1.5 pt-0.5">
                    <div
                      className="flex flex-wrap items-center gap-1.5"
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
                                  ? 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--accent-os)]'
                                  : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)]/70 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]',
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
                  </div>
                )}
              </div>

              {/* Cột Sân khấu Đồ họa Toán học tương tác 120fps (5/12) */}
              <div className="relative overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] sm:col-span-5">
                <SubjectStageCanvas
                  slug={resumeLocation?.subject.slug ?? 'cau-truc-dai-so'}
                  isCardHovered={isResumeStageHovered}
                />
                {resumeCardStats && (
                  <span className="pointer-events-none absolute right-2 bottom-2 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)]/90 px-2 py-0.5 font-mono text-[9.5px] font-semibold text-[var(--text-secondary)] backdrop-blur-xs">
                    {resumeCardStats.formulaBadge}
                  </span>
                )}
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-3.5">
              <Link
                to={resumeHref}
                className="group/cta inline-flex items-center gap-2 rounded-lg bg-[var(--accent-os)] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all duration-150 hover:bg-[var(--accent-primary-hover)] active:scale-[0.98]"
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

          {/* Cột Phải (5 cột) — Đồng hồ Radial 4 Vòng Học phần & Nhịp Pomodoro trực quan */}
          <div
            data-testid="dashboard-metrics-card"
            onMouseMove={updateCardSpotlight}
            className="lu-bento-interactive flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)] lg:col-span-5"
          >
            {/* Khối trên: Vòng đồng tâm 4 học phần (Radial Mastery Dial) + 3 chỉ số */}
            <div className="relative z-10 flex items-center gap-4">
              {/* Vòng đồng tâm SVG 4 quỹ đạo môn học */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]">
                <svg viewBox="0 0 96 96" className="h-20 w-20 -rotate-90" aria-hidden="true">
                  {subjectCards.map((card, idx) => {
                    const r = 38 - idx * 6.5;
                    const c = 2 * Math.PI * r;
                    const ratio = Math.max(0.08, card.percent / 100);
                    return (
                      <g key={card.subject.slug}>
                        <circle
                          cx="48"
                          cy="48"
                          r={r}
                          fill="none"
                          stroke="var(--border-hairline)"
                          strokeWidth="3.2"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r={r}
                          fill="none"
                          stroke={card.color}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeDasharray={`${(c * ratio).toFixed(1)} ${c.toFixed(1)}`}
                        />
                      </g>
                    );
                  })}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-xs font-bold text-[var(--text-main)] tabular-nums">
                    {totalPercent}%
                  </span>
                </div>
              </div>

              {/* 3 Ô chỉ số tinh gọn */}
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-2.5">
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Bài hoàn thành
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[var(--text-main)] tabular-nums">
                    {completedCount}
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">
                      /{totalLessons}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-2.5">
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Tiến độ tổng
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[var(--accent-os)] tabular-nums">
                    {totalPercent}%
                  </p>
                </div>

                <Link
                  to={ROUTES.glossary}
                  className="group col-span-2 flex items-center justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-2 transition-colors hover:border-[var(--accent-os)]/40"
                >
                  <span className="font-mono text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Kho Thuật ngữ
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[var(--text-main)] tabular-nums group-hover:text-[var(--accent-os)]">
                    <span>{allGlossaryEntries.length}+ mục</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Khối dưới: Thanh Pomodoro có vòng đếm ngược trực quan */}
            <div
              data-testid="dashboard-pomodoro-bar"
              className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 32 32" className="absolute inset-0 h-8 w-8 -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="13.5"
                      fill="none"
                      stroke="var(--border-hairline)"
                      strokeWidth="2.2"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="13.5"
                      fill="none"
                      stroke="var(--accent-heritage)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeDasharray={`${(84.8 * (isPomodoroActive ? Math.max(0.08, 1 - pomodoroProgressRatio) : 1)).toFixed(1)} 84.8`}
                    />
                  </svg>
                  <Hourglass
                    className={cn(
                      'h-3.5 w-3.5 text-[var(--accent-heritage)]',
                      isPomodoroRunning && 'animate-pulse',
                    )}
                    aria-hidden="true"
                  />
                </div>
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
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
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

        {/* C. HÀNG BENTO 2 — LƯỚI 4 HỌC PHẦN VỚI ĐỒ HỌA HÌNH HỌC TƯƠNG TÁC ĐỘC BẢN */}
        <section aria-label="Bốn học phần trọng tâm" className="space-y-3">
          <div className="flex items-center justify-between">
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
            {subjectCards.map((item) => (
              <Link
                key={item.subject.slug}
                to={ROUTES.subjectOverview(item.subject.slug)}
                data-testid={`dashboard-subject-card-${item.subject.slug}`}
                onMouseMove={updateCardSpotlight}
                style={
                  {
                    '--spot-glow': `rgba(${item.rgb}, 0.13)`,
                    '--spot-glow-dark': `rgba(${item.rgb}, 0.25)`,
                  } as CSSProperties
                }
                className="lu-bento-interactive group flex flex-col justify-between gap-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:bg-[var(--bg-workspace)] hover:shadow-[var(--shadow-bento-hover)]"
              >
                {/* Sân khấu Hình học Vector sống động riêng cho từng môn */}
                <div
                  style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(${item.rgb}, 0.09) 0%, transparent 75%)`,
                  }}
                  className="relative z-10 h-24 w-full overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/80 px-2 py-1"
                >
                  <SubjectMiniVisualStage slug={item.subject.slug} color={item.color} />
                  <span className="pointer-events-none absolute right-2 bottom-1.5 font-mono text-[9px] font-medium text-[var(--text-muted)] opacity-80">
                    {item.formulaBadge}
                  </span>
                </div>

                {/* Đầu đề & Nhãn mã môn */}
                <div className="relative z-10 space-y-2">
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
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--text-secondary)] tabular-nums">
                      <span>{item.percent}%</span>
                      <ArrowRight
                        className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <h3 className="font-serif text-[16.5px] leading-snug font-semibold text-[var(--text-main)] transition-colors group-hover:text-[var(--accent-os)]">
                    {item.subject.title}
                  </h3>
                </div>

                {/* Thanh tiến độ mảnh dưới đáy */}
                <div className="relative z-10 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${Math.max(item.percent, item.completedCount > 0 ? 10 : 6)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* D. HÀNG BENTO 3 — BẢO TÀNG ÁNH SÁNG, SÂN KHẤU CÔNG THỨC KATEX & BÀN BIDA 8-BALL MINI (7 : 5) */}
        <section
          aria-label="Di sản học thuật, thuật ngữ và giải lao"
          className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        >
          {/* Cột Trái (7 cột) — "Di sản trong ngày" kèm Filmstrip 4 tác phẩm chọn nhanh */}
          <div
            data-testid="dashboard-heritage-card"
            onMouseMove={updateCardSpotlight}
            className="lu-bento-interactive group/heritage flex flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)] lg:col-span-7"
          >
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
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

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-shell)] shadow-xs sm:w-44">
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
                <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/65 px-2 py-0.5 font-mono text-[9.5px] font-medium text-white backdrop-blur-xs">
                  {currentHeritage.yearOrEra}
                </span>
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

                {/* Dải 4 nút chọn nhanh tác phẩm ngay trên thẻ */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    {featuredHeritageStrip.map(({ idx, artwork }) => {
                      const active = idx === heritageIndex;
                      return (
                        <button
                          key={artwork.id}
                          type="button"
                          onClick={() => setHeritageIndex(idx)}
                          title={artwork.title}
                          className={cn(
                            'cursor-pointer rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold transition-all',
                            active
                              ? 'border-[var(--accent-heritage)] bg-[var(--accent-heritage)] text-white'
                              : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-muted)] hover:border-[var(--accent-heritage)]/50 hover:text-[var(--text-main)]',
                          )}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>

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

          {/* Cột Phải (5 cột) — Sân khấu Công thức KaTeX & Bàn Bida 8-Ball Mini */}
          <div className="flex flex-col gap-3.5 lg:col-span-5">
            {currentGlossary && (
              <div
                data-testid="dashboard-glossary-card"
                onMouseMove={updateCardSpotlight}
                className="lu-bento-interactive flex flex-1 flex-col justify-between gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)]"
              >
                <div className="relative z-10 flex items-center justify-between gap-2">
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
                  className="group relative z-10 flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 transition-colors hover:border-[var(--accent-os)]/45"
                >
                  {/* Sân khấu công thức KaTeX nổi bật */}
                  <div className="lu-atelier-backdrop flex h-14 min-w-[78px] shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-sm text-[var(--text-main)] shadow-2xs">
                    <KatexMath math={currentGlossary.formula || currentGlossary.symbol} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
                      {currentGlossary.nameVi}
                    </p>
                    <p className="truncate font-mono text-[10.5px] text-[var(--text-muted)]">
                      {currentGlossary.nameEn}
                    </p>
                    {currentGlossary.brief && (
                      <p className="line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                        <InlineMathText text={currentGlossary.brief} />
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Thẻ Bida 8-Ball kèm minh họa mặt bàn Bida Emerald & tia ngắm */}
            <div
              data-testid="dashboard-billiards-card"
              onMouseMove={updateCardSpotlight}
              className="lu-bento-interactive group/billiards flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-bento-hover)]"
            >
              <div className="relative z-10 flex min-w-0 items-center gap-3">
                {/* Minh họa mặt bàn Bida 8-Ball thu nhỏ sống động */}
                <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-[#8C6D3F]/50 bg-[#163D31] shadow-inner">
                  <svg viewBox="0 0 80 48" className="h-full w-full" aria-hidden="true">
                    <rect
                      x="3"
                      y="3"
                      width="74"
                      height="42"
                      rx="4"
                      fill="none"
                      stroke="#C5A262"
                      strokeOpacity="0.45"
                      strokeWidth="1"
                    />
                    {/* Đường ngắm cơ tới bi số 8 */}
                    <line
                      x1="22"
                      y1="28"
                      x2="56"
                      y2="18"
                      stroke="#FAFBF9"
                      strokeOpacity="0.55"
                      strokeWidth="1"
                      strokeDasharray="2.5 2.5"
                      className="lu-dg-stream-fast"
                    />
                    {/* Bi cái (Cue ball) */}
                    <circle
                      cx="22"
                      cy="28"
                      r="5"
                      fill="#FAFBF9"
                      className="transition-transform duration-300 group-hover/billiards:translate-x-1"
                    />
                    <circle cx="22" cy="28" r="1.1" fill="#C93B2B" />
                    {/* Bi số 8 */}
                    <g className="transition-transform duration-300 group-hover/billiards:translate-x-1.5 group-hover/billiards:-translate-y-0.5">
                      <circle
                        cx="56"
                        cy="18"
                        r="5.5"
                        fill="#101514"
                        stroke="#C5A262"
                        strokeWidth="0.7"
                      />
                      <circle cx="56" cy="18" r="2.6" fill="#FAFBF9" />
                      <text
                        x="56"
                        y="19.6"
                        textAnchor="middle"
                        fontSize="4.6"
                        fontWeight="bold"
                        fill="#101514"
                      >
                        8
                      </text>
                    </g>
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-main)]">
                    Sảnh Bida 8-Ball WPA
                  </p>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    Giải lao · Bàn 15 bi vật lý chuẩn WPA
                  </p>
                </div>
              </div>

              <Link
                to={ROUTES.sanctuaryTab('bida')}
                className="group/bida relative z-10 inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-all duration-150 hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)] active:scale-[0.98]"
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
