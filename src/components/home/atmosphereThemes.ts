export type AtmosphericPhase = 'dem-ngan-ha' | 'binh-minh' | 'nang-ngoc' | 'hoang-hon';

export interface AtmosphericPhaseOption {
  readonly id: AtmosphericPhase;
  readonly label: string;
  readonly description: string;
  readonly swatchGradient: string;
}

export const ATMOSPHERIC_PHASE_OPTIONS: readonly AtmosphericPhaseOption[] = [
  {
    id: 'dem-ngan-ha',
    label: 'Đêm Ngân Hà',
    description:
      'Lam Ngọc Vũ Trụ sâu thẳm, ánh vàng Hoàng Kim trên đỉnh Fansipan & hổ phách ấm chân trời',
    swatchGradient: 'linear-gradient(135deg, #060C18 0%, #0F263A 58%, #E5C158 100%)',
  },
  {
    id: 'binh-minh',
    label: 'Bình Minh',
    description: 'Chân trời cam hồng hừng đông, biển mây nhuộm vàng sớm & tia nắng rực rỡ',
    swatchGradient: 'linear-gradient(135deg, #352148 0%, #FF8FA3 58%, #FFD166 100%)',
  },
  {
    id: 'nang-ngoc',
    label: 'Nắng Ngọc',
    description: 'Bầu trời xanh ngọc bích trong trẻo, núi đá xanh lam & ruộng lúa vàng ngọc',
    swatchGradient: 'linear-gradient(135deg, #0D3B4C 0%, #4895EF 68%, #F4D35E 100%)',
  },
  {
    id: 'hoang-hon',
    label: 'Hoàng Hôn',
    description: 'Sắc chiều đỏ chu sa, tím khói & hổ phách ấm vùng cao',
    swatchGradient: 'linear-gradient(135deg, #3D2645 0%, #C83E37 58%, #E9C46A 100%)',
  },
];

export type RgbTriplet = readonly [number, number, number];

export interface AtmospherePalette {
  readonly sky0: RgbTriplet;
  readonly sky1: RgbTriplet;
  readonly sky2: RgbTriplet;
  readonly sky3: RgbTriplet;
  readonly sky4: RgbTriplet;
  readonly dawnCore: RgbTriplet;
  readonly dawnEdge: RgbTriplet;
  readonly facetCelestial: RgbTriplet;
  readonly facetDawn: RgbTriplet;
  readonly facetMid: RgbTriplet;
  readonly facetAbyss: RgbTriplet;
  readonly rimGlow: RgbTriplet;
  readonly terracePoolA: RgbTriplet;
  readonly terracePoolB: RgbTriplet;
  readonly terraceRim: RgbTriplet;
  readonly cloudIvory: RgbTriplet;
  readonly cloudPearl: RgbTriplet;
  readonly cloudSlate: RgbTriplet;
  readonly cloudRim: RgbTriplet;
  readonly rayWarm: RgbTriplet;
  readonly rayCool: RgbTriplet;
  readonly pineTop: RgbTriplet;
  readonly pineBot: RgbTriplet;
  readonly starIntensity: number;
  readonly milkyWayIntensity: number;
  readonly rayIntensity: number;
  readonly contrastScrimAlpha: number;
}

export const ATMOSPHERIC_PALETTES: Record<AtmosphericPhase, AtmospherePalette> = {
  'dem-ngan-ha': {
    sky0: [6, 12, 24], // #060C18 (Lam Ngọc Vũ Trụ)
    sky1: [10, 24, 41], // Chuyển sắc đêm sâu
    sky2: [15, 38, 58], // #0F263A (Ngọc Bích Đêm)
    sky3: [28, 62, 88], // Xanh lam ngọc tầng mây
    sky4: [42, 72, 92], // Chân trời lam hổ phách
    dawnCore: [212, 163, 89], // #D4A359 (Hổ Phách ấm)
    dawnEdge: [78, 168, 222], // #4EA8DE (Ngọc Lam)
    facetCelestial: [78, 168, 222], // #4EA8DE (Ngọc Lam đón sáng Ngân Hà)
    facetDawn: [229, 193, 88], // #E5C158 (Vàng Hoàng Kim vách đỉnh)
    facetMid: [18, 46, 68],
    facetAbyss: [6, 14, 24],
    rimGlow: [229, 193, 88], // #E5C158
    terracePoolA: [32, 84, 118],
    terracePoolB: [132, 198, 228],
    terraceRim: [229, 193, 88], // #E5C158
    cloudIvory: [248, 245, 236],
    cloudPearl: [224, 234, 242],
    cloudSlate: [128, 156, 178],
    cloudRim: [229, 193, 88], // #E5C158
    rayWarm: [229, 193, 88],
    rayCool: [78, 168, 222],
    pineTop: [19, 42, 58],
    pineBot: [5, 11, 20],
    starIntensity: 1.0,
    milkyWayIntensity: 1.0,
    rayIntensity: 1.05,
    contrastScrimAlpha: 0.28,
  },
  'binh-minh': {
    sky0: [24, 24, 52], // Sắc tím chàm đỉnh trời giữ chữ sáng rõ
    sky1: [77, 49, 86],
    sky2: [176, 86, 118],
    sky3: [255, 143, 163], // #FF8FA3
    sky4: [255, 209, 102], // #FFD166
    dawnCore: [255, 209, 102], // #FFD166
    dawnEdge: [255, 143, 163], // #FF8FA3
    facetCelestial: [216, 134, 152],
    facetDawn: [255, 209, 102],
    facetMid: [58, 42, 74],
    facetAbyss: [22, 18, 38],
    rimGlow: [255, 209, 102],
    terracePoolA: [255, 143, 163],
    terracePoolB: [255, 209, 102],
    terraceRim: [255, 236, 179],
    cloudIvory: [255, 246, 230],
    cloudPearl: [255, 214, 218],
    cloudSlate: [128, 108, 144],
    cloudRim: [255, 209, 102],
    rayWarm: [255, 209, 102],
    rayCool: [255, 143, 163],
    pineTop: [46, 33, 62],
    pineBot: [20, 14, 30],
    starIntensity: 0.36,
    milkyWayIntensity: 0.22,
    rayIntensity: 1.65,
    contrastScrimAlpha: 0.44,
  },
  'nang-ngoc': {
    sky0: [13, 59, 76], // #0D3B4C
    sky1: [22, 88, 116],
    sky2: [42, 122, 176],
    sky3: [72, 149, 239], // #4895EF
    sky4: [142, 202, 230],
    dawnCore: [255, 240, 176],
    dawnEdge: [114, 214, 224],
    facetCelestial: [78, 148, 176],
    facetDawn: [224, 202, 110],
    facetMid: [25, 80, 102],
    facetAbyss: [10, 41, 56],
    rimGlow: [244, 211, 94],
    terracePoolA: [42, 157, 143], // Xanh ngọc lục
    terracePoolB: [233, 196, 106], // Vàng lúa chín
    terraceRim: [255, 243, 176],
    cloudIvory: [255, 255, 252],
    cloudPearl: [224, 242, 254],
    cloudSlate: [110, 158, 184],
    cloudRim: [255, 230, 156],
    rayWarm: [255, 238, 170],
    rayCool: [144, 224, 239],
    pineTop: [18, 66, 78],
    pineBot: [8, 32, 42],
    starIntensity: 0.14,
    milkyWayIntensity: 0.08,
    rayIntensity: 1.45,
    contrastScrimAlpha: 0.5,
  },
  'hoang-hon': {
    sky0: [24, 18, 36],
    sky1: [61, 38, 69], // #3D2645
    sky2: [124, 46, 66],
    sky3: [200, 62, 55], // #C83E37
    sky4: [233, 196, 106], // #E9C46A
    dawnCore: [233, 196, 106], // #E9C46A
    dawnEdge: [200, 62, 55], // #C83E37
    facetCelestial: [139, 73, 91],
    facetDawn: [233, 196, 106],
    facetMid: [53, 31, 59],
    facetAbyss: [22, 13, 29],
    rimGlow: [233, 196, 106],
    terracePoolA: [200, 62, 55],
    terracePoolB: [233, 196, 106],
    terraceRim: [244, 211, 140],
    cloudIvory: [255, 240, 212],
    cloudPearl: [216, 152, 160],
    cloudSlate: [74, 51, 82],
    cloudRim: [231, 111, 81],
    rayWarm: [233, 196, 106],
    rayCool: [200, 62, 55],
    pineTop: [38, 22, 46],
    pineBot: [16, 9, 22],
    starIntensity: 0.56,
    milkyWayIntensity: 0.42,
    rayIntensity: 1.55,
    contrastScrimAlpha: 0.42,
  },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRgb(a: RgbTriplet, b: RgbTriplet, t: number): RgbTriplet {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

export function rgbString(rgb: RgbTriplet): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function rgbaString(rgb: RgbTriplet, alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}

/**
 * Nội suy mượt toàn bộ bảng màu khí quyển giữa 2 thời khắc thiên nhiên (t ∈ [0, 1]).
 */
export function interpolateAtmospherePalette(
  from: AtmospherePalette,
  to: AtmospherePalette,
  rawT: number,
): AtmospherePalette {
  const t = Math.min(1, Math.max(0, rawT));
  if (t <= 0) return from;
  if (t >= 1) return to;

  return {
    sky0: lerpRgb(from.sky0, to.sky0, t),
    sky1: lerpRgb(from.sky1, to.sky1, t),
    sky2: lerpRgb(from.sky2, to.sky2, t),
    sky3: lerpRgb(from.sky3, to.sky3, t),
    sky4: lerpRgb(from.sky4, to.sky4, t),
    dawnCore: lerpRgb(from.dawnCore, to.dawnCore, t),
    dawnEdge: lerpRgb(from.dawnEdge, to.dawnEdge, t),
    facetCelestial: lerpRgb(from.facetCelestial, to.facetCelestial, t),
    facetDawn: lerpRgb(from.facetDawn, to.facetDawn, t),
    facetMid: lerpRgb(from.facetMid, to.facetMid, t),
    facetAbyss: lerpRgb(from.facetAbyss, to.facetAbyss, t),
    rimGlow: lerpRgb(from.rimGlow, to.rimGlow, t),
    terracePoolA: lerpRgb(from.terracePoolA, to.terracePoolA, t),
    terracePoolB: lerpRgb(from.terracePoolB, to.terracePoolB, t),
    terraceRim: lerpRgb(from.terraceRim, to.terraceRim, t),
    cloudIvory: lerpRgb(from.cloudIvory, to.cloudIvory, t),
    cloudPearl: lerpRgb(from.cloudPearl, to.cloudPearl, t),
    cloudSlate: lerpRgb(from.cloudSlate, to.cloudSlate, t),
    cloudRim: lerpRgb(from.cloudRim, to.cloudRim, t),
    rayWarm: lerpRgb(from.rayWarm, to.rayWarm, t),
    rayCool: lerpRgb(from.rayCool, to.rayCool, t),
    pineTop: lerpRgb(from.pineTop, to.pineTop, t),
    pineBot: lerpRgb(from.pineBot, to.pineBot, t),
    starIntensity: lerp(from.starIntensity, to.starIntensity, t),
    milkyWayIntensity: lerp(from.milkyWayIntensity, to.milkyWayIntensity, t),
    rayIntensity: lerp(from.rayIntensity, to.rayIntensity, t),
    contrastScrimAlpha: lerp(from.contrastScrimAlpha, to.contrastScrimAlpha, t),
  };
}
