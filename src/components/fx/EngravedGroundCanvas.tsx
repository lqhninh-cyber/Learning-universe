import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import {
  computeFrameDelta,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';

export interface EngravedGroundCanvasProps {
  readonly className?: string;
  /** Bước lưới điểm cơ sở (px), mặc định 16px theo chuẩn ruled-grounds */
  readonly step?: number;
  /** Chu kỳ nút chữ thập + (mặc định mỗi 4 nút) */
  readonly crosshairEvery?: number;
  /** Tỉ lệ chiều rộng vùng tĩnh bên trái để chữ typography luôn thoáng */
  readonly calmLeftFraction?: number;
  /** Tâm hoa văn guilloche trục X (tỉ lệ 0..1) đặt dưới mô hình 3D */
  readonly rosetteCenterX?: number;
  /** Tâm hoa văn guilloche trục Y (tỉ lệ 0..1) */
  readonly rosetteCenterY?: number;
  readonly showEngraving?: boolean;
  readonly showRosette?: boolean;
}

interface RuledGridCache {
  width: number;
  height: number;
  cols: number;
  rows: number;
  ox: number;
  oy: number;
  pointCount: number;
  px: Float32Array;
  py: Float32Array;
  calm: Float32Array;
  isCross: Uint8Array;
  engravingPaths: Path2D[];
  rosettePaths: Path2D[];
}

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

/**
 * Trường độ cao 2D mượt cho nét khắc đồng (line-engraving/effect.js),
 * kết hợp gợn sóng nghiêng và đỉnh trung tâm vùng hoa văn bên phải.
 */
function sampleReliefHeight(nx: number, ny: number, rx: number, ry: number): number {
  const dx = nx - rx;
  const dy = ny - ry;
  const peak = Math.exp(-(dx * dx * 8.2 + dy * dy * 10.5));
  const waveA = Math.sin(nx * 5.2 + ny * 3.1) * 0.5 + 0.5;
  const waveB = Math.cos(nx * 9.4 - ny * 7.8) * 0.5 + 0.5;
  return clamp01(peak * 0.65 + waveA * 0.24 + waveB * 0.11);
}

function buildRuledGridCache(
  width: number,
  height: number,
  step: number,
  crosshairEvery: number,
  calmLeftFraction: number,
  rosetteCenterX: number,
  rosetteCenterY: number,
  showEngraving: boolean,
  showRosette: boolean,
): RuledGridCache {
  const cols = Math.max(1, Math.floor(width / step) + 1);
  const rows = Math.max(1, Math.floor(height / step) + 1);
  const ox = Math.floor((width - (cols - 1) * step) * 0.5);
  const oy = Math.floor((height - (rows - 1) * step) * 0.5);
  const pointCount = cols * rows;

  const px = new Float32Array(pointCount);
  const py = new Float32Array(pointCount);
  const calm = new Float32Array(pointCount);
  const isCross = new Uint8Array(pointCount);

  let idx = 0;
  for (let iy = 0; iy < rows; iy += 1) {
    const y = Math.round(oy + iy * step) + 0.5;
    for (let ix = 0; ix < cols; ix += 1) {
      const x = Math.round(ox + ix * step) + 0.5;
      const nx = x / Math.max(1, width);
      const ny = y / Math.max(1, height);
      // Vùng tĩnh nhẹ phía trái để khối chữ Hero giữ tương phản tuyệt đối
      const calmMask = 1 - smoothstep(0, calmLeftFraction, nx);
      const edgeFade =
        smoothstep(0.01, 0.08, nx) *
        smoothstep(0.01, 0.08, 1 - nx) *
        smoothstep(0.02, 0.12, ny) *
        smoothstep(0.02, 0.12, 1 - ny);

      px[idx] = x;
      py[idx] = y;
      calm[idx] = clamp01(calmMask * 0.72 + (1 - edgeFade) * 0.55);
      isCross[idx] = ix % crosshairEvery === 0 && iy % crosshairEvery === 0 ? 1 : 0;
      idx += 1;
    }
  }

  const engravingPaths: Path2D[] = [];
  if (showEngraving && typeof Path2D !== 'undefined' && width > 40 && height > 40) {
    // Khắc tuyến tính song song nghiêng 20 độ uốn theo địa hình
    const angleRad = (20 * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const nxVec = -sinA;
    const nyVec = cosA;
    const pitch = 13;
    const diag = Math.hypot(width, height);
    const lineCount = Math.floor(diag / pitch) + 4;
    const sampleStep = 14;
    const bendPx = 11;

    for (let i = -Math.floor(lineCount * 0.5); i <= Math.floor(lineCount * 0.5); i += 1) {
      const baseOffset = i * pitch;
      const path = new Path2D();
      let started = false;

      for (let s = -diag * 0.55; s <= diag * 0.55; s += sampleStep) {
        const rawX = width * 0.5 + cosA * s + nxVec * baseOffset;
        const rawY = height * 0.5 + sinA * s + nyVec * baseOffset;
        if (rawX < -24 || rawX > width + 24 || rawY < -24 || rawY > height + 24) continue;

        const normX = rawX / width;
        const normY = rawY / height;
        const h = sampleReliefHeight(normX, normY, rosetteCenterX, rosetteCenterY);
        const calmWeight = 1 - smoothstep(0.04, calmLeftFraction * 0.92, normX) * 0.65;
        const bx = rawX + nxVec * (h - 0.35) * bendPx * calmWeight;
        const by = rawY + nyVec * (h - 0.35) * bendPx * calmWeight;

        if (!started) {
          path.moveTo(bx, by);
          started = true;
        } else {
          path.lineTo(bx, by);
        }
      }

      if (started) engravingPaths.push(path);
    }
  }

  const rosettePaths: Path2D[] = [];
  if (showRosette && typeof Path2D !== 'undefined' && width > 80 && height > 80) {
    // Hoa văn guilloche 18 cánh dưới khối pha lê 3D (line-engraving/effect.js)
    const cx = width * rosetteCenterX;
    const cy = height * rosetteCenterY;
    const baseRadius = Math.min(width, height) * 0.34;
    const lobes = 18;
    const steps = 180;
    const rings = [0.48, 0.72, 0.96];

    for (let rIdx = 0; rIdx < rings.length; rIdx += 1) {
      const ringScale = rings[rIdx] ?? 0.7;
      const amp = 6 + rIdx * 3.5;
      const phase = rIdx * 0.45;
      const ringPath = new Path2D();
      for (let k = 0; k <= steps; k += 1) {
        const theta = (k / steps) * Math.PI * 2;
        const radius = baseRadius * ringScale + Math.sin(theta * lobes + phase) * amp;
        const x = cx + Math.cos(theta) * radius;
        const y = cy + Math.sin(theta) * radius;
        if (k === 0) ringPath.moveTo(x, y);
        else ringPath.lineTo(x, y);
      }
      ringPath.closePath();
      rosettePaths.push(ringPath);
    }
  }

  return {
    width,
    height,
    cols,
    rows,
    ox,
    oy,
    pointCount,
    px,
    py,
    calm,
    isCross,
    engravingPaths,
    rosettePaths,
  };
}

/**
 * Nền lưới chấm kỹ thuật 16px, điểm chữ thập chuẩn độ và đường khắc tuyến tính guilloche.
 * Chuyển thể trực tiếp từ thuật toán ruled-grounds và line-engraving của taste-skill.
 */
export function EngravedGroundCanvas({
  className,
  step = 16,
  crosshairEvery = 4,
  calmLeftFraction = 0.46,
  rosetteCenterX = 0.75,
  rosetteCenterY = 0.5,
  showEngraving = true,
  showRosette = true,
}: EngravedGroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getLowLatency2DContext(canvas, { alpha: true });
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let cache: RuledGridCache | null = null;
    let isVisible = true;
    let rafId: number | null = null;
    let lastTs = typeof performance !== 'undefined' ? performance.now() : 0;
    let elapsedSec = 0;

    // Trạng thái con trỏ chuột nội suy mượt độc lập tần số quét
    let pointerTargetX = 0.74;
    let pointerTargetY = 0.48;
    let pointerActiveTarget = 0;
    let pointerX = 0.74;
    let pointerY = 0.48;
    let pointerActive = 0;

    const rebuildSize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextW = Math.max(0, Math.round(rect.width));
      const nextH = Math.max(0, Math.round(rect.height));
      if (nextW === 0 || nextH === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (nextW === width && nextH === height && canvas.width === Math.round(nextW * dpr)) {
        return;
      }
      width = nextW;
      height = nextH;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      cache = buildRuledGridCache(
        width,
        height,
        step,
        crosshairEvery,
        calmLeftFraction,
        rosetteCenterX,
        rosetteCenterY,
        showEngraving,
        showRosette,
      );
    };

    const drawFrame = (ts: number) => {
      const delta = computeFrameDelta(ts, lastTs);
      lastTs = ts;
      if (!reducedMotion) {
        elapsedSec += delta.dtSeconds;
      }

      if (!cache || width === 0 || height === 0) {
        rebuildSize();
      }
      if (!cache || width === 0 || height === 0) return;

      const damp = frameDampFactor(8, delta.dtSeconds);
      pointerX += (pointerTargetX - pointerX) * damp;
      pointerY += (pointerTargetY - pointerY) * damp;
      pointerActive += (pointerActiveTarget - pointerActive) * damp;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Tâm sáng chuẩn độ: dao động Lissajous chậm hoặc bám theo vị trí con trỏ chuột mượt 120fps
      const wanderX =
        width *
        (rosetteCenterX -
          0.1 +
          Math.sin(elapsedSec * 0.2513) * 0.18 +
          Math.cos(elapsedSec * 0.13) * 0.05);
      const wanderY =
        height *
        (rosetteCenterY + Math.cos(elapsedSec * 0.197) * 0.22 + Math.sin(elapsedSec * 0.11) * 0.04);
      const focusX = pointerActive > 0.02 ? width * pointerX : wanderX;
      const focusY = pointerActive > 0.02 ? height * pointerY : wanderY;
      const radiusPx = Math.max(140, Math.min(width, height) * 0.42);
      const invRadius = 1 / radiusPx;

      // 1. Nét khắc tuyến tính 20° tĩnh + Hệ đường khắc ngang nổi 3D uốn cong & tách giãn quanh con trỏ
      if (cache.engravingPaths.length > 0) {
        ctx.lineWidth = 0.7;
        ctx.strokeStyle = 'rgba(30, 51, 46, 0.042)';
        for (let i = 0; i < cache.engravingPaths.length; i += 1) {
          const path = cache.engravingPaths[i];
          if (path) ctx.stroke(path);
        }
      }

      if (showEngraving && width > 80 && height > 80) {
        const horizPitch = 22;
        const xStep = Math.max(24, Math.round(width / 46));
        const domeSigma = Math.max(125, Math.min(width, height) * 0.34);
        const invSigmaSq = 1 / (domeSigma * domeSigma);
        const repelStrength = 14 + pointerActive * 16;

        for (let baseY = horizPitch; baseY < height - 8; baseY += horizPitch) {
          const dyFromFocus = baseY - focusY;
          const nearBand = Math.abs(dyFromFocus) < domeSigma * 1.45;
          ctx.beginPath();
          let maxLift = 0;

          for (let x = 0; x <= width + xStep; x += xStep) {
            const sx = x > width ? width : x;
            const nx = sx / width;
            const calmMask = 1 - smoothstep(0.02, calmLeftFraction * 0.95, nx) * 0.72;
            const dx = sx - focusX;
            const d2 = dx * dx + dyFromFocus * dyFromFocus;
            const dome = nearBand ? Math.exp(-d2 * invSigmaSq) : 0;
            // Tách giãn trên/dưới quanh tâm chuột để tạo cảm giác khối cầu khắc chìm 3D
            const signY = dyFromFocus === 0 ? 0 : dyFromFocus > 0 ? 1 : -1;
            const spreadY = signY * dome * repelStrength;
            const rippleY =
              Math.sin(nx * 9.2 + baseY * 0.035 + elapsedSec * 0.45) * 2.1 * (1 - calmMask * 0.4);
            const y = baseY + (spreadY + rippleY) * (0.42 + 0.58 * calmMask);

            if (dome > maxLift) maxLift = dome;
            if (x === 0) ctx.moveTo(sx, y);
            else ctx.lineTo(sx, y);
          }

          const lineAlpha = 0.045 + maxLift * (0.04 + pointerActive * 0.05);
          ctx.lineWidth = maxLift > 0.25 ? 0.95 : 0.7;
          ctx.strokeStyle =
            maxLift > 0.38 && pointerActive > 0.08
              ? `rgba(140, 114, 72, ${Math.min(0.22, lineAlpha * 1.65).toFixed(3)})`
              : `rgba(30, 51, 46, ${lineAlpha.toFixed(3)})`;
          ctx.stroke();
        }
      }

      // 2. Hoa văn guilloche đồng trục dưới mô hình 3D
      if (cache.rosettePaths.length > 0) {
        for (let i = 0; i < cache.rosettePaths.length; i += 1) {
          const ring = cache.rosettePaths[i];
          if (!ring) continue;
          ctx.lineWidth = i === 1 ? 0.9 : 0.65;
          ctx.strokeStyle =
            i === 1
              ? `rgba(140, 114, 72, ${(0.085 + pointerActive * 0.045).toFixed(3)})`
              : 'rgba(30, 51, 46, 0.065)';
          ctx.stroke(ring);
        }
      }

      // 3. Điểm lưới chuẩn độ 16px & chữ thập 3px với vùng ánh sáng dạo Lissajous + con trỏ

      const { pointCount, px, py, calm, isCross } = cache;
      for (let i = 0; i < pointCount; i += 1) {
        const x = px[i] ?? 0;
        const y = py[i] ?? 0;
        const calmVal = calm[i] ?? 0;
        const distNorm = Math.hypot(x - focusX, y - focusY) * invRadius;
        const spot = Math.max(0, 1 - distNorm);
        const lit = spot * spot * (1 - calmVal * 0.72);
        const baseAlpha = (0.145 + lit * 0.34) * (1 - calmVal * 0.58);

        if (baseAlpha <= 0.02) continue;

        if (isCross[i] === 1) {
          const half = 3;
          ctx.lineWidth = 1;
          ctx.strokeStyle =
            lit > 0.28
              ? `rgba(140, 114, 72, ${Math.min(0.62, baseAlpha + 0.16).toFixed(3)})`
              : `rgba(30, 51, 46, ${baseAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(x - half, y);
          ctx.lineTo(x + half, y);
          ctx.moveTo(x, y - half);
          ctx.lineTo(x, y + half);
          ctx.stroke();
        } else {
          ctx.fillStyle =
            lit > 0.36
              ? `rgba(140, 114, 72, ${Math.min(0.55, baseAlpha + 0.12).toFixed(3)})`
              : `rgba(30, 51, 46, ${(baseAlpha * 0.85).toFixed(3)})`;
          const dotRadius = lit > 0.35 ? 1.15 : 0.85;
          ctx.fillRect(x - dotRadius * 0.5, y - dotRadius * 0.5, dotRadius * 2, dotRadius * 2);
        }
      }

      ctx.restore();
    };

    const tick = (ts: number) => {
      if (!isVisible) {
        rafId = null;
        return;
      }
      drawFrame(ts);
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      if (reducedMotion) {
        drawFrame(lastTs);
        return;
      }
      if (rafId === null && isVisible) {
        lastTs = typeof performance !== 'undefined' ? performance.now() : 0;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rebuildSize();
    drawFrame(lastTs);

    const parentEl = canvas.parentElement;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerTargetX = clamp01((e.clientX - rect.left) / rect.width);
      pointerTargetY = clamp01((e.clientY - rect.top) / rect.height);
      pointerActiveTarget = 1;
      if (reducedMotion) drawFrame(lastTs);
    };

    const handlePointerLeave = () => {
      pointerActiveTarget = 0;
      if (reducedMotion) drawFrame(lastTs);
    };

    if (parentEl) {
      parentEl.addEventListener('pointermove', handlePointerMove, { passive: true });
      parentEl.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        rebuildSize();
        drawFrame(lastTs);
      });
      resizeObserver.observe(canvas);
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = entry ? entry.isIntersecting : true;
          if (isVisible) startLoop();
          else if (rafId !== null) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
          }
        },
        { threshold: 0.01 },
      );
      intersectionObserver.observe(canvas);
    }

    startLoop();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (parentEl) {
        parentEl.removeEventListener('pointermove', handlePointerMove);
        parentEl.removeEventListener('pointerleave', handlePointerLeave);
      }
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [
    step,
    crosshairEvery,
    calmLeftFraction,
    rosetteCenterX,
    rosetteCenterY,
    showEngraving,
    showRosette,
    reducedMotion,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="engraved-ground-canvas"
      className={cn('pointer-events-none block h-full w-full', className)}
    />
  );
}
