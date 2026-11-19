import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import {
  computeFrameDelta,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';
import {
  angleLerp,
  ARMILLARY_RINGS,
  type ArmillaryRingSpec,
  BLUEPRINT_SYMBOLS,
  CORE_TIER1_SCALE,
  CRYSTAL_FACES,
  CRYSTAL_VERTICES,
  DIAL_TRIG_360,
  formatAlidadeAngle,
  HALF_LIGHT_VEC,
  HARMONIC_WAVE_POINTS,
  ICO_FACES,
  ICO_TIER1_SCALE,
  ICO_VERTICES,
  LIGHT_DIR,
  type ProjectedPoint,
  projectPointInto,
  rotateVec3ScaledInto,
  SHININESS_BLINN,
  SPHERICAL_WAVE_TRIG,
  type Vec3,
} from './heroSculptureGeometry';

interface ShadedTriangleBuffer {
  indices: [number, number, number];
  p0: ProjectedPoint;
  p1: ProjectedPoint;
  p2: ProjectedPoint;
  avgZ: number;
  light: number;
  specular: number;
  fresnel: number;
  isFront: boolean;
}

interface DragPhysicsState {
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  isDragging: boolean;
  lastX: number;
  lastY: number;
  manualOffsetX: number;
  manualOffsetY: number;
  lastMoveMs: number;
}

interface ResonancePulse {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  x2: number;
  y2: number;
  hasPairTether: boolean;
}

interface HoverWave {
  active: boolean;
  progress: number;
}

const MAX_RESONANCE_PULSES = 8;
const RESONANCE_COOLDOWN_MS = 900;
const SYMBOL_PROXIMITY_PX = 110;
const FACET_HOVER_RADIUS_PX = 160;
const BASE_AUTO_SPEED_X = 0.18 / 60;
const BASE_AUTO_SPEED_Y = 0.25 / 60;
const RADAR_SPEED = 0.42;
const RADAR_SECTOR_RAD = 0.38;
const RADAR_HIT_RAD = 0.22;
const DRAG_SENSITIVITY = 0.0075;

function createZeroVec3Array(count: number): Vec3[] {
  const arr: Vec3[] = [];
  for (let i = 0; i < count; i += 1) {
    arr.push({ x: 0, y: 0, z: 0 });
  }
  return arr;
}

function createZeroProjArray(count: number): ProjectedPoint[] {
  const arr: ProjectedPoint[] = [];
  for (let i = 0; i < count; i += 1) {
    arr.push({ x: 0, y: 0, z: 0, scale: 1 });
  }
  return arr;
}

function projectPolyhedronIntoBuffers(
  vertices: readonly Vec3[],
  faces: readonly (readonly [number, number, number])[],
  scaleFactor: number,
  normalExplosionPx: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  cx: number,
  cy: number,
  fov: number,
  worldOut: Vec3[],
  projOut: ProjectedPoint[],
  facePool: ShadedTriangleBuffer[],
  backOut: ShadedTriangleBuffer[],
  frontOut: ShadedTriangleBuffer[],
  tmpShiftVec: Vec3,
): void {
  for (let i = 0; i < vertices.length; i += 1) {
    const w = rotateVec3ScaledInto(vertices[i]!, scaleFactor, rotX, rotY, rotZ, worldOut[i]!);
    projectPointInto(w, cx, cy, fov, projOut[i]!);
  }

  backOut.length = 0;
  frontOut.length = 0;
  const shiftWorld = normalExplosionPx > 0.001 ? normalExplosionPx / (fov / 3.35) : 0;

  for (let f = 0; f < faces.length; f += 1) {
    const tri = faces[f]!;
    const i0 = tri[0];
    const i1 = tri[1];
    const i2 = tri[2];

    const w0 = worldOut[i0]!;
    const w1 = worldOut[i1]!;
    const w2 = worldOut[i2]!;

    const e1x = w1.x - w0.x;
    const e1y = w1.y - w0.y;
    const e1z = w1.z - w0.z;
    const e2x = w2.x - w0.x;
    const e2y = w2.y - w0.y;
    const e2z = w2.z - w0.z;

    let nx = e1y * e2z - e1z * e2y;
    let ny = e1z * e2x - e1x * e2z;
    let nz = e1x * e2y - e1y * e2x;
    const nLen = Math.hypot(nx, ny, nz) || 1;
    nx /= nLen;
    ny /= nLen;
    nz /= nLen;

    const item = facePool[f]!;
    item.indices[0] = i0;
    item.indices[1] = i1;
    item.indices[2] = i2;

    if (shiftWorld > 0) {
      // Đảm bảo vector pháp tuyến luôn hướng ra ngoài khi mở khe hở vi mô theo pháp tuyến mặt
      const centroidDot =
        (w0.x + w1.x + w2.x) * nx + (w0.y + w1.y + w2.y) * ny + (w0.z + w1.z + w2.z) * nz;
      const outSign = centroidDot >= 0 ? 1 : -1;
      const sx = nx * outSign * shiftWorld;
      const sy = ny * outSign * shiftWorld;
      const sz = nz * outSign * shiftWorld;

      tmpShiftVec.x = w0.x + sx;
      tmpShiftVec.y = w0.y + sy;
      tmpShiftVec.z = w0.z + sz;
      projectPointInto(tmpShiftVec, cx, cy, fov, item.p0);

      tmpShiftVec.x = w1.x + sx;
      tmpShiftVec.y = w1.y + sy;
      tmpShiftVec.z = w1.z + sz;
      projectPointInto(tmpShiftVec, cx, cy, fov, item.p1);

      tmpShiftVec.x = w2.x + sx;
      tmpShiftVec.y = w2.y + sy;
      tmpShiftVec.z = w2.z + sz;
      projectPointInto(tmpShiftVec, cx, cy, fov, item.p2);
    } else {
      const p0 = projOut[i0]!;
      const p1 = projOut[i1]!;
      const p2 = projOut[i2]!;
      item.p0.x = p0.x;
      item.p0.y = p0.y;
      item.p0.z = p0.z;
      item.p0.scale = p0.scale;
      item.p1.x = p1.x;
      item.p1.y = p1.y;
      item.p1.z = p1.z;
      item.p1.scale = p1.scale;
      item.p2.x = p2.x;
      item.p2.y = p2.y;
      item.p2.z = p2.z;
      item.p2.scale = p2.scale;
    }

    item.avgZ = (item.p0.z + item.p1.z + item.p2.z) / 3;
    item.light = Math.max(0, nx * LIGHT_DIR.x + ny * LIGHT_DIR.y + nz * LIGHT_DIR.z);
    const halfDot = Math.max(
      0,
      nx * HALF_LIGHT_VEC.x + ny * HALF_LIGHT_VEC.y + nz * HALF_LIGHT_VEC.z,
    );
    item.specular = Math.pow(halfDot, SHININESS_BLINN);
    item.fresnel = Math.pow(1 - Math.max(0, nz), 2.2);
    item.isFront = nz >= 0;

    if (item.isFront) frontOut.push(item);
    else backOut.push(item);
  }

  backOut.sort((a, b) => a.avgZ - b.avgZ);
  frontOut.sort((a, b) => a.avgZ - b.avgZ);
}

function drawAstrolabeBackdropAndAlidade(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  minDim: number,
  alphaCurr: number,
  radarAngle: number,
): void {
  const unitScale = minDim / 460;
  const outerR = 185 * unitScale;
  const innerR = 178 * unitScale;
  const axisExtent = 198 * unitScale;
  const coreClearR = outerR * 0.36;

  ctx.save();

  // Hai vòng chia độ ngoại vi đồng tâm R_dial = 185px & 178px (tỉ lệ unitScale)
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(30, 58, 52, 0.24)';
  ctx.lineWidth = 0.85;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(140, 109, 63, 0.26)';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // Vòng phân cách Tầng 2 (0.48..0.78) và Tầng 3 (0.88..1.0)
  ctx.beginPath();
  ctx.arc(cx, cy, outerR * 0.82, 0, Math.PI * 2);
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = 'rgba(45, 82, 102, 0.14)';
  ctx.lineWidth = 0.65;
  ctx.stroke();
  ctx.setLineDash([]);

  // G. Quét Radar Thiên Văn 22° (0.38 rad) nhẹ nhàng ngoài Tầng 1
  const sweepSlices = 10;
  for (let s = 0; s < sweepSlices; s += 1) {
    const sliceStart = radarAngle - RADAR_SECTOR_RAD * ((sweepSlices - s) / sweepSlices);
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, sliceStart, radarAngle, false);
    ctx.arc(cx, cy, coreClearR, radarAngle, sliceStart, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(36, 87, 70, 0.0055)';
    ctx.fill();
  }

  const sweepCos = Math.cos(radarAngle);
  const sweepSin = Math.sin(radarAngle);
  ctx.beginPath();
  ctx.moveTo(cx + sweepCos * coreClearR, cy + sweepSin * coreClearR);
  ctx.lineTo(cx + sweepCos * outerR, cy + sweepSin * outerR);
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.4)';
  ctx.lineWidth = 0.85;
  ctx.stroke();

  // 360 vạch chia độ mảnh 0.5px, mỗi 15° vạch dài hơn kèm chấm mốc tọa độ nhỏ
  for (let deg = 0; deg < 360; deg += 1) {
    const t = DIAL_TRIG_360[deg]!;
    const tickStart = t.isMajor15
      ? innerR - 7.5 * unitScale
      : t.isMedium5
        ? innerR - 3.2 * unitScale
        : innerR + 1.2 * unitScale;

    ctx.beginPath();
    ctx.moveTo(cx + t.cos * tickStart, cy + t.sin * tickStart);
    ctx.lineTo(cx + t.cos * outerR, cy + t.sin * outerR);
    ctx.strokeStyle = t.isMajor15
      ? 'rgba(30, 58, 52, 0.42)'
      : t.isMedium5
        ? 'rgba(140, 109, 63, 0.30)'
        : 'rgba(30, 58, 52, 0.18)';
    ctx.lineWidth = t.isMajor15 ? 0.85 : 0.5;
    ctx.stroke();

    if (t.isMajor15) {
      const dotR = (deg % 45 === 0 ? 1.55 : 1.05) * Math.max(0.85, unitScale);
      const dotRadiusPos = outerR + 5.5 * unitScale;
      ctx.beginPath();
      ctx.arc(cx + t.cos * dotRadiusPos, cy + t.sin * dotRadiusPos, dotR, 0, Math.PI * 2);
      ctx.fillStyle = deg % 90 === 0 ? 'rgba(140, 109, 63, 0.62)' : 'rgba(36, 87, 70, 0.42)';
      ctx.fill();
    }
  }

  // 2 trục chuẩn trực vuông góc & đường chéo 45° chừa khoảng sạch Tầng 1 (0 -> 0.36 * R_dial)
  for (const angleDeg of [0, 45, 90, 135]) {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const isCardinal = angleDeg % 90 === 0;
    const reach = isCardinal ? axisExtent : outerR * 0.96;

    ctx.beginPath();
    ctx.moveTo(cx - cos * reach, cy - sin * reach);
    ctx.lineTo(cx - cos * coreClearR, cy - sin * coreClearR);
    ctx.moveTo(cx + cos * coreClearR, cy + sin * coreClearR);
    ctx.lineTo(cx + cos * reach, cy + sin * reach);
    ctx.strokeStyle = isCardinal ? 'rgba(30, 58, 52, 0.14)' : 'rgba(140, 109, 63, 0.11)';
    ctx.lineWidth = isCardinal ? 0.7 : 0.55;
    ctx.stroke();

    const perpX = -sin;
    const perpY = cos;
    const reticleSteps = isCardinal ? [0.43, 0.62, 0.82] : [0.46, 0.76];
    for (const frac of reticleSteps) {
      for (const sign of [-1, 1]) {
        const px = cx + cos * (outerR * frac * sign);
        const py = cy + sin * (outerR * frac * sign);
        const halfLen = (isCardinal ? 3.2 : 2.2) * unitScale;
        ctx.beginPath();
        ctx.moveTo(px - perpX * halfLen, py - perpY * halfLen);
        ctx.lineTo(px + perpX * halfLen, py + perpY * halfLen);
        ctx.strokeStyle = isCardinal ? 'rgba(30, 58, 52, 0.24)' : 'rgba(140, 109, 63, 0.2)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  // D. Kim Chỉ Góc Khóa Theo Con Trỏ Chuột (Interactive Cursor-Tracking Alidade & Vernier Arc)
  const vernierHalfSpan = (12 * Math.PI) / 180;
  const vernierR = outerR + 1.5 * unitScale;
  ctx.beginPath();
  ctx.arc(cx, cy, vernierR, alphaCurr - vernierHalfSpan, alphaCurr + vernierHalfSpan);
  ctx.strokeStyle = '#1E332E';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Các vạch chia du xích nhỏ dọc theo cung Vernier (±12°)
  for (let sub = -4; sub <= 4; sub += 1) {
    const aSub = alphaCurr + (sub / 4) * vernierHalfSpan;
    const cS = Math.cos(aSub);
    const sS = Math.sin(aSub);
    const len =
      sub === 0 ? 6.5 * unitScale : Math.abs(sub) % 2 === 0 ? 4.2 * unitScale : 2.6 * unitScale;
    ctx.beginPath();
    ctx.moveTo(cx + cS * (vernierR - 1), cy + sS * (vernierR - 1));
    ctx.lineTo(cx + cS * (vernierR + len), cy + sS * (vernierR + len));
    ctx.strokeStyle = sub === 0 ? '#9C7A4C' : 'rgba(30, 51, 46, 0.58)';
    ctx.lineWidth = sub === 0 ? 1.15 : 0.7;
    ctx.stroke();
  }

  // Đường gióng siêu mảnh nối đối xứng α_curr <-> α_curr + π
  const cosA = Math.cos(alphaCurr);
  const sinA = Math.sin(alphaCurr);
  const perpX = -sinA;
  const perpY = cosA;

  ctx.beginPath();
  ctx.moveTo(cx + cosA * (outerR * 0.78), cy + sinA * (outerR * 0.78));
  ctx.lineTo(cx + cosA * (outerR + 3 * unitScale), cy + sinA * (outerR + 3 * unitScale));
  ctx.moveTo(cx - cosA * (outerR * 0.78), cy - sinA * (outerR * 0.78));
  ctx.lineTo(cx - cosA * (outerR + 2 * unitScale), cy - sinA * (outerR + 2 * unitScale));
  ctx.strokeStyle = 'rgba(30, 51, 46, 0.25)';
  ctx.setLineDash([2, 3]);
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.setLineDash([]);

  // Kim chỉ góc tam giác rỗng (Hollow Alidade Pointer) tại α_curr
  const tipR = outerR - 1.5 * unitScale;
  const baseR = outerR + 10 * unitScale;
  const halfBase = 4.2 * unitScale;
  ctx.beginPath();
  ctx.moveTo(cx + cosA * tipR, cy + sinA * tipR);
  ctx.lineTo(cx + cosA * baseR + perpX * halfBase, cy + sinA * baseR + perpY * halfBase);
  ctx.lineTo(cx + cosA * baseR - perpX * halfBase, cy + sinA * baseR - perpY * halfBase);
  ctx.closePath();
  ctx.fillStyle = 'rgba(250, 251, 249, 0.85)';
  ctx.fill();
  ctx.strokeStyle = '#1E332E';
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Con chạy đối xứng ở góc α_curr + π
  const oppAngle = alphaCurr + Math.PI;
  const oppSpan = (8 * Math.PI) / 180;
  ctx.beginPath();
  ctx.arc(cx, cy, vernierR, oppAngle - oppSpan, oppAngle + oppSpan);
  ctx.strokeStyle = 'rgba(30, 51, 46, 0.45)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  const cBaseR = outerR + 7.2 * unitScale;
  const cHalf = 3.0 * unitScale;
  ctx.beginPath();
  ctx.moveTo(cx - cosA * (outerR - 0.5 * unitScale), cy - sinA * (outerR - 0.5 * unitScale));
  ctx.lineTo(cx - cosA * cBaseR + perpX * cHalf, cy - sinA * cBaseR + perpY * cHalf);
  ctx.lineTo(cx - cosA * cBaseR - perpX * cHalf, cy - sinA * cBaseR - perpY * cHalf);
  ctx.closePath();
  ctx.fillStyle = '#FAFBF9';
  ctx.fill();
  ctx.strokeStyle = '#8C6D3F';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // Nhãn giá trị góc độ/radian trượt gọn theo kim chỉ góc
  const labelText = formatAlidadeAngle(alphaCurr);
  const labelR = outerR + 21 * unitScale;
  const lx = cx + cosA * labelR;
  const ly = cy + sinA * labelR;
  ctx.font = '500 9.5px "JetBrains Mono Variable", ui-monospace, monospace';
  ctx.fillStyle = '#4A5D58';
  ctx.textBaseline = 'middle';
  ctx.textAlign = cosA > 0.25 ? 'left' : cosA < -0.25 ? 'right' : 'center';
  ctx.fillText(labelText, lx, ly);

  ctx.restore();
}

function drawArmillaryRingHalf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  ring: ArmillaryRingSpec,
  ringIdx: number,
  fov: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  time: number,
  drawFrontHalf: boolean,
  outerProjBuf: ProjectedPoint[],
  innerProjBuf: ProjectedPoint[],
  satWorldOut: Vec3,
  satProjOut: ProjectedPoint,
  tmpVec: Vec3,
  tmpInner: Vec3,
  tmpPt: ProjectedPoint,
): void {
  const segments = 96;

  for (let i = 0; i <= segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    tmpVec.x = cos * ring.radiusX;
    tmpVec.y = sin * ring.radiusY;
    tmpVec.z = 0;
    rotateVec3ScaledInto(tmpVec, 1, rotX, rotY, rotZ, tmpVec);
    projectPointInto(tmpVec, cx, cy, fov, outerProjBuf[i]!);

    if (ring.isDoubleRim) {
      tmpInner.x = cos * ring.radiusX * ring.innerRatio;
      tmpInner.y = sin * ring.radiusY * ring.innerRatio;
      tmpInner.z = 0;
      rotateVec3ScaledInto(tmpInner, 1, rotX, rotY, rotZ, tmpInner);
      projectPointInto(tmpInner, cx, cy, fov, innerProjBuf[i]!);
    }
  }

  for (let i = 0; i < segments; i += 1) {
    const p1 = outerProjBuf[i]!;
    const p2 = outerProjBuf[i + 1]!;
    const avgZ = (p1.z + p2.z) * 0.5;
    if (avgZ >= 0 !== drawFrontHalf) continue;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = ring.ringColor;
    ctx.globalAlpha = drawFrontHalf ? Math.min(0.88, 0.58 + avgZ * 0.3) : 0.32;
    ctx.lineWidth = drawFrontHalf ? ring.strokeWidth : 0.7;
    ctx.stroke();

    if (ring.isDoubleRim) {
      const ip1 = innerProjBuf[i]!;
      const ip2 = innerProjBuf[i + 1]!;
      ctx.beginPath();
      ctx.moveTo(ip1.x, ip1.y);
      ctx.lineTo(ip2.x, ip2.y);
      ctx.strokeStyle = '#8C6D3F';
      ctx.globalAlpha = drawFrontHalf ? 0.58 : 0.22;
      ctx.lineWidth = drawFrontHalf ? 0.9 : 0.55;
      ctx.stroke();
    }
  }

  // Nan hoa chia độ 3D nối vành khuyên kép
  const stepDeg = Math.round(360 / ring.spokeCount);
  for (let deg = 0; deg < 360; deg += stepDeg) {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    tmpVec.x = cos * ring.radiusX;
    tmpVec.y = sin * ring.radiusY;
    tmpVec.z = 0;
    rotateVec3ScaledInto(tmpVec, 1, rotX, rotY, rotZ, tmpVec);
    if (tmpVec.z >= 0 !== drawFrontHalf) continue;

    const innerScale = ring.isDoubleRim ? ring.innerRatio : deg % 30 === 0 ? 0.945 : 0.97;
    tmpInner.x = cos * ring.radiusX * innerScale;
    tmpInner.y = sin * ring.radiusY * innerScale;
    tmpInner.z = 0;
    rotateVec3ScaledInto(tmpInner, 1, rotX, rotY, rotZ, tmpInner);

    projectPointInto(tmpVec, cx, cy, fov, tmpPt);
    const ox = tmpPt.x;
    const oy = tmpPt.y;
    projectPointInto(tmpInner, cx, cy, fov, tmpPt);

    ctx.beginPath();
    ctx.moveTo(tmpPt.x, tmpPt.y);
    ctx.lineTo(ox, oy);
    ctx.strokeStyle = deg % 90 === 0 ? '#8C6D3F' : ring.ringColor;
    ctx.globalAlpha = drawFrontHalf ? 0.62 : 0.22;
    ctx.lineWidth = drawFrontHalf ? (ring.isDoubleRim ? 0.9 : 0.75) : 0.5;
    ctx.stroke();
  }

  // Hạt Ngọc Khoáng Thạch kèm dải đuôi cong sáng 25° (14 đoạn)
  const omega = (0.42 + ringIdx * 0.08) * ring.cometDirection;
  const headTheta = ring.cometOffset + time * omega;

  tmpVec.x = Math.cos(headTheta) * ring.radiusX;
  tmpVec.y = Math.sin(headTheta) * ring.radiusY;
  tmpVec.z = 0;
  rotateVec3ScaledInto(tmpVec, 1, rotX, rotY, rotZ, satWorldOut);
  projectPointInto(satWorldOut, cx, cy, fov, satProjOut);

  const trailSpanRad = (25 * Math.PI) / 180;
  const trailSegs = 14;
  for (let s = 0; s < trailSegs; s += 1) {
    const t0 = s / trailSegs;
    const t1 = (s + 1) / trailSegs;
    const a0 = headTheta - ring.cometDirection * trailSpanRad * t0;
    const a1 = headTheta - ring.cometDirection * trailSpanRad * t1;

    tmpVec.x = Math.cos(a0) * ring.radiusX;
    tmpVec.y = Math.sin(a0) * ring.radiusY;
    tmpVec.z = 0;
    rotateVec3ScaledInto(tmpVec, 1, rotX, rotY, rotZ, tmpVec);

    tmpInner.x = Math.cos(a1) * ring.radiusX;
    tmpInner.y = Math.sin(a1) * ring.radiusY;
    tmpInner.z = 0;
    rotateVec3ScaledInto(tmpInner, 1, rotX, rotY, rotZ, tmpInner);

    const midZ = (tmpVec.z + tmpInner.z) * 0.5;
    if (midZ >= 0 !== drawFrontHalf) continue;

    projectPointInto(tmpVec, cx, cy, fov, tmpPt);
    const p0x = tmpPt.x;
    const p0y = tmpPt.y;
    projectPointInto(tmpInner, cx, cy, fov, tmpPt);

    const falloff = Math.pow(1 - t0, 1.55);
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(tmpPt.x, tmpPt.y);
    ctx.strokeStyle = `rgba(${ring.cometRgb}, ${(falloff * (drawFrontHalf ? 0.86 : 0.34)).toFixed(3)})`;
    ctx.lineWidth = (drawFrontHalf ? 2.8 : 1.7) * (1 - t0 * 0.82);
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  // Vẽ Hạt Ngọc Khoáng Thạch 3 lớp: Quầng hào quang dịu (r=7, alpha=0.22) -> Vành ngọc (r=3.6) -> Tâm sứ (#FAFBF9, r=1.5)
  if (satWorldOut.z >= 0 === drawFrontHalf) {
    const haloScale = drawFrontHalf ? 1 : 0.72;
    const haloR = 7 * haloScale;
    ctx.globalAlpha = drawFrontHalf ? 0.22 : 0.1;
    ctx.fillStyle = ring.cometColor;
    ctx.beginPath();
    ctx.arc(satProjOut.x, satProjOut.y, haloR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = drawFrontHalf ? 0.96 : 0.38;
    ctx.fillStyle = ring.cometColor;
    ctx.beginPath();
    ctx.arc(satProjOut.x, satProjOut.y, 3.6 * haloScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = drawFrontHalf ? 0.98 : 0.5;
    ctx.fillStyle = '#FAFBF9';
    ctx.beginPath();
    ctx.arc(satProjOut.x, satProjOut.y, 1.5 * haloScale, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawSphericalHarmonicWaves(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dialR: number,
  time: number,
  wavePrimaryBuf: ProjectedPoint[],
  waveSymBuf: ProjectedPoint[],
): void {
  // Tầng 3 (0.88 * R_dial -> 1.0 * R_dial): ôm sát mép trong đĩa chuẩn độ, tách biệt hoàn toàn Tầng 1 & 2
  const baseR = 0.91 * dialR;
  const ampA = 0.026 * dialR;
  const cosEnvelope = Math.cos(1.1 * time);

  for (let i = 0; i < HARMONIC_WAVE_POINTS; i += 1) {
    const trig = SPHERICAL_WAVE_TRIG[i]!;
    const th = trig.theta;
    const radialOsc = ampA * Math.sin(8 * th - 2.2 * time) * cosEnvelope;

    const r1 = baseR + radialOsc;
    wavePrimaryBuf[i]!.x = cx + r1 * trig.cosT;
    wavePrimaryBuf[i]!.y = cy + r1 * trig.sinT;

    const r2 = baseR - radialOsc;
    waveSymBuf[i]!.x = cx + r2 * trig.cosT;
    waveSymBuf[i]!.y = cy + r2 * trig.sinT;
  }

  // Vạch pha siêu mảnh nối các đỉnh bụng sóng đối pha quanh vành biên ngoài
  ctx.save();
  ctx.strokeStyle = 'rgba(59, 122, 101, 0.2)';
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  for (let i = 0; i < HARMONIC_WAVE_POINTS; i += 5) {
    const pA = wavePrimaryBuf[i]!;
    const pB = waveSymBuf[i]!;
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
  }
  ctx.stroke();

  // Đường sóng thứ hai: Hổ Phách Trầm
  ctx.beginPath();
  ctx.moveTo(waveSymBuf[0]!.x, waveSymBuf[0]!.y);
  for (let i = 1; i < HARMONIC_WAVE_POINTS; i += 1) {
    ctx.lineTo(waveSymBuf[i]!.x, waveSymBuf[i]!.y);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.34)';
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Đường sóng thứ nhất: Ngọc Bích Khoáng Thạch
  ctx.beginPath();
  ctx.moveTo(wavePrimaryBuf[0]!.x, wavePrimaryBuf[0]!.y);
  for (let i = 1; i < HARMONIC_WAVE_POINTS; i += 1) {
    ctx.lineTo(wavePrimaryBuf[i]!.x, wavePrimaryBuf[i]!.y);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(59, 122, 101, 0.44)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.restore();
}

function drawBlueprintSymbolsInCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  minDim: number,
  time: number,
  smoothX: number,
  smoothY: number,
  pointerActive: boolean,
  pointerCanvasX: number,
  pointerCanvasY: number,
  dtScale: number,
  radarAngle: number,
  updatePulse: boolean,
  symbolPulseBuf: Float64Array,
  smoothProxBuf: Float64Array,
  smoothPushXBuf: Float64Array,
  smoothPushYBuf: Float64Array,
): void {
  const dialR = 185 * (minDim / 460);
  const damp = Math.min(1, 0.14 * dtScale);
  const pulseDecay = Math.pow(0.96, dtScale);

  ctx.save();
  for (let i = 0; i < BLUEPRINT_SYMBOLS.length; i += 1) {
    const spec = BLUEPRINT_SYMBOLS[i]!;
    const baseX =
      spec.nx * width +
      spec.ampX * Math.sin(spec.omega * time + spec.phase) +
      smoothX * spec.depthFactor;
    const baseY =
      spec.ny * height +
      spec.ampY * Math.cos(0.8 * spec.omega * time + spec.phase) +
      smoothY * spec.depthFactor;

    let targetProx = 0;
    let targetPushX = 0;
    let targetPushY = 0;
    if (pointerActive) {
      const dx = baseX - pointerCanvasX;
      const dy = baseY - pointerCanvasY;
      const dist = Math.hypot(dx, dy);
      if (dist < SYMBOL_PROXIMITY_PX) {
        targetProx = 1 - dist / SYMBOL_PROXIMITY_PX;
        const mag = targetProx * 12;
        const inv = dist > 0.5 ? 1 / dist : 0;
        targetPushX = dx * inv * mag;
        targetPushY = dy * inv * mag;
      }
    }

    smoothProxBuf[i] = smoothProxBuf[i]! + (targetProx - smoothProxBuf[i]!) * damp;
    smoothPushXBuf[i] = smoothPushXBuf[i]! + (targetPushX - smoothPushXBuf[i]!) * damp;
    smoothPushYBuf[i] = smoothPushYBuf[i]! + (targetPushY - smoothPushYBuf[i]!) * damp;

    const prox = smoothProxBuf[i]!;
    const nxPos = baseX + smoothPushXBuf[i]!;
    const nyPos = baseY + smoothPushYBuf[i]!;

    if (updatePulse) {
      const symbolAngle = Math.atan2(nyPos - cy, nxPos - cx);
      let angDiff = Math.abs(radarAngle - symbolAngle) % (Math.PI * 2);
      if (angDiff > Math.PI) angDiff = Math.PI * 2 - angDiff;
      symbolPulseBuf[i] = angDiff < RADAR_HIT_RAD ? 1.0 : symbolPulseBuf[i]! * pulseDecay;
    }

    const pulse = symbolPulseBuf[i]!;
    const baseOpacity = Math.max(0.34, 0.4 + 0.08 * Math.sin(1.1 * time + spec.phase)); // >= 0.34
    const sweepOpacity = baseOpacity + pulse * (0.82 - baseOpacity);
    const finalOpacity = Math.max(0.34, sweepOpacity, Math.min(0.92, baseOpacity + prox * 0.52));
    const circleR = 16 + 3 * pulse;

    // Đường tiếp tuyến nét đứt siêu mảnh nối từ mép đĩa ra vòng tròn ký hiệu
    const toCenterDx = cx - nxPos;
    const toCenterDy = cy - nyPos;
    const toCenterDist = Math.hypot(toCenterDx, toCenterDy) || 1;
    const dirX = toCenterDx / toCenterDist;
    const dirY = toCenterDy / toCenterDist;
    const guideStartX = nxPos + dirX * circleR;
    const guideStartY = nyPos + dirY * circleR;
    const reachDist = Math.max(circleR + 6, toCenterDist - dialR);
    const guideEndX = nxPos + dirX * reachDist;
    const guideEndY = nyPos + dirY * reachDist;

    if (reachDist > circleR + 8) {
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(guideStartX, guideStartY);
      ctx.lineTo(guideEndX, guideEndY);
      ctx.strokeStyle = `rgba(30, 51, 46, ${(0.08 + prox * 0.24 + pulse * 0.14).toFixed(3)})`;
      ctx.lineWidth = 0.65 + pulse * 0.2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Đốm sáng nhỏ chạy dọc theo đường nối nét đứt từ mép đĩa ra vòng tròn ký hiệu khi tia quét qua
      if (pulse > 0.02) {
        const travel = Math.min(1, (1 - pulse) / 0.85);
        const dotX = guideEndX + (guideStartX - guideEndX) * travel;
        const dotY = guideEndY + (guideStartY - guideEndY) * travel;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(156, 122, 76, ${(0.38 * pulse).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dotX, dotY, 1.55, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250, 251, 249, ${Math.min(0.98, 0.45 + 0.55 * pulse).toFixed(3)})`;
        ctx.fill();
      }
    }

    // Vòng tròn chuẩn độ mảnh r = 16px (nở sáng vàng hổ phách khi Radar quét qua)
    ctx.beginPath();
    ctx.arc(nxPos, nyPos, circleR, 0, Math.PI * 2);
    if (pulse > 0.02) {
      ctx.strokeStyle = `rgba(156, 122, 76, ${(0.15 + 0.55 * pulse).toFixed(3)})`;
      ctx.lineWidth = 0.9 + pulse * 0.65 + prox * 0.35;
    } else {
      ctx.strokeStyle =
        prox > 0.08
          ? `rgba(30, 51, 46, ${(0.1 + prox * 0.45).toFixed(3)})`
          : 'rgba(30, 51, 46, 0.10)';
      ctx.lineWidth = 0.8 + prox * 0.45;
    }
    ctx.stroke();

    // Chấm nhỏ quay quanh vành tròn chuẩn độ
    const rimAngle = time * spec.orbitSpeed + spec.phase;
    ctx.beginPath();
    ctx.arc(
      nxPos + Math.cos(rimAngle) * circleR,
      nyPos + Math.sin(rimAngle) * circleR,
      1.45 + Math.max(prox, pulse * 0.6) * 0.45,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = pulse > 0.25 ? '#9C7A4C' : prox > 0.2 ? '#1E332E' : 'rgba(156, 122, 76, 0.58)';
    ctx.fill();

    // Ký hiệu toán học xoay nhẹ ±6°
    const tiltRad = Math.sin(0.9 * spec.omega * time + spec.phase) * ((6 * Math.PI) / 180);
    ctx.save();
    ctx.translate(nxPos, nyPos);
    ctx.rotate(tiltRad);
    ctx.font = `600 ${Math.round(16 + Math.max(prox * 2, pulse * 1.5))}px 'STIX Two Math', 'Cambria Math', 'Segoe UI Symbol', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle =
      prox > 0.05 || pulse > 0.02
        ? `rgba(30, 51, 46, ${finalOpacity.toFixed(3)})`
        : `rgba(30, 51, 46, ${baseOpacity.toFixed(3)})`;
    ctx.fillText(spec.symbol, 0, 1);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Điêu Khắc Nhị Thập Diện Ngọc Bích & Lõi Tinh Thể Hổ Phách 120fps (`crystalline-astrolabe-v5`):
 * - Phân tầng 3 phân khu bán kính chuẩn Tỷ lệ vàng theo R_dial:
 *   + Tầng 1 (0 -> 0.34 R_dial): Tâm sạch chỉ có Lõi Hổ Phách cắt giác bên trong Vỏ Nhị thập diện đều & khớp nở vi mô Blinn-Phong
 *   + Tầng 2 (0.48 -> 0.78 R_dial): 4 Vòng Quỹ Đạo Thiên Cầu & 4 Hạt Ngọc Khoáng Thạch kèm Cộng hưởng Giao điểm
 *   + Tầng 3 (0.88 -> 1.0 R_dial): Sóng Đứng Điều Hòa ôm sát mép trong đĩa chuẩn độ
 * - Cơ chế Kéo Chuột Xoay 360° có quán tính vật lý (damping 0.94^dtScale)
 * - Quét Radar Thiên Văn đồng bộ phát sáng 8 Nút Giao Bản Vẽ Động (∫, ∑, ∂, ∆, φ, π, ∀, ≃)
 */
export function LearningSpaceHeroCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragPhysicsRef = useRef<DragPhysicsState>({
    rotX: 0.65 * 0.18,
    rotY: 0.65 * 0.25,
    velX: 0,
    velY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    manualOffsetX: 0,
    manualOffsetY: 0,
    lastMoveMs: 0,
  });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(360, container.clientWidth || 480);
    let height = Math.max(380, container.clientHeight || 470);
    let dpr = Math.min(window.devicePixelRatio || 1, 3);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      width = Math.max(360, container.clientWidth || 480);
      height = Math.max(380, container.clientHeight || 470);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    // Bộ đệm tiền cấp phát O(1) — không phát sinh cấp phát bộ nhớ trong vòng lặp 120fps
    const icoWorldVerts = createZeroVec3Array(ICO_VERTICES.length);
    const icoProjVerts = createZeroProjArray(ICO_VERTICES.length);
    const icoFacePool: ShadedTriangleBuffer[] = ICO_FACES.map(() => ({
      indices: [0, 0, 0],
      p0: { x: 0, y: 0, z: 0, scale: 1 },
      p1: { x: 0, y: 0, z: 0, scale: 1 },
      p2: { x: 0, y: 0, z: 0, scale: 1 },
      avgZ: 0,
      light: 0,
      specular: 0,
      fresnel: 0,
      isFront: true,
    }));
    const icoBackFaces: ShadedTriangleBuffer[] = [];
    const icoFrontFaces: ShadedTriangleBuffer[] = [];

    const crystalWorldVerts = createZeroVec3Array(CRYSTAL_VERTICES.length);
    const crystalProjVerts = createZeroProjArray(CRYSTAL_VERTICES.length);
    const crystalFacePool: ShadedTriangleBuffer[] = CRYSTAL_FACES.map(() => ({
      indices: [0, 0, 0],
      p0: { x: 0, y: 0, z: 0, scale: 1 },
      p1: { x: 0, y: 0, z: 0, scale: 1 },
      p2: { x: 0, y: 0, z: 0, scale: 1 },
      avgZ: 0,
      light: 0,
      specular: 0,
      fresnel: 0,
      isFront: true,
    }));
    const crystalBackFaces: ShadedTriangleBuffer[] = [];
    const crystalFrontFaces: ShadedTriangleBuffer[] = [];

    const wavePrimaryProj = createZeroProjArray(HARMONIC_WAVE_POINTS);
    const waveSymProj = createZeroProjArray(HARMONIC_WAVE_POINTS);
    const ringOuterProj = createZeroProjArray(97);
    const ringInnerProj = createZeroProjArray(97);
    const satWorldPositions = createZeroVec3Array(ARMILLARY_RINGS.length);
    const satProjPositions = createZeroProjArray(ARMILLARY_RINGS.length);

    const resonancePulses: ResonancePulse[] = Array.from({ length: MAX_RESONANCE_PULSES }, () => ({
      active: false,
      x: 0,
      y: 0,
      radius: 3,
      maxRadius: 34,
      alpha: 0,
      color: '156, 122, 76',
      x2: 0,
      y2: 0,
      hasPairTether: false,
    }));
    const pairCooldownUntil = new Float64Array(6);
    const axisCooldownUntil = new Float64Array(ARMILLARY_RINGS.length);

    const hoverWaves: HoverWave[] = [
      { active: false, progress: 0 },
      { active: false, progress: 0 },
      { active: false, progress: 0 },
    ];
    let lastHoverWaveSec = -10;

    const blueprintSmoothProx = new Float64Array(BLUEPRINT_SYMBOLS.length);
    const blueprintSmoothPushX = new Float64Array(BLUEPRINT_SYMBOLS.length);
    const blueprintSmoothPushY = new Float64Array(BLUEPRINT_SYMBOLS.length);
    const symbolPulseBuf = new Float64Array(BLUEPRINT_SYMBOLS.length);

    const ringAngles = ARMILLARY_RINGS.map(() => ({ rotX: 0, rotY: 0, rotZ: 0 }));

    const tmpVecA: Vec3 = { x: 0, y: 0, z: 0 };
    const tmpVecB: Vec3 = { x: 0, y: 0, z: 0 };
    const tmpShiftVec: Vec3 = { x: 0, y: 0, z: 0 };
    const tmpProj: ProjectedPoint = { x: 0, y: 0, z: 0, scale: 1 };

    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let pointerCanvasX = width * 0.5;
    let pointerCanvasY = height * 0.5;
    let pointerInsideCanvas = false;
    let isHovered = false;
    let hoverMix = 0;
    let facetHoverMix = 0;
    let alphaCurr = -Math.PI / 4;
    let coreSpinPhase = 0;
    let isVisible = true;
    let rafId = 0;
    let elapsed = 0;
    let prevNow = performance.now();

    const triggerHoverWave = (nowSec: number) => {
      if (nowSec - lastHoverWaveSec < 0.45) return;
      const slot = hoverWaves.find((w) => !w.active) ?? hoverWaves[0]!;
      slot.active = true;
      slot.progress = 0;
      lastHoverWaveSec = nowSec;
    };

    const spawnResonancePulse = (
      x: number,
      y: number,
      color: string,
      hasPairTether: boolean,
      x2: number,
      y2: number,
    ) => {
      let target = resonancePulses.find((p) => !p.active);
      if (!target) {
        // Ghi đè xung mờ nhất nếu đã đủ 8 xung
        target = resonancePulses.reduce((lowest, item) =>
          item.alpha < lowest.alpha ? item : lowest,
        );
      }
      target.active = true;
      target.x = x;
      target.y = y;
      target.radius = 3;
      target.maxRadius = 34;
      target.alpha = 0.65;
      target.color = color;
      target.hasPairTether = hasPairTether;
      target.x2 = x2;
      target.y2 = y2;
    };

    const heroSection = container.closest('section') ?? container;

    const handleHeroPointerMove = (event: Event) => {
      const ptr = event as PointerEvent;
      const heroRect = heroSection.getBoundingClientRect();
      if (heroRect.width && heroRect.height) {
        pointerX = Math.max(
          -1,
          Math.min(1, ((ptr.clientX - heroRect.left) / heroRect.width - 0.5) * 2),
        );
        pointerY = Math.max(
          -1,
          Math.min(1, ((ptr.clientY - heroRect.top) / heroRect.height - 0.5) * 2),
        );
      }

      const canvasRect = container.getBoundingClientRect();
      if (canvasRect.width && canvasRect.height) {
        pointerCanvasX = ptr.clientX - canvasRect.left;
        pointerCanvasY = ptr.clientY - canvasRect.top;
        pointerInsideCanvas =
          pointerCanvasX >= 0 &&
          pointerCanvasX <= canvasRect.width &&
          pointerCanvasY >= 0 &&
          pointerCanvasY <= canvasRect.height;
      }
    };

    const handleHeroPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      pointerInsideCanvas = false;
    };

    const handleSculptureEnter = () => {
      isHovered = true;
      triggerHoverWave(elapsed);
    };

    const handleSculptureMove = () => {
      if (!isHovered) {
        isHovered = true;
        triggerHoverWave(elapsed);
      } else if (elapsed - lastHoverWaveSec > 1.35) {
        triggerHoverWave(elapsed);
      }
    };

    const handleSculptureLeave = () => {
      isHovered = false;
      pointerInsideCanvas = false;
    };

    heroSection.addEventListener('pointermove', handleHeroPointerMove);
    heroSection.addEventListener('pointerleave', handleHeroPointerLeave);
    container.addEventListener('pointerenter', handleSculptureEnter);
    container.addEventListener('pointermove', handleSculptureMove);
    container.addEventListener('pointerleave', handleSculptureLeave);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(container);
    }

    let intersectionObserver: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      intersectionObserver.observe(container);
    }

    const renderFrame = (
      time: number,
      corePhase: number,
      dtScale: number,
      checkResonance: boolean,
      facetHover: number,
    ) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + smoothX * 8;
      const cy = height * 0.5 + smoothY * 7;
      const minDim = Math.min(width, height);
      const fov = minDim * 1.15;
      const unitScale = minDim / 460;
      const dialR = 185 * unitScale;
      const radarAngle = (time * RADAR_SPEED) % (Math.PI * 2);

      // Hào quang tinh thể nền cực nhẹ
      const subtleBackdropGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 195 * unitScale);
      subtleBackdropGlow.addColorStop(0, 'rgba(245, 208, 120, 0.14)');
      subtleBackdropGlow.addColorStop(0.45, 'rgba(59, 122, 101, 0.05)');
      subtleBackdropGlow.addColorStop(1, 'rgba(242, 244, 243, 0)');
      ctx.fillStyle = subtleBackdropGlow;
      ctx.fillRect(0, 0, width, height);

      // E. 8 Nút Giao Bản Vẽ Động (Animated Blueprint Nodes) ngoài vành đĩa đồng bộ Radar
      drawBlueprintSymbolsInCanvas(
        ctx,
        width,
        height,
        cx,
        cy,
        minDim,
        time,
        smoothX,
        smoothY,
        pointerInsideCanvas,
        pointerCanvasX,
        pointerCanvasY,
        dtScale,
        radarAngle,
        checkResonance,
        symbolPulseBuf,
        blueprintSmoothProx,
        blueprintSmoothPushX,
        blueprintSmoothPushY,
      );

      // D, Backdrop & Radar Sweep. Đĩa Chuẩn Độ Trắc Địa 360° & Kim Chỉ Góc Alidade theo con trỏ
      drawAstrolabeBackdropAndAlidade(ctx, cx, cy, minDim, alphaCurr, radarAngle);

      // Tầng 3 (0.88 -> 1.0 * R_dial): Sóng Đứng Điều Hòa ôm sát mép trong đĩa chuẩn độ
      drawSphericalHarmonicWaves(ctx, cx, cy, dialR, time, wavePrimaryProj, waveSymProj);

      // Sóng giao thoa nhẹ khi tương tác chuột vào vùng mô hình
      for (const wave of hoverWaves) {
        if (!wave.active) continue;
        const p = wave.progress;
        const radius = (22 + p * 168) * unitScale;
        const alpha = (1 - p) * (1 - p) * 0.42;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(36, 87, 70, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.0 - p * 0.45;
        ctx.stroke();
      }

      // Góc Euler của 4 vòng Thiên Cầu (Tầng 2: 0.48..0.78 R_dial, tích hợp quán tính kéo xoay 360°)
      const drag = dragPhysicsRef.current;
      const tiltBoost = 1 + hoverMix * 0.28;
      for (let idx = 0; idx < ARMILLARY_RINGS.length; idx += 1) {
        const ring = ARMILLARY_RINGS[idx]!;
        ringAngles[idx]!.rotX =
          ring.baseTiltX +
          drag.manualOffsetX +
          Math.sin(time * 0.38 + idx * 0.9) * 0.1 +
          smoothY * (0.24 * tiltBoost - idx * 0.02);
        ringAngles[idx]!.rotY =
          drag.manualOffsetY +
          Math.cos(time * ring.speedY + idx * 1.1) * 0.2 +
          smoothX * (0.28 * tiltBoost - idx * 0.03);
        ringAngles[idx]!.rotZ = ring.baseTiltZ + time * ring.speedZ;
      }

      // LỚP 1: Nửa sau của 4 Vòng Thiên Cầu & Đuôi Sao Chổi Khoáng Thạch
      for (let idx = 0; idx < ARMILLARY_RINGS.length; idx += 1) {
        const ring = ARMILLARY_RINGS[idx]!;
        const ang = ringAngles[idx]!;
        drawArmillaryRingHalf(
          ctx,
          cx,
          cy,
          ring,
          idx,
          fov,
          ang.rotX,
          ang.rotY,
          ang.rotZ,
          time,
          false,
          ringOuterProj,
          ringInnerProj,
          satWorldPositions[idx]!,
          satProjPositions[idx]!,
          tmpVecA,
          tmpVecB,
          tmpProj,
        );
      }

      // Tầng 1 (0 -> 0.34 R_dial): Phép xoay & Hiệu ứng Hô hấp Phản chiếu Ánh sáng Khớp nở vi mô
      const icoRotX = drag.rotX + smoothY * 0.36 * tiltBoost;
      const icoRotY = drag.rotY + smoothX * 0.42 * tiltBoost;
      const icoRotZ = time * 0.07;

      const naturalBreath = 0.15 * (0.5 + 0.5 * Math.sin(time * 2.0));
      const facetExpansion = Math.min(1, naturalBreath + facetHover * 0.85);
      const normalExplosionPx = 3.6 * facetExpansion;

      // Tính phép chiếu 3D cho Khối Nhị thập diện ngoài & Lõi tinh thể Hổ Phách trong
      projectPolyhedronIntoBuffers(
        ICO_VERTICES,
        ICO_FACES,
        ICO_TIER1_SCALE,
        normalExplosionPx,
        icoRotX,
        icoRotY,
        icoRotZ,
        cx,
        cy,
        fov,
        icoWorldVerts,
        icoProjVerts,
        icoFacePool,
        icoBackFaces,
        icoFrontFaces,
        tmpShiftVec,
      );

      projectPolyhedronIntoBuffers(
        CRYSTAL_VERTICES,
        CRYSTAL_FACES,
        CORE_TIER1_SCALE,
        0,
        drag.rotX - corePhase * 0.34 + smoothY * 0.48 * tiltBoost,
        drag.rotY - corePhase * 0.5 + smoothX * 0.54 * tiltBoost,
        corePhase * 0.19,
        cx,
        cy,
        fov,
        crystalWorldVerts,
        crystalProjVerts,
        crystalFacePool,
        crystalBackFaces,
        crystalFrontFaces,
        tmpShiftVec,
      );

      // LỚP 2a: Các mặt khuất phía sau của Nhị thập diện đều (n_z < 0)
      ctx.save();
      ctx.setLineDash([2, 3]);
      for (let i = 0; i < icoBackFaces.length; i += 1) {
        const f = icoBackFaces[i]!;
        const { p0, p1, p2 } = f;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(36, 87, 70, 0.04)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(30, 58, 52, 0.18)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // LỚP 2b: Lõi Tinh Thể Hổ Phách Cắt Giác Sắc Nét (#F5D078 -> #B87D28 -> #7C5216)
      for (let i = 0; i < crystalBackFaces.length; i += 1) {
        const f = crystalBackFaces[i]!;
        const { p0, p1, p2 } = f;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(184, 125, 40, 0.22)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(124, 82, 22, 0.32)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      for (let i = 0; i < crystalFrontFaces.length; i += 1) {
        const f = crystalFrontFaces[i]!;
        const { p0, p1, p2 } = f;
        const grad = ctx.createLinearGradient(p0.x, p0.y, (p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5);
        if (f.light > 0.52) {
          grad.addColorStop(0, '#F5D078');
          grad.addColorStop(0.55, '#B87D28');
          grad.addColorStop(1, '#7C5216');
        } else {
          grad.addColorStop(0, '#E3B652');
          grad.addColorStop(0.5, '#9F691F');
          grad.addColorStop(1, '#7C5216');
        }

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.globalAlpha = 0.78 + f.light * 0.2;
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = f.specular > 0.25 ? '#FFF8E1' : '#7C5216';
        ctx.lineWidth = 0.95;
        ctx.stroke();

        if (f.light > 0.34) {
          const midEdgeX = (p1.x + p2.x) * 0.5;
          const midEdgeY = (p1.y + p2.y) * 0.5;
          ctx.beginPath();
          ctx.moveTo(p0.x + (midEdgeX - p0.x) * 0.16, p0.y + (midEdgeY - p0.y) * 0.16);
          ctx.lineTo(p0.x + (midEdgeX - p0.x) * 0.76, p0.y + (midEdgeY - p0.y) * 0.76);
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.35 + f.specular * 0.52).toFixed(2)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Tia Sáng Khe Tinh Thể (Seam Glow): ánh hổ phách ấm hắt ra giữa các khe mặt vừa nở
      const icoScreenRadius = ICO_TIER1_SCALE * (fov / 3.35);
      const seamGlowRadius = icoScreenRadius * (1.14 + 0.14 * facetExpansion);
      const seamAlpha = 0.18 + 0.28 * facetExpansion;
      const seamGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, seamGlowRadius);
      seamGrad.addColorStop(0, `rgba(235, 182, 92, ${seamAlpha.toFixed(3)})`);
      seamGrad.addColorStop(0.55, `rgba(245, 208, 120, ${(seamAlpha * 0.42).toFixed(3)})`);
      seamGrad.addColorStop(1, 'rgba(235, 182, 92, 0)');
      ctx.fillStyle = seamGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, seamGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      // LỚP 2c: Các mặt hướng ra trước của Nhị thập diện đều (n_z >= 0) kèm phản chiếu Blinn-Phong
      for (let i = 0; i < icoFrontFaces.length; i += 1) {
        const f = icoFrontFaces[i]!;
        const { p0, p1, p2 } = f;
        const oppMidX = (p1.x + p2.x) * 0.5;
        const oppMidY = (p1.y + p2.y) * 0.5;
        const faceGrad = ctx.createLinearGradient(p0.x, p0.y, oppMidX, oppMidY);

        const jadeAlpha = 0.14 + f.light * 0.1 + f.fresnel * 0.05;
        const porcelainAlpha = Math.min(0.42, 0.14 + f.light * 0.16 + f.specular * 0.35);
        faceGrad.addColorStop(0, `rgba(255, 255, 255, ${porcelainAlpha.toFixed(3)})`);
        faceGrad.addColorStop(0.55, `rgba(45, 118, 96, ${jadeAlpha.toFixed(3)})`);
        faceGrad.addColorStop(1, `rgba(27, 59, 51, ${(0.08 + (1 - f.light) * 0.1).toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fillStyle = faceGrad;
        ctx.fill();

        if (f.specular > 0.4) {
          ctx.fillStyle = `rgba(255, 253, 245, ${(f.specular * 0.48).toFixed(3)})`;
          ctx.fill();
        }

        ctx.strokeStyle = '#1B3B33';
        ctx.lineWidth = 1.2;
        ctx.lineJoin = 'round';
        ctx.stroke();

        if (f.specular > 0.4) {
          ctx.strokeStyle = `rgba(255, 253, 245, ${Math.min(0.95, 0.52 + f.specular * 0.42).toFixed(3)})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // LỚP 3: Nửa trước của 4 Vòng Thiên Cầu Kép & 4 Hạt Ngọc Khoáng Thạch
      for (let idx = 0; idx < ARMILLARY_RINGS.length; idx += 1) {
        const ring = ARMILLARY_RINGS[idx]!;
        const ang = ringAngles[idx]!;
        drawArmillaryRingHalf(
          ctx,
          cx,
          cy,
          ring,
          idx,
          fov,
          ang.rotX,
          ang.rotY,
          ang.rotZ,
          time,
          true,
          ringOuterProj,
          ringInnerProj,
          satWorldPositions[idx]!,
          satProjPositions[idx]!,
          tmpVecA,
          tmpVecB,
          tmpProj,
        );
      }

      // C. Kiểm tra Cộng hưởng Giao điểm (khoảng cách < 26px hoặc cắt trục chuẩn trực, hồi 900ms)
      if (checkResonance) {
        const nowMs = time * 1000;
        let pairIdx = 0;
        for (let a = 0; a < ARMILLARY_RINGS.length; a += 1) {
          const pa = satProjPositions[a]!;
          for (let b = a + 1; b < ARMILLARY_RINGS.length; b += 1) {
            const pb = satProjPositions[b]!;
            const dist = Math.hypot(pa.x - pb.x, pa.y - pb.y);
            if (dist < 26 && nowMs >= pairCooldownUntil[pairIdx]!) {
              pairCooldownUntil[pairIdx] = nowMs + RESONANCE_COOLDOWN_MS;
              spawnResonancePulse(
                (pa.x + pb.x) * 0.5,
                (pa.y + pb.y) * 0.5,
                ARMILLARY_RINGS[a]!.cometRgb,
                true,
                pb.x - pa.x,
                pb.y - pa.y,
              );
            }
            pairIdx += 1;
          }

          if (
            (Math.abs(pa.x - cx) < 3.5 || Math.abs(pa.y - cy) < 3.5) &&
            nowMs >= axisCooldownUntil[a]!
          ) {
            axisCooldownUntil[a] = nowMs + RESONANCE_COOLDOWN_MS;
            spawnResonancePulse(pa.x, pa.y, ARMILLARY_RINGS[a]!.cometRgb, false, 0, 0);
          }
        }
      }

      // Vẽ các vòng sóng cộng hưởng giao điểm (2 vòng đồng tâm 3px -> 34px + tia nối sáng giữa 2 hạt)
      for (let i = 0; i < MAX_RESONANCE_PULSES; i += 1) {
        const pulse = resonancePulses[i]!;
        if (!pulse.active) continue;
        const progress = (pulse.radius - 3) / (pulse.maxRadius - 3);
        const alpha = Math.max(0, 0.65 * (1 - progress));
        pulse.alpha = alpha;

        if (pulse.hasPairTether && progress < 0.45) {
          const halfDx = pulse.x2 * 0.5;
          const halfDy = pulse.y2 * 0.5;
          ctx.beginPath();
          ctx.moveTo(pulse.x - halfDx, pulse.y - halfDy);
          ctx.lineTo(pulse.x + halfDx, pulse.y + halfDy);
          ctx.strokeStyle = `rgba(${pulse.color}, ${(alpha * 1.15).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${pulse.color}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.05;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, Math.max(2, pulse.radius * 0.65), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(250, 251, 249, ${(alpha * 0.9).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.restore();
    };

    renderFrame(0.65, 0.65, 1, false, 0);
    if (prefersReducedMotion) {
      return () => {
        heroSection.removeEventListener('pointermove', handleHeroPointerMove);
        heroSection.removeEventListener('pointerleave', handleHeroPointerLeave);
        container.removeEventListener('pointerenter', handleSculptureEnter);
        container.removeEventListener('pointermove', handleSculptureMove);
        container.removeEventListener('pointerleave', handleSculptureLeave);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;

      if (isVisible && !document.hidden) {
        elapsed += dtScale / 60;
        const hoverDamp = frameDampFactor(7.0, dtSeconds);
        hoverMix += ((isHovered ? 1 : 0) - hoverMix) * hoverDamp;
        coreSpinPhase += (dtScale / 60) * (1 + hoverMix * 0.45);

        const tiltDamp = frameDampFactor(5.0, dtSeconds);
        smoothX += (pointerX - smoothX) * tiltDamp;
        smoothY += (pointerY - smoothY) * tiltDamp;

        const cx = width * 0.5 + smoothX * 8;
        const cy = height * 0.5 + smoothY * 7;

        // Cập nhật quán tính kéo xoay 360° chuẩn 120fps
        const drag = dragPhysicsRef.current;
        if (!drag.isDragging) {
          const inertiaRotY = drag.velY * dtScale;
          const inertiaRotX = drag.velX * dtScale;
          drag.rotY += inertiaRotY + BASE_AUTO_SPEED_Y * dtScale;
          drag.rotX += inertiaRotX + BASE_AUTO_SPEED_X * dtScale;
          drag.manualOffsetY += inertiaRotY;
          drag.manualOffsetX += inertiaRotX;
          const friction = Math.pow(0.94, dtScale);
          drag.velY *= friction;
          drag.velX *= friction;
        }

        // Cập nhật độ mở khớp mặt tinh thể khi con trỏ lại gần lõi (< 160px)
        const distToCenter = Math.hypot(pointerCanvasX - cx, pointerCanvasY - cy);
        const targetFacetHover =
          pointerInsideCanvas && distToCenter < FACET_HOVER_RADIUS_PX ? 1 : 0;
        facetHoverMix += (targetFacetHover - facetHoverMix) * Math.min(1, 0.08 * dtScale);

        // D. Nội suy góc Kim Chỉ Góc Alidade theo đường tròn ngắn nhất (damping 0.12 * dtScale)
        const targetAlidade = pointerInsideCanvas
          ? Math.atan2(pointerCanvasY - cy, pointerCanvasX - cx)
          : elapsed * 0.22 - Math.PI / 5;
        alphaCurr = angleLerp(alphaCurr, targetAlidade, Math.min(1, 0.12 * dtScale));

        // Cập nhật 8 xung cộng hưởng giao điểm (3px -> 34px)
        const pulseStep = 0.85 * dtScale;
        for (let i = 0; i < MAX_RESONANCE_PULSES; i += 1) {
          const pulse = resonancePulses[i]!;
          if (!pulse.active) continue;
          pulse.radius += pulseStep;
          if (pulse.radius >= pulse.maxRadius) {
            pulse.active = false;
            pulse.alpha = 0;
          }
        }

        for (const wave of hoverWaves) {
          if (!wave.active) continue;
          wave.progress += dtSeconds * 0.85;
          if (wave.progress >= 1) {
            wave.active = false;
            wave.progress = 0;
          }
        }

        renderFrame(elapsed, coreSpinPhase, dtScale, true, facetHoverMix);
      }

      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      heroSection.removeEventListener('pointermove', handleHeroPointerMove);
      heroSection.removeEventListener('pointerleave', handleHeroPointerLeave);
      container.removeEventListener('pointerenter', handleSculptureEnter);
      container.removeEventListener('pointermove', handleSculptureMove);
      container.removeEventListener('pointerleave', handleSculptureLeave);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [prefersReducedMotion]);

  const handleCanvasPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const drag = dragPhysicsRef.current;
    drag.isDragging = true;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.velX = 0;
    drag.velY = 0;
    drag.lastMoveMs = performance.now();
    event.currentTarget.dataset.dragging = 'true';
    event.currentTarget.classList.add('cursor-grabbing');
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleCanvasPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragPhysicsRef.current;
    if (!drag.isDragging) return;
    const dx = event.clientX - drag.lastX;
    const dy = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.velY = dx * DRAG_SENSITIVITY;
    drag.velX = dy * DRAG_SENSITIVITY;
    drag.rotY += drag.velY;
    drag.rotX += drag.velX;
    drag.manualOffsetY += drag.velY;
    drag.manualOffsetX += drag.velX;
    drag.lastMoveMs = performance.now();
  };

  const handleCanvasPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragPhysicsRef.current;
    if (!drag.isDragging) return;
    drag.isDragging = false;
    if (performance.now() - drag.lastMoveMs > 90) {
      drag.velX = 0;
      drag.velY = 0;
    }
    event.currentTarget.dataset.dragging = 'false';
    event.currentTarget.classList.remove('cursor-grabbing');
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      data-testid="learning-space-celestial-rings"
      data-sculpture-version="crystalline-astrolabe-v5"
      className="relative flex h-[400px] w-full cursor-grab items-center justify-center select-none active:cursor-grabbing sm:h-[460px] lg:h-[480px]"
    >
      {/* Danh mục ký hiệu toán học chuẩn A11y đồng bộ với 8 Nút Giao Bản Vẽ Động trên Canvas */}
      <div aria-hidden="true" data-testid="hero-math-parallax-glyphs" className="sr-only">
        {BLUEPRINT_SYMBOLS.map((glyph) => (
          <span key={glyph.symbol}>{glyph.symbol}</span>
        ))}
      </div>

      {/* Khung SVG dự phòng thanh mảnh khi môi trường không hỗ trợ Canvas 2D */}
      <svg
        viewBox="0 0 360 360"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto h-[320px] w-[320px] opacity-20"
        fill="none"
      >
        <circle
          cx="180"
          cy="180"
          r="146"
          stroke="#9C7A4C"
          strokeWidth="0.9"
          strokeDasharray="3 5"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="142"
          ry="66"
          transform="rotate(-24 180 180)"
          stroke="#49768F"
          strokeWidth="0.9"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="132"
          ry="58"
          transform="rotate(34 180 180)"
          stroke="#3B7A65"
          strokeWidth="0.9"
        />
        <polygon points="180,96 244,142 220,224 140,224 116,142" stroke="#1B3B33" strokeWidth="1" />
        <polygon points="180,126 220,192 140,192" stroke="#9E6356" strokeWidth="1" />
      </svg>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-dragging="false"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        className="relative z-10 block h-full w-full cursor-grab touch-none active:cursor-grabbing"
      />
    </div>
  );
}
