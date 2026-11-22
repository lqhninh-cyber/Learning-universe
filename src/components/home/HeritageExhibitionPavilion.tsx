import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Landmark,
  Maximize2,
  Pause,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  HERITAGE_ARTWORKS,
  HERITAGE_CATEGORY_TABS,
  HeritageFallbackIllustration,
  isHeritageInlineSvg,
  type HeritageArtwork,
  type HeritageCategory,
} from '@/components/home/HeritageArtShowcase';
import { getHeritageMathConnection } from '@/data/heritageMathConnections';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, frameDampFactor } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

const HERITAGE_SUBJECT_DISPLAY: Record<
  'CTĐS' | 'HHAVE' | 'GTHMB' | 'GDH',
  { readonly title: string; readonly dotClass: string; readonly badgeClass: string }
> = {
  CTĐS: {
    title: 'Cấu trúc đại số',
    dotClass: 'bg-[#8C5828] dark:bg-[#D99B5E]',
    badgeClass:
      'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
  },
  HHAVE: {
    title: 'Hình học Affine & Euclide',
    dotClass: 'bg-[#1D4F6E] dark:bg-[#64A8D1]',
    badgeClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
  },
  GTHMB: {
    title: 'Giải tích hàm một biến',
    dotClass: 'bg-[#1B5E4A] dark:bg-[#52B394]',
    badgeClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
  },
  GDH: {
    title: 'Giáo dục học',
    dotClass: 'bg-[#8F3D35] dark:bg-[#DF7B70]',
    badgeClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
  },
};

const ROTATION_INTERVAL_MS = 20000;
const SLIDE_TRANSITION_MS = 320;
const FILMSTRIP_SCROLL_STEP_PX = 420;

interface FilmstripItemProps {
  readonly artwork: HeritageArtwork;
  readonly displayIndex: number;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}

function FilmstripThumbnailButton({
  artwork,
  displayIndex,
  isActive,
  onSelect,
}: FilmstripItemProps) {
  const [thumbError, setThumbError] = useState(false);
  const numStr = String(displayIndex + 1).padStart(2, '0');
  const showInlineSvg = thumbError || isHeritageInlineSvg(artwork);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Chọn tác phẩm ${displayIndex + 1}: ${artwork.shortTitle}`}
      aria-pressed={isActive}
      className={cn(
        'group relative flex w-[136px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-[var(--bg-workspace)] text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent-heritage)] focus-visible:outline-none sm:w-[152px]',
        isActive
          ? 'border-2 border-[var(--accent-heritage)] shadow-sm'
          : 'border border-[var(--border-hairline)] opacity-90 hover:border-[var(--accent-heritage)]/65 hover:opacity-100',
      )}
    >
      <div className="relative h-20 w-full overflow-hidden bg-[var(--bg-shell)]">
        {showInlineSvg ? (
          <div className="h-full w-full">
            <HeritageFallbackIllustration artwork={artwork} compact />
          </div>
        ) : (
          <img
            src={artwork.imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setThumbError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <span
          className={cn(
            'absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold backdrop-blur-sm',
            isActive
              ? 'border border-[var(--accent-heritage)]/60 bg-[var(--bg-workspace)]/95 text-[var(--text-main)] shadow-2xs'
              : 'border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/88 text-[var(--text-secondary)]',
          )}
        >
          {numStr}
        </span>
      </div>
      <div className="min-w-0 px-2.5 py-2">
        <p
          title={artwork.title}
          className={cn(
            'block truncate font-serif text-xs font-semibold',
            isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-secondary)]',
          )}
        >
          {artwork.shortTitle}
        </p>
      </div>
    </button>
  );
}

/**
 * SCREEN 2: PHÒNG TRƯNG BÀY DI SẢN BẢO TÀNG (#khong-gian-di-san)
 * - Nền sơn mài ngọc bích sâu thẳm (#09171E -> #0B1D19 -> #081A15) tách biệt hoàn toàn khỏi mây Screen 1.
 * - Bố cục 3 tầng: Sân khấu 12 cột (Khung tranh 16:10 + Hồ sơ Học thuật trực tiếp) -> Thanh điều khiển trình chiếu trung tâm -> Filmstrip 30 tác phẩm.
 */
export function HeritageExhibitionPavilion() {
  const prefersReducedMotion = useReducedMotion();
  const drumPatternId = useId().replace(/:/g, '');

  const [activeCategory, setActiveCategory] = useState<'all' | HeritageCategory>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const imgMotionRef = useRef<HTMLImageElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const motionRafRef = useRef<number>(0);
  const transitionTimerRef = useRef<number>(0);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasInteractedIndexRef = useRef(false);
  const parallaxStateRef = useRef({
    curX: 0,
    curY: 0,
    curScale: 1,
    targetX: 0,
    targetY: 0,
    targetScale: 1,
    px: 0.5,
    py: 0.5,
    active: false,
    lastNow: 0,
  });

  const artworks =
    activeCategory === 'all'
      ? HERITAGE_ARTWORKS
      : HERITAGE_ARTWORKS.filter((item) => item.category === activeCategory);
  const totalCount = artworks.length;
  const totalCatalogCount = HERITAGE_ARTWORKS.length;
  const safeIndex = Math.min(currentIndex, Math.max(totalCount - 1, 0));
  const currentArtwork = artworks[safeIndex] ?? artworks[0]!;
  const currentMathConnection = getHeritageMathConnection(currentArtwork.id);
  const currentSubjectStyle = HERITAGE_SUBJECT_DISPLAY[currentMathConnection.subjectCode];
  const formattedIndex = String(safeIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalCount).padStart(2, '0');

  const handleSelectCategory = useCallback((nextCategory: 'all' | HeritageCategory) => {
    setActiveCategory(nextCategory);
    setCurrentIndex(0);
    setImageError(false);
    setIsTransitioning(false);
  }, []);

  const goToIndex = useCallback(
    (nextIdx: number, isUserAction = true) => {
      if (totalCount <= 0) return;
      const wrapped = ((nextIdx % totalCount) + totalCount) % totalCount;
      if (wrapped === safeIndex && !imageError) return;

      if (isUserAction) {
        hasInteractedIndexRef.current = true;
      }

      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (prefersReducedMotion) {
        setCurrentIndex(wrapped);
        setImageError(false);
        return;
      }

      setIsTransitioning(true);
      transitionTimerRef.current = window.setTimeout(() => {
        setCurrentIndex(wrapped);
        setImageError(false);
        setIsTransitioning(false);
      }, SLIDE_TRANSITION_MS);
    },
    [imageError, prefersReducedMotion, safeIndex, totalCount],
  );

  // Chỉ căn giữa thumbnail theo chiều ngang trong nội bộ Filmstrip khi người dùng chủ động chọn (tuyệt đối không dùng scrollIntoView gây cuộn dọc cả trang)
  useEffect(() => {
    if (!hasInteractedIndexRef.current) return;
    hasInteractedIndexRef.current = false;
    const strip = filmstripRef.current;
    const activeThumb = thumbRefs.current[safeIndex];
    if (!strip || !activeThumb || typeof strip.scrollTo !== 'function') return;
    const targetLeft = activeThumb.offsetLeft - (strip.clientWidth - activeThumb.clientWidth) / 2;
    strip.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [prefersReducedMotion, safeIndex]);

  const scrollFilmstripBy = useCallback(
    (deltaX: number) => {
      filmstripRef.current?.scrollBy?.({
        left: deltaX,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion],
  );

  const handleNext = useCallback(() => {
    goToIndex(safeIndex + 1, true);
  }, [goToIndex, safeIndex]);

  const handlePrev = useCallback(() => {
    goToIndex(safeIndex - 1, true);
  }, [goToIndex, safeIndex]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      if (motionRafRef.current) window.cancelAnimationFrame(motionRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPaused || isLightboxOpen || totalCount <= 1) return;
    const timer = window.setInterval(() => goToIndex(safeIndex + 1, false), ROTATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goToIndex, isLightboxOpen, isPaused, safeIndex, totalCount]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, isLightboxOpen]);

  const scheduleMotionLoop = useCallback(() => {
    if (motionRafRef.current || prefersReducedMotion) return;
    parallaxStateRef.current.lastNow = performance.now();

    const tick = (now: number) => {
      const s = parallaxStateRef.current;
      const { dtSeconds } = computeFrameDelta(now, s.lastNow);
      s.lastNow = now;
      const alpha = frameDampFactor(12, dtSeconds);

      s.curX += (s.targetX - s.curX) * alpha;
      s.curY += (s.targetY - s.curY) * alpha;
      s.curScale += (s.targetScale - s.curScale) * alpha;

      if (imgMotionRef.current) {
        imgMotionRef.current.style.transform = `translate3d(${s.curX.toFixed(2)}px, ${s.curY.toFixed(2)}px, 0) scale(${s.curScale.toFixed(4)})`;
      }
      if (glareRef.current) {
        const pxPct = (s.px * 100).toFixed(1);
        const pyPct = (s.py * 100).toFixed(1);
        glareRef.current.style.background = `radial-gradient(circle 220px at ${pxPct}% ${pyPct}%, rgba(156, 122, 76, 0.14), transparent 72%)`;
        glareRef.current.style.opacity = s.active ? '0.72' : '0';
      }

      const settled =
        !s.active &&
        Math.abs(s.curX) < 0.05 &&
        Math.abs(s.curY) < 0.05 &&
        Math.abs(s.curScale - 1) < 0.001;

      if (settled) {
        if (imgMotionRef.current) {
          imgMotionRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
        }
        motionRafRef.current = 0;
        return;
      }

      motionRafRef.current = window.requestAnimationFrame(tick);
    };

    motionRafRef.current = window.requestAnimationFrame(tick);
  }, [prefersReducedMotion]);

  const handleFrameMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    const s = parallaxStateRef.current;
    s.px = px;
    s.py = py;
    s.targetX = (px - 0.5) * -8;
    s.targetY = (py - 0.5) * -6;
    s.targetScale = 1.03;
    s.active = true;
    scheduleMotionLoop();
  };

  const handleFrameMouseLeave = () => {
    const s = parallaxStateRef.current;
    s.targetX = 0;
    s.targetY = 0;
    s.targetScale = 1;
    s.active = false;
    scheduleMotionLoop();
  };

  return (
    <section
      id="khong-gian-di-san"
      data-testid="heritage-art-showcase"
      aria-label="Không gian Di sản Học thuật và Nghệ thuật"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative scroll-mt-16 overflow-hidden bg-[var(--bg-workspace)] pt-8 pb-14 text-[var(--text-main)]"
    >
      {/* Họa tiết đồng tâm Trống Đồng Đông Sơn khắc chìm dịu */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] select-none"
      >
        <defs>
          <pattern id={drumPatternId} width="240" height="240" patternUnits="userSpaceOnUse">
            <circle cx="120" cy="120" r="108" fill="none" stroke="#9C7A4C" strokeWidth="0.9" />
            <circle
              cx="120"
              cy="120"
              r="78"
              fill="none"
              stroke="#2D5266"
              strokeWidth="0.7"
              strokeDasharray="4 5"
            />
            <circle cx="120" cy="120" r="46" fill="none" stroke="#9C7A4C" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${drumPatternId})`} />
      </svg>

      {/* Adaptive Exhibition Aura: Ánh sáng phòng triển lãm thích ứng chiết xuất từ tác phẩm đang xem */}
      {!imageError && !isHeritageInlineSvg(currentArtwork) && (
        <div
          aria-hidden="true"
          data-testid="heritage-adaptive-aura"
          className="lu-canopy-mask pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden select-none"
        >
          <img
            key={currentArtwork.id}
            src={currentArtwork.imageSrc}
            alt=""
            aria-hidden="true"
            decoding="async"
            className={cn(
              'h-full w-full scale-110 object-cover blur-[60px] transition-opacity duration-500 ease-out',
              isTransitioning ? 'opacity-0' : 'opacity-[0.07] dark:opacity-[0.11]',
            )}
          />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-[1240px] px-6 lg:px-10">
        {/* ================================================================
          TẦNG 1: TIÊU ĐỀ KHU VỰC DI SẢN & THANH LỌC 4 NHÓM
          ================================================================ */}
        <div className="mb-6 flex flex-col gap-5 border-b border-[var(--border-hairline)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-[var(--accent-heritage)] uppercase">
              <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span>BẢO TÀNG TRI THỨC &amp; VĂN HIẾN</span>
            </div>
            <h1 className="font-serif text-[28px] leading-tight font-bold tracking-tight text-[var(--text-main)] lg:text-[36px]">
              Di sản Học thuật &amp; Nghệ thuật
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Không gian triển lãm {totalCatalogCount} kiệt tác kiến trúc, hội họa và tư liệu lịch
              sử xác thực ghi dấu hành trình khoa bảng Việt Nam và cách mạng tư duy toán học – thiên
              văn nhân loại.
            </p>
          </div>

          {/* Thanh lọc 4 nhóm phân loại di sản */}
          <div
            role="tablist"
            aria-label="Phân loại tác phẩm di sản"
            className="flex flex-wrap items-center gap-2"
          >
            {HERITAGE_CATEGORY_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              const tabCount =
                tab.id === 'all'
                  ? totalCatalogCount
                  : HERITAGE_ARTWORKS.filter((item) => item.category === tab.id).length;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[11.5px] font-semibold transition-all duration-150',
                    isSelected
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white shadow-xs'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent-heritage)] hover:text-[var(--text-main)]',
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="tabular-nums opacity-75">({tabCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================
          TẦNG 2: SÂN KHẤU TRIỂN LÃM CHÍNH (GRID 12 CỘT: 7 TRANH + 5 HỒ SƠ)
          ================================================================ */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* Cột Trái (7 cột): Khung Trưng Bày Bảo Tàng */}
          <div className="flex min-w-0 flex-col lg:col-span-7">
            <div
              data-testid="heritage-art-frame"
              onMouseMove={handleFrameMouseMove}
              onMouseLeave={handleFrameMouseLeave}
              className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 transition-colors duration-300 hover:border-[var(--accent-heritage)]/60 md:p-6"
            >
              <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                {imageError || isHeritageInlineSvg(currentArtwork) ? (
                  <div
                    data-testid="heritage-svg-fallback"
                    className="h-full max-h-[380px] w-full overflow-hidden rounded-xl lg:max-h-[410px]"
                  >
                    <HeritageFallbackIllustration artwork={currentArtwork} />
                  </div>
                ) : (
                  <img
                    ref={imgMotionRef}
                    src={currentArtwork.imageSrc}
                    alt={currentArtwork.alt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    style={{ backfaceVisibility: 'hidden' }}
                    className={cn(
                      'mx-auto max-h-[380px] w-full object-contain transition-opacity duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform select-none lg:max-h-[410px]',
                      isTransitioning ? 'opacity-0' : 'opacity-100',
                    )}
                  />
                )}
              </div>

              <p className="mt-3 border-t border-[var(--border-hairline)] pt-3 font-serif text-[12px] text-[var(--text-muted)] italic">
                {currentArtwork.caption}
              </p>

              <div
                ref={glareRef}
                data-testid="heritage-foil-glare"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Cột Phải (5 cột): Thẻ Thuyết Minh Bảo Tàng */}
          <aside
            aria-label={`Hồ sơ học thuật: ${currentArtwork.title}`}
            className={cn(
              'flex min-w-0 flex-col gap-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 transition-opacity duration-[320ms] sm:p-7 lg:col-span-5',
              isTransitioning ? 'opacity-65' : 'opacity-100',
            )}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
                <span className="font-mono text-xs font-bold tracking-widest text-[var(--accent-heritage)]">
                  {formattedIndex} / {formattedTotal}
                </span>
                <span className="inline-flex items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1 font-mono text-[11px] font-medium text-[var(--text-secondary)]">
                  {currentArtwork.artistOrOrigin} · {currentArtwork.yearOrEra}
                </span>
              </div>

              <h2 className="font-serif text-[24px] leading-snug font-bold text-[var(--text-main)] lg:text-[26px]">
                {currentArtwork.title}
              </h2>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--accent-heritage)] uppercase">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Giá trị Học thuật &amp; Biểu tượng</span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {currentArtwork.academicSignificance}
                </p>
              </div>

              {/* Khối Góc nhìn Toán học & Học phần liên quan (40/40 tác phẩm) */}
              <div
                data-testid="heritage-math-connection"
                className="space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--accent-os)] uppercase">
                    <Compass className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Góc nhìn Toán học &amp; Học phần liên quan</span>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold',
                      currentSubjectStyle.badgeClass,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn('h-1.5 w-1.5 rounded-full', currentSubjectStyle.dotClass)}
                    />
                    <span>{currentMathConnection.subjectCode}</span>
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  {currentMathConnection.connection}
                </p>

                <div className="pt-0.5">
                  <Link
                    to={ROUTES.subjectOverview(currentMathConnection.subjectSlug)}
                    data-testid="heritage-math-subject-link"
                    className="group/subject inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-os)] transition-opacity hover:opacity-85"
                  >
                    <span>Mở học phần {currentSubjectStyle.title}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-150 group-hover/subject:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mục 2: Hộp Lược sử & Bối cảnh ra đời */}
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-hairline)] pb-2 font-mono text-[11px] font-semibold tracking-wider text-[var(--accent-heritage)] uppercase">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Lược sử &amp; Bối cảnh ra đời</span>
              </div>

              <dl className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[var(--text-main)]">
                    Tác phẩm gốc:{' '}
                  </dt>
                  <dd className="inline font-serif font-medium text-[var(--text-main)]">
                    {currentArtwork.originalTitle}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[var(--text-main)]">
                    Niên đại &amp; Thời kỳ:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.eraAndPeriod}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[var(--text-main)]">
                    Chất liệu &amp; Kỹ thuật:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.materialAndTechnique}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[var(--text-main)]">
                    Nơi lưu trữ gốc:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.archivalLocation}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* ================================================================
          THANH ĐIỀU KHIỂN TRÌNH CHIẾU TRUNG TÂM
          ================================================================ */}
        <div
          data-testid="heritage-control-bar"
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
        >
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Tác phẩm trước"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition-all hover:border-[var(--accent-heritage)] hover:bg-[var(--bg-workspace)] active:scale-[0.98] sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4 text-[var(--accent-heritage)]" aria-hidden="true" />
            <span>Tác phẩm trước</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Tự động chiếu' : 'Tạm dừng'}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition-all hover:border-[var(--accent-heritage)] hover:bg-[var(--bg-workspace)] active:scale-[0.98] sm:text-sm"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 text-[var(--accent-heritage)]" aria-hidden="true" />
                <span>Tự động chiếu</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-[var(--accent-heritage)]" aria-hidden="true" />
                <span>Tạm dừng</span>
              </>
            )}
          </button>

          <span
            data-testid="heritage-index-indicator"
            className="inline-flex items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 font-mono text-xs font-bold tracking-widest text-[var(--accent-heritage)] sm:text-sm"
          >
            {formattedIndex} / {formattedTotal}
          </span>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Tác phẩm tiếp"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition-all hover:border-[var(--accent-heritage)] hover:bg-[var(--bg-workspace)] active:scale-[0.98] sm:text-sm"
          >
            <span>Tác phẩm tiếp</span>
            <ChevronRight className="h-4 w-4 text-[var(--accent-heritage)]" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label={`Phóng to tác phẩm ${currentArtwork.title}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition-all hover:border-[var(--accent-heritage)] hover:bg-[var(--bg-workspace)] active:scale-[0.98] sm:text-sm"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[var(--accent-heritage)]" aria-hidden="true" />
            <span>Xem toàn màn hình</span>
          </button>
        </div>

        {/* ================================================================
          TẦNG 3: THANH FILMSTRIP 40 THU NHỎ TƯƠNG TÁC
          ================================================================ */}
        <div className="mt-7 border-t border-[var(--border-hairline)] pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-[var(--accent-heritage)] uppercase">
              DANH MỤC TRIỂN LÃM ({formattedTotal} TÁC PHẨM)
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              Bấm chọn tác phẩm hoặc trượt ngang để chiêm ngưỡng hồ sơ chi tiết
            </span>
          </div>

          <div className="relative flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollFilmstripBy(-FILMSTRIP_SCROLL_STEP_PX)}
              aria-label="Cuộn danh mục sang trái"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-main)] transition-all hover:border-[var(--accent-heritage)] hover:bg-[var(--bg-workspace)] sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--accent-heritage)]" aria-hidden="true" />
            </button>

            <div
              ref={filmstripRef}
              data-testid="heritage-filmstrip"
              className="flex min-w-0 flex-1 [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden"
              role="list"
              aria-label={`Dải thu nhỏ ${totalCount} tác phẩm di sản`}
            >
              {artworks.map((art, idx) => (
                <div
                  key={art.id}
                  role="listitem"
                  ref={(el) => {
                    thumbRefs.current[idx] = el;
                  }}
                >
                  <FilmstripThumbnailButton
                    artwork={art}
                    displayIndex={idx}
                    isActive={idx === safeIndex}
                    onSelect={() => goToIndex(idx)}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollFilmstripBy(FILMSTRIP_SCROLL_STEP_PX)}
              aria-label="Cuộn danh mục sang phải"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-main)] transition-all hover:border-[var(--accent-heritage)] hover:bg-[var(--bg-workspace)] sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4 text-[var(--accent-heritage)]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Hộp thoại Phóng to Toàn Màn Hình (Lightbox Modal) */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem toàn màn hình: ${currentArtwork.title}`}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md sm:p-8"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-[var(--text-main)] shadow-2xl sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-[var(--accent-heritage)]">
                  {formattedIndex} / {formattedTotal} · {currentArtwork.artistOrOrigin}
                </p>
                <h3 className="truncate font-serif text-lg font-bold text-[var(--text-main)] sm:text-xl">
                  {currentArtwork.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Đóng xem toàn màn hình"
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-main)] transition-colors hover:border-[var(--accent-heritage)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-shell)] p-3">
              {imageError || isHeritageInlineSvg(currentArtwork) ? (
                <div className="aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-lg">
                  <HeritageFallbackIllustration artwork={currentArtwork} />
                </div>
              ) : (
                <img
                  src={currentArtwork.imageSrc}
                  alt={currentArtwork.alt}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain select-none"
                />
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="font-serif text-xs text-[var(--text-secondary)] italic">
                {currentArtwork.caption}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Xem tác phẩm trước"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-heritage)]"
                >
                  <ChevronLeft
                    className="h-3.5 w-3.5 text-[var(--accent-heritage)]"
                    aria-hidden="true"
                  />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Xem tác phẩm tiếp theo"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-heritage)]"
                >
                  <span>Sau</span>
                  <ChevronRight
                    className="h-3.5 w-3.5 text-[var(--accent-heritage)]"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
