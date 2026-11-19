import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Maximize2,
  Pause,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  HERITAGE_ARTWORKS,
  HeritageFallbackIllustration,
  isHeritageInlineSvg,
  type HeritageArtwork,
} from '@/components/home/HeritageArtShowcase';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, frameDampFactor } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

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
        'group relative flex w-[136px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-[#FAFBF9] text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#9C7A4C] focus-visible:outline-none sm:w-[152px]',
        isActive
          ? 'border-2 border-[#9C7A4C] shadow-[0_8px_22px_rgba(24,38,36,0.08)]'
          : 'border border-[#CFD9D5] opacity-90 hover:border-[#9C7A4C]/65 hover:opacity-100',
      )}
    >
      <div className="relative h-20 w-full overflow-hidden bg-[#E7ECEA]">
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
              ? 'border border-[#9C7A4C]/55 bg-[#FAFBF9]/95 text-[#1E332E] shadow-2xs'
              : 'border border-[#CFD9D5]/90 bg-[#FAFBF9]/88 text-[#354E48]',
          )}
        >
          {numStr}
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p
          className={cn(
            'truncate font-serif text-xs font-semibold',
            isActive ? 'text-[#142622]' : 'text-[#2D423D]',
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

  const artworks = HERITAGE_ARTWORKS;
  const totalCount = artworks.length;
  const safeIndex = Math.min(currentIndex, Math.max(totalCount - 1, 0));
  const currentArtwork = artworks[safeIndex] ?? artworks[0]!;
  const formattedIndex = String(safeIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalCount).padStart(2, '0');

  const goToIndex = useCallback(
    (nextIdx: number) => {
      if (totalCount <= 0) return;
      const wrapped = ((nextIdx % totalCount) + totalCount) % totalCount;
      if (wrapped === safeIndex && !imageError) return;

      hasInteractedIndexRef.current = true;

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

  // Tự động cuộn mượt để căn giữa thumbnail đang được chọn trên dải Filmstrip
  useEffect(() => {
    if (!hasInteractedIndexRef.current) return;
    const activeThumb = thumbRefs.current[safeIndex];
    activeThumb?.scrollIntoView?.({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
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
    goToIndex(safeIndex + 1);
  }, [goToIndex, safeIndex]);

  const handlePrev = useCallback(() => {
    goToIndex(safeIndex - 1);
  }, [goToIndex, safeIndex]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      if (motionRafRef.current) window.cancelAnimationFrame(motionRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPaused || isLightboxOpen || totalCount <= 1) return;
    const timer = window.setInterval(handleNext, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [handleNext, isLightboxOpen, isPaused, totalCount]);

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
      className="relative scroll-mt-24 overflow-hidden border-t border-[#D4DFDA] bg-[#EEF2F0] pt-24 pb-16 text-[#142622]"
    >
      {/* Dấu cộng chuẩn trực (+) trên đường ngăn kỹ thuật 1px solid #D4DFDA */}
      <div
        aria-hidden="true"
        className="lu-container-wide pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
      </div>

      {/* Họa tiết đồng tâm Trống Đồng Đông Sơn khắc chìm dịu trên nền Bạch Ngọc */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] select-none"
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

      <div className="lu-container-wide relative z-10">
        {/* ================================================================
          TẦNG 1: TIÊU ĐỀ KHU VỰC DI SẢN (ALABASTER MUSEUM GALLERY)
          ================================================================ */}
        <div className="mb-6 border-b border-[#D4DFDA] pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest text-[#8C6228] uppercase">
              <Landmark className="h-3.5 w-3.5 text-[#8C6228]" aria-hidden="true" />
              <span>BẢO TÀNG TRI THỨC &amp; VĂN HIẾN</span>
            </div>
            <h2 className="font-serif text-[32px] leading-tight font-bold tracking-tight text-[#142622] lg:text-[40px]">
              Di sản Học thuật &amp; Nghệ thuật
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[#2D423D] sm:text-base">
              Không gian triển lãm {totalCount} kiệt tác kiến trúc, hội họa và tư liệu lịch sử ghi
              dấu hành trình khoa bảng Việt Nam và cách mạng tư duy toán học – thiên văn nhân loại.
            </p>
          </div>
        </div>

        {/* ================================================================
          TẦNG 2: SÂN KHẤU TRIỂN LÃM CHÍNH (GRID 12 CỘT: 7 TRANH + 5 HỒ SƠ)
          ================================================================ */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Cột Trái (7 cột): Khung Trưng Bày Bảo Tàng Nền Trắng Sứ #FAFBF9 */}
          <div className="flex flex-col lg:col-span-7">
            <div
              data-testid="heritage-art-frame"
              onMouseMove={handleFrameMouseMove}
              onMouseLeave={handleFrameMouseLeave}
              className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] p-4 shadow-[0_16px_40px_rgba(24,38,36,0.06)] transition-colors duration-300 hover:border-[#9C7A4C]/70 md:p-6"
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

              {/* Dòng chú thích ngắn nằm gọn bên trong đáy thẻ trắng bên trái */}
              <p className="mt-3 border-t border-[#E6ECE9] pt-3 font-serif text-[12px] text-[#4A5D58] italic">
                {currentArtwork.caption}
              </p>

              {/* Ánh sáng viền đồng dịu bám theo con trỏ */}
              <div
                ref={glareRef}
                data-testid="heritage-foil-glare"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Cột Phải (5 cột): Thẻ Thuyết Minh Bảo Tàng Nền Trắng Sứ #FAFBF9 */}
          <aside
            aria-label={`Hồ sơ học thuật: ${currentArtwork.title}`}
            className={cn(
              'flex flex-col gap-5 rounded-2xl border border-[#D4DFDA] bg-[#FAFBF9] p-6 shadow-[0_16px_40px_rgba(24,38,36,0.05)] transition-opacity duration-[320ms] sm:p-7 lg:col-span-5',
              isTransitioning ? 'opacity-65' : 'opacity-100',
            )}
          >
            <div className="space-y-4">
              {/* Số thứ tự + Thẻ Niên đại & Nguồn gốc */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8E5] pb-3">
                <span className="font-mono text-xs font-bold tracking-widest text-[#8C6228]">
                  {formattedIndex} / {formattedTotal}
                </span>
                <span className="inline-flex items-center rounded-full border border-[#DCE4E0] bg-[#F3F6F4] px-3 py-1 font-mono text-[11px] font-medium text-[#354E48]">
                  {currentArtwork.artistOrOrigin} · {currentArtwork.yearOrEra}
                </span>
              </div>

              {/* Tên Tác phẩm */}
              <h3 className="font-serif text-[26px] leading-snug font-bold text-[#142622] lg:text-[28px]">
                {currentArtwork.title}
              </h3>

              {/* Mục 1: Giá trị Học thuật & Biểu tượng */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#8C6228] uppercase">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Giá trị Học thuật &amp; Biểu tượng</span>
                </div>
                <p className="text-sm leading-relaxed text-[#2D423D]">
                  {currentArtwork.academicSignificance}
                </p>
              </div>
            </div>

            {/* Mục 2: Hộp Lược sử & Bối cảnh ra đời nền phụ #F3F6F4 viền #DCE4E0 */}
            <div className="rounded-xl border border-[#DCE4E0] bg-[#F3F6F4] p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-[#DCE4E0] pb-2 font-mono text-[11px] font-semibold tracking-wider text-[#8C6228] uppercase">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Lược sử &amp; Bối cảnh ra đời</span>
              </div>

              <dl className="space-y-2 text-xs leading-relaxed text-[#2D423D]">
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#1E332E]">
                    Tác phẩm gốc:{' '}
                  </dt>
                  <dd className="inline font-serif font-medium text-[#142622]">
                    {currentArtwork.originalTitle}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#1E332E]">
                    Niên đại &amp; Thời kỳ:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.eraAndPeriod}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#1E332E]">
                    Chất liệu &amp; Kỹ thuật:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.materialAndTechnique}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#1E332E]">
                    Nơi lưu trữ gốc:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.archivalLocation}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* ================================================================
          THANH ĐIỀU KHIỂN TRÌNH CHIẾU TRUNG TÂM TÔNG SÁNG SỨ BẠCH NGỌC
          ================================================================ */}
        <div
          data-testid="heritage-control-bar"
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Tác phẩm trước"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-4 py-2 text-xs font-semibold text-[#182624] shadow-xs transition-all hover:border-[#9C7A4C] hover:bg-white active:scale-[0.98] sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4 text-[#8C6228]" aria-hidden="true" />
            <span>Tác phẩm trước</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Tự động chiếu' : 'Tạm dừng'}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-4 py-2 text-xs font-semibold text-[#182624] shadow-xs transition-all hover:border-[#9C7A4C] hover:bg-white active:scale-[0.98] sm:text-sm"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 text-[#8C6228]" aria-hidden="true" />
                <span>Tự động chiếu</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-[#8C6228]" aria-hidden="true" />
                <span>Tạm dừng</span>
              </>
            )}
          </button>

          <span
            data-testid="heritage-index-indicator"
            className="inline-flex items-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-4 py-2 font-mono text-xs font-bold tracking-widest text-[#8C6228] shadow-2xs sm:text-sm"
          >
            {formattedIndex} / {formattedTotal}
          </span>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Tác phẩm tiếp"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-4 py-2 text-xs font-semibold text-[#182624] shadow-xs transition-all hover:border-[#9C7A4C] hover:bg-white active:scale-[0.98] sm:text-sm"
          >
            <span>Tác phẩm tiếp</span>
            <ChevronRight className="h-4 w-4 text-[#8C6228]" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label={`Phóng to tác phẩm ${currentArtwork.title}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-4 py-2 text-xs font-semibold text-[#182624] shadow-xs transition-all hover:border-[#9C7A4C] hover:bg-white active:scale-[0.98] sm:text-sm"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#8C6228]" aria-hidden="true" />
            <span>Xem toàn màn hình</span>
          </button>
        </div>

        {/* ================================================================
          TẦNG 3: THANH FILMSTRIP 32 THU NHỎ TƯƠNG TÁC TÔNG SÁNG
          ================================================================ */}
        <div className="mt-7 border-t border-[#D4DFDA] pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-[#8C6228] uppercase">
              DANH MỤC TRIỂN LÃM ({formattedTotal} TÁC PHẨM)
            </span>
            <span className="font-mono text-[11px] text-[#4A5D58]">
              Bấm chọn tác phẩm hoặc trượt ngang để chiêm ngưỡng hồ sơ chi tiết
            </span>
          </div>

          <div className="relative flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollFilmstripBy(-FILMSTRIP_SCROLL_STEP_PX)}
              aria-label="Cuộn danh mục sang trái"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] text-[#182624] shadow-xs transition-all hover:border-[#9C7A4C] hover:bg-white sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4 text-[#8C6228]" aria-hidden="true" />
            </button>

            <div
              ref={filmstripRef}
              data-testid="heritage-filmstrip"
              className="flex flex-1 [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden"
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
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] text-[#182624] shadow-xs transition-all hover:border-[#9C7A4C] hover:bg-white sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4 text-[#8C6228]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Hộp thoại Phóng to Toàn Màn Hình (Lightbox Modal Tông Sứ Bảo Tàng) */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem toàn màn hình: ${currentArtwork.title}`}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#142622]/75 p-4 backdrop-blur-md sm:p-8"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] p-4 text-[#142622] shadow-2xl sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between gap-4 border-b border-[#E2E8E5] pb-3">
              <div>
                <p className="font-mono text-xs font-semibold text-[#8C6228]">
                  {formattedIndex} / {formattedTotal} · {currentArtwork.artistOrOrigin}
                </p>
                <h3 className="font-serif text-lg font-bold text-[#142622] sm:text-xl">
                  {currentArtwork.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Đóng xem toàn màn hình"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#CFD9D5] bg-[#F3F6F4] text-[#182624] transition-colors hover:border-[#9C7A4C] hover:bg-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8E5] bg-[#EEF2F0] p-3">
              {imageError || isHeritageInlineSvg(currentArtwork) ? (
                <div className="aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-lg">
                  <HeritageFallbackIllustration artwork={currentArtwork} />
                </div>
              ) : (
                <img
                  src={currentArtwork.imageSrc}
                  alt={currentArtwork.alt}
                  referrerPolicy="no-referrer"
                  className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain select-none"
                />
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="font-serif text-xs text-[#354E48] italic">{currentArtwork.caption}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Xem tác phẩm trước"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#CFD9D5] bg-[#FAFBF9] px-3 py-1.5 text-xs font-semibold text-[#182624] transition-colors hover:border-[#9C7A4C] hover:bg-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-[#8C6228]" aria-hidden="true" />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Xem tác phẩm tiếp theo"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#CFD9D5] bg-[#FAFBF9] px-3 py-1.5 text-xs font-semibold text-[#182624] transition-colors hover:border-[#9C7A4C] hover:bg-white"
                >
                  <span>Sau</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#8C6228]" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
