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
  readonly layerIndex: 2 | 3 | 4;
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
 * Sinh hệ thống 21 đường đồng mức ruộng bậc thang tinh xảo (6 + 7 + 8 = 21 đường trên 3 sườn núi gần/trung cảnh).
 * Khoảng cách thu hẹp ở sườn dốc đứng (|dy/dx| lớn) và giãn rộng tự nhiên ở vùng thung lũng thoải.
 */
function buildTerracedContours(
  layers: readonly SmoothMountainLayer[],
  height: number,
): readonly TerracedContourLine[] {
  const tierCounts: Record<2 | 3 | 4, number> = {
    2: 6,
    3: 7,
    4: 8,
  };

  const contours: TerracedContourLine[] = [];
  let nextId = 0;

  for (const targetIdx of [2, 3, 4] as const) {
    const layer = layers[targetIdx];
    if (!layer) continue;

    const count = tierCounts[targetIdx];
    const slopeBandPx = Math.max(
      height * (targetIdx === 4 ? 0.145 : targetIdx === 3 ? 0.135 : 0.125),
      72,
    );

    for (let tier = 0; tier < count; tier += 1) {
      const normalizedTier = (tier + 1) / (count + 1);
      const pts: { x: number; y: number }[] = [];
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < layer.points.length; i += 1) {
        const ridge = layer.points[i]!;
        const slopeAbs = Math.abs(ridge.dydx);
        // Chỗ dốc |dy/dx| cao -> hệ số nén nhỏ hơn (~0.42), thung lũng thoải -> giãn rộng (~1.0)
        const spacingCompression = 1 / (1 + 2.6 * slopeAbs);
        const subtleTerraceWave =
          Math.sin(ridge.x * 0.012 + tier * 0.9 + targetIdx * 1.7) * (2.2 + targetIdx * 0.5);
        const yOffset =
          6 + slopeBandPx * normalizedTier * (0.58 + 0.42 * spacingCompression) + subtleTerraceWave;
        const y = ridge.y + yOffset;
        pts.push({ x: ridge.x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      const tone: 'gold' | 'cyan' = (tier + targetIdx) % 2 === 0 ? 'gold' : 'cyan';
      contours.push({
        id: nextId,
        layerIndex: targetIdx,
        tierIndex: tier,
        depth: layer.depth,
        tone,
        baseAlpha: tone === 'gold' ? 0.14 : 0.12,
        lineWidth: 0.65,
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
  const cy = height * 0.3;
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
  const scale = Math.max(0.75, Math.min(1.25, minDim / 880));
  return [
    { cx: width * 0.18, cy: height * 0.24, radius: 320 * scale, alpha: 0.042, tone: 'indigo' },
    { cx: width * 0.34, cy: height * 0.29, radius: 390 * scale, alpha: 0.052, tone: 'teal' },
    { cx: width * 0.5, cy: height * 0.21, radius: 440 * scale, alpha: 0.056, tone: 'indigo' },
    { cx: width * 0.67, cy: height * 0.27, radius: 380 * scale, alpha: 0.055, tone: 'amber' },
    { cx: width * 0.84, cy: height * 0.18, radius: 300 * scale, alpha: 0.044, tone: 'teal' },
    { cx: width * 0.44, cy: height * 0.39, radius: 340 * scale, alpha: 0.036, tone: 'teal' },
    { cx: width * 0.74, cy: height * 0.34, radius: 270 * scale, alpha: 0.048, tone: 'amber' },
  ];
}

/** Sinh toàn bộ hình học địa hình 5 tầng, 21 đường đồng mức, tinh vân & Đài Thiên Cầu Đông Sơn */
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
    mistLakeTopY: h * 0.82,
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

  const toneColorMap: Record<NebulaHaloSpec['tone'], readonly [number, number, number]> = {
    indigo: palette.facetCelestial,
    teal: [96, 168, 206],
    amber: palette.dawnCore,
  };

  for (const halo of geometry.nebulaHalos) {
    const rgb = toneColorMap[halo.tone];
    const alpha = halo.alpha * (0.55 + palette.milkyWayIntensity * 0.55);
    const grad = ctx.createRadialGradient(halo.cx, halo.cy, 0, halo.cx, halo.cy, halo.radius);
    grad.addColorStop(0, rgbaString(rgb, alpha));
    grad.addColorStop(0.45, rgbaString(rgb, alpha * 0.5));
    grad.addColorStop(1, rgbaString(rgb, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(halo.cx, halo.cy, halo.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return surf;
}

function renderMountainTopographyOffscreen(
  geometry: HeroTerrainGeometry,
  phase: AtmosphericPhase,
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

  const isNightLike = phase === 'dem-ngan-ha' || phase === 'hoang-hon';

  // Sắc thái Chàm Ngọc / Lam Đá cho 5 tầng núi từ xa đến gần, hòa tan vào sương thung lũng (#1E384D / #28495E)
  const layerPeakPalette: readonly (readonly [number, number, number])[] = isNightLike
    ? [
        [22, 41, 61], // #16293D
        [20, 38, 56],
        [17, 34, 52],
        [15, 29, 45],
        [13, 27, 42], // #0D1B2A
      ]
    : [
        palette.facetMid,
        palette.facetMid,
        palette.facetAbyss,
        palette.facetAbyss,
        palette.bottomMistDeep,
      ];

  const layerBasePalette: readonly (readonly [number, number, number])[] = isNightLike
    ? [
        [30, 56, 77], // #1E384D
        [34, 62, 84],
        [28, 52, 74],
        [22, 44, 64],
        [17, 34, 51],
      ]
    : [
        palette.cloudSlate,
        palette.facetMid,
        palette.bottomMistDeep,
        palette.bottomMistDeep,
        palette.bottomMistDeep,
      ];

  const mistBandRgb: readonly [number, number, number] = isNightLike
    ? [40, 73, 94] // #28495E
    : palette.cloudPearl;

  for (const layer of geometry.mountainLayers) {
    const peakRgb = layerPeakPalette[layer.index] ?? [22, 41, 61];
    const skirtRgb = layerBasePalette[layer.index] ?? [30, 56, 77];

    // 1. Khối núi mịn qua quadraticCurveTo (tuyệt đối KHÔNG vẽ viền cứng ctx.stroke ở đỉnh núi)
    ctx.save();
    ctx.beginPath();
    traceSmoothQuadraticCurve(ctx, layer.points, true);
    ctx.lineTo(geometry.width + 48, geometry.height);
    ctx.lineTo(-48, geometry.height);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, layer.baseY - 50, 0, layer.skirtY + 80);
    grad.addColorStop(0, rgbaString(peakRgb, 0.94));
    grad.addColorStop(0.58, rgbaString(skirtRgb, 0.96));
    grad.addColorStop(1, rgbaString(mistBandRgb, 0.42));
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. Đường đồng mức ruộng bậc thang (chỉ trên 3 tầng sườn núi trung cảnh & gần: index 2, 3, 4)
    if (layer.index >= 2) {
      ctx.clip();
      const layerContours = geometry.contours.filter((c) => c.layerIndex === layer.index);
      for (const contour of layerContours) {
        ctx.beginPath();
        traceSmoothQuadraticCurve(ctx, contour.points, true);
        ctx.lineWidth = contour.lineWidth;
        ctx.strokeStyle =
          contour.tone === 'gold'
            ? `rgba(218, 185, 120, ${contour.baseAlpha})`
            : `rgba(125, 195, 225, ${contour.baseAlpha})`;
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Lớp Sương Mù Thung Lũng tách lớp chiều sâu tự nhiên ở chân mỗi tầng núi (không dùng nét viền cứng)
    const mistTop = layer.skirtY - 52;
    const mistBottom = Math.min(geometry.height * 0.88, layer.skirtY + 62);
    const mistGrad = ctx.createLinearGradient(0, mistTop, 0, mistBottom);
    const mistAlpha = isNightLike ? 0.26 - layer.index * 0.025 : 0.34 - layer.index * 0.03;
    mistGrad.addColorStop(0, rgbaString(mistBandRgb, 0));
    mistGrad.addColorStop(0.5, rgbaString(mistBandRgb, Math.max(0.1, mistAlpha)));
    mistGrad.addColorStop(1, rgbaString(mistBandRgb, 0));
    ctx.fillStyle = mistGrad;
    ctx.fillRect(-40, mistTop, geometry.width + 80, mistBottom - mistTop);
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

  // Vòng tròn tâm mảnh
  ctx.beginPath();
  ctx.arc(0, 0, astrolabe.starInnerRadius * 0.55, 0, Math.PI * 2);
  ctx.lineWidth = 0.65;
  ctx.strokeStyle = 'rgba(229, 193, 118, 0.24)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, astrolabe.starInnerRadius, 0, Math.PI * 2);
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = 'rgba(229, 193, 118, 0.22)';
  ctx.stroke();

  // Ngôi sao Đông Sơn 14 cánh mảnh chuẩn tỷ lệ hình học
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
  ctx.fillStyle = 'rgba(229, 193, 118, 0.05)';
  ctx.fill();
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = 'rgba(229, 193, 118, 0.22)';
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

  // Vòng tròn đồng tâm siêu mảnh (0.55px - 0.85px)
  ctx.beginPath();
  ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
  ctx.lineWidth = ring.lineWidth;
  ctx.strokeStyle = 'rgba(229, 193, 118, 0.18)';
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
    ctx.lineWidth = isMajor ? 0.85 : 0.5;
    ctx.strokeStyle = isMajor ? 'rgba(229, 193, 118, 0.28)' : 'rgba(229, 193, 118, 0.15)';
    ctx.stroke();

    if (isMajor) {
      ctx.beginPath();
      ctx.arc(cos * (outerR + 3.5), sin * (outerR + 3.5), 1.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(229, 193, 118, 0.28)';
      ctx.fill();
    }
  }

  return surf;
}

/**
 * Tiền kết xuất (pre-render) các lớp địa hình cơ sở, tinh vân & vòng khắc độ Thiên Cầu Đông Sơn
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
    astrolabeStarSprite: renderAstrolabeStarOffscreen(geometry.astrolabe, safeDpr),
    astrolabeRingSprites: geometry.astrolabe.rings.map((ring) =>
      renderAstrolabeRingOffscreen(ring, astrolabeRingSpriteSize, safeDpr),
    ),
    astrolabeRingSpriteSize,
  };
}
