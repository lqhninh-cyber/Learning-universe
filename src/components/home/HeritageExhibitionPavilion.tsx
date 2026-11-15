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
        'group relative flex w-[136px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-all duration-250 focus-visible:ring-2 focus-visible:ring-[#E5C158] focus-visible:outline-none sm:w-[152px]',
        isActive
          ? 'border-[#E5C158] bg-[#C9A45C]/18 shadow-[0_0_24px_rgba(229,193,88,0.24)]'
          : 'border-[#C9A45C]/22 bg-[#0D1622]/85 opacity-85 hover:border-[#C9A45C]/55 hover:opacity-100',
      )}
    >
      <div className="relative h-20 w-full overflow-hidden bg-[#10212E]">
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
              ? 'bg-[#E5C158] text-[#05100D]'
              : 'border border-white/15 bg-black/60 text-[#F7F3E8]',
          )}
        >
          {numStr}
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p
          className={cn(
            'truncate font-serif text-xs font-semibold',
            isActive ? 'text-[#FAF6EE]' : 'text-[#D1DCD6]',
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
        glareRef.current.style.background = `radial-gradient(circle 220px at ${pxPct}% ${pyPct}%, rgba(229, 193, 88, 0.22), transparent 72%)`;
        glareRef.current.style.opacity = s.active ? '0.68' : '0';
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
      style={{
        background:
          'radial-gradient(circle at 30% 40%, rgba(212,168,83,0.10), transparent 65%), linear-gradient(180deg, #121B28 0%, #1A2332 50%, #15222B 100%)',
      }}
      className="relative overflow-hidden py-20 text-[#FAF5E8] lg:py-24"
    >
      {/* Họa tiết đồng tâm Trống Đồng Đông Sơn mờ tinh tế */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045] select-none"
      >
        <defs>
          <pattern id={drumPatternId} width="240" height="240" patternUnits="userSpaceOnUse">
            <circle cx="120" cy="120" r="108" fill="none" stroke="#E5C158" strokeWidth="0.9" />
            <circle
              cx="120"
              cy="120"
              r="78"
              fill="none"
              stroke="#E5C158"
              strokeWidth="0.7"
              strokeDasharray="4 5"
            />
            <circle cx="120" cy="120" r="46" fill="none" stroke="#C9A45C" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${drumPatternId})`} />
      </svg>

      {/* Đường chỉ vàng đồng thanh mảnh phía trên */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A45C]/35 to-transparent"
      />

      <div className="lu-container-wide relative z-10">
        {/* ================================================================
          TẦNG 1: TIÊU ĐỀ KHU VỰC DI SẢN
          ================================================================ */}
        <div className="mb-10 border-b border-[#C9A45C]/25 pb-7">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-[#E5C158] uppercase">
              <Landmark className="h-3.5 w-3.5 text-[#E5C158]" aria-hidden="true" />
              <span>BẢO TÀNG TRI THỨC &amp; VĂN HIẾN</span>
            </div>
            <h2 className="font-serif text-[32px] leading-tight font-bold tracking-tight text-[#F7F3E8] lg:text-[40px]">
              Di sản Học thuật &amp; Nghệ thuật
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[#C8D6CE] sm:text-base">
              Không gian triển lãm {totalCount} kiệt tác kiến trúc, hội họa và tư liệu lịch sử ghi
              dấu hành trình khoa bảng Việt Nam và cách mạng tư duy toán học – thiên văn nhân loại.
            </p>
          </div>
        </div>

        {/* ================================================================
          TẦNG 2: SÂN KHẤU TRIỂN LÃM CHÍNH (GRID 12 CỘT: 7 TRANH + 5 HỒ SƠ)
          ================================================================ */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Cột Trái (7 cột): Khung Tác phẩm Bảo tàng Rộng Rãi */}
          <div className="flex flex-col lg:col-span-7">
            <div
              data-testid="heritage-art-frame"
              onMouseMove={handleFrameMouseMove}
              onMouseLeave={handleFrameMouseLeave}
              className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#D4A853]/40 bg-[#0D1622] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-colors duration-300 hover:border-[#E5B85B]/75"
            >
              {imageError || isHeritageInlineSvg(currentArtwork) ? (
                <div
                  data-testid="heritage-svg-fallback"
                  className="h-full w-full overflow-hidden rounded-xl"
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
                    'mx-auto h-full w-full object-contain transition-opacity duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform select-none',
                    isTransitioning ? 'opacity-0' : 'opacity-100',
                  )}
                />
              )}

              {/* Ánh sáng viền vàng dịu bám theo con trỏ */}
              <div
                ref={glareRef}
                data-testid="heritage-foil-glare"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300"
              />
            </div>

            {/* Thanh chú thích đặt ngoài khung tranh để không che hình */}
            <div className="mt-3 px-1">
              <p className="font-serif text-xs text-[#E8C87D]/95 italic sm:text-sm">
                {currentArtwork.caption}
              </p>
            </div>
          </div>

          {/* Cột Phải (5 cột): Hồ Sơ Học Thuật Hiển Thị Trực Tiếp */}
          <aside
            aria-label={`Hồ sơ học thuật: ${currentArtwork.title}`}
            className={cn(
              'flex flex-col justify-between rounded-2xl border border-[#D4A853]/30 bg-[#0F1926]/86 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-opacity duration-[320ms] sm:p-7 lg:col-span-5',
              isTransitioning ? 'opacity-65' : 'opacity-100',
            )}
          >
            <div className="space-y-4">
              {/* Số thứ tự + Thẻ Niên đại & Nguồn gốc */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C9A45C]/20 pb-3">
                <span className="font-mono text-xs font-bold tracking-widest text-[#E5C158]">
                  {formattedIndex} / {formattedTotal}
                </span>
                <span className="inline-flex items-center rounded-full border border-[#C9A45C]/30 bg-[#C9A45C]/15 px-3 py-1 font-mono text-[11px] font-medium text-[#E8C87D]">
                  {currentArtwork.artistOrOrigin} · {currentArtwork.yearOrEra}
                </span>
              </div>

              {/* Tên Tác phẩm */}
              <h3 className="font-serif text-[26px] leading-snug font-bold text-[#FAF6EE] lg:text-[28px]">
                {currentArtwork.title}
              </h3>

              {/* Mục 1: Giá trị Học thuật & Biểu tượng */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#E5C158] uppercase">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Giá trị Học thuật &amp; Biểu tượng</span>
                </div>
                <p className="text-sm leading-relaxed text-[#D1DCD6]">
                  {currentArtwork.academicSignificance}
                </p>
              </div>
            </div>

            {/* Mục 2: Card Lược sử & Bối cảnh ra đời tinh tế bằng nền giấy tối ấm */}
            <div className="mt-6 rounded-xl border border-[#C9A45C]/28 bg-[#FAF6EE]/[0.05] p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-[#C9A45C]/20 pb-2 font-mono text-[11px] font-semibold tracking-wider text-[#E8C87D] uppercase">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Lược sử &amp; Bối cảnh ra đời</span>
              </div>

              <dl className="space-y-2 text-xs leading-relaxed text-[#D1DCD6]">
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#E5C158]">
                    Tác phẩm gốc:{' '}
                  </dt>
                  <dd className="inline font-serif text-[#FAF6EE]">
                    {currentArtwork.originalTitle}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#E5C158]">
                    Niên đại &amp; Thời kỳ:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.eraAndPeriod}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#E5C158]">
                    Chất liệu &amp; Kỹ thuật:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.materialAndTechnique}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-[11px] font-semibold text-[#E5C158]">
                    Nơi lưu trữ gốc:{' '}
                  </dt>
                  <dd className="inline">{currentArtwork.archivalLocation}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* ================================================================
          THANH ĐIỀU KHIỂN TRÌNH CHIẾU TRUNG TÂM (GIỮA KHUNG TRANH & FILMSTRIP)
          ================================================================ */}
        <div
          data-testid="heritage-control-bar"
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Tác phẩm trước"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4A853]/40 bg-[#132030] px-4 py-2 text-xs font-medium text-[#FAF5E8] shadow-sm transition-all hover:border-[#E5B85B] hover:bg-[#1B2D42] active:scale-[0.98] sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4 text-[#E5B85B]" aria-hidden="true" />
            <span>Tác phẩm trước</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Tự động chiếu' : 'Tạm dừng'}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4A853]/40 bg-[#132030] px-4 py-2 text-xs font-medium text-[#E5B85B] shadow-sm transition-all hover:border-[#E5B85B] hover:bg-[#1B2D42] active:scale-[0.98] sm:text-sm"
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tự động chiếu</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tạm dừng</span>
              </>
            )}
          </button>

          <span
            data-testid="heritage-index-indicator"
            className="inline-flex items-center rounded-full border border-[#D4A853]/40 bg-[#0D1622] px-4 py-2 font-mono text-xs font-bold tracking-widest text-[#E5B85B] sm:text-sm"
          >
            {formattedIndex} / {formattedTotal}
          </span>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Tác phẩm tiếp"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4A853]/40 bg-[#132030] px-4 py-2 text-xs font-medium text-[#FAF5E8] shadow-sm transition-all hover:border-[#E5B85B] hover:bg-[#1B2D42] active:scale-[0.98] sm:text-sm"
          >
            <span>Tác phẩm tiếp</span>
            <ChevronRight className="h-4 w-4 text-[#E5B85B]" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label={`Phóng to tác phẩm ${currentArtwork.title}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D4A853]/40 bg-[#132030] px-4 py-2 text-xs font-medium text-[#FAF5E8] shadow-sm transition-all hover:border-[#E5B85B] hover:bg-[#1B2D42] active:scale-[0.98] sm:text-sm"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#E5B85B]" aria-hidden="true" />
            <span>Xem toàn màn hình</span>
          </button>
        </div>

        {/* ================================================================
          TẦNG 3: THANH FILMSTRIP 30 THU NHỎ TƯƠNG TÁC (KHÔNG THANH CUỘN THÔ)
          ================================================================ */}
        <div className="mt-7 border-t border-[#D4A853]/20 pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] tracking-widest text-[#E8C87D]/90 uppercase">
              DANH MỤC TRIỂN LÃM ({formattedTotal} TÁC PHẨM)
            </span>
            <span className="font-mono text-[11px] text-[#B8C7D4]">
              Bấm chọn tác phẩm hoặc trượt ngang để chiêm ngưỡng hồ sơ chi tiết
            </span>
          </div>

          <div className="relative flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollFilmstripBy(-FILMSTRIP_SCROLL_STEP_PX)}
              aria-label="Cuộn danh mục sang trái"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#D4A853]/40 bg-[#132030] text-[#FAF5E8] shadow-md transition-all hover:border-[#E5B85B] hover:bg-[#1B2D42] sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4 text-[#E5B85B]" aria-hidden="true" />
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
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#D4A853]/40 bg-[#132030] text-[#FAF5E8] shadow-md transition-all hover:border-[#E5B85B] hover:bg-[#1B2D42] sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4 text-[#E5B85B]" aria-hidden="true" />
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-8"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#D4A853]/45 bg-[#0D1622] p-4 shadow-2xl sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between gap-4 border-b border-[#C9A45C]/20 pb-3">
              <div>
                <p className="font-mono text-xs text-[#E5C158]">
                  {formattedIndex} / {formattedTotal} · {currentArtwork.artistOrOrigin}
                </p>
                <h3 className="font-serif text-lg font-bold text-[#FAF6EE] sm:text-xl">
                  {currentArtwork.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Đóng xem toàn màn hình"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#FAF6EE] hover:border-[#E5C158] hover:text-[#E5C158]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-black/45 p-2">
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
              <p className="font-serif text-xs text-[#E8C87D] italic">{currentArtwork.caption}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Xem tác phẩm trước"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#C9A45C]/35 px-3 py-1.5 text-xs text-[#F7F3E8] hover:border-[#E5C158]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Xem tác phẩm tiếp theo"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#C9A45C]/35 px-3 py-1.5 text-xs text-[#F7F3E8] hover:border-[#E5C158]"
                >
                  <span>Sau</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
