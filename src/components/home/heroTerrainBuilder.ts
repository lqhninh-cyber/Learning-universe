import {
  rgbaString,
  rgbString,
  type AtmospherePalette,
  type AtmosphericPhase,
} from '@/components/home/atmosphereThemes';

export type TerrainSurface = OffscreenCanvas | HTMLCanvasElement;

export interface TerrainPoint {
  readonly x: number;
  readonly y: number;
}

export interface LateralSpurFacet {
  readonly polygon: readonly TerrainPoint[];
  readonly isLit: boolean;
  readonly ridgeLine: readonly TerrainPoint[];
  readonly striations: readonly {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
  }[];
}

export interface FractalRidgeLayer {
  readonly id: 'far' | 'mid-back' | 'mid-main' | 'gorge-flanks';
  readonly depth: number;
  readonly points: readonly TerrainPoint[];
  readonly spurs: readonly LateralSpurFacet[];
  readonly rimLightSegments: readonly {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
    readonly intensity: number;
  }[];
}

export interface PavilionSpec {
  readonly cx: number;
  readonly baseY: number;
  readonly width: number;
  readonly height: number;
  readonly cliffPolygon: readonly TerrainPoint[];
  readonly pathPoints: readonly TerrainPoint[];
  readonly stoneLanterns: readonly { readonly x: number; readonly y: number; readonly r: number }[];
}

export interface StoneBridgeSpec {
  readonly leftX: number;
  readonly rightX: number;
  readonly deckY: number;
  readonly archCrownY: number;
  readonly pillarCount: number;
}

export interface TerraceContourSpec {
  readonly side: 'west' | 'east';
  readonly tierIndex: number;
  readonly upperPoints: readonly TerrainPoint[];
  readonly lowerPoints: readonly TerrainPoint[];
}

export interface WaterfallStreamSpec {
  readonly id: number;
  readonly centerRatioX: number;
  readonly widthBase: number;
  readonly phase: number;
  readonly points: readonly TerrainPoint[];
}

export interface HeroTerrainGeometry {
  readonly width: number;
  readonly height: number;
  readonly celestialOrb: { readonly cx: number; readonly cy: number; readonly haloRadius: number };
  readonly gorge: {
    readonly centerX: number;
    readonly topY: number;
    readonly bottomY: number;
    readonly topHalfW: number;
    readonly bottomHalfW: number;
    readonly boulders: readonly {
      readonly cx: number;
      readonly cy: number;
      readonly rx: number;
      readonly ry: number;
    }[];
  };
  readonly ridges: readonly FractalRidgeLayer[];
  readonly pavilion: PavilionSpec;
  readonly bridge: StoneBridgeSpec;
  readonly terraces: readonly TerraceContourSpec[];
  readonly streams: readonly WaterfallStreamSpec[];
  readonly lakeBounds: {
    readonly leftX: number;
    readonly rightX: number;
    readonly topY: number;
    readonly bottomY: number;
  };
  readonly saddleOrigin: {
    readonly x: number;
    readonly y: number;
    readonly slopeX: number;
    readonly slopeY: number;
  };
}

export interface HeroTerrainLayerCache {
  readonly key: string;
  readonly width: number;
  readonly height: number;
  readonly phase: AtmosphericPhase;
  readonly dpr: number;
  readonly geometry: HeroTerrainGeometry;
  readonly milkyWayLayer: TerrainSurface | null;
  readonly celestialOrbLayer: TerrainSurface | null;
  readonly ridgesAndArchitectureLayer: TerrainSurface | null;
  readonly foregroundPineLayer: TerrainSurface | null;
}

function hashUnit(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function makeOffscreenSurface(w: number, h: number): TerrainSurface | null {
  if (w <= 0 || h <= 0) return null;
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(w, h);
    } catch {
      // Fallback sang HTMLCanvasElement
    }
  }
  if (typeof document !== 'undefined') {
    const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
    if (isJsdom) return null;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  return null;
}

function getCtx2d(
  surface: TerrainSurface | null,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (!surface) return null;
  try {
    return surface.getContext('2d') as
      CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  } catch {
    return null;
  }
}

/**
 * Đệ quy Midpoint Displacement 5–6 cấp kết hợp nhiễu sắc cạnh (`Math.abs(sin)`)
 * tạo đường sống núi tai mèo Hoàng Liên Sơn hiểm trở, hoàn toàn loại bỏ đường cong tròn đều.
 */
export function generateMidpointFractalSpan(options: {
  readonly xStart: number;
  readonly xEnd: number;
  readonly baseProfileY: (nx: number) => number;
  readonly levels: number;
  readonly roughness: number;
  readonly seed: number;
}): TerrainPoint[] {
  const { xStart, xEnd, baseProfileY, levels, roughness, seed } = options;
  const clampedLevels = Math.max(4, Math.min(6, levels));
  const segCount = 1 << clampedLevels;
  const ys = new Float64Array(segCount + 1);
  const spanW = xEnd - xStart;

  ys[0] = baseProfileY(0);
  ys[segCount] = baseProfileY(1);

  let step = segCount;
  let scale = roughness;
  let iter = 0;

  while (step > 1) {
    const half = step >> 1;
    for (let i = 0; i < segCount; i += step) {
      const mid = i + half;
      const nx = mid / segCount;
      const anchorY = baseProfileY(nx);
      const interpolated = (ys[i]! + ys[i + step]!) * 0.5;
      // Hợp nhất neo địa hình vĩ mô với nhiễu sắc cạnh ridge-noise
      const ridgeNoise = 1 - Math.abs(Math.sin(nx * 19.7 + seed * 3.1 + iter * 1.4));
      const jitter = (hashUnit(seed * 97 + mid * 13 + iter * 41) - 0.42) * 1.2;
      const delta = (jitter + (ridgeNoise - 0.5) * 0.65) * scale;
      ys[mid] = anchorY * 0.42 + interpolated * 0.58 - Math.abs(delta) * 0.55 + delta * 0.45;
    }
    step = half;
    scale *= 0.54;
    iter += 1;
  }

  const points: TerrainPoint[] = [];
  for (let i = 0; i <= segCount; i += 1) {
    const nx = i / segCount;
    points.push({
      x: xStart + nx * spanW,
      y: ys[i]!,
    });
  }
  return points;
}

function buildLateralSpursAndFacets(
  points: readonly TerrainPoint[],
  celestialX: number,
  valleyBottomY: number,
  seed: number,
  height: number,
): LateralSpurFacet[] {
  const spurs: LateralSpurFacet[] = [];
  // Xác định các đỉnh cục bộ (peaks) để hạ sống núi phụ 3D rẽ xuống thung lũng
  for (let i = 3; i < points.length - 3; i += 1) {
    const prev2 = points[i - 2]!;
    const prev1 = points[i - 1]!;
    const curr = points[i]!;
    const next1 = points[i + 1]!;
    const next2 = points[i + 2]!;

    const isSummit =
      curr.y <= prev1.y && curr.y <= next1.y && (curr.y < prev2.y - 4 || curr.y < next2.y - 4);
    if (!isSummit) continue;

    // Tránh vẽ sống núi cắt qua lòng hẻm thác trung tâm
    const dropDepth = Math.min(valleyBottomY - curr.y, height * 0.28);
    if (dropDepth < 24) continue;

    const spurDir = curr.x < celestialX ? 1 : -1;
    const lateralShift = (24 + hashUnit(seed + i * 7) * 38) * spurDir;
    const midSpurX = curr.x + lateralShift * 0.46;
    const midSpurY = curr.y + dropDepth * 0.48 + (hashUnit(seed + i * 11) - 0.5) * 12;
    const endSpurX = curr.x + lateralShift * 1.12;
    const endSpurY = curr.y + dropDepth;

    const ridgeLine: TerrainPoint[] = [
      curr,
      { x: midSpurX, y: midSpurY },
      { x: endSpurX, y: endSpurY },
    ];

    // Mảng vách hướng về phía Thiên thể (Moonlit / Sunlit Facet)
    const litWingIdx =
      celestialX >= curr.x ? Math.min(points.length - 1, i + 4) : Math.max(0, i - 4);
    const litWingPt = points[litWingIdx]!;
    const litPolygon: TerrainPoint[] = [
      curr,
      points[celestialX >= curr.x ? i + 2 : i - 2]!,
      litWingPt,
      {
        x: litWingPt.x + lateralShift * 0.45,
        y: Math.min(valleyBottomY, litWingPt.y + dropDepth * 0.72),
      },
      { x: endSpurX, y: endSpurY },
      { x: midSpurX, y: midSpurY },
    ];

    const striations: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let s = 1; s <= 4; s += 1) {
      const t = s / 5;
      const sx = curr.x + (midSpurX - curr.x) * t + (celestialX >= curr.x ? 6 : -6);
      const sy = curr.y + (midSpurY - curr.y) * t + 4;
      striations.push({
        x1: sx,
        y1: sy,
        x2: sx + (celestialX >= curr.x ? 26 : -26),
        y2: sy + 18 + s * 4,
      });
    }

    spurs.push({
      polygon: litPolygon,
      isLit: true,
      ridgeLine,
      striations,
    });

    // Mảng vách khuất sáng (Shadowed Cliff Facet)
    const darkWingIdx =
      celestialX >= curr.x ? Math.max(0, i - 4) : Math.min(points.length - 1, i + 4);
    const darkWingPt = points[darkWingIdx]!;
    const darkPolygon: TerrainPoint[] = [
      curr,
      points[celestialX >= curr.x ? i - 2 : i + 2]!,
      darkWingPt,
      {
        x: darkWingPt.x - lateralShift * 0.35,
        y: Math.min(valleyBottomY, darkWingPt.y + dropDepth * 0.75),
      },
      { x: endSpurX, y: endSpurY },
      { x: midSpurX, y: midSpurY },
    ];

    spurs.push({
      polygon: darkPolygon,
      isLit: false,
      ridgeLine,
      striations: [],
    });

    i += 2;
  }
  return spurs;
}

function buildRimLightPass(
  points: readonly TerrainPoint[],
  spurs: readonly LateralSpurFacet[],
  orbX: number,
  orbY: number,
  maxDistPx = 450,
): FractalRidgeLayer['rimLightSegments'] {
  const segments: { x1: number; y1: number; x2: number; y2: number; intensity: number }[] = [];

  const maybeAddSegment = (a: TerrainPoint, b: TerrainPoint, weight: number) => {
    const mx = (a.x + b.x) * 0.5;
    const my = (a.y + b.y) * 0.5;
    const dist = Math.hypot(mx - orbX, my - orbY);
    if (dist > maxDistPx) return;
    const falloff = Math.pow(1 - dist / maxDistPx, 1.35) * weight;
    if (falloff <= 0.04) return;
    segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, intensity: Math.min(1, falloff) });
  };

  for (let i = 0; i < points.length - 1; i += 1) {
    maybeAddSegment(points[i]!, points[i + 1]!, 0.95);
  }
  for (const spur of spurs) {
    if (!spur.isLit) continue;
    for (let i = 0; i < spur.ridgeLine.length - 1; i += 1) {
      maybeAddSegment(spur.ridgeLine[i]!, spur.ridgeLine[i + 1]!, 0.72);
    }
  }
  return segments;
}

function buildRiceTerraceContours(width: number, height: number): TerraceContourSpec[] {
  const contours: TerraceContourSpec[] = [];
  // 14 bậc ruộng bậc thang uốn lượn theo đường đồng mức (7 bên sườn Tây, 7 bên sườn Đông)
  // Giới hạn dải cao độ 0.582h–0.702h để nhường vùng thung lũng 0.72h–0.88h cho Hồ Sơn Thủy phản chiếu
  for (let sideIdx = 0; sideIdx < 2; sideIdx += 1) {
    const side: 'west' | 'east' = sideIdx === 0 ? 'west' : 'east';
    for (let tier = 0; tier < 7; tier += 1) {
      const upperPoints: TerrainPoint[] = [];
      const lowerPoints: TerrainPoint[] = [];
      const baseY = height * (0.584 + tier * 0.0155);
      const bandThickness = height * (0.0072 + tier * 0.0009);
      const steps = 16;

      for (let s = 0; s <= steps; s += 1) {
        const t = s / steps;
        const x =
          side === 'west'
            ? width * (0.01 + t * (0.41 - tier * 0.008))
            : width * (0.565 + tier * 0.008 + t * 0.425);
        const contourCurve =
          Math.sin(t * Math.PI * 1.6 + tier * 0.55 + (side === 'east' ? 1.1 : 0)) * height * 0.011 +
          (side === 'west' ? t * height * 0.02 : (1 - t) * height * 0.018);
        const yUp = baseY + contourCurve;
        upperPoints.push({ x, y: yUp });
        lowerPoints.push({ x, y: yUp + bandThickness });
      }
      contours.push({ side, tierIndex: tier, upperPoints, lowerPoints });
    }
  }
  return contours;
}

/**
 * Xây dựng toàn bộ dữ liệu địa hình Fractal Hoàng Liên Sơn, Vọng Tinh Các, Cầu Đá, Thác Đa Dòng
 * hoàn toàn thuần túy (pure geometry) để vừa tiền kết xuất lên OffscreenCanvas vừa kiểm thử được.
 */
export function buildHeroTerrainGeometry(width: number, height: number): HeroTerrainGeometry {
  const safeW = Math.max(width, 320);
  const safeH = Math.max(height, 480);
  const orbX = safeW * 0.78;
  const orbY = safeH * 0.22;

  const gorgeCenterX = safeW * 0.486;
  const gorgeTopY = safeH * 0.455;
  const gorgeBottomY = safeH * 0.728;
  const gorgeTopHalfW = safeW * 0.022;
  const gorgeBottomHalfW = safeW * 0.046;

  // Hồ sơ độ cao từng tầng núi đá tai mèo (nhọn sắc cạnh quanh Fansipan & Ngũ Chỉ Sơn, khuyết V ở trung tâm)
  const farProfile = (nx: number): number => {
    const base = safeH * 0.47;
    const p1 = Math.exp(-Math.pow((nx - 0.19) / 0.11, 2)) * safeH * 0.11;
    const p2 = Math.exp(-Math.pow((nx - 0.43) / 0.12, 2)) * safeH * 0.14;
    const p3 = Math.exp(-Math.pow((nx - 0.69) / 0.13, 2)) * safeH * 0.17;
    const p4 = Math.exp(-Math.pow((nx - 0.91) / 0.1, 2)) * safeH * 0.13;
    return base - p1 - p2 - p3 - p4;
  };

  const midBackProfile = (nx: number): number => {
    const base = safeH * 0.51;
    const p1 = Math.exp(-Math.pow((nx - 0.11) / 0.09, 2)) * safeH * 0.13;
    const p2 = Math.exp(-Math.pow((nx - 0.34) / 0.09, 2)) * safeH * 0.19;
    const saddleCut = Math.exp(-Math.pow((nx - 0.486) / 0.055, 2)) * safeH * 0.095;
    const fansipan = Math.exp(-Math.pow((nx - 0.635) / 0.085, 2)) * safeH * 0.25;
    const p4 = Math.exp(-Math.pow((nx - 0.87) / 0.11, 2)) * safeH * 0.18;
    return base - p1 - p2 + saddleCut - fansipan - p4;
  };

  const midMainProfile = (nx: number): number => {
    const base = safeH * 0.56;
    const leftCliff = Math.exp(-Math.pow((nx - 0.24) / 0.12, 2)) * safeH * 0.135;
    // Khuyết chữ V sâu chính giữa dành cho Hẻm Vực Thác Bản Giốc / Thác Bạc
    const gorgeCut = Math.exp(-Math.pow((nx - 0.486) / 0.036, 2)) * safeH * 0.11;
    // Mỏm đá nhô bên phải thác cho Lầu Vọng Tinh Các (nx ~ 0.72)
    const eastPeak = Math.exp(-Math.pow((nx - 0.58) / 0.08, 2)) * safeH * 0.15;
    const pavilionCrag = Math.exp(-Math.pow((nx - 0.72) / 0.065, 2)) * safeH * 0.115;
    const farEast = Math.exp(-Math.pow((nx - 0.94) / 0.1, 2)) * safeH * 0.16;
    return base - leftCliff + gorgeCut - eastPeak - pavilionCrag - farEast;
  };

  const gorgeFlanksProfile = (nx: number): number => {
    const base = safeH * 0.635;
    const westShoulder = Math.exp(-Math.pow((nx - 0.38) / 0.09, 2)) * safeH * 0.09;
    const vNotch = Math.exp(-Math.pow((nx - 0.486) / 0.038, 2)) * safeH * 0.11;
    const eastShoulder = Math.exp(-Math.pow((nx - 0.59) / 0.09, 2)) * safeH * 0.085;
    return base - westShoulder + vNotch - eastShoulder;
  };

  const farPts = generateMidpointFractalSpan({
    xStart: -safeW * 0.06,
    xEnd: safeW * 1.06,
    baseProfileY: farProfile,
    levels: 5,
    roughness: safeH * 0.055,
    seed: 1.7,
  });
  const midBackPts = generateMidpointFractalSpan({
    xStart: -safeW * 0.06,
    xEnd: safeW * 1.06,
    baseProfileY: midBackProfile,
    levels: 6,
    roughness: safeH * 0.072,
    seed: 4.3,
  });
  const midMainPts = generateMidpointFractalSpan({
    xStart: -safeW * 0.06,
    xEnd: safeW * 1.06,
    baseProfileY: midMainProfile,
    levels: 6,
    roughness: safeH * 0.062,
    seed: 8.9,
  });
  const flankPts = generateMidpointFractalSpan({
    xStart: safeW * 0.16,
    xEnd: safeW * 0.84,
    baseProfileY: gorgeFlanksProfile,
    levels: 5,
    roughness: safeH * 0.044,
    seed: 12.1,
  });

  const farSpurs = buildLateralSpursAndFacets(farPts, orbX, safeH * 0.72, 11, safeH);
  const midBackSpurs = buildLateralSpursAndFacets(midBackPts, orbX, safeH * 0.76, 23, safeH);
  const midMainSpurs = buildLateralSpursAndFacets(midMainPts, orbX, safeH * 0.82, 37, safeH);
  const flankSpurs = buildLateralSpursAndFacets(flankPts, orbX, safeH * 0.84, 51, safeH);

  const ridges: FractalRidgeLayer[] = [
    {
      id: 'far',
      depth: 0.25,
      points: farPts,
      spurs: farSpurs,
      rimLightSegments: buildRimLightPass(farPts, farSpurs, orbX, orbY),
    },
    {
      id: 'mid-back',
      depth: 0.52,
      points: midBackPts,
      spurs: midBackSpurs,
      rimLightSegments: buildRimLightPass(midBackPts, midBackSpurs, orbX, orbY),
    },
    {
      id: 'mid-main',
      depth: 0.8,
      points: midMainPts,
      spurs: midMainSpurs,
      rimLightSegments: buildRimLightPass(midMainPts, midMainSpurs, orbX, orbY),
    },
    {
      id: 'gorge-flanks',
      depth: 0.94,
      points: flankPts,
      spurs: flankSpurs,
      rimLightSegments: buildRimLightPass(flankPts, flankSpurs, orbX, orbY),
    },
  ];

  // Vọng Tinh Các (Đài Quan Tinh 2 tầng mái đao cong) ngự trên mỏm đá sườn phải (x ≈ 0.72w, y ≈ 0.455h)
  const pavCx = safeW * 0.722;
  const pavBaseY = safeH * 0.456;
  const pavW = Math.max(44, Math.min(68, safeW * 0.044));
  const pavH = Math.max(46, Math.min(70, safeH * 0.072));
  const pavilion: PavilionSpec = {
    cx: pavCx,
    baseY: pavBaseY,
    width: pavW,
    height: pavH,
    cliffPolygon: [
      { x: pavCx - pavW * 1.15, y: pavBaseY + safeH * 0.12 },
      { x: pavCx - pavW * 0.62, y: pavBaseY + 3 },
      { x: pavCx + pavW * 0.58, y: pavBaseY + 2 },
      { x: pavCx + pavW * 1.18, y: pavBaseY + safeH * 0.095 },
      { x: pavCx + pavW * 1.4, y: pavBaseY + safeH * 0.25 },
      { x: pavCx - pavW * 1.25, y: pavBaseY + safeH * 0.25 },
    ],
    pathPoints: [
      { x: pavCx - pavW * 0.18, y: pavBaseY + 8 },
      { x: pavCx - pavW * 0.85, y: pavBaseY + safeH * 0.052 },
      { x: pavCx - pavW * 0.22, y: pavBaseY + safeH * 0.098 },
      { x: pavCx - pavW * 1.12, y: pavBaseY + safeH * 0.148 },
      { x: pavCx - pavW * 0.52, y: pavBaseY + safeH * 0.195 },
      { x: pavCx - pavW * 1.38, y: pavBaseY + safeH * 0.24 },
    ],
    stoneLanterns: [
      { x: pavCx - pavW * 0.36, y: pavBaseY + 14, r: 1.8 },
      { x: pavCx - pavW * 0.82, y: pavBaseY + safeH * 0.05, r: 1.8 },
      { x: pavCx - pavW * 0.35, y: pavBaseY + safeH * 0.092, r: 1.8 },
      { x: pavCx - pavW * 0.96, y: pavBaseY + safeH * 0.136, r: 1.8 },
      { x: pavCx - pavW * 0.62, y: pavBaseY + safeH * 0.182, r: 1.8 },
      { x: pavCx - pavW * 1.18, y: pavBaseY + safeH * 0.224, r: 1.8 },
      { x: pavCx - pavW * 1.42, y: pavBaseY + safeH * 0.246, r: 1.8 },
    ],
  };

  // Cầu Vòm Đá Cổ bắc ngang tầng giữa hẻm vực thác (y ≈ 0.578h)
  const bridgeDeckY = gorgeTopY + (gorgeBottomY - gorgeTopY) * 0.43;
  const bridgeHalfSpan = safeW * 0.044;
  const bridge: StoneBridgeSpec = {
    leftX: gorgeCenterX - bridgeHalfSpan,
    rightX: gorgeCenterX + bridgeHalfSpan,
    deckY: bridgeDeckY,
    archCrownY: bridgeDeckY + Math.max(8, safeH * 0.014),
    pillarCount: 7,
  };

  // 5 dòng thác đan xen uốn quanh các mỏm đá đen giữa hẻm vực
  const streams: WaterfallStreamSpec[] = [];
  const streamRatios = [-0.52, -0.24, 0.02, 0.28, 0.54];
  for (let s = 0; s < streamRatios.length; s += 1) {
    const ratioX = streamRatios[s]!;
    const pts: TerrainPoint[] = [];
    for (let k = 0; k <= 12; k += 1) {
      const p = k / 12;
      const spreadX = gorgeTopHalfW + p * (gorgeBottomHalfW - gorgeTopHalfW);
      const weave = Math.sin(p * Math.PI * 2.6 + s * 1.35) * spreadX * 0.24;
      pts.push({
        x: gorgeCenterX + ratioX * spreadX + weave,
        y: gorgeTopY + p * (gorgeBottomY - gorgeTopY),
      });
    }
    streams.push({
      id: s,
      centerRatioX: ratioX,
      widthBase: s === 2 ? 4.4 : 2.5 + (s % 2) * 1.1,
      phase: s * 1.4,
      points: pts,
    });
  }

  const gorgeBoulders = [
    {
      cx: gorgeCenterX - gorgeTopHalfW * 0.35,
      cy: gorgeTopY + (gorgeBottomY - gorgeTopY) * 0.26,
      rx: 11,
      ry: 7,
    },
    {
      cx: gorgeCenterX + gorgeBottomHalfW * 0.22,
      cy: gorgeTopY + (gorgeBottomY - gorgeTopY) * 0.6,
      rx: 15,
      ry: 9,
    },
    {
      cx: gorgeCenterX - gorgeBottomHalfW * 0.26,
      cy: gorgeTopY + (gorgeBottomY - gorgeTopY) * 0.78,
      rx: 17,
      ry: 10,
    },
  ];

  return {
    width: safeW,
    height: safeH,
    celestialOrb: { cx: orbX, cy: orbY, haloRadius: 180 },
    gorge: {
      centerX: gorgeCenterX,
      topY: gorgeTopY,
      bottomY: gorgeBottomY,
      topHalfW: gorgeTopHalfW,
      bottomHalfW: gorgeBottomHalfW,
      boulders: gorgeBoulders,
    },
    ridges,
    pavilion,
    bridge,
    terraces: buildRiceTerraceContours(safeW, safeH),
    streams,
    lakeBounds: {
      leftX: safeW * 0.42,
      rightX: safeW * 0.94,
      topY: safeH * 0.72,
      bottomY: safeH * 0.88,
    },
    saddleOrigin: {
      x: safeW * 0.42,
      y: safeH * 0.445,
      slopeX: 0.46,
      slopeY: 0.88,
    },
  };
}

function tracePolyline(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pts: readonly TerrainPoint[],
  closeBottomY?: number,
): void {
  if (pts.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i += 1) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  if (closeBottomY !== undefined) {
    const last = pts[pts.length - 1]!;
    const first = pts[0]!;
    ctx.lineTo(last.x, closeBottomY);
    ctx.lineTo(first.x, closeBottomY);
    ctx.closePath();
  }
}

/** Vẽ cụm Tùng núi cao tán ngang thủy mặc Á Đông */
function drawInkWashMountainPine(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  leanDir: 1 | -1,
  trunkColor: string,
  needleColor: string,
  warmHighlightAlpha = 0,
): void {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);

  // Thân tùng uốn khúc cổ thụ
  ctx.strokeStyle = trunkColor;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(leanDir * 4, -12, -leanDir * 5, -24, leanDir * 6, -38);
  ctx.stroke();

  // Cành vươn ngang
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(leanDir * 2, -19);
  ctx.lineTo(leanDir * 14, -22);
  ctx.moveTo(-leanDir * 2, -28);
  ctx.lineTo(-leanDir * 13, -31);
  ctx.stroke();

  // Tán lá tùng phân tầng ngang dẹt
  const pads: readonly [number, number, number, number][] = [
    [leanDir * 14, -23, 14, 4.2],
    [-leanDir * 12, -31, 13, 4.0],
    [leanDir * 5, -39, 16, 4.8],
    [leanDir * 2, -45, 10, 3.6],
  ];

  for (const [px, py, rx, ry] of pads) {
    ctx.fillStyle = needleColor;
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, leanDir * 0.08, 0, Math.PI * 2);
    ctx.fill();
    if (warmHighlightAlpha > 0) {
      ctx.fillStyle = `rgba(255, 198, 108, ${warmHighlightAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(px, py + ry * 0.35, rx * 0.72, ry * 0.45, leanDir * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function renderMilkyWayOffscreen(
  w: number,
  h: number,
  dpr: number,
  palette: AtmospherePalette,
): TerrainSurface | null {
  const surface = makeOffscreenSurface(Math.round(w * dpr), Math.round(h * dpr));
  const ctx = getCtx2d(surface);
  if (!surface || !ctx || typeof ctx.createRadialGradient !== 'function') return null;

  ctx.save();
  ctx.scale(dpr, dpr);

  const mwIntensity = Math.max(0.18, palette.milkyWayIntensity);
  ctx.save();
  ctx.translate(w * 0.48, h * 0.25);
  ctx.rotate(0.43);

  // Dải tinh vân chéo từ góc trên trái xuống đỉnh núi phải (nebula puffs + rãnh bụi tối)
  const coreRadius = w * 0.62;
  const bandGrad = ctx.createRadialGradient(0, 0, w * 0.04, 0, 0, coreRadius);
  bandGrad.addColorStop(0, rgbaString(palette.facetCelestial, 0.24 * mwIntensity));
  bandGrad.addColorStop(0.32, `rgba(125, 184, 232, ${(0.14 * mwIntensity).toFixed(3)})`);
  bandGrad.addColorStop(0.62, rgbaString(palette.dawnCore, 0.08 * mwIntensity));
  bandGrad.addColorStop(1, 'rgba(10, 21, 38, 0)');
  ctx.save();
  ctx.scale(1.55, 0.28);
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Các đám mây bụi sao đa sắc (amethyst / sapphire / warm gold nebula puffs)
  for (let i = 0; i < 22; i += 1) {
    const r1 = hashUnit(i * 17 + 3);
    const r2 = hashUnit(i * 29 + 7);
    const r3 = hashUnit(i * 43 + 11);
    const px = (r1 - 0.5) * w * 0.92;
    const py = (r2 - 0.5) * h * 0.16;
    const rad = w * (0.045 + r3 * 0.075);
    const puff = ctx.createRadialGradient(px, py, 0, px, py, rad);
    const color =
      i % 3 === 0
        ? `rgba(147, 197, 253, ${(0.1 * mwIntensity).toFixed(3)})`
        : i % 3 === 1
          ? `rgba(167, 139, 250, ${(0.08 * mwIntensity).toFixed(3)})`
          : rgbaString(palette.dawnCore, 0.075 * mwIntensity);
    puff.addColorStop(0, color);
    puff.addColorStop(1, 'rgba(10, 21, 38, 0)');
    ctx.fillStyle = puff;
    ctx.beginPath();
    ctx.ellipse(px, py, rad * 1.4, rad * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cụm sao nhỏ dày đặc dọc theo rãnh Ngân Hà
  for (let i = 0; i < 160; i += 1) {
    const r1 = hashUnit(i * 31 + 101);
    const r2 = hashUnit(i * 53 + 203);
    const r3 = hashUnit(i * 71 + 307);
    const sx = (r1 - 0.5) * w * 1.05;
    const sy = (r2 - 0.5) * h * 0.22;
    const starAlpha = (0.28 + r3 * 0.65) * Math.min(1, palette.starIntensity + 0.18);
    ctx.fillStyle =
      r3 > 0.7
        ? `rgba(255, 240, 200, ${starAlpha.toFixed(3)})`
        : `rgba(225, 242, 255, ${starAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.5 + r3 * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();
  return surface;
}

function renderCelestialOrbOffscreen(
  geom: HeroTerrainGeometry,
  dpr: number,
  phase: AtmosphericPhase,
  palette: AtmospherePalette,
): TerrainSurface | null {
  const { width: w, height: h, celestialOrb } = geom;
  const surface = makeOffscreenSurface(Math.round(w * dpr), Math.round(h * dpr));
  const ctx = getCtx2d(surface);
  if (!surface || !ctx || typeof ctx.createRadialGradient !== 'function') return null;

  const { cx, cy, haloRadius } = celestialOrb;
  ctx.save();
  ctx.scale(dpr, dpr);

  // Quầng khúc xạ băng tinh 22 độ (180px radialGradient opacity 0.14) hoặc quầng thái dương
  const isNight = phase === 'dem-ngan-ha';
  const haloGrad = ctx.createRadialGradient(cx, cy, isNight ? 18 : 12, cx, cy, haloRadius);
  if (isNight) {
    haloGrad.addColorStop(0, 'rgba(250, 246, 238, 0.14)');
    haloGrad.addColorStop(0.45, 'rgba(148, 197, 233, 0.14)');
    haloGrad.addColorStop(0.76, 'rgba(229, 193, 88, 0.08)');
    haloGrad.addColorStop(1, 'rgba(148, 197, 233, 0)');
  } else {
    haloGrad.addColorStop(0, 'rgba(255, 243, 176, 0.42)');
    haloGrad.addColorStop(0.42, rgbaString(palette.dawnCore, 0.24));
    haloGrad.addColorStop(0.78, rgbaString(palette.dawnEdge, 0.09));
    haloGrad.addColorStop(1, 'rgba(224, 90, 71, 0)');
  }
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
  ctx.fill();

  // Vòng hào quang 22 độ băng tinh mảnh
  ctx.strokeStyle = isNight ? 'rgba(210, 234, 252, 0.12)' : rgbaString(palette.rimGlow, 0.14);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, haloRadius * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  if (isNight) {
    const moonR = Math.max(22, Math.min(32, w * 0.021));
    // Phần tối phản chiếu ánh sáng trái đất mờ (earthshine)
    ctx.fillStyle = 'rgba(148, 197, 233, 0.08)';
    ctx.beginPath();
    ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Trăng lưỡi liềm sắc nét (#FAF6EE)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#FAF6EE';
    ctx.beginPath();
    ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Phần khuyết dịch sang trái-trên tạo dáng lưỡi liềm đón ánh trăng
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx - moonR * 0.46, cy - moonR * 0.22, moonR * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tái phủ earthshine mờ trong lòng đĩa tối
    ctx.fillStyle = 'rgba(148, 197, 233, 0.08)';
    ctx.beginPath();
    ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Đĩa mặt trời chuyển sắc từ vàng kim #FFF3B0 sang cam chu sa #E05A47 + anamorphic streak
    const sunR = Math.max(25, Math.min(36, w * 0.023));
    const sunGrad = ctx.createRadialGradient(cx, cy, sunR * 0.15, cx, cy, sunR);
    sunGrad.addColorStop(0, '#FFFDF2');
    sunGrad.addColorStop(0.55, '#FFF3B0');
    sunGrad.addColorStop(1, phase === 'nang-ngoc' ? '#F4D35E' : '#E05A47');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Tia tán xạ ngang nhẹ (anamorphic lens streak)
    const streakGrad = ctx.createLinearGradient(cx - 210, cy, cx + 210, cy);
    streakGrad.addColorStop(0, 'rgba(255, 243, 176, 0)');
    streakGrad.addColorStop(0.5, 'rgba(255, 243, 176, 0.34)');
    streakGrad.addColorStop(1, 'rgba(255, 243, 176, 0)');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(cx - 210, cy - 1.6, 420, 3.2);
  }

  ctx.restore();
  return surface;
}

function renderRidgesAndArchitectureOffscreen(
  geom: HeroTerrainGeometry,
  dpr: number,
  phase: AtmosphericPhase,
  palette: AtmospherePalette,
): TerrainSurface | null {
  const { width: w, height: h, ridges, pavilion, terraces, gorge } = geom;
  const surface = makeOffscreenSurface(Math.round(w * dpr), Math.round(h * dpr));
  const ctx = getCtx2d(surface);
  if (!surface || !ctx || typeof ctx.createLinearGradient !== 'function') return null;

  ctx.save();
  ctx.scale(dpr, dpr);

  const isNight = phase === 'dem-ngan-ha';
  const litTop = isNight ? '#3A5A78' : rgbString(palette.facetCelestial);
  const litBot = isNight ? '#1B334B' : rgbString(palette.facetMid);
  const shadowTop = isNight ? '#0B1624' : rgbString(palette.facetAbyss);
  const shadowBot = isNight ? '#060C16' : 'rgb(6, 12, 22)';
  const rimHex = isNight ? '#F3E5AB' : '#FFD166';

  // 1. Vẽ 4 tầng núi đá tai mèo fractal + sống núi phụ 3D + vân đá + viền Rim-Light 450px
  for (let idx = 0; idx < ridges.length; idx += 1) {
    const ridge = ridges[idx]!;
    const layerAlpha = idx === 0 ? 0.56 : idx === 1 ? 0.82 : 0.98;

    ctx.save();
    ctx.globalAlpha = layerAlpha;

    // Nền khối núi tổng thể
    const bodyGrad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.85);
    bodyGrad.addColorStop(0, idx === 0 ? litBot : shadowTop);
    bodyGrad.addColorStop(1, shadowBot);
    ctx.fillStyle = bodyGrad;
    tracePolyline(ctx, ridge.points, h * 0.9);
    ctx.fill();

    // Hai mảng Sáng (Moonlit/Sunlit Facet) – Tối (Shadowed Cliff Facet) rõ rệt từ sống núi phụ 3D
    const litGrad = ctx.createLinearGradient(0, h * 0.32, w * 0.2, h * 0.78);
    litGrad.addColorStop(0, litTop);
    litGrad.addColorStop(1, litBot);
    const darkGrad = ctx.createLinearGradient(0, h * 0.34, 0, h * 0.82);
    darkGrad.addColorStop(0, shadowTop);
    darkGrad.addColorStop(1, shadowBot);

    for (const spur of ridge.spurs) {
      if (spur.polygon.length < 3) continue;
      ctx.fillStyle = spur.isLit ? litGrad : darkGrad;
      tracePolyline(ctx, spur.polygon);
      ctx.closePath();
      ctx.fill();

      // Vân đá chéo (rock striations) trên vách đón ánh sáng
      if (spur.isLit && spur.striations.length > 0) {
        ctx.strokeStyle = isNight ? 'rgba(218, 232, 245, 0.14)' : rgbaString(palette.rimGlow, 0.16);
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        for (const st of spur.striations) {
          ctx.moveTo(st.x1, st.y1);
          ctx.lineTo(st.x2, st.y2);
        }
        ctx.stroke();
      }
    }

    // Gờ đá ánh vàng kim tinh tế trên đỉnh sống núi (không dùng nét viền thô đồng nhất)
    if (idx >= 1) {
      ctx.strokeStyle = rgbaString(palette.rimGlow, idx === 1 ? 0.24 : 0.38);
      ctx.lineWidth = 1.0;
      ctx.lineJoin = 'miter';
      tracePolyline(ctx, ridge.points);
      ctx.stroke();
    }

    // Rim-Lighting Pass: Viền sáng ngược sắc lẹm trong bán kính 450px quanh Thiên thể
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (const seg of ridge.rimLightSegments) {
      ctx.strokeStyle = rimHex;
      ctx.globalAlpha = layerAlpha * seg.intensity * 0.82;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }

    // Lớp sương thung lũng mỏng ngăn giữa các tầng núi xa và trung cảnh
    if (idx === 0 || idx === 1) {
      const mistY = h * (idx === 0 ? 0.44 : 0.51);
      const mistGrad = ctx.createLinearGradient(0, mistY - 26, 0, mistY + 64);
      mistGrad.addColorStop(0, 'rgba(197, 211, 220, 0)');
      mistGrad.addColorStop(0.55, rgbaString(palette.cloudSlate, idx === 0 ? 0.2 : 0.14));
      mistGrad.addColorStop(1, 'rgba(17, 34, 51, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, mistY - 26, w, 90);
    }

    ctx.restore();
  }

  // 2. Khoét lòng hẻm vực V trung tâm & mỏm đá giữa dòng thác
  const gorgeGrad = ctx.createLinearGradient(
    gorge.centerX,
    gorge.topY,
    gorge.centerX,
    gorge.bottomY,
  );
  gorgeGrad.addColorStop(0, '#040912');
  gorgeGrad.addColorStop(1, '#081423');
  ctx.fillStyle = gorgeGrad;
  ctx.beginPath();
  ctx.moveTo(gorge.centerX - gorge.topHalfW, gorge.topY);
  ctx.lineTo(gorge.centerX + gorge.topHalfW, gorge.topY);
  ctx.lineTo(gorge.centerX + gorge.bottomHalfW * 1.18, gorge.bottomY);
  ctx.lineTo(gorge.centerX - gorge.bottomHalfW * 1.18, gorge.bottomY);
  ctx.closePath();
  ctx.fill();

  for (const b of gorge.boulders) {
    ctx.fillStyle = '#07111D';
    ctx.beginPath();
    ctx.moveTo(b.cx - b.rx, b.cy + b.ry * 0.4);
    ctx.lineTo(b.cx - b.rx * 0.4, b.cy - b.ry);
    ctx.lineTo(b.cx + b.rx * 0.55, b.cy - b.ry * 0.72);
    ctx.lineTo(b.cx + b.rx, b.cy + b.ry * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgbaString(palette.rimGlow, 0.28);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // 3. 14 Bậc Ruộng Bậc Thang mùa nước đổ (7 tầng x 2 bên sườn thung lũng)
  for (const terrace of terraces) {
    const firstUp = terrace.upperPoints[0]!;
    const lastDown = terrace.lowerPoints[terrace.lowerPoints.length - 1]!;
    const waterGrad = ctx.createLinearGradient(firstUp.x, firstUp.y, lastDown.x, lastDown.y);
    waterGrad.addColorStop(0, rgbaString(palette.terracePoolA, 0.56));
    waterGrad.addColorStop(0.55, rgbaString(palette.terracePoolB, 0.48));
    waterGrad.addColorStop(1, 'rgba(255, 183, 77, 0.34)');

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(firstUp.x, firstUp.y);
    for (let i = 1; i < terrace.upperPoints.length; i += 1) {
      ctx.lineTo(terrace.upperPoints[i]!.x, terrace.upperPoints[i]!.y);
    }
    for (let i = terrace.lowerPoints.length - 1; i >= 0; i -= 1) {
      ctx.lineTo(terrace.lowerPoints[i]!.x, terrace.lowerPoints[i]!.y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = rgbaString(palette.terraceRim, 0.68);
    ctx.lineWidth = 1.05;
    tracePolyline(ctx, terrace.upperPoints);
    ctx.stroke();
  }

  // 4. VỌNG TINH CÁC (Cổ lầu 2 tầng mái đao cong Việt Nam trên mỏm đá cao bên phải thác)
  ctx.fillStyle = '#091522';
  tracePolyline(ctx, pavilion.cliffPolygon);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgbaString(palette.rimGlow, 0.35);
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // Bậc đường đá chữ Z dẫn lên Vọng Tinh Các + 7 đốm đèn lồng đá
  ctx.strokeStyle = 'rgba(218, 226, 234, 0.36)';
  ctx.lineWidth = 2.0;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  tracePolyline(ctx, pavilion.pathPoints);
  ctx.stroke();

  for (const lantern of pavilion.stoneLanterns) {
    const glow = ctx.createRadialGradient(lantern.x, lantern.y, 0, lantern.x, lantern.y, 18);
    glow.addColorStop(0, 'rgba(255, 209, 102, 0.42)');
    glow.addColorStop(1, 'rgba(255, 183, 77, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lantern.x, lantern.y, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(lantern.x, lantern.y, lantern.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rừng Tùng cổ thụ quanh cổ lầu & sườn dốc (ánh đèn hắt ấm lên tán tùng lân cận)
  const pineColor = isNight ? '#0A1927' : rgbString(palette.pineBot);
  const trunkColor = '#122030';
  drawInkWashMountainPine(
    ctx,
    pavilion.cx - pavilion.width * 0.92,
    pavilion.baseY + 26,
    0.85,
    -1,
    trunkColor,
    pineColor,
    0.18,
  );
  drawInkWashMountainPine(
    ctx,
    pavilion.cx + pavilion.width * 0.92,
    pavilion.baseY + 18,
    0.92,
    1,
    trunkColor,
    pineColor,
    0.22,
  );
  drawInkWashMountainPine(
    ctx,
    pavilion.cx - pavilion.width * 1.45,
    pavilion.baseY + 62,
    0.72,
    1,
    trunkColor,
    pineColor,
    0.14,
  );
  drawInkWashMountainPine(ctx, w * 0.31, h * 0.56, 0.88, -1, trunkColor, pineColor, 0);
  drawInkWashMountainPine(ctx, w * 0.36, h * 0.59, 0.74, 1, trunkColor, pineColor, 0);
  drawInkWashMountainPine(ctx, w * 0.56, h * 0.58, 0.78, -1, trunkColor, pineColor, 0);
  drawInkWashMountainPine(ctx, w * 0.82, h * 0.57, 0.94, 1, trunkColor, pineColor, 0);

  // Vẽ kiến trúc Vọng Tinh Các chi tiết
  const { cx: pcx, baseY: pby, width: pw, height: ph } = pavilion;
  const ambientGlow = ctx.createRadialGradient(
    pcx,
    pby - ph * 0.45,
    4,
    pcx,
    pby - ph * 0.45,
    pw * 1.85,
  );
  ambientGlow.addColorStop(0, 'rgba(255, 183, 77, 0.36)');
  ambientGlow.addColorStop(0.5, 'rgba(255, 159, 67, 0.14)');
  ambientGlow.addColorStop(1, 'rgba(255, 159, 67, 0)');
  ctx.fillStyle = ambientGlow;
  ctx.beginPath();
  ctx.arc(pcx, pby - ph * 0.45, pw * 1.85, 0, Math.PI * 2);
  ctx.fill();

  // Bệ đá tam cấp
  ctx.fillStyle = '#152536';
  ctx.fillRect(pcx - pw * 0.52, pby - 5, pw * 1.04, 7);

  // Tầng 1 cổ lầu: cột gỗ sẫm + ô cửa sổ hắt ánh sáng hổ phách #FFB74D
  ctx.fillStyle = '#182430';
  ctx.fillRect(pcx - pw * 0.38, pby - ph * 0.42, pw * 0.76, ph * 0.36);
  ctx.fillStyle = '#FFB74D';
  ctx.fillRect(pcx - pw * 0.24, pby - ph * 0.36, pw * 0.14, ph * 0.22);
  ctx.fillRect(pcx - pw * 0.05, pby - ph * 0.36, pw * 0.1, ph * 0.22);
  ctx.fillRect(pcx + pw * 0.1, pby - ph * 0.36, pw * 0.14, ph * 0.22);

  // Mái đao cong tầng 1
  ctx.fillStyle = '#0B1622';
  ctx.beginPath();
  ctx.moveTo(pcx - pw * 0.62, pby - ph * 0.39);
  ctx.quadraticCurveTo(pcx - pw * 0.36, pby - ph * 0.43, pcx, pby - ph * 0.56);
  ctx.quadraticCurveTo(pcx + pw * 0.36, pby - ph * 0.43, pcx + pw * 0.62, pby - ph * 0.39);
  ctx.lineTo(pcx + pw * 0.54, pby - ph * 0.34);
  ctx.quadraticCurveTo(pcx, pby - ph * 0.38, pcx - pw * 0.54, pby - ph * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rimHex;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Tầng 2 vọng nguyệt
  ctx.fillStyle = '#15202C';
  ctx.fillRect(pcx - pw * 0.26, pby - ph * 0.74, pw * 0.52, ph * 0.24);
  ctx.fillStyle = '#FFB74D';
  ctx.fillRect(pcx - pw * 0.15, pby - ph * 0.7, pw * 0.11, ph * 0.15);
  ctx.fillRect(pcx + pw * 0.04, pby - ph * 0.7, pw * 0.11, ph * 0.15);

  // Mái đao cong tầng 2 + đỉnh bầu hồ lô
  ctx.fillStyle = '#09131F';
  ctx.beginPath();
  ctx.moveTo(pcx - pw * 0.48, pby - ph * 0.71);
  ctx.quadraticCurveTo(pcx - pw * 0.26, pby - ph * 0.77, pcx, pby - ph * 0.95);
  ctx.quadraticCurveTo(pcx + pw * 0.26, pby - ph * 0.77, pcx + pw * 0.48, pby - ph * 0.71);
  ctx.lineTo(pcx + pw * 0.4, pby - ph * 0.67);
  ctx.quadraticCurveTo(pcx, pby - ph * 0.72, pcx - pw * 0.4, pby - ph * 0.67);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rimHex;
  ctx.lineWidth = 0.95;
  ctx.stroke();

  ctx.fillStyle = rimHex;
  ctx.beginPath();
  ctx.arc(pcx, pby - ph * 0.99, 2.1, 0, Math.PI * 2);
  ctx.fill();

  // 5. CẦU VÒM ĐÁ CỔ bắc ngang hẻm vực thác (vẽ sau thác tại Layer 4 để thác đổ bên dưới vòm đá)
  ctx.restore();
  return surface;
}

/**
 * Vẽ Cầu Vòm Đá Cổ bắc ngang tầng giữa hẻm vực thác (Layer 4 trên mặt thác, nửa ẩn nửa hiện trong sương nước).
 */
export function drawStoneArchBridge(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  bridge: StoneBridgeSpec,
  palette: AtmospherePalette,
): void {
  const spanW = bridge.rightX - bridge.leftX;
  const bridgeMidX = (bridge.leftX + bridge.rightX) * 0.5;

  ctx.save();
  ctx.fillStyle = '#152536';
  ctx.beginPath();
  ctx.moveTo(bridge.leftX, bridge.deckY - 4);
  ctx.quadraticCurveTo(bridgeMidX, bridge.deckY - 9, bridge.rightX, bridge.deckY - 4);
  ctx.lineTo(bridge.rightX, bridge.archCrownY + 11);
  ctx.quadraticCurveTo(bridgeMidX, bridge.archCrownY - 12, bridge.leftX, bridge.archCrownY + 11);
  ctx.closePath();
  ctx.fill();

  // Mép vòm đá bắt sáng trăng/nắng & lan can cột đá cổ
  ctx.strokeStyle = rgbaString(palette.rimGlow, 0.48);
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(bridge.leftX, bridge.deckY - 4);
  ctx.quadraticCurveTo(bridgeMidX, bridge.deckY - 9, bridge.rightX, bridge.deckY - 4);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(205, 224, 240, 0.58)';
  ctx.lineWidth = 1.05;
  for (let p = 0; p < bridge.pillarCount; p += 1) {
    const t = p / (bridge.pillarCount - 1);
    const px = bridge.leftX + t * spanW;
    const camber = Math.sin(t * Math.PI) * 4.5;
    ctx.beginPath();
    ctx.moveTo(px, bridge.deckY - 4 - camber);
    ctx.lineTo(px, bridge.deckY - 9.5 - camber);
    ctx.stroke();
  }

  // Tay vịn lan can nối các trụ đá
  ctx.strokeStyle = 'rgba(205, 224, 240, 0.44)';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.moveTo(bridge.leftX, bridge.deckY - 8.5);
  ctx.quadraticCurveTo(bridgeMidX, bridge.deckY - 13.5, bridge.rightX, bridge.deckY - 8.5);
  ctx.stroke();
  ctx.restore();
}

function renderForegroundPineFrameOffscreen(
  w: number,
  h: number,
  dpr: number,
  palette: AtmospherePalette,
): TerrainSurface | null {
  const surface = makeOffscreenSurface(Math.round(w * dpr), Math.round(h * dpr));
  const ctx = getCtx2d(surface);
  if (!surface || !ctx) return null;

  ctx.save();
  ctx.scale(dpr, dpr);

  const silDark = '#040A12';
  const silPine = rgbString(palette.pineBot);

  // Góc dưới trái: cành tùng cổ thụ vươn khung tự nhiên + hoa đỗ quyên núi cao
  ctx.fillStyle = silDark;
  ctx.beginPath();
  ctx.moveTo(-24, h + 16);
  ctx.lineTo(-24, h * 0.72);
  ctx.quadraticCurveTo(w * 0.08, h * 0.79, w * 0.16, h + 16);
  ctx.closePath();
  ctx.fill();

  drawInkWashMountainPine(ctx, w * 0.052, h * 0.79, 2.35, 1, '#09131F', silPine, 0);
  drawInkWashMountainPine(ctx, w * 0.112, h * 0.85, 1.85, 1, '#08121E', silPine, 0);

  // Rìa phải tiền cảnh: bóng cành tùng cao vươn vào tạo chiều sâu khung cửa sổ
  ctx.fillStyle = silDark;
  ctx.beginPath();
  ctx.moveTo(w + 24, h + 16);
  ctx.lineTo(w + 24, h * 0.66);
  ctx.quadraticCurveTo(w * 0.91, h * 0.76, w * 0.84, h + 16);
  ctx.closePath();
  ctx.fill();

  drawInkWashMountainPine(ctx, w * 0.945, h * 0.73, 2.45, -1, '#09131F', silPine, 0);
  drawInkWashMountainPine(ctx, w * 0.885, h * 0.83, 1.8, -1, '#08121E', silPine, 0);

  // Điểm xuyết chùm hoa đỗ quyên núi cao sắc nét tại cành tiền cảnh
  const blooms: readonly { readonly x: number; readonly y: number; readonly r: number }[] = [
    { x: w * 0.082, y: h * 0.74, r: 5 },
    { x: w * 0.092, y: h * 0.752, r: 4 },
    { x: w * 0.132, y: h * 0.82, r: 4.5 },
    { x: w * 0.914, y: h * 0.68, r: 5.2 },
    { x: w * 0.902, y: h * 0.695, r: 4 },
    { x: w * 0.862, y: h * 0.79, r: 4.4 },
  ];
  for (const bloom of blooms) {
    ctx.fillStyle = 'rgba(218, 92, 124, 0.76)';
    ctx.beginPath();
    ctx.arc(bloom.x, bloom.y, bloom.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 224, 156, 0.75)';
    ctx.beginPath();
    ctx.arc(bloom.x, bloom.y, bloom.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  return surface;
}

/**
 * Tiền kết xuất (pre-render) toàn bộ 4 lớp tĩnh/bán tĩnh vào OffscreenCanvas theo (width, height, phase, dpr)
 * giúp vòng lặp 120fps chỉ thực hiện GPU blit + các hiệu ứng động dưới < 3ms/frame.
 */
export function buildHeroTerrainLayerCache(
  width: number,
  height: number,
  phase: AtmosphericPhase,
  palette: AtmospherePalette,
  dpr = 1,
): HeroTerrainLayerCache {
  const safeDpr = Math.min(2, Math.max(1, dpr));
  const geometry = buildHeroTerrainGeometry(width, height);
  return {
    key: `${width}x${height}:${phase}:${safeDpr}`,
    width,
    height,
    phase,
    dpr: safeDpr,
    geometry,
    milkyWayLayer: renderMilkyWayOffscreen(width, height, safeDpr, palette),
    celestialOrbLayer: renderCelestialOrbOffscreen(geometry, safeDpr, phase, palette),
    ridgesAndArchitectureLayer: renderRidgesAndArchitectureOffscreen(
      geometry,
      safeDpr,
      phase,
      palette,
    ),
    foregroundPineLayer: renderForegroundPineFrameOffscreen(width, height, safeDpr, palette),
  };
}
