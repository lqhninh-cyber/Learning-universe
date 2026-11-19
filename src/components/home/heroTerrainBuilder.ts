import {
  rgbaString,
  type AtmospherePalette,
  type AtmosphericPhase,
} from '@/components/home/atmosphereThemes';

export type TerrainSurface = OffscreenCanvas | HTMLCanvasElement;

export interface TerrainPoint {
  readonly x: number;
  readonly y: number;
  readonly dydx: number;
}

export interface SmoothMountainLayer {
  readonly index: 0 | 1 | 2 | 3 | 4;
  readonly depth: number;
  readonly baseY: number;
  readonly skirtY: number;
  readonly points: readonly TerrainPoint[];
}

export interface TerracedContourLine {
  readonly id: number;
  readonly layerIndex: 1 | 2 | 3 | 4;
  readonly tierIndex: number;
  readonly depth: number;
  readonly tone: 'gold' | 'cyan';
  readonly baseAlpha: number;
  readonly lineWidth: number;
  readonly minY: number;
  readonly maxY: number;
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

export interface AstrolabeRingSpec {
  readonly index: 0 | 1 | 2 | 3;
  readonly radius: number;
  readonly angularSpeedRadSec: number;
  readonly lineWidth: number;
  readonly tickStepDeg: 5;
  readonly majorStepDeg: 30;
}

export interface EclipticArcSpec {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly rotationRad: number;
  readonly nodes: readonly { readonly x: number; readonly y: number }[];
}

export interface AstrolabeSpec {
  readonly cx: number;
  readonly cy: number;
  readonly starRays: 14;
  readonly starInnerRadius: number;
  readonly starOuterRadius: number;
  readonly rings: readonly AstrolabeRingSpec[];
  readonly eclipticArcs: readonly EclipticArcSpec[];
}

export interface NebulaHaloSpec {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly alpha: number;
  readonly tone: 'indigo' | 'teal' | 'amber';
}

export interface HeroTerrainGeometry {
  readonly width: number;
  readonly height: number;
  readonly mountainLayers: readonly SmoothMountainLayer[];
  readonly contours: readonly TerracedContourLine[];
  readonly astrolabe: AstrolabeSpec;
  readonly nebulaHalos: readonly NebulaHaloSpec[];
  readonly mistLakeTopY: number;
}

export interface HeroTerrainLayerCache {
  readonly key: string;
  readonly width: number;
  readonly height: number;
  readonly phase: AtmosphericPhase;
  readonly dpr: number;
  readonly geometry: HeroTerrainGeometry;
  readonly nebulaLayer: TerrainSurface | null;
  readonly mountainTopographyLayer: TerrainSurface | null;
  readonly valleyMistLayers: readonly (TerrainSurface | null)[];
  readonly astrolabeStarSprite: TerrainSurface | null;
  readonly astrolabeRingSprites: readonly (TerrainSurface | null)[];
  readonly astrolabeRingSpriteSize: number;
}

interface HarmonicComponent {
  readonly ampRatio: number;
  readonly cycles: number;
  readonly phase: number;
}

interface MountainLayerConfig {
  readonly index: 0 | 1 | 2 | 3 | 4;
  readonly depth: number;
  readonly baseRatioY: number;
  readonly skirtRatioY: number;
  readonly harmonics: readonly HarmonicComponent[];
}

const MOUNTAIN_LAYER_CONFIGS: readonly MountainLayerConfig[] = [
  {
    index: 0,
    depth: 0.14,
    baseRatioY: 0.43,
    skirtRatioY: 0.66,
    harmonics: [
      { ampRatio: 0.048, cycles: 0.95, phase: 0.45 },
      { ampRatio: 0.026, cycles: 2.1, phase: 1.9 },
      { ampRatio: 0.015, cycles: 3.4, phase: 4.1 },
      { ampRatio: 0.009, cycles: 5.1, phase: 2.7 },
      { ampRatio: 0.005, cycles: 7.3, phase: 0.8 },
    ],
  },
  {
    index: 1,
    depth: 0.28,
    baseRatioY: 0.51,
    skirtRatioY: 0.72,
    harmonics: [
      { ampRatio: 0.046, cycles: 1.05, phase: 2.25 },
      { ampRatio: 0.025, cycles: 2.3, phase: 0.35 },
      { ampRatio: 0.014, cycles: 3.8, phase: 3.6 },
      { ampRatio: 0.008, cycles: 5.5, phase: 5.1 },
      { ampRatio: 0.0045, cycles: 7.9, phase: 1.4 },
    ],
  },
  {
    index: 2,
    depth: 0.46,
    baseRatioY: 0.585,
    skirtRatioY: 0.785,
    harmonics: [
      { ampRatio: 0.044, cycles: 1.15, phase: 3.9 },
      { ampRatio: 0.024, cycles: 2.45, phase: 1.25 },
      { ampRatio: 0.013, cycles: 3.95, phase: 5.05 },
      { ampRatio: 0.0075, cycles: 5.9, phase: 2.15 },
      { ampRatio: 0.004, cycles: 8.2, phase: 4.4 },
    ],
  },
  {
    index: 3,
    depth: 0.68,
    baseRatioY: 0.655,
    skirtRatioY: 0.84,
    harmonics: [
      { ampRatio: 0.042, cycles: 1.22, phase: 5.35 },
      { ampRatio: 0.022, cycles: 2.6, phase: 3.0 },
      { ampRatio: 0.012, cycles: 4.25, phase: 0.75 },
      { ampRatio: 0.007, cycles: 6.1, phase: 4.2 },
      { ampRatio: 0.0038, cycles: 8.7, phase: 2.65 },
    ],
  },
  {
    index: 4,
    depth: 0.9,
    baseRatioY: 0.725,
    skirtRatioY: 0.895,
    harmonics: [
      { ampRatio: 0.038, cycles: 1.32, phase: 1.1 },
      { ampRatio: 0.02, cycles: 2.75, phase: 4.85 },
      { ampRatio: 0.011, cycles: 4.5, phase: 2.4 },
      { ampRatio: 0.006, cycles: 6.4, phase: 5.7 },
      { ampRatio: 0.0034, cycles: 9.1, phase: 0.35 },
    ],
  },
];

function makeOffscreenSurface(w: number, h: number): TerrainSurface | null {
  if (w <= 0 || h <= 0) return null;
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(w, h);
    } catch {
      // Fallback sang HTMLCanvasElement nếu trình duyệt giới hạn OffscreenCanvas
    }
  }
  if (typeof document !== 'undefined') {
    const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
    if (isJsdom) return null;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }
  return null;
}

function getSurfaceContext(surface: TerrainSurface | null): CanvasRenderingContext2D | null {
  if (!surface) return null;
  return surface.getContext('2d') as CanvasRenderingContext2D | null;
}

/** Vẽ đường cong mượt đi qua trung điểm bằng quadraticCurveTo (tuyệt đối không gãy khúc) */
export function traceSmoothQuadraticCurve(
  ctx: CanvasRenderingContext2D,
  points: readonly { readonly x: number; readonly y: number }[],
  moveFirst = true,
): void {
  if (points.length === 0) return;
  const first = points[0]!;
  if (moveFirst) {
    ctx.moveTo(first.x, first.y);
  } else {
    ctx.lineTo(first.x, first.y);
  }
  if (points.length === 1) return;
  if (points.length === 2) {
    const second = points[1]!;
    ctx.lineTo(second.x, second.y);
    return;
  }

  for (let i = 1; i < points.length - 1; i += 1) {
    const curr = points[i]!;
    const next = points[i + 1]!;
    const midX = (curr.x + next.x) * 0.5;
    const midY = (curr.y + next.y) * 0.5;
    ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
  }
  const last = points[points.length - 1]!;
  ctx.lineTo(last.x, last.y);
}

/**
 * Tổng hợp chiều cao núi theo chuỗi điều hòa Fourier 5 thành phần (y(x) = base + Σ A_k sin(ω_k x + φ_k))
 * Đảm bảo dãy núi trập trùng mềm mại, giữ thung lũng thoáng ở trung tâm để chữ tiêu đề dễ đọc.
 */
function sampleHarmonicMountainLayer(
  config: MountainLayerConfig,
  width: number,
  height: number,
): SmoothMountainLayer {
  const stepX = Math.max(12, Math.round(width / 96));
  const xMin = -48;
  const xMax = width + 48;
  const baseY = height * config.baseRatioY;
  const skirtY = height * config.skirtRatioY;
  const rawPoints: { x: number; y: number }[] = [];

  for (let x = xMin; x <= xMax + stepX * 0.5; x += stepX) {
    const nx = x / Math.max(width, 1);
    let harmonicSum = 0;
    for (const h of config.harmonics) {
      const omega = h.cycles * Math.PI * 2;
      harmonicSum += height * h.ampRatio * Math.sin(omega * nx + h.phase);
    }

    // Nhấn nhẹ thung lũng mở ở vùng giữa-trái và nâng thế núi về hai bên cánh cảnh quan
    const valleyArch = Math.cos((nx - 0.52) * Math.PI * 1.6) * height * 0.022;
    const y = baseY + harmonicSum + valleyArch;
    rawPoints.push({ x, y });
  }

  const points: TerrainPoint[] = rawPoints.map((pt, idx) => {
    const prev = rawPoints[Math.max(0, idx - 1)]!;
    const next = rawPoints[Math.min(rawPoints.length - 1, idx + 1)]!;
    const dx = Math.max(next.x - prev.x, 1);
    const dydx = (next.y - prev.y) / dx;
    return { x: pt.x, y: pt.y, dydx };
  });

  return {
    index: config.index,
    depth: config.depth,
    baseY,
    skirtY,
    points,
  };
}

/**
 * Sinh hệ thống 24 đường đồng mức ruộng bậc thang nổi khối rõ nét (5 + 6 + 6 + 7 = 24 đường trên 4 tầng núi).
 * Khoảng cách thu hẹp ở sườn dốc đứng (|dy/dx| lớn) và giãn rộng tự nhiên ở vùng thung lũng thoải.
 */
function buildTerracedContours(
  layers: readonly SmoothMountainLayer[],
  height: number,
): readonly TerracedContourLine[] {
  const tierCounts: Record<1 | 2 | 3 | 4, number> = {
    1: 5,
    2: 6,
    3: 6,
    4: 7,
  };

  const contours: TerracedContourLine[] = [];
  let nextId = 0;

  for (const targetIdx of [1, 2, 3, 4] as const) {
    const layer = layers[targetIdx];
    if (!layer) continue;

    const count = tierCounts[targetIdx];
    const slopeBandPx = Math.max(
      height * (targetIdx === 4 ? 0.15 : targetIdx === 3 ? 0.14 : targetIdx === 2 ? 0.13 : 0.115),
      68,
    );

    for (let tier = 0; tier < count; tier += 1) {
      const normalizedTier = (tier + 1) / (count + 1);
      const pts: { x: number; y: number }[] = [];
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < layer.points.length; i += 1) {
        const ridge = layer.points[i]!;
        const slopeAbs = Math.abs(ridge.dydx);
        const spacingCompression = 1 / (1 + 2.6 * slopeAbs);
        const subtleTerraceWave =
          Math.sin(ridge.x * 0.012 + tier * 0.9 + targetIdx * 1.7) * (2.4 + targetIdx * 0.55);
        const yOffset =
          6 + slopeBandPx * normalizedTier * (0.58 + 0.42 * spacingCompression) + subtleTerraceWave;
        const y = ridge.y + yOffset;
        pts.push({ x: ridge.x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      const isIndexContour = tier === 0 || (tier + 1) % 3 === 0;
      const tone: 'gold' | 'cyan' = (tier + targetIdx) % 2 === 0 ? 'gold' : 'cyan';
      contours.push({
        id: nextId,
        layerIndex: targetIdx,
        tierIndex: tier,
        depth: layer.depth,
        tone,
        baseAlpha: tone === 'gold' ? (isIndexContour ? 0.3 : 0.26) : isIndexContour ? 0.48 : 0.42,
        lineWidth: 0.75,
        minY,
        maxY,
        points: pts,
      });
      nextId += 1;
    }
  }

  return contours;
}

function buildDongSonAstrolabe(width: number, height: number): AstrolabeSpec {
  const cx = width * 0.72;
  const cy = height * 0.33;
  const scale = Math.max(0.56, Math.min(width, height) / 900);

  const rings: readonly AstrolabeRingSpec[] = [
    {
      index: 0,
      radius: 74 * scale,
      angularSpeedRadSec: 0.04,
      lineWidth: 0.75,
      tickStepDeg: 5,
      majorStepDeg: 30,
    },
    {
      index: 1,
      radius: 116 * scale,
      angularSpeedRadSec: -0.04,
      lineWidth: 0.65,
      tickStepDeg: 5,
      majorStepDeg: 30,
    },
    {
      index: 2,
      radius: 162 * scale,
      angularSpeedRadSec: 0.032,
      lineWidth: 0.55,
      tickStepDeg: 5,
      majorStepDeg: 30,
    },
    {
      index: 3,
      radius: 212 * scale,
      angularSpeedRadSec: -0.026,
      lineWidth: 0.85,
      tickStepDeg: 5,
      majorStepDeg: 30,
    },
  ];

  const arc1Rx = width * 0.48;
  const arc1Ry = height * 0.24;
  const arc1Rot = -0.34;
  const arc2Rx = width * 0.42;
  const arc2Ry = height * 0.19;
  const arc2Rot = 0.28;

  const sampleEllipseNode = (
    rx: number,
    ry: number,
    rot: number,
    theta: number,
  ): { x: number; y: number } => {
    const lx = rx * Math.cos(theta);
    const ly = ry * Math.sin(theta);
    return {
      x: cx + lx * Math.cos(rot) - ly * Math.sin(rot),
      y: cy + lx * Math.sin(rot) + ly * Math.cos(rot),
    };
  };

  const eclipticArcs: readonly EclipticArcSpec[] = [
    {
      cx,
      cy,
      rx: arc1Rx,
      ry: arc1Ry,
      rotationRad: arc1Rot,
      nodes: [
        sampleEllipseNode(arc1Rx, arc1Ry, arc1Rot, 0.35),
        sampleEllipseNode(arc1Rx, arc1Ry, arc1Rot, Math.PI + 0.35),
        sampleEllipseNode(arc1Rx, arc1Ry, arc1Rot, 2.2),
      ],
    },
    {
      cx,
      cy,
      rx: arc2Rx,
      ry: arc2Ry,
      rotationRad: arc2Rot,
      nodes: [
        sampleEllipseNode(arc2Rx, arc2Ry, arc2Rot, -0.5),
        sampleEllipseNode(arc2Rx, arc2Ry, arc2Rot, Math.PI - 0.5),
        sampleEllipseNode(arc2Rx, arc2Ry, arc2Rot, 1.3),
      ],
    },
  ];

  return {
    cx,
    cy,
    starRays: 14,
    starInnerRadius: 11 * scale,
    starOuterRadius: 44 * scale,
    rings,
    eclipticArcs,
  };
}

function buildSmoothNebulaHalos(width: number, height: number): readonly NebulaHaloSpec[] {
  const minDim = Math.min(width, height);
  const scale = Math.max(0.85, Math.min(1.2, minDim / 880));
  // 5 lớp tinh vân Ngân Hà vắt chéo từ (0.10W, 0.05H) xuống (0.85W, 0.55H) + quầng phụ
  return [
    { cx: width * 0.1, cy: height * 0.05, radius: 290 * scale, alpha: 0.055, tone: 'teal' },
    { cx: width * 0.27, cy: height * 0.17, radius: 360 * scale, alpha: 0.06, tone: 'indigo' },
    { cx: width * 0.45, cy: height * 0.28, radius: 420 * scale, alpha: 0.06, tone: 'amber' },
    { cx: width * 0.64, cy: height * 0.4, radius: 380 * scale, alpha: 0.058, tone: 'teal' },
    { cx: width * 0.85, cy: height * 0.55, radius: 330 * scale, alpha: 0.052, tone: 'amber' },
    { cx: width * 0.73, cy: height * 0.32, radius: 280 * scale, alpha: 0.055, tone: 'amber' },
  ];
}

/** Sinh toàn bộ hình học địa hình 5 tầng, 24 đường đồng mức, Dải Ngân Hà & Đài Thiên Cầu Đông Sơn */
export function buildHeroTerrainGeometry(width: number, height: number): HeroTerrainGeometry {
  const w = Math.max(width, 320);
  const h = Math.max(height, 480);
  const mountainLayers = MOUNTAIN_LAYER_CONFIGS.map((cfg) =>
    sampleHarmonicMountainLayer(cfg, w, h),
  );
  const contours = buildTerracedContours(mountainLayers, h);
  const astrolabe = buildDongSonAstrolabe(w, h);
  const nebulaHalos = buildSmoothNebulaHalos(w, h);

  return {
    width: w,
    height: h,
    mountainLayers,
    contours,
    astrolabe,
    nebulaHalos,
    mistLakeTopY: h * 0.76,
  };
}

function renderNebulaOffscreen(
  geometry: HeroTerrainGeometry,
  palette: AtmospherePalette,
  dpr: number,
): TerrainSurface | null {
  const surf = makeOffscreenSurface(
    Math.round(geometry.width * dpr),
    Math.round(geometry.height * dpr),
  );
  const ctx = getSurfaceContext(surf);
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const mwScale = 0.48 + palette.milkyWayIntensity * 0.52;

  // Dải Ngân Hà 5 lớp vắt chéo từ (0.10W, 0.05H) -> (0.85W, 0.55H)
  const x0 = geometry.width * 0.1;
  const y0 = geometry.height * 0.05;
  const x1 = geometry.width * 0.85;
  const y1 = geometry.height * 0.55;
  const bandCx = (x0 + x1) * 0.5;
  const bandCy = (y0 + y1) * 0.5;
  const bandAngle = Math.atan2(y1 - y0, x1 - x0);
  const bandHalfLen = Math.hypot(x1 - x0, y1 - y0) * 0.62;

  const ribbonSpecs: readonly {
    readonly ryRatio: number;
    readonly offsetPx: number;
    readonly color: readonly [number, number, number];
    readonly alpha: number;
  }[] = [
    { ryRatio: 0.28, offsetPx: -18, color: [90, 165, 215], alpha: 0.1 * mwScale },
    { ryRatio: 0.22, offsetPx: 14, color: palette.rayCool, alpha: 0.085 * mwScale },
    { ryRatio: 0.16, offsetPx: 0, color: [225, 185, 115], alpha: 0.08 * mwScale },
    { ryRatio: 0.11, offsetPx: -8, color: [90, 165, 215], alpha: 0.095 * mwScale },
    { ryRatio: 0.075, offsetPx: 6, color: palette.dawnCore, alpha: 0.075 * mwScale },
  ];

  for (const spec of ribbonSpecs) {
    ctx.save();
    ctx.translate(bandCx, bandCy + spec.offsetPx);
    ctx.rotate(bandAngle);
    ctx.scale(1, (geometry.height * spec.ryRatio) / Math.max(bandHalfLen, 1));
    const bandGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bandHalfLen);
    bandGrad.addColorStop(0, rgbaString(spec.color, spec.alpha));
    bandGrad.addColorStop(0.55, rgbaString(spec.color, spec.alpha * 0.45));
    bandGrad.addColorStop(1, rgbaString(spec.color, 0));
    ctx.fillStyle = bandGrad;
    ctx.beginPath();
    ctx.arc(0, 0, bandHalfLen, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const toneColorMap: Record<NebulaHaloSpec['tone'], readonly [number, number, number]> = {
    indigo: palette.facetCelestial,
    teal: [90, 165, 215],
    amber: [225, 185, 115],
  };

  for (const halo of geometry.nebulaHalos) {
    const rgb = toneColorMap[halo.tone];
    const alpha = Math.min(0.11, halo.alpha * 1.45 * mwScale);
    const grad = ctx.createRadialGradient(halo.cx, halo.cy, 0, halo.cx, halo.cy, halo.radius);
    grad.addColorStop(0, rgbaString(rgb, alpha));
    grad.addColorStop(0.48, rgbaString(rgb, alpha * 0.52));
    grad.addColorStop(1, rgbaString(rgb, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(halo.cx, halo.cy, halo.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Taste-Skill aurora-curtains: Rèm cực quang gấp nếp chữ S (S-curve folded curtains with bright hem & vertical ray creases)
  const curtainCount = 3;
  for (let cIdx = 0; cIdx < curtainCount; cIdx += 1) {
    const startX = geometry.width * (0.18 + cIdx * 0.22);
    const spanW = geometry.width * (0.46 - cIdx * 0.05);
    const baseHemY = geometry.height * (0.34 + cIdx * 0.06);
    const reachH = geometry.height * (0.24 - cIdx * 0.025);
    const foldFreq = (2.2 + cIdx * 0.55) / Math.max(spanW, 1);
    const phaseShift = cIdx * 1.65 + 0.4;
    const hemColor: readonly [number, number, number] =
      cIdx === 1 ? [225, 185, 115] : [90, 175, 215];
    const topColor: readonly [number, number, number] = palette.facetCelestial;

    const raySteps = 44;
    for (let s = 0; s < raySteps; s += 1) {
      const u = s / raySteps;
      const dx = (u - 0.5) * spanW;
      const edgeEnv = Math.sin(u * Math.PI);
      if (edgeEnv <= 0.02) continue;

      const sp = dx * foldFreq * Math.PI * 2 + phaseShift;
      const sw = Math.sin(sp + 0.45 * Math.sin(sp));
      const turn = Math.abs(Math.cos(sp + 0.45 * Math.sin(sp)));
      const crease = (0.58 + 0.82 * turn * turn * turn) * edgeEnv;

      const xPos = startX + u * spanW;
      // Giữ vùng chữ bên trái (calm zone: 0.25W, 0.58H) êm dịu theo chuẩn taste-skill aurora-curtains
      const calmDx = (xPos / geometry.width - 0.24) * 1.35;
      const calmDy = baseHemY / geometry.height - 0.56;
      const calmDist = Math.hypot(calmDx, calmDy);
      const calmMask = Math.min(1, Math.max(0.22, (calmDist - 0.14) / 0.38));

      const hemY = baseHemY + sw * 22 * (1 - cIdx * 0.15);
      const rayReach = reachH * (0.68 + 0.32 * Math.sin(sp * 1.7 + cIdx));
      const rayAlpha = Math.min(0.11, 0.036 * crease * mwScale * calmMask);

      const rayGrad = ctx.createLinearGradient(xPos, hemY + 18, xPos, hemY - rayReach);
      rayGrad.addColorStop(0, rgbaString(hemColor, 0));
      rayGrad.addColorStop(0.14, rgbaString(hemColor, rayAlpha * 1.25));
      rayGrad.addColorStop(0.46, rgbaString(mixRgb(hemColor, topColor, 0.5), rayAlpha * 0.65));
      rayGrad.addColorStop(1, rgbaString(topColor, 0));

      ctx.fillStyle = rayGrad;
      ctx.fillRect(
        xPos - (spanW / raySteps) * 0.7,
        hemY - rayReach,
        (spanW / raySteps) * 1.4,
        rayReach + 18,
      );
    }
  }

  return surf;
}

function mixRgb(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
): readonly [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function renderMountainTopographyOffscreen(
  geometry: HeroTerrainGeometry,
  _phase: AtmosphericPhase,
  _palette: AtmospherePalette,
  dpr: number,
): TerrainSurface | null {
  const surf = makeOffscreenSurface(
    Math.round(geometry.width * dpr),
    Math.round(geometry.height * dpr),
  );
  const ctx = getSurfaceContext(surf);
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 5 tầng núi sơn thủy sương mù tách lớp rõ ràng từ xa đến gần (Bình Minh Bạch Ngọc)
  const layerPeakPalette: readonly (readonly [number, number, number])[] = [
    [200, 218, 212], // Tầng 1 (xa nhất): #C8DAD4
    [165, 192, 184], // Tầng 2: #A5C0B8
    [120, 155, 146], // Tầng 3: #789B92
    [76, 115, 105], // Tầng 4: #4C7369
    [43, 75, 67], // Tầng 5 (tiền cảnh đáy): #2B4B43
  ];

  const layerBasePalette: readonly (readonly [number, number, number])[] = [
    [230, 239, 236], // Tan vào sương #E6EFEC
    [210, 225, 220], // #D2E1DC
    [177, 199, 192], // #B1C7C0
    [138, 168, 160], // #8AA8A0
    [184, 203, 197], // Tan êm vào dải sương sáng đáy Hero #B8CBC5 -> #EEF2F0
  ];

  const mistBandRgb: readonly [number, number, number] = [230, 239, 236]; // #E6EFEC

  for (const layer of geometry.mountainLayers) {
    const peakRgb = layerPeakPalette[layer.index] ?? [120, 155, 146];
    const skirtRgb = layerBasePalette[layer.index] ?? [177, 199, 192];

    // 1. Khối núi đa tầng có chiều sâu khí quyển sáng trong
    ctx.save();
    ctx.beginPath();
    traceSmoothQuadraticCurve(ctx, layer.points, true);
    ctx.lineTo(geometry.width + 48, geometry.height);
    ctx.lineTo(-48, geometry.height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, layer.baseY - 40, 0, layer.skirtY + 75);
    grad.addColorStop(0, rgbaString(peakRgb, layer.index === 0 ? 0.88 : 0.96));
    grad.addColorStop(0.58, rgbaString(mixRgb(peakRgb, skirtRgb, 0.55), 0.95));
    grad.addColorStop(1, rgbaString(skirtRgb, layer.index === 4 ? 0.92 : 0.72));
    ctx.fillStyle = grad;
    ctx.fill();

    // 1.5. Viền sáng nắng mai dọc sống núi rgba(255, 252, 240, 0.65)
    ctx.save();
    ctx.beginPath();
    traceSmoothQuadraticCurve(ctx, layer.points, true);
    const rimGrad = ctx.createLinearGradient(0, 0, geometry.width, 0);
    const focusStop = Math.max(0.18, Math.min(0.84, geometry.astrolabe.cx / geometry.width));
    const rimPeakAlpha = layer.index === 0 ? 0.68 : layer.index <= 2 ? 0.65 : 0.45;
    rimGrad.addColorStop(0, `rgba(255, 252, 240, ${(rimPeakAlpha * 0.35).toFixed(3)})`);
    rimGrad.addColorStop(focusStop, `rgba(255, 252, 240, ${rimPeakAlpha.toFixed(3)})`);
    rimGrad.addColorStop(1, `rgba(255, 252, 240, ${(rimPeakAlpha * 0.42).toFixed(3)})`);
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = layer.index === 0 ? 1.35 : 1.05;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // 2. 24-30 đường đồng mức ruộng bậc thang siêu mảnh (lineWidth: 0.75px):
    // Đồng Cổ rgba(140, 102, 48, 0.30) xen Trắng Sứ rgba(255, 255, 255, 0.48)
    if (layer.index >= 1) {
      ctx.clip();
      const layerContours = geometry.contours.filter((c) => c.layerIndex === layer.index);
      const bronzeRgb: readonly [number, number, number] = [140, 102, 48];
      const porcelainRgb: readonly [number, number, number] = [255, 255, 255];

      for (const contour of layerContours) {
        const contourGrad = ctx.createLinearGradient(0, 0, geometry.width, 0);
        const isBronze = contour.tone === 'gold';
        const baseColor = isBronze ? bronzeRgb : porcelainRgb;
        const aFull = isBronze ? 0.3 : 0.48;
        // Làm dịu vùng calm dưới cột chữ bên trái và sắc nét dần sang sườn núi bên phải
        contourGrad.addColorStop(0, rgbaString(baseColor, aFull * 0.34));
        contourGrad.addColorStop(0.26, rgbaString(baseColor, aFull * 0.54));
        contourGrad.addColorStop(0.62, rgbaString(baseColor, aFull));
        contourGrad.addColorStop(0.86, rgbaString(baseColor, Math.min(0.64, aFull * 1.12)));
        contourGrad.addColorStop(1, rgbaString(baseColor, aFull * 0.6));

        ctx.beginPath();
        traceSmoothQuadraticCurve(ctx, contour.points, true);
        ctx.lineWidth = contour.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = contourGrad;
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Lớp Sương Mù Bạch Ngọc tách lớp chiều sâu ở chân mỗi tầng núi
    const mistTop = layer.skirtY - 46;
    const mistBottom = Math.min(geometry.height * 0.9, layer.skirtY + 62);
    const mistGrad = ctx.createLinearGradient(0, mistTop, 0, mistBottom);
    const mistAlpha = Math.max(0.18, 0.44 - layer.index * 0.05);
    mistGrad.addColorStop(0, rgbaString(mistBandRgb, 0));
    mistGrad.addColorStop(0.5, rgbaString(mistBandRgb, mistAlpha));
    mistGrad.addColorStop(1, rgbaString(mistBandRgb, 0));
    ctx.fillStyle = mistGrad;
    ctx.fillRect(-40, mistTop, geometry.width + 80, mistBottom - mistTop);
  }

  return surf;
}

/** Pre-render 3 lớp Biển Sương Ban Mai seamless (OffscreenCanvas) cho vùng đáy 0.72H -> 1.0H */
function renderValleyMistLayerOffscreen(
  width: number,
  height: number,
  layerIndex: 0 | 1 | 2,
  _phase: AtmosphericPhase,
  _palette: AtmospherePalette,
  dpr: number,
): TerrainSurface | null {
  const bandHeight = Math.ceil(height * 0.32);
  const surf = makeOffscreenSurface(Math.round(width * dpr), Math.round(bandHeight * dpr));
  const ctx = getSurfaceContext(surf);
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const mistJadeA: readonly [number, number, number] = [221, 231, 228]; // #DDE7E4
  const mistJadeB: readonly [number, number, number] = [237, 242, 240]; // #EDF2F0
  const warmDawnMist: readonly [number, number, number] = [255, 246, 224]; // #FFF6E0

  const puffCount = 12 + layerIndex * 3;
  const baseYRatio = 0.34 + layerIndex * 0.16;

  for (let i = 0; i < puffCount; i += 1) {
    const cx = ((i + 0.5) / puffCount) * width;
    const cy = bandHeight * (baseYRatio + Math.sin(i * 1.9 + layerIndex * 2.3) * 0.14);
    const rx = Math.max(90, (width / puffCount) * (1.25 + (i % 3) * 0.25));
    const ry = bandHeight * (0.28 + (i % 2) * 0.08);
    const isWarm = i % 3 === 0;
    const rgb = isWarm ? warmDawnMist : i % 2 === 0 ? mistJadeB : mistJadeA;
    const alpha = isWarm ? 0.24 : 0.32 - layerIndex * 0.04;

    for (const offsetX of [-width, 0, width]) {
      const px = cx + offsetX;
      if (px + rx < -20 || px - rx > width + 20) continue;
      ctx.save();
      ctx.translate(px, cy);
      ctx.scale(1, ry / rx);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0, rgbaString(rgb, alpha));
      grad.addColorStop(0.55, rgbaString(rgb, alpha * 0.45));
      grad.addColorStop(1, rgbaString(rgb, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  return surf;
}

function renderAstrolabeStarOffscreen(
  astrolabe: AstrolabeSpec,
  dpr: number,
): TerrainSurface | null {
  const size = Math.ceil((astrolabe.starOuterRadius + 14) * 2);
  const surf = makeOffscreenSurface(Math.round(size * dpr), Math.round(size * dpr));
  const ctx = getSurfaceContext(surf);
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const half = size * 0.5;
  ctx.translate(half, half);

  // Vòng tròn tâm khắc nét Đồng Trầm & Lam Phiến
  ctx.beginPath();
  ctx.arc(0, 0, astrolabe.starInnerRadius * 0.55, 0, Math.PI * 2);
  ctx.lineWidth = 0.85;
  ctx.strokeStyle = 'rgba(45, 82, 102, 0.28)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, astrolabe.starInnerRadius, 0, Math.PI * 2);
  ctx.lineWidth = 0.95;
  ctx.strokeStyle = 'rgba(148, 107, 48, 0.52)';
  ctx.stroke();

  // Ngôi sao Đông Sơn 14 cánh khắc nét Đồng Trầm cổ điển sắc nét (0.52)
  const totalPoints = astrolabe.starRays * 2;
  ctx.beginPath();
  for (let i = 0; i <= totalPoints; i += 1) {
    const angle = (i * Math.PI) / astrolabe.starRays - Math.PI / 2;
    const r = i % 2 === 0 ? astrolabe.starOuterRadius : astrolabe.starInnerRadius;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(218, 182, 118, 0.17)';
  ctx.fill();
  ctx.lineWidth = 1.0;
  ctx.strokeStyle = 'rgba(148, 107, 48, 0.52)';
  ctx.stroke();

  return surf;
}

function renderAstrolabeRingOffscreen(
  ring: AstrolabeRingSpec,
  spriteLogicalSize: number,
  dpr: number,
): TerrainSurface | null {
  const surf = makeOffscreenSurface(
    Math.round(spriteLogicalSize * dpr),
    Math.round(spriteLogicalSize * dpr),
  );
  const ctx = getSurfaceContext(surf);
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const half = spriteLogicalSize * 0.5;
  ctx.translate(half, half);

  // Luân phiên chỉ Đồng Trầm rgba(148, 107, 48, 0.52) & Lam Phiến rgba(45, 82, 102, 0.34)
  const isBronzeRing = ring.index % 2 === 0;
  const primaryStroke = isBronzeRing ? 'rgba(148, 107, 48, 0.52)' : 'rgba(45, 82, 102, 0.34)';
  const minorTickStroke = isBronzeRing ? 'rgba(148, 107, 48, 0.38)' : 'rgba(45, 82, 102, 0.26)';

  ctx.beginPath();
  ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
  ctx.lineWidth = ring.lineWidth + 0.1;
  ctx.strokeStyle = primaryStroke;
  ctx.stroke();

  // Khắc vạch chia độ: mỗi 5° một vạch ngắn 3px, mỗi 30° một vạch dài 7px kèm chấm tròn nhỏ
  for (let deg = 0; deg < 360; deg += ring.tickStepDeg) {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const isMajor = deg % ring.majorStepDeg === 0;
    const tickLen = isMajor ? 7 : 3;
    const innerR = ring.radius - tickLen * 0.5;
    const outerR = ring.radius + tickLen * 0.5;

    ctx.beginPath();
    ctx.moveTo(cos * innerR, sin * innerR);
    ctx.lineTo(cos * outerR, sin * outerR);
    ctx.lineWidth = isMajor ? 0.95 : 0.6;
    ctx.strokeStyle = isMajor ? primaryStroke : minorTickStroke;
    ctx.stroke();

    if (isMajor) {
      ctx.beginPath();
      ctx.arc(cos * (outerR + 3.5), sin * (outerR + 3.5), 1.3, 0, Math.PI * 2);
      ctx.fillStyle = isBronzeRing ? 'rgba(148, 107, 48, 0.52)' : 'rgba(45, 82, 102, 0.38)';
      ctx.fill();
    }
  }

  return surf;
}

/**
 * Tiền kết xuất (pre-render) các lớp địa hình cơ sở, Dải Ngân Hà, 3 lớp Biển Mây & vòng khắc độ Thiên Cầu Đông Sơn
 * vào OffscreenCanvas để đảm bảo thời gian vẽ khung hình 120fps luôn < 3ms/frame.
 */
export function buildHeroTerrainLayerCache(
  width: number,
  height: number,
  phase: AtmosphericPhase,
  palette: AtmospherePalette,
  dpr = 1,
): HeroTerrainLayerCache {
  const safeDpr = Math.max(1, Math.min(2, dpr));
  const geometry = buildHeroTerrainGeometry(width, height);
  const maxRingR = geometry.astrolabe.rings[geometry.astrolabe.rings.length - 1]?.radius ?? 220;
  const astrolabeRingSpriteSize = Math.ceil((maxRingR + 18) * 2);

  return {
    key: `${geometry.width}x${geometry.height}:${phase}:${safeDpr}`,
    width: geometry.width,
    height: geometry.height,
    phase,
    dpr: safeDpr,
    geometry,
    nebulaLayer: renderNebulaOffscreen(geometry, palette, safeDpr),
    mountainTopographyLayer: renderMountainTopographyOffscreen(geometry, phase, palette, safeDpr),
    valleyMistLayers: ([0, 1, 2] as const).map((idx) =>
      renderValleyMistLayerOffscreen(geometry.width, geometry.height, idx, phase, palette, safeDpr),
    ),
    astrolabeStarSprite: renderAstrolabeStarOffscreen(geometry.astrolabe, safeDpr),
    astrolabeRingSprites: geometry.astrolabe.rings.map((ring) =>
      renderAstrolabeRingOffscreen(ring, astrolabeRingSpriteSize, safeDpr),
    ),
    astrolabeRingSpriteSize,
  };
}
