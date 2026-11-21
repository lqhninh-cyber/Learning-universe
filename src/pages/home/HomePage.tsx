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
import { AtmosphericCanopy } from '@/components/atmosphere/AtmosphericCanopy';
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
  readonly watercolorWash: string;
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
    watercolorWash:
      'radial-gradient(68% 92% at 24% 26%, rgba(140, 88, 40, 0.15) 0%, transparent 72%), radial-gradient(60% 84% at 82% 76%, rgba(158, 118, 59, 0.12) 0%, transparent 74%)',
  },
  'hinh-hoc-affine': {
    code: 'HHAVE',
    color: '#1D4F6E',
    darkColor: '#64A8D1',
    rgb: '29, 79, 110',
    pillClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    formulaBadge: 'Aff(E) ⋉ GL(V)',
    watercolorWash:
      'radial-gradient(68% 92% at 26% 24%, rgba(29, 79, 110, 0.16) 0%, transparent 72%), radial-gradient(58% 82% at 80% 74%, rgba(100, 168, 209, 0.12) 0%, transparent 74%)',
  },
  'giai-tich-ham-mot-bien': {
    code: 'GTHMB',
    color: '#1B5E4A',
    darkColor: '#52B394',
    rgb: '27, 94, 74',
    pillClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    formulaBadge: '∫ f(x)dx = F(b) − F(a)',
    watercolorWash:
      'radial-gradient(68% 92% at 28% 26%, rgba(27, 94, 74, 0.15) 0%, transparent 72%), radial-gradient(60% 82% at 78% 72%, rgba(82, 179, 148, 0.12) 0%, transparent 74%)',
  },
  'giao-duc-hoc': {
    code: 'GDH',
    color: '#8F3D35',
    darkColor: '#DF7B70',
    rgb: '143, 61, 53',
    pillClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    formulaBadge: 'Tri thức ↔ Sư phạm',
    watercolorWash:
      'radial-gradient(68% 92% at 26% 28%, rgba(143, 61, 53, 0.15) 0%, transparent 72%), radial-gradient(58% 82% at 80% 74%, rgba(223, 123, 112, 0.12) 0%, transparent 74%)',
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
 * Minh họa hình học tương tác riêng cho từng thẻ trong lưới 4 học phần tại Tầng 3.
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
            strokeOpacity="0.82"
            fill={color}
            fillOpacity="0.06"
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
          <circle cx="194" cy="46" r="24" strokeWidth="1.3" strokeOpacity="0.78" />
          <rect
            x="178"
            y="30"
            width="32"
            height="32"
            rx="3"
            strokeWidth="1.15"
            strokeOpacity="0.58"
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
        <g stroke={color} strokeOpacity="0.34" strokeDasharray="3 3" fill="none">
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
          strokeOpacity="0.72"
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
        <line
          x1="18"
          y1="72"
          x2="242"
          y2="72"
          stroke={color}
          strokeOpacity="0.32"
          strokeWidth="1"
        />
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
 * TRANG CHỦ (/): BỐ CỤC 3 TẦNG TRỤC Z — THIÊN CẢNH KÍNH MỜ × SWISS EDITORIAL
 * - Tầng 1: Mái Vòm Khí Quyển (Atmospheric Canopy) hòa tan đáy mượt, chữ dọc nghệ thuật lề phải.
 * - Tầng 2: Cầu Nối Kính Mờ (Floating Glass Dock) gối lề âm lên chân Tầng 1 (7 + 5).
 * - Tầng 3: Mặt Phẳng Học Thuật sạch (Grounded Academic Grid) trên nền phẳng var(--bg-workspace).
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
        watercolorWash:
          'radial-gradient(64% 90% at 30% 30%, rgba(23, 51, 44, 0.14) 0%, transparent 72%)',
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
        watercolorWash: style.watercolorWash,
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
  const heritageNumberLabel = String(heritageIndex + 1).padStart(2, '0');

  return (
    <div
      data-testid="workspace-dashboard"
      className="min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      {/* ========================================================================
          TẦNG 1: MÁI VÒM KHÍ QUYỂN (ATMOSPHERIC CANOPY) — TRÀN SÁT MÉP TRÊN (-mt-12)
          ======================================================================== */}
      <AtmosphericCanopy
        variant="dashboard"
        enableCelestialOverlay
        enableParallax
        showScrim
        testId="dashboard-atmospheric-canopy"
        className="-mt-12 min-h-[235px] pt-16 pb-8 sm:min-h-[270px] sm:pt-20 md:min-h-[330px] md:pb-24 lg:min-h-[360px] lg:pt-24 lg:pb-28"
      >
        <header className="relative mx-auto flex max-w-[1240px] items-start justify-between gap-6 px-6 lg:px-10">
          <div className="max-w-2xl min-w-0 space-y-3">
            <h1 className="font-serif text-[32px] leading-[1.12] font-semibold tracking-tight text-[var(--text-main)] sm:text-[38px] lg:text-[44px]">
              <span className="sr-only">LEARNING UNIVERSE — </span>
              Không gian Tổng quan
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-sm text-[var(--text-secondary)]">
              <p
                data-testid="dashboard-quote-text"
                className="font-serif text-[14.5px] leading-relaxed italic sm:text-[15.5px]"
              >
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
                className="group/quote inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2.5 py-0.5 font-mono text-[10.5px] font-medium whitespace-nowrap text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)] active:scale-95"
              >
                <RefreshCw
                  className="h-3 w-3 transition-transform duration-300 group-hover/quote:rotate-180"
                  aria-hidden="true"
                />
                <span>Câu khác</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <time
                data-testid="dashboard-date"
                className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 font-mono text-[11px] whitespace-nowrap text-[var(--text-secondary)]"
              >
                {todayFormatted}
              </time>
              <button
                type="button"
                onClick={openCommandPalette}
                className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--accent-os)]/45 hover:text-[var(--text-main)] active:scale-[0.98] sm:inline-flex"
              >
                <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                <kbd className="font-mono text-[10.5px] font-semibold text-[var(--text-muted)]">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>

          {/* Dải chữ dọc nghệ thuật ở lề phải Tầng 1 (ẩn dưới lg để không chạm tiêu đề) */}
          <aside
            aria-hidden="true"
            data-testid="canopy-vertical-label"
            className="lu-vertical-label hidden shrink-0 items-center gap-3 pt-1 font-mono text-[10.5px] font-medium tracking-[0.22em] text-[var(--text-secondary)] uppercase opacity-55 select-none lg:flex"
          >
            <span>DI SẢN #{heritageNumberLabel} · 40</span>
            <span className="h-6 w-px bg-[var(--text-muted)]/40" />
            <span>{currentHeritage.shortTitle}</span>
          </aside>
        </header>
      </AtmosphericCanopy>

      {/* ========================================================================
          TẦNG 2 & TẦNG 3: CẦU NỐI KÍNH MỜ GỐI LỀ ÂM → MẶT PHẲNG HỌC THUẬT SẠCH
          ======================================================================== */}
      <div className="mx-auto max-w-[1240px] space-y-7 px-6 pb-10 lg:px-10">
        {/* TẦNG 2: CẦU NỐI KÍNH MỜ (FLOATING GLASS DOCK — 7 : 5) */}
        <section
          aria-label="Hành động chính và tiến độ học tập"
          data-testid="floating-glass-dock"
          className="relative z-20 mt-2 grid grid-cols-1 gap-5 md:-mt-14 lg:-mt-20 lg:grid-cols-12"
        >
          {/* Cột Trái (7 cột) — Thẻ Kính Mờ 'Đang học dở' với mô hình đa diện thoáng viền */}
          <div
            data-testid="dashboard-resume-card"
            onMouseMove={updateCardSpotlight}
            onMouseEnter={() => setIsResumeStageHovered(true)}
            onMouseLeave={() => setIsResumeStageHovered(false)}
            style={
              {
                borderLeftWidth: '3px',
                borderLeftColor: resumeAccentColor,
                '--spot-glow': `rgba(${resumeCardStats?.rgb ?? '140, 88, 40'}, 0.10)`,
                '--spot-glow-dark': `rgba(${resumeCardStats?.rgb ?? '140, 88, 40'}, 0.20)`,
              } as CSSProperties
            }
            className="lu-glass-dock lu-bento-interactive group/resume flex min-w-0 flex-col justify-between gap-4 rounded-2xl border p-5 sm:p-6 lg:col-span-7"
          >
            <div className="relative z-10 grid grid-cols-1 items-center gap-5 sm:grid-cols-12">
              <div className="flex min-w-0 flex-col justify-between space-y-3 sm:col-span-7">
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

                {/* Thanh bước bài học trong chương hiện tại */}
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
                                ? 'border-[var(--border-hairline)] bg-[var(--bg-workspace)]/80 text-[var(--accent-os)]'
                                : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)]/60 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]',
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

              {/* Khung mô hình xem trước nổi thoáng không bị bó viền cứng */}
              <div className="relative min-w-0 overflow-hidden sm:col-span-5">
                <SubjectStageCanvas
                  slug={resumeLocation?.subject.slug ?? 'cau-truc-dai-so'}
                  isCardHovered={isResumeStageHovered}
                />
                {resumeCardStats && (
                  <span className="pointer-events-none absolute right-2 bottom-1.5 font-mono text-[9.5px] font-semibold text-[var(--text-muted)]">
                    {resumeCardStats.formulaBadge}
                  </span>
                )}
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] pt-3.5">
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

          {/* Cột Phải (5 cột) — Thẻ Kính Mờ 'Chỉ số tiến độ & Pomodoro' */}
          <div
            data-testid="dashboard-metrics-card"
            onMouseMove={updateCardSpotlight}
            className="lu-glass-dock lu-bento-interactive flex min-w-0 flex-col justify-between gap-4 rounded-2xl border p-5 lg:col-span-5"
          >
            <div className="relative z-10 flex items-center gap-4">
              {/* Vòng đồng tâm 4 quỹ đạo môn học */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/85">
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

              {/* 3 Ô chỉ số sắc nét chuẩn tabular-nums */}
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/85 p-2.5">
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

                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/85 p-2.5">
                  <p className="font-mono text-[9.5px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                    Tiến độ tổng
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-[var(--accent-os)] tabular-nums">
                    {totalPercent}%
                  </p>
                </div>

                <Link
                  to={ROUTES.glossary}
                  className="group col-span-2 flex items-center justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/85 px-3 py-2 transition-colors hover:border-[var(--accent-os)]/40"
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

            {/* Thanh Pomodoro tích hợp vòng đếm ngược trực quan */}
            <div
              data-testid="dashboard-pomodoro-bar"
              className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/85 px-3.5 py-2.5"
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

        {/* ========================================================================
            TẦNG 3: MẶT PHẲNG HỌC THUẬT (GROUNDED ACADEMIC GRID — PHẲNG SẠCH, KHÔNG KÍNH MỜ)
            ======================================================================== */}
        <section aria-label="Bốn học phần trọng tâm" className="space-y-3 pt-1">
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
                className="group flex min-w-0 flex-col justify-between gap-3.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-workspace)] hover:shadow-[var(--shadow-bento-hover)]"
              >
                {/* Khung minh họa với vệt loang màu nước siêu nhẹ đúng mã màu môn (opacity 12%–16%) */}
                <div
                  style={{ backgroundImage: item.watercolorWash }}
                  className="relative h-24 w-full overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1"
                >
                  <SubjectMiniVisualStage slug={item.subject.slug} color={item.color} />
                  <span className="pointer-events-none absolute right-2 bottom-1.5 font-mono text-[9px] font-medium text-[var(--text-muted)] opacity-80">
                    {item.formulaBadge}
                  </span>
                </div>

                <div className="space-y-2">
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

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
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

        {/* TẦNG 3 (HÀNG DƯỚI): DI SẢN TRONG NGÀY (7/12) + THUẬT NGỮ NGẪU NHIÊN & SẢNH BIDA (5/12) */}
        <section
          aria-label="Di sản học thuật, thuật ngữ và giải lao"
          className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        >
          {/* Cột Trái (7 cột) — Di sản trong ngày (phẳng sạch) */}
          <div
            data-testid="dashboard-heritage-card"
            className="group/heritage flex min-w-0 flex-col justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 transition-colors duration-200 hover:border-[var(--border-strong)] lg:col-span-7"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  <Landmark
                    className="h-3.5 w-3.5 text-[var(--accent-heritage)]"
                    aria-hidden="true"
                  />
                  <span>Di sản trong ngày</span>
                </span>
                <span className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--accent-heritage)] tabular-nums">
                  #{heritageNumberLabel} / {HERITAGE_ARTWORKS.length}
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
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-shell)] sm:w-44">
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

          {/* Cột Phải (5 cột) — Thuật ngữ ngẫu nhiên & Sảnh Bida 8-Ball (phẳng sạch) */}
          <div className="flex min-w-0 flex-col gap-3.5 lg:col-span-5">
            {currentGlossary && (
              <div
                data-testid="dashboard-glossary-card"
                className="flex flex-1 flex-col justify-between gap-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 transition-colors duration-200 hover:border-[var(--border-strong)]"
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
                  className="group flex items-center gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 transition-colors hover:border-[var(--accent-os)]/45"
                >
                  <div className="flex h-14 min-w-[78px] shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-sm text-[var(--text-main)]">
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

            <div
              data-testid="dashboard-billiards-card"
              className="group/billiards flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 transition-colors duration-200 hover:border-[var(--border-strong)]"
            >
              <div className="flex min-w-0 items-center gap-3">
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
                    <circle
                      cx="22"
                      cy="28"
                      r="5"
                      fill="#FAFBF9"
                      className="transition-transform duration-300 group-hover/billiards:translate-x-1"
                    />
                    <circle cx="22" cy="28" r="1.1" fill="#C93B2B" />
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
