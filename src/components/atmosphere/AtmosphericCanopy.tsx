import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildAtmosphericFallbackMesh,
  DASHBOARD_CANOPY_ASSETS,
  getSubjectWashAsset,
} from '@/config/atmosphereAssets';
import { useReadingSettings } from '@/context/ReadingSettingsContext';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import {
  computeFrameDelta,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export interface AtmosphericCanopyProps {
  /** Biến thể: mái vòm Trang Tổng quan, dải đầu Không gian Học tập hoặc dải sắc 4 Học phần */
  readonly variant: 'dashboard' | 'learning-space' | 'subject';
  /** Slug môn học khi variant === 'subject' */
  readonly subjectSlug?: string;
  /** Bật chế độ ảnh tràn viền sắc nét (không hòa tan trắng nửa dưới, dùng scrim định hướng) */
  readonly fullBleedPhoto?: boolean;
  /** Lớp phủ scrim định hướng tùy chỉnh (dùng cho sắc thái sáng/chiều/tối/đêm ở chế độ fullBleedPhoto) */
  readonly scrimGradient?: string;
  /** Bật lớp nét thiên cầu động 120fps phủ nhẹ lên tranh nền */
  readonly enableCelestialOverlay?: boolean;
  /** Bật parallax vi mô translate3d theo con trỏ chuột (tắt khi prefers-reduced-motion) */
  readonly enableParallax?: boolean;
  /** Lớp sương đệm bảo vệ độ tương phản chữ bên trái (--canopy-scrim) */
  readonly showScrim?: boolean;
  /** Cho phép hiển thị ở chế độ chỉ nền tuyệt đối (dùng cho header mỏng không bọc children) */
  readonly backgroundOnly?: boolean;
  readonly className?: string;
  readonly testId?: string;
  readonly children?: ReactNode;
}

function readDomDarkState(): boolean {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  return root.classList.contains('dark') || root.getAttribute('data-theme') === 'dark';
}

/**
 * Mái Vòm Khí Quyển 3 Lớp (External Artwork + 120FPS Celestial Overlay + Intelligent Fallback):
 * - Lớp 0: Nền CSS đa sắc loang màu nước (Watercolor Mesh) tự động đồng bộ Ceramic Light / Obsidian Studio.
 * - Lớp 1: Ảnh nghệ thuật ngoài từ `public/assets/atmosphere/` (tự ẩn sạch khi thiếu file, fade-in 450ms khi tải xong).
 * - Lớp 2: Nét hình học thiên cầu siêu mảnh 120fps có IntersectionObserver & prefers-reduced-motion.
 * - Ranh giới đáy: Mặt nạ hòa tan đa điểm dừng (.lu-canopy-mask) + lớp sương đệm var(--bg-workspace) chống color banding.
 */
export function AtmosphericCanopy({
  variant,
  subjectSlug,
  fullBleedPhoto = false,
  scrimGradient,
  enableCelestialOverlay = true,
  enableParallax = false,
  showScrim = variant === 'dashboard',
  backgroundOnly = false,
  className,
  testId = 'atmospheric-canopy',
  children,
}: AtmosphericCanopyProps) {
  const { theme } = useReadingSettings();
  const prefersReducedMotion = useReducedMotion();

  const [domDark, setDomDark] = useState<boolean>(() => readDomDarkState());
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const [failedMap, setFailedMap] = useState<Record<string, boolean>>({});

  const hostRef = useRef<HTMLDivElement | null>(null);
  const parallaxLayerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Theo dõi đồng bộ lớp `.dark` / `data-theme` trên <html> để phản hồi tức thì khi đổi Sáng ↔ Tối
  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const sync = () => setDomDark(readDomDarkState());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const isDark = theme === 'dark' || domDark;

  const subjectWash = useMemo(() => getSubjectWashAsset(subjectSlug), [subjectSlug]);

  const assetSrc = useMemo<string | null>(() => {
    if (variant === 'dashboard') {
      return isDark ? DASHBOARD_CANOPY_ASSETS.dark : DASHBOARD_CANOPY_ASSETS.light;
    }
    // Các tranh loang màu nước học phần (subject-wash-*.webp) dùng nền giấy trắng sáng -> áp dụng cho Light Mode;
    // ở Dark Mode tự chuyển sang dải sương Obsidian riêng biệt để không gây vệt trắng đục.
    if (variant === 'subject' && subjectWash && !isDark) {
      return subjectWash.src;
    }
    return null;
  }, [isDark, subjectWash, variant]);

  const fallbackMesh = useMemo(
    () => buildAtmosphericFallbackMesh({ variant, isDark, subjectSlug }),
    [isDark, subjectSlug, variant],
  );

  const isAssetFailed = assetSrc ? Boolean(failedMap[assetSrc]) : true;
  const isAssetLoaded = assetSrc ? Boolean(loadedMap[assetSrc]) : false;

  // Nếu ảnh đã có sẵn trong bộ nhớ đệm trình duyệt (reload / điều hướng quay lại), hiển thị ngay không chờ sự kiện onLoad
  useEffect(() => {
    if (!assetSrc || isAssetLoaded || isAssetFailed) return;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoadedMap((prev) => (prev[assetSrc] ? prev : { ...prev, [assetSrc]: true }));
    }
  }, [assetSrc, isAssetFailed, isAssetLoaded]);

  // Parallax vi mô chỉ tác động lên transform: translate3d() (không chạm blur/width/height/shadow)
  useEffect(() => {
    if (!enableParallax || prefersReducedMotion) return;
    const host = hostRef.current;
    const layer = parallaxLayerRef.current;
    if (!host || !layer) return;

    let rafId = 0;
    let isVisible = true;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let prevNow = performance.now();

    const step = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      const alpha = frameDampFactor(7, dtSeconds);
      curX += (targetX - curX) * alpha;
      curY += (targetY - curY) * alpha;

      layer.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) scale(1.03)`;

      if (isVisible && (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05)) {
        rafId = window.requestAnimationFrame(step);
      } else {
        rafId = 0;
      }
    };

    const schedule = () => {
      if (!rafId && isVisible) {
        prevNow = performance.now();
        rafId = window.requestAnimationFrame(step);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = -nx * 10;
      targetY = -ny * 6;
      schedule();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.02 },
      );
      io.observe(host);
    }

    host.addEventListener('pointermove', onPointerMove, { passive: true });
    host.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      io?.disconnect();
      layer.style.transform = 'translate3d(0px, 0px, 0px)';
    };
  }, [enableParallax, prefersReducedMotion]);

  // Lớp 2: Nét Hình học Thiên cầu Động siêu mảnh (0.75px–1px, opacity 12%–22%)
  useEffect(() => {
    if (!enableCelestialOverlay) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(320, host.clientWidth || 960);
    let height = Math.max(140, host.clientHeight || 300);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, host.clientWidth || 960);
      height = Math.max(140, host.clientHeight || 300);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    const accentRgb =
      variant === 'subject' && subjectWash
        ? isDark
          ? subjectWash.darkRgb
          : subjectWash.rgb
        : isDark
          ? '120, 178, 160'
          : '23, 51, 44';
    const goldRgb = isDark ? '212, 175, 106' : '158, 118, 59';

    const drawCelestial = (tSec: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * (variant === 'dashboard' ? 0.77 : 0.8);
      const cy = height * (variant === 'dashboard' ? 0.42 : 0.46);
      const baseR = Math.min(width * 0.28, height * 0.82);

      // 3 vòng cung quỹ đạo đồng tâm siêu mảnh (0.75px – 1px)
      const rings = [
        { r: baseR * 0.56, dash: [3, 6], speed: 0.045, rgb: accentRgb, alpha: isDark ? 0.2 : 0.16 },
        { r: baseR * 0.84, dash: [], speed: -0.028, rgb: goldRgb, alpha: isDark ? 0.19 : 0.15 },
        {
          r: baseR * 1.12,
          dash: [6, 10],
          speed: 0.018,
          rgb: accentRgb,
          alpha: isDark ? 0.14 : 0.12,
        },
      ];

      for (const ring of rings) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tSec * ring.speed);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ring.rgb}, ${ring.alpha})`;
        ctx.lineWidth = 0.85;
        ctx.setLineDash(ring.dash);
        ctx.stroke();
        ctx.restore();
      }
      ctx.setLineDash([]);

      // Các vạch chia độ thiên văn mảnh trên vành giữa
      const midR = baseR * 0.84;
      const tickRot = -tSec * 0.028;
      for (let i = 0; i < 24; i += 1) {
        const angle = tickRot + (i * Math.PI * 2) / 24;
        const isCardinal = i % 6 === 0;
        const inner = midR - (isCardinal ? 7 : 3.5);
        const outer = midR + (isCardinal ? 4 : 2);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.strokeStyle = `rgba(${isCardinal ? goldRgb : accentRgb}, ${isCardinal ? 0.22 : 0.13})`;
        ctx.lineWidth = isCardinal ? 0.95 : 0.75;
        ctx.stroke();
      }

      // 2 đường tiếp tuyến hình học giao nhau tại trục thiên cầu
      const lineAngle = 0.22 + Math.sin(tSec * 0.12) * 0.03;
      const span = baseR * 1.35;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(lineAngle) * span, cy - Math.sin(lineAngle) * span);
      ctx.lineTo(cx + Math.cos(lineAngle) * span, cy + Math.sin(lineAngle) * span);
      ctx.strokeStyle = `rgba(${accentRgb}, ${isDark ? 0.14 : 0.11})`;
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // 3 nút tọa độ quỹ đạo xoay chậm
      const nodes = [
        { r: baseR * 0.56, angle: tSec * 0.14 + 0.8, rgb: goldRgb, size: 2.4 },
        { r: baseR * 0.84, angle: -tSec * 0.09 + 2.4, rgb: accentRgb, size: 2.8 },
        { r: baseR * 1.12, angle: tSec * 0.06 + 4.1, rgb: goldRgb, size: 2.0 },
      ];
      for (const n of nodes) {
        const nx = cx + Math.cos(n.angle) * n.r;
        const ny = cy + Math.sin(n.angle) * n.r;
        ctx.beginPath();
        ctx.arc(nx, ny, n.size + 3.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${n.rgb}, 0.16)`;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.rgb}, ${isDark ? 0.52 : 0.42})`;
        ctx.fill();
      }

      ctx.restore();
    };

    let rafId = 0;
    let isVisible = true;
    let elapsed = 0;
    let prevNow = performance.now();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        resize();
        drawCelestial(elapsed);
      });
      ro.observe(host);
    }

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.02 },
      );
      io.observe(host);
    }

    drawCelestial(0);

    if (prefersReducedMotion) {
      return () => {
        ro?.disconnect();
        io?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtSeconds;
        drawCelestial(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [enableCelestialOverlay, isDark, prefersReducedMotion, subjectWash, variant]);

  const objectPosition = fullBleedPhoto
    ? 'center center'
    : (subjectWash?.objectPosition ?? 'center 35%');

  const canopyBackdrop = (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none',
        !fullBleedPhoto && 'lu-canopy-mask',
      )}
    >
      <div
        ref={parallaxLayerRef}
        style={
          {
            willChange: enableParallax && !prefersReducedMotion ? 'transform' : undefined,
          } as CSSProperties
        }
        className="absolute inset-0"
      >
        {/* Lớp 0: Nền Fallback CSS đa sắc giàu chiều sâu (luôn sẵn sàng, 0 vỡ ảnh) */}
        <div
          data-testid={`${testId}-fallback`}
          style={{ backgroundImage: fallbackMesh }}
          className="absolute inset-0 transition-opacity duration-500"
        />

        {/* Lớp 1: Ảnh chụp thật ngoài (External Curated Asset) — tự ẩn sạch nếu chưa có file */}
        {assetSrc && !isAssetFailed && (
          <img
            ref={imgRef}
            key={assetSrc}
            src={assetSrc}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority={variant === 'dashboard' ? 'high' : 'auto'}
            style={{ objectPosition }}
            onLoad={() => setLoadedMap((prev) => ({ ...prev, [assetSrc]: true }))}
            onError={() => setFailedMap((prev) => ({ ...prev, [assetSrc]: true }))}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-[450ms] ease-out',
              isAssetLoaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}

        {/* Lớp 2: Nét hình học thiên cầu động siêu mảnh 120fps */}
        {enableCelestialOverlay && (
          <canvas
            ref={canvasRef}
            data-testid={`${testId}-celestial`}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>

      {/* Chế độ Spatial Full-Bleed Photo: chỉ phủ scrim định hướng giữ nửa dưới ảnh sắc nét cho kính mờ */}
      {fullBleedPhoto ? (
        <div
          data-testid={`${testId}-scrim`}
          style={{
            background:
              scrimGradient ??
              'linear-gradient(105deg, rgba(14, 24, 22, 0.72) 0%, rgba(14, 24, 22, 0.38) 52%, rgba(14, 24, 22, 0.15) 100%)',
          }}
          className="pointer-events-none absolute inset-0 transition-[background] duration-500"
        />
      ) : (
        <>
          {/* Lớp sương đệm đáy đồng bộ nền var(--bg-workspace) cho các dải wash đầu trang */}
          <div
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--bg-workspace) 62%, transparent) 55%, var(--bg-workspace) 100%)',
            }}
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-[30%]"
          />

          {/* Lớp sương đệm bảo vệ độ tương phản chữ bên trái (--canopy-scrim) */}
          {showScrim && (
            <div
              style={{ background: 'var(--canopy-scrim)' }}
              className="pointer-events-none absolute inset-0"
            />
          )}
        </>
      )}
    </div>
  );

  if (backgroundOnly) {
    return (
      <div
        ref={hostRef}
        data-testid={testId}
        data-atmosphere-variant={variant}
        data-atmosphere-theme={isDark ? 'dark' : 'light'}
        aria-hidden="true"
        className={cn('pointer-events-none absolute inset-x-0 top-0 overflow-hidden', className)}
      >
        {canopyBackdrop}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      data-testid={testId}
      data-atmosphere-variant={variant}
      data-atmosphere-theme={isDark ? 'dark' : 'light'}
      className={cn('relative overflow-hidden', className)}
    >
      {canopyBackdrop}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AtmosphericCanopy;
