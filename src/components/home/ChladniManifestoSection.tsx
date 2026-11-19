import { ArrowRight, ArrowUpRight, Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

interface ChladniPreset {
  readonly id: string;
  readonly label: string;
  readonly m: number;
  readonly n: number;
}

type PillarId = 1 | 2 | 3;

const CHLADNI_PRESETS: readonly ChladniPreset[] = [
  { id: 'doi-xung', label: 'Đối xứng (3, 5)', m: 3, n: 5 },
  { id: 'giao-thoa', label: 'Giao thoa (4, 7)', m: 4, n: 7 },
  { id: 'hoi-tu', label: 'Hội tụ (5, 8)', m: 5, n: 8 },
  { id: 'dong-son', label: 'Đông Sơn (6, 9)', m: 6, n: 9 },
] as const;

const MANIFESTO_PILLARS: readonly {
  readonly id: PillarId;
  readonly index: string;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    id: 1,
    index: '01',
    title: 'Chuẩn hóa Chứng minh',
    description:
      'Toàn bộ định nghĩa, mệnh đề và chứng minh biên soạn chuẩn KaTeX, đối chiếu nguồn giáo trình rõ ràng.',
  },
  {
    id: 2,
    index: '02',
    title: 'Trực quan hóa 120fps',
    description:
      'Chuyển hóa cấu trúc trừu tượng thành mô phỏng tương tác trực tiếp bằng đồ họa trắc địa.',
  },
  {
    id: 3,
    index: '03',
    title: 'Nhịp học tập Chuyên sâu',
    description:
      'Kết hợp bộ đếm giờ tùy chỉnh, chế độ tập trung và hệ thống thuật ngữ tra cứu liên môn.',
  },
] as const;

const MIN_MODE = 2;
const MAX_MODE = 12;

// Hệ hạt 2 tầng: 2.600 hạt lõi Đá Phiến + 1.000 hạt bụi Vàng Đồng & Ngọc Bích = 3.600 hạt
const CHLADNI_CORE_COUNT = 2600;
const CHLADNI_DUST_COUNT = 1000;
const CHLADNI_TOTAL_PARTICLES = CHLADNI_CORE_COUNT + CHLADNI_DUST_COUNT;

const POINTER_DISTURB_RADIUS_PX = 65;
const POINTER_INTERFERENCE_RADIUS_PX = 104;
const BREATHING_PERIOD_S = 4.0;
const CONTOUR_GRID_N = 52;
const MAX_CONTOUR_SEGMENTS = CONTOUR_GRID_N * CONTOUR_GRID_N * 2;

interface ChladniParticleSystem {
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly speed: Float32Array;
  readonly layerKind: Uint8Array; // 0 = Lõi Đá Phiến #1E332E, 1 = Bụi Vàng Đồng #9C7A4C, 2 = Bụi Ngọc Bích #3B7A65
  readonly shimmerPhase: Float32Array;
  seed: number;
}

interface ContourBuffer {
  readonly coords: Float32Array; // [x0, y0, x1, y1, ...] trong tọa độ chuẩn hóa [-1, 1]
  count: number;
  cachedM: number;
  cachedN: number;
}

function nextRand(sys: ChladniParticleSystem): number {
  // PRNG Mulberry-style nhanh O(1), không cấp phát bộ nhớ trong vòng lặp 120fps
  sys.seed = (sys.seed * 1664525 + 1013904223) >>> 0;
  return sys.seed / 4294967296;
}

function createChladniParticles(): ChladniParticleSystem {
  const sys: ChladniParticleSystem = {
    x: new Float32Array(CHLADNI_TOTAL_PARTICLES),
    y: new Float32Array(CHLADNI_TOTAL_PARTICLES),
    speed: new Float32Array(CHLADNI_TOTAL_PARTICLES),
    layerKind: new Uint8Array(CHLADNI_TOTAL_PARTICLES),
    shimmerPhase: new Float32Array(CHLADNI_TOTAL_PARTICLES),
    seed: 20261119,
  };

  for (let i = 0; i < CHLADNI_TOTAL_PARTICLES; i += 1) {
    const angle = nextRand(sys) * Math.PI * 2;
    const rad = Math.sqrt(nextRand(sys)) * 0.96;
    sys.x[i] = Math.cos(angle) * rad;
    sys.y[i] = Math.sin(angle) * rad;
    sys.speed[i] = 0;
    sys.shimmerPhase[i] = nextRand(sys) * Math.PI * 2;
    if (i < CHLADNI_CORE_COUNT) {
      sys.layerKind[i] = 0; // Lớp 1: 2.600 hạt lõi Đá Phiến #1E332E (r = 1.25px)
    } else {
      sys.layerKind[i] = i % 2 === 0 ? 1 : 2; // Lớp 2: 1.000 hạt bụi Vàng Đồng & Ngọc Bích (r = 1.0px)
    }
  }

  return sys;
}

function createContourBuffer(): ContourBuffer {
  return {
    coords: new Float32Array(MAX_CONTOUR_SEGMENTS * 4),
    count: 0,
    cachedM: -1,
    cachedN: -1,
  };
}

function evalChladni(x: number, y: number, mPi: number, nPi: number): number {
  return Math.cos(nPi * x) * Math.cos(mPi * y) - Math.cos(mPi * x) * Math.cos(nPi * y);
}

/**
 * Xây dựng đường đồng mức giải tích Z(x, y) = 0 bằng thuật toán Marching Squares
 * vào bộ đệm tiền cấp phát khi (m, n) thay đổi.
 */
function ensureAnalyticalContours(buf: ContourBuffer, m: number, n: number): void {
  if (buf.cachedM === m && buf.cachedN === n) return;
  buf.cachedM = m;
  buf.cachedN = n;
  buf.count = 0;

  const nPi = n * Math.PI;
  const mPi = m * Math.PI;
  const N = CONTOUR_GRID_N;
  const step = 2 / N;

  const emitSeg = (ax: number, ay: number, bx: number, by: number) => {
    if (buf.count >= MAX_CONTOUR_SEGMENTS) return;
    const base = buf.count * 4;
    buf.coords[base] = ax;
    buf.coords[base + 1] = ay;
    buf.coords[base + 2] = bx;
    buf.coords[base + 3] = by;
    buf.count += 1;
  };

  const interp = (v0: number, v1: number): number => {
    const denom = v1 - v0;
    if (Math.abs(denom) < 1e-6) return 0.5;
    return Math.min(1, Math.max(0, -v0 / denom));
  };

  for (let iy = 0; iy < N; iy += 1) {
    const y0 = -1 + iy * step;
    const y1 = y0 + step;
    for (let ix = 0; ix < N; ix += 1) {
      const x0 = -1 + ix * step;
      const x1 = x0 + step;
      const cxCell = (x0 + x1) * 0.5;
      const cyCell = (y0 + y1) * 0.5;
      if (cxCell * cxCell + cyCell * cyCell > 0.98) continue;

      const v00 = evalChladni(x0, y0, mPi, nPi); // bottom-left (top-left in screen)
      const v10 = evalChladni(x1, y0, mPi, nPi);
      const v11 = evalChladni(x1, y1, mPi, nPi);
      const v01 = evalChladni(x0, y1, mPi, nPi);

      const b0 = v00 >= 0 ? 1 : 0;
      const b1 = v10 >= 0 ? 2 : 0;
      const b2 = v11 >= 0 ? 4 : 0;
      const b3 = v01 >= 0 ? 8 : 0;
      const mask = b0 | b1 | b2 | b3;
      if (mask === 0 || mask === 15) continue;

      // Tọa độ 4 giao điểm trên 4 cạnh: 0=top(y0), 1=right(x1), 2=bottom(y1), 3=left(x0)
      const ptsX = [x0 + interp(v00, v10) * step, x1, x0 + interp(v01, v11) * step, x0];
      const ptsY = [y0, y0 + interp(v10, v11) * step, y1, y0 + interp(v00, v01) * step];

      switch (mask) {
        case 1:
        case 14:
          emitSeg(ptsX[3]!, ptsY[3]!, ptsX[0]!, ptsY[0]!);
          break;
        case 2:
        case 13:
          emitSeg(ptsX[0]!, ptsY[0]!, ptsX[1]!, ptsY[1]!);
          break;
        case 4:
        case 11:
          emitSeg(ptsX[1]!, ptsY[1]!, ptsX[2]!, ptsY[2]!);
          break;
        case 8:
        case 7:
          emitSeg(ptsX[2]!, ptsY[2]!, ptsX[3]!, ptsY[3]!);
          break;
        case 3:
        case 12:
          emitSeg(ptsX[3]!, ptsY[3]!, ptsX[1]!, ptsY[1]!);
          break;
        case 6:
        case 9:
          emitSeg(ptsX[0]!, ptsY[0]!, ptsX[2]!, ptsY[2]!);
          break;
        case 5: {
          const centerVal = evalChladni(cxCell, cyCell, mPi, nPi);
          if (centerVal >= 0) {
            emitSeg(ptsX[3]!, ptsY[3]!, ptsX[2]!, ptsY[2]!);
            emitSeg(ptsX[0]!, ptsY[0]!, ptsX[1]!, ptsY[1]!);
          } else {
            emitSeg(ptsX[3]!, ptsY[3]!, ptsX[0]!, ptsY[0]!);
            emitSeg(ptsX[1]!, ptsY[1]!, ptsX[2]!, ptsY[2]!);
          }
          break;
        }
        case 10: {
          const centerVal = evalChladni(cxCell, cyCell, mPi, nPi);
          if (centerVal >= 0) {
            emitSeg(ptsX[3]!, ptsY[3]!, ptsX[0]!, ptsY[0]!);
            emitSeg(ptsX[1]!, ptsY[1]!, ptsX[2]!, ptsY[2]!);
          } else {
            emitSeg(ptsX[3]!, ptsY[3]!, ptsX[2]!, ptsY[2]!);
            emitSeg(ptsX[0]!, ptsY[0]!, ptsX[1]!, ptsY[1]!);
          }
          break;
        }
        default:
          break;
      }
    }
  }
}

function stepChladniParticles(
  sys: ChladniParticleSystem,
  m: number,
  n: number,
  dtScale: number,
  excitation: number,
  activePillar: PillarId,
  elapsedSeconds: number,
  pointerActive: boolean,
  pointerNormX: number,
  pointerNormY: number,
  pointerNormRadius: number,
  interferenceNormRadius: number,
): void {
  const nPi = n * Math.PI;
  const mPi = m * Math.PI;
  const safeDt = Math.min(2.2, Math.max(0.15, dtScale));
  const activePointerR = activePillar === 2 ? interferenceNormRadius : pointerNormRadius;
  const pointerR2 = activePointerR * activePointerR;

  // Khi trụ cột 3 (Nhịp học tập Chuyên sâu) bật: chu kỳ thở điều hòa T = 4 giây
  const breathCycle =
    activePillar === 3
      ? 0.5 -
        0.5 * Math.cos(((elapsedSeconds % BREATHING_PERIOD_S) / BREATHING_PERIOD_S) * Math.PI * 2)
      : 0;

  for (let i = 0; i < CHLADNI_TOTAL_PARTICLES; i += 1) {
    let x = sys.x[i]!;
    let y = sys.y[i]!;
    const isDust = sys.layerKind[i] !== 0;

    const cosNx = Math.cos(nPi * x);
    const sinNx = Math.sin(nPi * x);
    const cosMy = Math.cos(mPi * y);
    const sinMy = Math.sin(mPi * y);
    const cosMx = Math.cos(mPi * x);
    const sinMx = Math.sin(mPi * x);
    const cosNy = Math.cos(nPi * y);
    const sinNy = Math.sin(nPi * y);

    // Z(x, y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)
    const z = cosNx * cosMy - cosMx * cosNy;
    const absZ = Math.abs(z);

    // Gradient giải tích giúp hạt tụ sắc nét dọc theo đường nút Z(x, y) ≈ 0
    const dZx = -nPi * sinNx * cosMy + mPi * sinMx * cosNy;
    const dZy = -mPi * cosNx * sinMy + nPi * cosMx * sinNy;
    const gradMag = Math.hypot(dZx, dZy) + 0.001;

    const signZ = z >= 0 ? 1 : -1;
    // Lớp 1 (2.600 hạt Đá Phiến): bám chặt vùng |Z| < 0.06; Lớp 2 (1.000 hạt bụi): rìa đường nút & dao động vi mô
    const settleFactor = isDust ? 0.011 : absZ < 0.06 ? 0.022 : 0.028;
    const settleBreathScale = activePillar === 3 ? 1 - breathCycle * 0.42 : 1;
    const settleStrength =
      Math.min(isDust ? 0.016 : 0.026, absZ * settleFactor) * settleBreathScale * safeDt;

    const dustMicroJitter = isDust ? 0.0028 : absZ < 0.06 ? 0.0004 : 0.0012;
    const breathJitter = activePillar === 3 ? breathCycle * (isDust ? 0.011 : 0.0065) : 0;
    const jitterAmp =
      (absZ * (isDust ? 0.019 : 0.0125) + dustMicroJitter + breathJitter + excitation * 0.032) *
      safeDt;

    const dxStep =
      -(signZ * (dZx / gradMag)) * settleStrength + (nextRand(sys) - 0.5) * 2 * jitterAmp;
    const dyStep =
      -(signZ * (dZy / gradMag)) * settleStrength + (nextRand(sys) - 0.5) * 2 * jitterAmp;

    x += dxStep;
    y += dyStep;
    let frameSpeed = Math.hypot(dxStep, dyStep) / Math.max(0.25, safeDt);

    // Tương tác chuột / chạm hoặc Tâm Phát Sóng Giao Thoa Thứ Cấp (Trụ cột 2)
    if (pointerActive) {
      const dx = x - pointerNormX;
      const dy = y - pointerNormY;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < pointerR2) {
        const dist = Math.sqrt(dist2) + 0.0001;
        const falloff = 1 - dist / activePointerR;
        if (activePillar === 2) {
          // 3 vòng sóng đồng tâm lan tỏa đẩy dạt và tái cấu trúc vân hạt theo thời gian thực
          const rippleWave = 0.5 + 0.5 * Math.sin(dist * 34 - elapsedSeconds * 9.5);
          const push = falloff * (0.036 + 0.044 * rippleWave) * safeDt;
          const scatter = falloff * 0.03 * safeDt;
          x += (dx / dist) * push + (nextRand(sys) - 0.5) * 2 * scatter;
          y += (dy / dist) * push + (nextRand(sys) - 0.5) * 2 * scatter;
          frameSpeed += falloff * 0.05;
        } else {
          const push = falloff * falloff * 0.055 * safeDt;
          const scatter = falloff * 0.042 * safeDt;
          x += (dx / dist) * push + (nextRand(sys) - 0.5) * 2 * scatter;
          y += (dy / dist) * push + (nextRand(sys) - 0.5) * 2 * scatter;
          frameSpeed += falloff * 0.03;
        }
      }
    }

    // Giữ toàn bộ 3.600 hạt bên trong đĩa tròn chuẩn độ R_plate
    const r2 = x * x + y * y;
    if (r2 > 0.9604) {
      const r = Math.sqrt(r2);
      const clampR = 0.955 - nextRand(sys) * 0.04;
      x = (x / r) * clampR;
      y = (y / r) * clampR;
    }

    sys.x[i] = x;
    sys.y[i] = y;
    sys.speed[i] = frameSpeed;
  }
}

function drawChladniFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  sys: ChladniParticleSystem,
  contourBuf: ContourBuffer,
  activePillar: PillarId,
  elapsedSeconds: number,
  pointerActive: boolean,
  pointerPxX: number,
  pointerPxY: number,
): void {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const cx = width * 0.5;
  const cy = height * 0.5;
  const plateR = Math.max(76, Math.min(width - 48, height - 32, 360) * 0.5);

  // Nền đĩa với ánh kim hướng tâm cực dịu (#FFFFFF -> #F4F7F5 -> #E6ECE9)
  const plateBg = ctx.createRadialGradient(cx, cy, plateR * 0.08, cx, cy, plateR);
  plateBg.addColorStop(0, '#FFFFFF');
  plateBg.addColorStop(0.68, '#F4F7F5');
  plateBg.addColorStop(1, '#E6ECE9');
  ctx.beginPath();
  ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
  ctx.fillStyle = plateBg;
  ctx.fill();

  // Trục tọa độ trắc địa siêu mảnh (x, y) và vòng đồng tâm chia độ
  ctx.strokeStyle = 'rgba(30, 51, 46, 0.075)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(cx - plateR, cy);
  ctx.lineTo(cx + plateR, cy);
  ctx.moveTo(cx, cy - plateR);
  ctx.lineTo(cx, cy + plateR);
  ctx.stroke();

  ctx.beginPath();
  ctx.setLineDash([3, 5]);
  ctx.arc(cx, cy, plateR * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.2)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.setLineDash([]);

  // Trụ cột 3: Quầng nhịp thở điều hòa 4 giây ôm nhẹ vành đĩa
  if (activePillar === 3) {
    const breathAmp =
      0.5 -
      0.5 * Math.cos(((elapsedSeconds % BREATHING_PERIOD_S) / BREATHING_PERIOD_S) * Math.PI * 2);
    ctx.beginPath();
    ctx.arc(cx, cy, plateR - 4 - breathAmp * 12, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(59, 122, 101, ${(0.12 + breathAmp * 0.24).toFixed(3)})`;
    ctx.lineWidth = 1.0 + breathAmp * 0.8;
    ctx.stroke();
  }

  // Vành ngoài đĩa cộng hưởng & 72 vạch khắc chia độ đồng (5° / 30°)
  ctx.beginPath();
  ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(30, 51, 46, 0.28)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, plateR + 6, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.34)';
  ctx.lineWidth = 0.75;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, plateR + 10.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.25)';
  ctx.lineWidth = 0.6;
  ctx.stroke();

  for (let i = 0; i < 72; i += 1) {
    const rad = (i * 5 * Math.PI) / 180;
    const isMajor = i % 6 === 0;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const inner = plateR + 0.5;
    const outer = plateR + (isMajor ? 8.5 : 4.2);
    ctx.beginPath();
    ctx.moveTo(cx + cos * inner, cy + sin * inner);
    ctx.lineTo(cx + cos * outer, cy + sin * outer);
    ctx.strokeStyle = isMajor ? 'rgba(140, 98, 40, 0.56)' : 'rgba(30, 51, 46, 0.22)';
    ctx.lineWidth = isMajor ? 1.0 : 0.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + cos * (plateR + 10.5), cy + sin * (plateR + 10.5));
    ctx.lineTo(
      cx + cos * (plateR + (isMajor ? 14.5 : 12.8)),
      cy + sin * (plateR + (isMajor ? 14.5 : 12.8)),
    );
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.25)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // Trụ cột 1: Lớp Đường Đồng Mức Giải Tích Z(x, y) = 0 màu Đồng Cổ (rgba(156, 122, 76, 0.42), 1px)
  if (activePillar === 1 && contourBuf.count > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, plateR * 0.97, 0, Math.PI * 2);
    ctx.clip();

    ctx.beginPath();
    for (let i = 0; i < contourBuf.count; i += 1) {
      const base = i * 4;
      ctx.moveTo(
        cx + contourBuf.coords[base]! * plateR,
        cy + contourBuf.coords[base + 1]! * plateR,
      );
      ctx.lineTo(
        cx + contourBuf.coords[base + 2]! * plateR,
        cy + contourBuf.coords[base + 3]! * plateR,
      );
    }
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.42)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Vòng sóng nhiễu cục bộ hoặc 3 vòng sóng giao thoa thứ cấp khi chọn Trụ cột 2
  if (pointerActive) {
    const distFromCenter = Math.hypot(pointerPxX - cx, pointerPxY - cy);
    if (distFromCenter <= plateR + POINTER_INTERFERENCE_RADIUS_PX * 0.4) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
      ctx.clip();

      if (activePillar === 2) {
        const aura = ctx.createRadialGradient(
          pointerPxX,
          pointerPxY,
          2,
          pointerPxX,
          pointerPxY,
          POINTER_INTERFERENCE_RADIUS_PX,
        );
        aura.addColorStop(0, 'rgba(45, 82, 102, 0.16)');
        aura.addColorStop(0.6, 'rgba(156, 122, 76, 0.08)');
        aura.addColorStop(1, 'rgba(45, 82, 102, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(pointerPxX, pointerPxY, POINTER_INTERFERENCE_RADIUS_PX, 0, Math.PI * 2);
        ctx.fill();

        // 3 vòng sóng đồng tâm lan tỏa (#2D5266 & #9C7A4C)
        for (let ringIdx = 0; ringIdx < 3; ringIdx += 1) {
          const phase = (elapsedSeconds * 1.15 + ringIdx / 3) % 1;
          const rWave = 10 + phase * (POINTER_INTERFERENCE_RADIUS_PX - 10);
          const alpha = (1 - phase) * 0.65;
          ctx.beginPath();
          ctx.arc(pointerPxX, pointerPxY, rWave, 0, Math.PI * 2);
          ctx.strokeStyle =
            ringIdx % 2 === 0
              ? `rgba(45, 82, 102, ${alpha.toFixed(3)})`
              : `rgba(156, 122, 76, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.25 - phase * 0.5;
          ctx.stroke();
        }
      } else {
        const aura = ctx.createRadialGradient(
          pointerPxX,
          pointerPxY,
          2,
          pointerPxX,
          pointerPxY,
          POINTER_DISTURB_RADIUS_PX,
        );
        aura.addColorStop(0, 'rgba(156, 122, 76, 0.14)');
        aura.addColorStop(1, 'rgba(156, 122, 76, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(pointerPxX, pointerPxY, POINTER_DISTURB_RADIUS_PX, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.setLineDash([3, 4]);
        ctx.arc(pointerPxX, pointerPxY, POINTER_DISTURB_RADIUS_PX, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(156, 122, 76, 0.32)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }

  // LỚP 1: 2.600 hạt lõi Đá Phiến #1E332E (r = 1.25px) bám chặt vùng đường nút |Z| < 0.06
  ctx.fillStyle = 'rgba(30, 51, 46, 0.84)';
  ctx.beginPath();
  for (let i = 0; i < CHLADNI_CORE_COUNT; i += 1) {
    const px = cx + sys.x[i]! * plateR;
    const py = cy + sys.y[i]! * plateR;
    ctx.moveTo(px + 1.25, py);
    ctx.arc(px, py, 1.25, 0, Math.PI * 2);
  }
  ctx.fill();

  // LỚP 2a: 500 hạt bụi Vàng Đồng #9C7A4C (r = 1.0px + lấp lánh nhẹ theo vận tốc cục bộ)
  ctx.fillStyle = 'rgba(156, 122, 76, 0.88)';
  ctx.beginPath();
  for (let i = CHLADNI_CORE_COUNT; i < CHLADNI_TOTAL_PARTICLES; i += 1) {
    if (sys.layerKind[i] !== 1) continue;
    const px = cx + sys.x[i]! * plateR;
    const py = cy + sys.y[i]! * plateR;
    const glint =
      0.92 +
      Math.min(0.45, sys.speed[i]! * 10) +
      0.14 * Math.sin(elapsedSeconds * 5.2 + sys.shimmerPhase[i]!);
    const r = Math.max(0.75, 1.0 * glint);
    ctx.moveTo(px + r, py);
    ctx.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fill();

  // LỚP 2b: 500 hạt bụi Ngọc Bích #3B7A65 (r = 1.0px + lấp lánh nhẹ theo vận tốc cục bộ)
  ctx.fillStyle = 'rgba(59, 122, 101, 0.82)';
  ctx.beginPath();
  for (let i = CHLADNI_CORE_COUNT; i < CHLADNI_TOTAL_PARTICLES; i += 1) {
    if (sys.layerKind[i] !== 2) continue;
    const px = cx + sys.x[i]! * plateR;
    const py = cy + sys.y[i]! * plateR;
    const glint =
      0.92 +
      Math.min(0.45, sys.speed[i]! * 10) +
      0.14 * Math.cos(elapsedSeconds * 4.8 + sys.shimmerPhase[i]!);
    const r = Math.max(0.75, 1.0 * glint);
    ctx.moveTo(px + r, py);
    ctx.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.restore();
}

function stepModeDigit(current: number, other: number, delta: -1 | 1): number {
  let candidate = current + delta;
  if (candidate === other) {
    candidate += delta;
  }
  if (candidate < MIN_MODE || candidate > MAX_MODE) {
    return current;
  }
  return candidate;
}

/**
 * PHÂN KHU KẾT TRANG TRANG CHỦ: EDITORIAL MANIFESTO × CHLADNI RESONANCE (120FPS)
 * - Cột Trái (5 cột): Tuyên ngôn phương pháp học thuật, 3 trụ cột liên kết 2 chiều với Canvas,
 *   cụm CTA & Dải thông số tổng kết (40 Di sản · 04 Học phần · 122 Bài giảng KaTeX).
 * - Cột Phải (7 cột): Đài cộng hưởng sóng đứng Chladni 3.600 hạt khoáng thạch 2 tầng,
 *   4 preset + stepper (m, n) ∈ [2..12] (m ≠ n), âm ngân chuông đồng Web Audio (tắt mặc định).
 */
export function ChladniManifestoSection() {
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<{ readonly m: number; readonly n: number }>({ m: 3, n: 5 });
  const [activePillar, setActivePillar] = useState<PillarId>(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<{ readonly m: number; readonly n: number }>(mode);
  const pillarRef = useRef<PillarId>(activePillar);
  const soundEnabledRef = useRef<boolean>(isSoundEnabled);
  const excitationRef = useRef<number>(0.35);
  const particlesRef = useRef<ChladniParticleSystem | null>(null);
  const contourBufRef = useRef<ContourBuffer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBronzeChime = useCallback((mVal: number, nVal: number) => {
    if (!soundEnabledRef.current || typeof window === 'undefined') return;
    try {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtor();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        void audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const f0 = 180 + (mVal + nVal) * 22;
      const f1 = f0 * 2.756;

      const oscFundamental = audioCtx.createOscillator();
      const oscOvertone = audioCtx.createOscillator();
      const gainFundamental = audioCtx.createGain();
      const gainOvertone = audioCtx.createGain();

      oscFundamental.type = 'sine';
      oscFundamental.frequency.setValueAtTime(f0, now);

      oscOvertone.type = 'sine';
      oscOvertone.frequency.setValueAtTime(f1, now);

      gainFundamental.gain.setValueAtTime(0.0001, now);
      gainFundamental.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gainFundamental.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      gainOvertone.gain.setValueAtTime(0.0001, now);
      gainOvertone.gain.linearRampToValueAtTime(0.02, now + 0.02);
      gainOvertone.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

      oscFundamental.connect(gainFundamental);
      gainFundamental.connect(audioCtx.destination);
      oscOvertone.connect(gainOvertone);
      gainOvertone.connect(audioCtx.destination);

      oscFundamental.start(now);
      oscOvertone.start(now);
      oscFundamental.stop(now + 1.45);
      oscOvertone.stop(now + 1.45);
    } catch {
      // Bỏ qua an toàn khi môi trường không hỗ trợ Web Audio API
    }
  }, []);

  useEffect(() => {
    soundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  useEffect(() => {
    return () => {
      try {
        void audioCtxRef.current?.close();
      } catch {
        // Không làm gián đoạn quá trình unmount
      }
      audioCtxRef.current = null;
    };
  }, []);

  useEffect(() => {
    modeRef.current = mode;
    pillarRef.current = activePillar;
    excitationRef.current = 1.0;

    if (contourBufRef.current === null) {
      contourBufRef.current = createContourBuffer();
    }
    ensureAnalyticalContours(contourBufRef.current, mode.m, mode.n);

    // Với prefers-reduced-motion: hội tụ nhanh và vẽ 1 khung tĩnh mới khi đổi chế độ hoặc trụ cột
    if (prefersReducedMotion && canvasRef.current && stageRef.current) {
      if (particlesRef.current === null) {
        particlesRef.current = createChladniParticles();
      }
      const canvas = canvasRef.current;
      const ctx = getLowLatency2DContext(canvas, { alpha: true });
      if (!ctx) return;
      const rect = stageRef.current.getBoundingClientRect();
      const width = Math.max(280, Math.round(rect.width) || 520);
      const height = Math.max(280, Math.round(rect.height) || 380);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sys = particlesRef.current;
      for (let step = 0; step < 52; step += 1) {
        stepChladniParticles(
          sys,
          mode.m,
          mode.n,
          1.15,
          0.08,
          activePillar,
          0,
          false,
          0,
          0,
          0.1,
          0.2,
        );
      }
      drawChladniFrame(
        ctx,
        width,
        height,
        dpr,
        sys,
        contourBufRef.current,
        activePillar,
        0,
        false,
        0,
        0,
      );
    }
  }, [mode, activePillar, prefersReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    if (particlesRef.current === null) {
      particlesRef.current = createChladniParticles();
    }
    if (contourBufRef.current === null) {
      contourBufRef.current = createContourBuffer();
    }
    const sys = particlesRef.current;
    const contourBuf = contourBufRef.current;
    ensureAnalyticalContours(contourBuf, modeRef.current.m, modeRef.current.n);

    const ctx = getLowLatency2DContext(canvas, { alpha: true });
    if (!ctx) return;

    let width = Math.max(280, stage.clientWidth || 520);
    let height = Math.max(280, stage.clientHeight || 380);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let isVisible = true;
    let rafId = 0;
    let prevNow = performance.now();
    let elapsed = 0;

    let pointerActive = false;
    let pointerPxX = 0;
    let pointerPxY = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(280, stage.clientWidth || 520);
      height = Math.max(280, stage.clientHeight || 380);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    // Tiền hội tụ nhẹ ban đầu để ngay khung hình đầu tiên đã hiện hoa văn đối xứng sắc nét
    const initSteps = prefersReducedMotion ? 56 : 28;
    for (let s = 0; s < initSteps; s += 1) {
      stepChladniParticles(
        sys,
        modeRef.current.m,
        modeRef.current.n,
        1.1,
        0.12,
        pillarRef.current,
        0,
        false,
        0,
        0,
        0.1,
        0.2,
      );
    }
    drawChladniFrame(ctx, width, height, dpr, sys, contourBuf, pillarRef.current, 0, false, 0, 0);

    const updatePointerCoords = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerPxX = event.clientX - rect.left;
      pointerPxY = event.clientY - rect.top;
      pointerActive = true;
    };

    const onPointerDown = (event: PointerEvent) => {
      updatePointerCoords(event);
      playBronzeChime(modeRef.current.m, modeRef.current.n);
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointerCoords(event);
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });
    canvas.addEventListener('pointercancel', onPointerLeave, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        resize();
        drawChladniFrame(
          ctx,
          width,
          height,
          dpr,
          sys,
          contourBuf,
          pillarRef.current,
          elapsed,
          pointerActive,
          pointerPxX,
          pointerPxY,
        );
      });
      resizeObserver.observe(stage);
    }

    if (prefersReducedMotion) {
      return () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('pointercancel', onPointerLeave);
        resizeObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      if (!isVisible) {
        rafId = 0;
        return;
      }

      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;
      elapsed += dtSeconds;

      if (!document.hidden) {
        excitationRef.current = Math.max(0, excitationRef.current - dtSeconds * 1.45);
        const plateR = Math.max(76, Math.min(width - 48, height - 32, 360) * 0.5);
        const cx = width * 0.5;
        const cy = height * 0.5;
        const pNormX = (pointerPxX - cx) / plateR;
        const pNormY = (pointerPxY - cy) / plateR;
        const pNormRadius = POINTER_DISTURB_RADIUS_PX / plateR;
        const interferenceRadius = POINTER_INTERFERENCE_RADIUS_PX / plateR;

        stepChladniParticles(
          sys,
          modeRef.current.m,
          modeRef.current.n,
          dtScale,
          excitationRef.current,
          pillarRef.current,
          elapsed,
          pointerActive,
          pNormX,
          pNormY,
          pNormRadius,
          interferenceRadius,
        );
        drawChladniFrame(
          ctx,
          width,
          height,
          dpr,
          sys,
          contourBuf,
          pillarRef.current,
          elapsed,
          pointerActive,
          pointerPxX,
          pointerPxY,
        );
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId !== 0) return;
      prevNow = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = entry ? entry.isIntersecting : true;
          if (isVisible) startLoop();
          else stopLoop();
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(section);
    }

    startLoop();

    return () => {
      stopLoop();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerLeave);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [prefersReducedMotion, playBronzeChime]);

  const handleSelectMode = (nextM: number, nextN: number) => {
    if (nextM === nextN) return;
    setMode({ m: nextM, n: nextN });
    playBronzeChime(nextM, nextN);
  };

  const nextMDown = stepModeDigit(mode.m, mode.n, -1);
  const nextMUp = stepModeDigit(mode.m, mode.n, 1);
  const nextNDown = stepModeDigit(mode.n, mode.m, -1);
  const nextNUp = stepModeDigit(mode.n, mode.m, 1);

  return (
    <section
      ref={sectionRef}
      id="tuyen-ngon-chladni"
      data-testid="chladni-manifesto-section"
      aria-label="Tuyên ngôn học thuật và Đài cộng hưởng sóng đứng Chladni"
      className="relative scroll-mt-20 border-t border-[#D4DFDA] bg-[#F2F4F3] text-[#142622] dark:border-[#1E3B2D] dark:bg-[#0E1A15] dark:text-[#E6ECE7]"
    >
      {/* Dấu cộng chuẩn trực (+) trên đường ngăn kỹ thuật 1px solid #D4DFDA */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1400px] justify-between px-6 lg:px-10"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-20 lg:px-10 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* CỘT TRÁI (5 cột): Tuyên Ngôn Phương Pháp Học Thuật + Liên Kết Trụ Cột ↔ Đài Sóng */}
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-3">
              <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#8C6228] uppercase dark:text-[#D5B47A]">
                SEC. 03 // KIẾN TRÚC TRI THỨC
              </p>
              <h2 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#142622] lg:text-4xl dark:text-[#E6ECE7]">
                Khi trực giác hình học gặp gỡ chiều sâu tiên đề.
              </h2>
            </div>

            {/* 3 Trụ cột tương tác 2 chiều với Đài Sóng Chladni bên phải */}
            <ol className="divide-y divide-[#D8E1DD] border-y border-[#D8E1DD] dark:divide-[#1E3B2D] dark:border-[#1E3B2D]">
              {MANIFESTO_PILLARS.map((pillar) => {
                const isActive = activePillar === pillar.id;
                return (
                  <li key={pillar.index}>
                    <button
                      type="button"
                      data-testid={`chladni-pillar-${pillar.id}`}
                      aria-pressed={isActive}
                      onClick={() => setActivePillar(pillar.id)}
                      onMouseEnter={() => setActivePillar(pillar.id)}
                      className={cn(
                        'w-full cursor-pointer border-l-2 py-3.5 pr-3 pl-3.5 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#1E332E] focus-visible:outline-none',
                        isActive
                          ? 'border-[#9C7A4C] bg-[#FAFBF9]/70 dark:border-[#D5B47A] dark:bg-[#12241C]/80'
                          : 'border-transparent hover:bg-[#FAFBF9]/45 dark:hover:bg-[#12241C]/45',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#8C6228] tabular-nums dark:text-[#D5B47A]">
                            {pillar.index} ·
                          </span>
                          <h3 className="font-serif text-base font-bold text-[#142622] dark:text-[#E6ECE7]">
                            {pillar.title}
                          </h3>
                        </div>
                        {isActive && (
                          <span className="shrink-0 rounded-full border border-[#9C7A4C]/35 bg-[#FAF8F4] px-2 py-0.5 font-mono text-[9.5px] font-bold tracking-wider text-[#8C6228] uppercase dark:border-[#D5B47A]/40 dark:bg-[#1A2F25] dark:text-[#D5B47A]">
                            ĐANG HIỂN THỊ
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#2D423D] dark:text-[#B9C8C1]">
                        {pillar.description}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Cụm nút kết trang (Clear Conversion CTA) */}
            <div>
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  to={ROUTES.learningSpace}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1E332E] px-5 py-3 text-sm font-semibold text-[#FAFBF9] shadow-[0_10px_24px_rgba(30,51,46,0.16)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#28443D] active:scale-[0.98] dark:bg-[#245746] dark:hover:bg-[#2E6E58]"
                >
                  <span>Bước vào Không gian học tập</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  to={ROUTES.glossary}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#CFD9D5] bg-[#FAFBF9] px-5 py-3 text-sm font-semibold text-[#182624] shadow-xs transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#9C7A4C]/65 hover:bg-[#E7ECEA] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
                >
                  <span>Khám phá Kho Thuật ngữ</span>
                  <ArrowRight
                    className="h-4 w-4 text-[#8C6228] dark:text-[#D5B47A]"
                    aria-hidden="true"
                  />
                </Link>
              </div>

              {/* Dải Thông Số Tổng Kết Liền Khối */}
              <div
                data-testid="chladni-summary-strip"
                className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#D8E1DD] pt-5 font-mono text-[11px] font-medium tracking-wider text-[#5C706A] dark:border-[#1E3B2D] dark:text-[#98ABA3]"
              >
                <span>40 DI SẢN XÁC THỰC</span>
                <span aria-hidden="true" className="text-[#9C7A4C] dark:text-[#D5B47A]">
                  ·
                </span>
                <span>04 HỌC PHẦN</span>
                <span aria-hidden="true" className="text-[#9C7A4C] dark:text-[#D5B47A]">
                  ·
                </span>
                <span>122 BÀI GIẢNG KATEX</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (7 cột): Đài Cộng Hưởng Sóng Đứng Chladni 120FPS */}
          <div className="lg:col-span-7">
            <div
              data-testid="chladni-resonance-card"
              className="relative overflow-hidden rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] shadow-[0_18px_48px_rgba(24,38,36,0.06)] dark:border-[#1E3B2D] dark:bg-[#12241C]"
            >
              {/* 4 góc thước ngắm bản vẽ chữ L mảnh sát mép ngoài thẻ */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 left-2 z-20 h-3 w-3 border-t-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 right-2 z-20 h-3 w-3 border-t-[1.5px] border-r-[1.5px] border-[#9C7A4C]/70"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 left-2 z-20 h-3 w-3 border-b-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2 bottom-2 z-20 h-3 w-3 border-r-[1.5px] border-b-[1.5px] border-[#9C7A4C]/70"
              />

              {/* Thanh đầu thẻ: Phương trình sóng đứng, chỉ số (m, n), stepper m/n & nút Chuông đồng */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#E2E8E5] bg-[#F7F9F8] px-6 py-4 dark:border-[#1E3B2D] dark:bg-[#0E1A15]">
                <span className="lu-fx-band-formula text-[#142622] dark:text-[#E6ECE7]">
                  cos(nπx)cos(mπy) − cos(mπx)cos(nπy) = 0
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    data-testid="chladni-mode-indicator"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4E0] bg-[#FAFBF9] px-3 py-0.5 font-mono text-[11px] font-semibold text-[#8C6228] tabular-nums dark:border-[#244335] dark:bg-[#12241C] dark:text-[#D5B47A]"
                  >
                    <span>(m, n) =</span>
                    <span className="text-[#142622] dark:text-[#E6ECE7]">
                      ({mode.m}, {mode.n})
                    </span>
                  </span>

                  {/* Stepper tinh chỉnh m ∈ [2..12] */}
                  <div
                    role="group"
                    aria-label="Tinh chỉnh tần số m"
                    className="inline-flex items-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-1 py-0.5 font-mono text-[10.5px] font-semibold dark:border-[#244335] dark:bg-[#12241C]"
                  >
                    <button
                      type="button"
                      aria-label="Giảm m"
                      disabled={nextMDown === mode.m}
                      onClick={() => handleSelectMode(nextMDown, mode.n)}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#2D423D] transition-colors hover:bg-[#E7ECEA] disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#C9D6D0] dark:hover:bg-[#1B3328]"
                    >
                      <Minus className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                    <span className="px-1 text-[#8C6228] select-none dark:text-[#D5B47A]">m</span>
                    <button
                      type="button"
                      aria-label="Tăng m"
                      disabled={nextMUp === mode.m}
                      onClick={() => handleSelectMode(nextMUp, mode.n)}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#2D423D] transition-colors hover:bg-[#E7ECEA] disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#C9D6D0] dark:hover:bg-[#1B3328]"
                    >
                      <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Stepper tinh chỉnh n ∈ [2..12] */}
                  <div
                    role="group"
                    aria-label="Tinh chỉnh tần số n"
                    className="inline-flex items-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-1 py-0.5 font-mono text-[10.5px] font-semibold dark:border-[#244335] dark:bg-[#12241C]"
                  >
                    <button
                      type="button"
                      aria-label="Giảm n"
                      disabled={nextNDown === mode.n}
                      onClick={() => handleSelectMode(mode.m, nextNDown)}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#2D423D] transition-colors hover:bg-[#E7ECEA] disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#C9D6D0] dark:hover:bg-[#1B3328]"
                    >
                      <Minus className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                    <span className="px-1 text-[#8C6228] select-none dark:text-[#D5B47A]">n</span>
                    <button
                      type="button"
                      aria-label="Tăng n"
                      disabled={nextNUp === mode.n}
                      onClick={() => handleSelectMode(mode.m, nextNUp)}
                      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#2D423D] transition-colors hover:bg-[#E7ECEA] disabled:cursor-not-allowed disabled:opacity-35 dark:text-[#C9D6D0] dark:hover:bg-[#1B3328]"
                    >
                      <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Nút bật/tắt âm ngân chuông đồng (tắt mặc định) */}
                  <button
                    type="button"
                    data-testid="chladni-sound-toggle"
                    aria-pressed={isSoundEnabled}
                    aria-label={
                      isSoundEnabled
                        ? 'Tắt âm ngân chuông đồng cộng hưởng'
                        : 'Bật âm ngân chuông đồng cộng hưởng'
                    }
                    title={
                      isSoundEnabled
                        ? 'Tắt âm ngân chuông đồng cộng hưởng'
                        : 'Bật âm ngân chuông đồng cộng hưởng'
                    }
                    onClick={() => setIsSoundEnabled((prev) => !prev)}
                    className={cn(
                      'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-colors',
                      isSoundEnabled
                        ? 'border-[#9C7A4C] bg-[#9C7A4C] text-[#FAFBF9] shadow-2xs dark:border-[#D5B47A] dark:bg-[#D5B47A] dark:text-[#142622]'
                        : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#4A5D58] hover:border-[#9C7A4C] hover:text-[#142622] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#98ABA3] dark:hover:border-[#D5B47A]',
                    )}
                  >
                    {isSoundEnabled ? (
                      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sân khấu Canvas đĩa cộng hưởng 3.600 hạt khoáng thạch 2 tầng */}
              <div
                ref={stageRef}
                className="relative h-[320px] w-full overflow-hidden bg-[#FAFBF9] sm:h-[390px] lg:h-[420px] dark:bg-[#12241C]"
              >
                <canvas
                  ref={canvasRef}
                  data-testid="chladni-resonance-canvas"
                  data-particle-count={CHLADNI_TOTAL_PARTICLES}
                  aria-label="Mô phỏng tương tác sóng đứng Chladni 3.600 hạt khoáng thạch"
                  className="block h-full w-full cursor-crosshair touch-none"
                />
              </div>

              {/* 4 nút chọn chế độ cộng hưởng đặt gọn dưới đáy khung */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8E5] bg-[#F7F9F8] px-6 py-4 dark:border-[#1E3B2D] dark:bg-[#0E1A15]">
                <div
                  role="group"
                  aria-label="Chọn chế độ cộng hưởng sóng đứng Chladni"
                  className="flex flex-wrap items-center gap-2"
                >
                  {CHLADNI_PRESETS.map((preset) => {
                    const isSelected = mode.m === preset.m && mode.n === preset.n;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectMode(preset.m, preset.n)}
                        className={cn(
                          'cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all duration-150 active:scale-[0.98]',
                          isSelected
                            ? 'border-[#1E332E] bg-[#1E332E] text-[#FAFBF9] shadow-2xs dark:border-[#6EB59B] dark:bg-[#245746] dark:text-[#FAFBF9]'
                            : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#2D423D] hover:border-[#9C7A4C] hover:bg-[#EDF2F0] hover:text-[#142622] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0] dark:hover:border-[#D5B47A] dark:hover:text-[#E6ECE7]',
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <span className="hidden font-mono text-[10.5px] text-[#4A5D58] sm:inline dark:text-[#98ABA3]">
                  3.600 hạt khoáng thạch · Di chuột để khuấy sóng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Đường viền kép mảnh Đồng Trầm (1px solid #9C7A4C/40) chuyển tiếp gọn xuống Footer Đá Phiến Trầm (#142622) */}
      <div
        aria-hidden="true"
        data-testid="chladni-footer-seam"
        className="w-full bg-[#F2F4F3] pt-1 dark:bg-[#0E1A15]"
      >
        <div className="h-[5px] w-full border-y border-[#9C7A4C]/40 bg-[#EAEFED] dark:bg-[#12241C]" />
      </div>
    </section>
  );
}

export default ChladniManifestoSection;
