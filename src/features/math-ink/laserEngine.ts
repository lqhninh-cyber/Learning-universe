/**
 * Động cơ Bút Laser tự tan không phá hủy (Non-destructive Auto-Fading Laser Pointer) cho /bang-viet.
 * - Mảng điểm tạm `{ x, y, createdAt }` được giữ trong `useRef` (không re-render React, không lưu store/Undo/export).
 * - Thời gian tồn tại mỗi điểm: 1200ms, tự mờ dần theo đường cong ease-out và thu hẹp độ dày về đuôi.
 * - Dừng hoàn toàn `requestAnimationFrame` khi người dùng thả bút và điểm cuối cùng hết hạn (0% CPU khi nhàn rỗi).
 */

export const LASER_POINT_TTL_MS = 1200;
export const LASER_MAX_CORE_WIDTH = 3.5;
export const LASER_MIN_CORE_WIDTH = 0.65;
export const LASER_HEAD_RADIUS = 4;
export const LASER_GLOW_SHADOW_BLUR = 10;

export const LASER_LIGHT_CORE_COLOR = '#FF4D4F';
export const LASER_DARK_CORE_COLOR = '#FF6B6B';
export const LASER_LIGHT_GLOW_COLOR = 'rgba(255, 92, 51, 0.56)';
export const LASER_DARK_GLOW_COLOR = 'rgba(255, 107, 74, 0.64)';

export type LaserColorPresetId = 'default' | 'emerald' | 'blue';

export interface LaserPoint {
  readonly x: number;
  readonly y: number;
  readonly createdAt: number;
}

export interface LaserTrail {
  readonly colorPreset: LaserColorPresetId;
  readonly points: LaserPoint[];
}

export interface LaserCursorPosition {
  readonly x: number;
  readonly y: number;
}

export interface LaserPalette {
  readonly core: string;
  readonly glow: string;
  readonly tipInner: string;
}

export interface LaserPointStyle {
  readonly life: number;
  readonly opacity: number;
  readonly width: number;
}

export interface RenderLaserOverlayOptions {
  readonly width: number;
  readonly height: number;
  readonly trails: readonly LaserTrail[];
  readonly pointerHead: LaserCursorPosition | null;
  readonly isPointerActive: boolean;
  readonly isDark: boolean;
  readonly activeColorPreset: LaserColorPresetId;
  readonly now: number;
  readonly ttlMs?: number;
}

export interface RenderLaserOverlayResult {
  readonly aliveTrails: LaserTrail[];
  readonly shouldContinue: boolean;
}

/**
 * Lọc giữ các điểm laser còn trong cửa sổ `ttlMs` (mặc định 1200ms).
 * Các điểm có `now - createdAt >= ttlMs` bị loại bỏ hoàn toàn.
 */
export function pruneExpiredLaserPoints(
  points: readonly LaserPoint[],
  now: number,
  ttlMs: number = LASER_POINT_TTL_MS,
): LaserPoint[] {
  if (points.length === 0 || ttlMs <= 0) return [];
  const fresh: LaserPoint[] = [];
  for (const pt of points) {
    const age = Math.max(0, now - pt.createdAt);
    if (age < ttlMs) {
      fresh.push(pt);
    }
  }
  return fresh;
}

/**
 * Lọc toàn bộ các nét laser tạm; loại bỏ nét nào đã tan hết điểm.
 */
export function pruneExpiredLaserTrails(
  trails: readonly LaserTrail[],
  now: number,
  ttlMs: number = LASER_POINT_TTL_MS,
): LaserTrail[] {
  if (trails.length === 0 || ttlMs <= 0) return [];
  const alive: LaserTrail[] = [];
  for (const trail of trails) {
    const freshPoints = pruneExpiredLaserPoints(trail.points, now, ttlMs);
    if (freshPoints.length > 0) {
      alive.push({ colorPreset: trail.colorPreset, points: freshPoints });
    }
  }
  return alive;
}

/**
 * Kiểm tra xem vòng lặp `requestAnimationFrame` có cần tiếp tục chạy hay không.
 * Trả về `false` ngay khi không còn chạm/rê bút và mảng điểm đã rỗng (0% CPU nhàn rỗi).
 */
export function shouldKeepLaserLoopRunning(
  trails: readonly LaserTrail[],
  isPointerActive: boolean,
): boolean {
  if (isPointerActive) return true;
  return trails.some((trail) => trail.points.length > 0);
}

/**
 * Tính độ mờ (ease-out về 0) và độ dày thu hẹp dần về đuôi cho một điểm laser theo tuổi thọ.
 */
export function computeLaserPointStyle(
  point: LaserPoint,
  now: number,
  ttlMs: number = LASER_POINT_TTL_MS,
): LaserPointStyle {
  if (ttlMs <= 0) {
    return { life: 0, opacity: 0, width: 0 };
  }
  const age = Math.max(0, now - point.createdAt);
  if (age >= ttlMs) {
    return { life: 0, opacity: 0, width: 0 };
  }
  const life = Math.max(0, Math.min(1, 1 - age / ttlMs));
  // Ease-out dịu về 0 (không cắt gắt khi chạm ngưỡng 1200ms)
  const opacity = Math.pow(life, 1.35);
  const width = LASER_MIN_CORE_WIDTH + (LASER_MAX_CORE_WIDTH - LASER_MIN_CORE_WIDTH) * life;
  return { life, opacity, width };
}

/**
 * Bảng màu tia laser thích ứng Sứ Bạch (Light: #FF4D4F) & Than Đá (Dark: #FF6B6B)
 * kèm hào quang đỏ cam bán trong suốt.
 */
export function resolveLaserPalette(
  isDark: boolean,
  colorPreset: LaserColorPresetId = 'default',
): LaserPalette {
  if (colorPreset === 'emerald') {
    return {
      core: isDark ? '#34D399' : '#16A34A',
      glow: isDark ? 'rgba(52, 211, 153, 0.6)' : 'rgba(22, 163, 74, 0.52)',
      tipInner: '#ECFDF5',
    };
  }
  if (colorPreset === 'blue') {
    return {
      core: isDark ? '#60A5FA' : '#2563EB',
      glow: isDark ? 'rgba(96, 165, 250, 0.62)' : 'rgba(37, 99, 235, 0.52)',
      tipInner: '#EFF6FF',
    };
  }
  return {
    core: isDark ? LASER_DARK_CORE_COLOR : LASER_LIGHT_CORE_COLOR,
    glow: isDark ? LASER_DARK_GLOW_COLOR : LASER_LIGHT_GLOW_COLOR,
    tipInner: isDark ? '#FFFFFF' : '#FFF5F5',
  };
}

function drawLaserTipDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  opacity: number,
  palette: LaserPalette,
): void {
  if (opacity <= 0.005 || radius <= 0.2) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = LASER_GLOW_SHADOW_BLUR;
  ctx.fillStyle = palette.core;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = Math.min(1, opacity * 0.92);
  ctx.fillStyle = palette.tipInner;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius * 0.4), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Kết xuất toàn bộ lớp phủ tia Laser ở 60fps lên `<canvas>` overlay không phá hủy.
 */
export function renderLaserOverlay(
  ctx: CanvasRenderingContext2D,
  options: RenderLaserOverlayOptions,
): RenderLaserOverlayResult {
  const ttlMs = options.ttlMs ?? LASER_POINT_TTL_MS;
  ctx.clearRect(0, 0, options.width, options.height);

  const aliveTrails = pruneExpiredLaserTrails(options.trails, options.now, ttlMs);

  for (const trail of aliveTrails) {
    const palette = resolveLaserPalette(options.isDark, trail.colorPreset);
    const pts = trail.points;

    if (pts.length === 1) {
      const only = pts[0]!;
      const style = computeLaserPointStyle(only, options.now, ttlMs);
      drawLaserTipDot(ctx, only.x, only.y, LASER_HEAD_RADIUS, style.opacity, palette);
      continue;
    }

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < pts.length; i += 1) {
      const prev = pts[i - 1]!;
      const cur = pts[i]!;
      const style = computeLaserPointStyle(cur, options.now, ttlMs);
      if (style.opacity <= 0.005) continue;

      // Lõi sắc nét (tối đa 3.5px) kèm hào quang mềm shadowBlur = 10
      ctx.globalAlpha = style.opacity;
      ctx.strokeStyle = palette.core;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = LASER_GLOW_SHADOW_BLUR;
      ctx.lineWidth = style.width;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();

      // Tâm sáng mảnh tăng độ sắc nét của tia laser
      ctx.globalAlpha = style.opacity * 0.58;
      ctx.strokeStyle = palette.tipInner;
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(0.55, style.width * 0.34);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Chấm đầu tia r = 4px tại vị trí con trỏ hiện tại
  if (options.isPointerActive && options.pointerHead) {
    const headPalette = resolveLaserPalette(options.isDark, options.activeColorPreset);
    drawLaserTipDot(
      ctx,
      options.pointerHead.x,
      options.pointerHead.y,
      LASER_HEAD_RADIUS,
      1,
      headPalette,
    );
  } else if (aliveTrails.length > 0) {
    const latestTrail = aliveTrails[aliveTrails.length - 1]!;
    const latestPt = latestTrail.points[latestTrail.points.length - 1];
    if (latestPt && latestTrail.points.length > 1) {
      const style = computeLaserPointStyle(latestPt, options.now, ttlMs);
      const tipPalette = resolveLaserPalette(options.isDark, latestTrail.colorPreset);
      const radius = Math.max(1.2, LASER_HEAD_RADIUS * Math.sqrt(style.life));
      drawLaserTipDot(ctx, latestPt.x, latestPt.y, radius, style.opacity, tipPalette);
    }
  }

  return {
    aliveTrails,
    shouldContinue: shouldKeepLaserLoopRunning(aliveTrails, options.isPointerActive),
  };
}
