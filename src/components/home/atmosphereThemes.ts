export type AtmosphericPhase = 'binh-minh-bach-ngoc';

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
  readonly bottomMistDeep: RgbTriplet;
  readonly starIntensity: number;
  readonly milkyWayIntensity: number;
  readonly rayIntensity: number;
  readonly contrastScrimAlpha: number;
}

/**
 * Bảng màu sáng "Bình Minh Bạch Ngọc & Sơn Thủy Sương Lam" —
 * đồng bộ 100% với hệ màu Bạch Ngọc Khoáng Thạch & Đá Phiến Trầm của Learning Universe.
 */
export const JADE_MIST_DAWN_PALETTE: AtmospherePalette = {
  sky0: [237, 243, 241], // #EDF3F1 Bạch Ngọc Sương
  sky1: [229, 239, 236], // Chuyển sắc sương ngọc
  sky2: [221, 234, 230], // #DDEAE6 Lam Ngọc Dịu
  sky3: [234, 237, 230], // Khí quyển sương sớm chân núi
  sky4: [246, 239, 224], // #F6EFE0 Nắng Mai Vàng Kem
  dawnCore: [255, 246, 224], // Quầng nắng ấm trong trẻo
  dawnEdge: [218, 182, 118], // Vàng đồng dịu
  facetCelestial: [200, 218, 212], // #C8DAD4 Tầng núi xa
  facetDawn: [255, 252, 240], // Viền nắng mai sống núi
  facetMid: [120, 155, 146], // #789B92 Tầng núi trung cảnh
  facetAbyss: [43, 75, 67], // #2B4B43 Tầng núi tiền cảnh
  rimGlow: [255, 252, 240], // Nắng mai sống núi
  terracePoolA: [156, 122, 76], // Đồng cổ #9C7A4C
  terracePoolB: [255, 255, 255], // Trắng sứ
  terraceRim: [166, 121, 54], // Vàng đồng #A67936 khi tương tác
  cloudIvory: [255, 250, 235], // Mây sáng ban mai
  cloudPearl: [230, 239, 236], // #E6EFEC Sương ngọc
  cloudSlate: [177, 199, 192], // #B1C7C0 Sương lam
  cloudRim: [255, 252, 240], // Mép sương đón nắng
  rayWarm: [255, 250, 235], // Tia nắng ban mai
  rayCool: [221, 234, 230], // Sương lam ngọc
  pineTop: [76, 115, 105], // #4C7369
  pineBot: [43, 75, 67], // #2B4B43
  bottomMistDeep: [237, 242, 240], // #EDF2F0 Dải sương mặt hồ đáy Hero
  starIntensity: 0.12,
  milkyWayIntensity: 0.1,
  rayIntensity: 1.0,
  contrastScrimAlpha: 0.82,
};

export const ATMOSPHERIC_PALETTES: Record<AtmosphericPhase, AtmospherePalette> = {
  'binh-minh-bach-ngoc': JADE_MIST_DAWN_PALETTE,
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
    bottomMistDeep: lerpRgb(from.bottomMistDeep, to.bottomMistDeep, t),
    starIntensity: lerp(from.starIntensity, to.starIntensity, t),
    milkyWayIntensity: lerp(from.milkyWayIntensity, to.milkyWayIntensity, t),
    rayIntensity: lerp(from.rayIntensity, to.rayIntensity, t),
    contrastScrimAlpha: lerp(from.contrastScrimAlpha, to.contrastScrimAlpha, t),
  };
}
