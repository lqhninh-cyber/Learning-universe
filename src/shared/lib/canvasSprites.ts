export type GlowTone = 'gold' | 'cinnabar' | 'emerald' | 'mist' | 'firefly';

export type GlowSpriteCanvas = HTMLCanvasElement | OffscreenCanvas;

export type GlowSpriteCache = Record<GlowTone, GlowSpriteCanvas | null>;

export interface FrameDelta {
  readonly dtMs: number;
  readonly dtSeconds: number;
  readonly dtScale: number;
}

const REFERENCE_FRAME_MS = 16.6667;
const MAX_FRAME_DELTA_MS = 50;
const SPRITE_SIZE = 64;

/**
 * Chuẩn hóa Delta-Time cho vòng lặp requestAnimationFrame 60Hz/120Hz/144Hz/240Hz+.
 * Khống chế tối đa 50ms để chống nhảy cóc vật lý khi chuyển tab trình duyệt.
 */
export function computeFrameDelta(timestampMs: number, lastTimestampMs: number): FrameDelta {
  const dtMs = Math.min(Math.max(timestampMs - lastTimestampMs, 0), MAX_FRAME_DELTA_MS);
  return {
    dtMs,
    dtSeconds: dtMs / 1000,
    dtScale: dtMs / REFERENCE_FRAME_MS,
  };
}

/**
 * Hệ số nội suy mượt bất biến theo tần số quét (Frame-Rate Independent Damping):
 * `1 - exp(-speed * dtSeconds)`
 */
export function frameDampFactor(speed: number, dtSeconds: number): number {
  if (dtSeconds <= 0) return 0;
  return 1 - Math.exp(-speed * dtSeconds);
}

/**
 * Khởi tạo Canvas 2D Context độ trễ thấp (`desynchronized: true`) kèm fallback an toàn
 * cho mọi trình duyệt và môi trường kiểm thử JSDOM.
 */
export function getLowLatency2DContext(
  canvas: HTMLCanvasElement,
  options: { readonly alpha?: boolean } = {},
): CanvasRenderingContext2D | null {
  const alpha = options.alpha ?? true;
  try {
    const lowLatencyCtx = canvas.getContext('2d', {
      alpha,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings);
    if (lowLatencyCtx) return lowLatencyCtx;
  } catch {
    // Fallback sang cấu hình mặc định nếu engine kiểm thử không hỗ trợ thuộc tính mới
  }

  try {
    return canvas.getContext('2d');
  } catch {
    return null;
  }
}

interface GlowPaletteStop {
  readonly core: string;
  readonly mid: string;
  readonly edge: string;
}

const GLOW_PALETTES: Record<GlowTone, GlowPaletteStop> = {
  gold: {
    core: 'rgba(255, 240, 196, 0.96)',
    mid: 'rgba(232, 168, 90, 0.42)',
    edge: 'rgba(232, 168, 90, 0)',
  },
  cinnabar: {
    core: 'rgba(220, 86, 74, 0.92)',
    mid: 'rgba(200, 62, 55, 0.36)',
    edge: 'rgba(200, 62, 55, 0)',
  },
  emerald: {
    core: 'rgba(174, 248, 224, 0.95)',
    mid: 'rgba(110, 231, 183, 0.38)',
    edge: 'rgba(110, 231, 183, 0)',
  },
  mist: {
    core: 'rgba(248, 246, 240, 0.88)',
    mid: 'rgba(218, 236, 230, 0.28)',
    edge: 'rgba(218, 236, 230, 0)',
  },
  firefly: {
    core: 'rgba(238, 255, 148, 0.95)',
    mid: 'rgba(226, 248, 107, 0.36)',
    edge: 'rgba(226, 248, 107, 0)',
  },
};

function makeOffscreenSpriteCanvas(size: number): GlowSpriteCanvas | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(size, size);
    } catch {
      // Fallback sang HTMLCanvasElement
    }
  }
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    return c;
  }
  return null;
}

function buildSingleGlowSprite(tone: GlowTone): GlowSpriteCanvas | null {
  const sprite = makeOffscreenSpriteCanvas(SPRITE_SIZE);
  if (!sprite) return null;

  let sCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  try {
    sCtx = sprite.getContext('2d') as
      CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  } catch {
    return null;
  }
  if (!sCtx || typeof sCtx.createRadialGradient !== 'function') {
    return null;
  }

  const palette = GLOW_PALETTES[tone];
  const half = SPRITE_SIZE / 2;
  const grad = sCtx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, palette.core);
  grad.addColorStop(0.28, palette.mid);
  grad.addColorStop(1, palette.edge);

  sCtx.fillStyle = grad;
  sCtx.beginPath();
  sCtx.arc(half, half, half, 0, Math.PI * 2);
  sCtx.fill();

  return sprite;
}

/**
 * Tạo bộ Sprite hạt phát sáng kích thước 64×64px đúng một lần khi khởi tạo Engine.
 * Giúp vẽ đom đóm, hạt phù du, sao băng, hạt ngọc bằng `drawImage` nhanh gấp 8-10 lần
 * so với gọi `shadowBlur` hoặc `createRadialGradient` trong mỗi frame 120fps+.
 */
export function createGlowSpriteCache(): GlowSpriteCache {
  return {
    gold: buildSingleGlowSprite('gold'),
    cinnabar: buildSingleGlowSprite('cinnabar'),
    emerald: buildSingleGlowSprite('emerald'),
    mist: buildSingleGlowSprite('mist'),
    firefly: buildSingleGlowSprite('firefly'),
  };
}

/**
 * Kết xuất hạt phát sáng từ Offscreen Sprite đã cache với `globalAlpha`.
 */
export function drawGlowSprite(
  ctx: CanvasRenderingContext2D,
  sprite: GlowSpriteCanvas | null,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  fallbackColor?: string,
): void {
  if (alpha <= 0.005 || radius <= 0.05) return;

  if (sprite && typeof ctx.drawImage === 'function') {
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = prevAlpha * Math.min(1, Math.max(0, alpha));
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = prevAlpha;
    return;
  }

  if (fallbackColor) {
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = prevAlpha * Math.min(1, Math.max(0, alpha));
    ctx.fillStyle = fallbackColor;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = prevAlpha;
  }
}
